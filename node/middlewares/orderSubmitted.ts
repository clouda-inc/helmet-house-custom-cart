import {
  getUserByEmail,
  getCostCenterById,
  createCRMOrder,
  getCRMOrder,
} from './GetMasterData'
import moment from 'moment'
import { getUserToken } from './getUserToken'

export async function orderSubmitted(
  ctx: StatusChangeContext,
  next: () => Promise<any>
) {
  const {
    clients: { orders: ordersClient, helmetHouseCRM: helmetHouseClient },
  } = ctx

  try {
    const crmOrder = await getCRMOrder({ orderId: ctx?.body?.orderId }, ctx)

    if ((crmOrder ?? []).length > 0) {
      return
    }

    const order = await ordersClient.order(ctx?.body?.orderId)

    const token = await getUserToken()

    const customData = order?.customData?.customApps?.find(
      (app: any) => app.id === 'helmethouse-metadata'
    )?.fields

    const orderSubmittedUser = JSON.parse(
      (customData ?? []).orderSubmittedUser ?? '{}'
    )

    const userData = await getUserByEmail(
      { email: orderSubmittedUser?.email?.value },
      ctx
    )

    const costId = (userData ?? []).find(
      (data: { email: string }) =>
        data.email === orderSubmittedUser?.email?.value
    )?.costId

    const costCenter = await getCostCenterById({ id: costId }, ctx)

    const costCenterName = costCenter?.name

    const accountData = await helmetHouseClient.getAccountNumber(
      costCenterName,
      token
    )

    const accountId =
      accountData?.value?.find(
        (account: any) => account.accountnumber === costCenterName
      )?.accountid ?? ''

    const warehouse =
      accountData?.value?.find(
        (account: any) => account.accountnumber === costCenterName
      )?.hh_primarywarehouse ?? ''

    const paymentTerms = accountData?.value?.find(
      (account: any) => account.accountnumber === costCenterName
    )?.hh_paymentterms

    const ownerId =
      accountData?.value?.find(
        (account: any) => account.accountnumber === costCenterName
      )?._ownerid_value ?? ''

    const backOrderPolicy = accountData?.value?.find(
      (account: any) => account.accountnumber === costCenterName
    )?.hh_backorderpolicy

    const signatureOptions = JSON.parse(
      (customData ?? []).signatureOptions ?? '{}'
    )

    const shippingAddress = order?.shippingData?.address

    const itemsTotal = order?.totals.find(
      (total: { id: string; name: string; value: number }) =>
        total.id === 'Items'
    ).value

    const taxTotal = order?.totals.find(
      (total: { id: string; name: string; value: number }) => total.id === 'Tax'
    ).value

    const handleShipingMethod = () => {
      if (
        shippingAddress?.state === 'AK' ||
        shippingAddress?.state === 'HI' ||
        shippingAddress?.state === 'PR'
      ) {
        return 2
      } else if (customData?.shippingOption === 'Ground') {
        return 1
      } else if (customData?.shippingOption === '1 Day') {
        return 3
      } else if (customData?.shippingOption === '2 Day') {
        return 4
      }
      return null
    }

    const handleSignatureOptions = () => {
      if (signatureOptions?.option === 'No Signature Required') {
        return 881900002
      } else if (signatureOptions?.option === 'Signature Required') {
        return 881900000
      } else if (signatureOptions?.option === 'Adult Signature Required') {
        return 881900001
      }
      return null
    }

    const handleReferencenumber = () => {
      try {
        const date = `dcs${moment(new Date(order?.creationDate)).format(
          'YY-MM-DD-HH-mm'
        )}`

        const dataArray = date.split('-')

        let referencenumber = ''

        dataArray.map((data: string) => {
          referencenumber = referencenumber + data
        })

        return referencenumber
      } catch (error) {
        console.error('handleReferencenumber: ', error)
        return ''
      }
    }

    const quoteHeaderData = {
      name: customData?.poNumber ?? '',
      hh_accountnumber: costCenterName ?? '',
      'customerid_account@odata.bind': `/accounts(${accountId})`,
      hh_localshippingmethod: handleShipingMethod(),
      hh_dropship: customData?.isDropShip === '1' ? true : false,
      hh_backorderpolicy: backOrderPolicy,
      totallineitemamount: itemsTotal ?? 0,
      hh_referencenumber: handleReferencenumber(),
      hh_source1: 881900000,
      overriddencreatedon: moment(new Date(order.creationDate)).format(
        'YYYY-MM-DD'
      ),
      hh_paymentterms: paymentTerms,
      'ownerid@odata.bind': `/systemusers(${ownerId})`,
      shipto_name: shippingAddress?.receiverName ?? '',
      shipto_line1: shippingAddress?.street ?? '',
      shipto_city: shippingAddress?.city ?? '',
      shipto_stateorprovince: shippingAddress?.state ?? '',
      shipto_postalcode: shippingAddress?.postalCode ?? '',
      shipto_country:
        (shippingAddress?.country ?? '') === 'USA'
          ? 'US'
          : shippingAddress?.country,
      totaltax: taxTotal ?? 0,
      hh_ordertype: customData.isProgramOrder ? 881900001 : 881900000,
      hh_signaturereq: handleSignatureOptions(),
      hh_signaturerequiredfee: parseFloat(signatureOptions?.cost),
    }

    const quoteHeader = await helmetHouseClient.addQuoteHeader(
      quoteHeaderData,
      token
    )

    const quoteId = quoteHeader?.quoteid

    if (quoteId) {
      const data = {
        orderId: ctx?.body?.orderId,
        status: 'Success',
        order: JSON.stringify(order),
        quoteId: quoteId,
      }
      await createCRMOrder(data, ctx)
    } else {
      const data = {
        orderId: ctx?.body?.orderId,
        status: 'Faild',
        order: JSON.stringify(order),
        quoteId: '',
      }
      await createCRMOrder(data, ctx)
    }

    const notesData = {
      'regardingobjectid_quote@odata.bind': `/quotes(${quoteId})`,
      description: order?.openTextField ?? '',
    }

    await helmetHouseClient.addNotes(notesData, token)

    order.items.map(async (item: any, index: number) => {
      const productDetails = await helmetHouseClient.getProduct(
        item?.refId,
        token
      )

      const productId = productDetails?.value?.find(
        (product: any) => product.productnumber === item?.refId
      )?.productid

      const defaultuomid = productDetails?.value?.find(
        (product: any) => product.productnumber === item?.refId
      )?._defaultuomid_value

      const quoteDetailLinesData = {
        'quoteid@odata.bind': `/quotes(${quoteId})`,
        'productid@odata.bind': `/products(${productId})`,
        priceperunit: item.price,
        quantity: item.quantity,
        lineitemnumber: index,
        hh_warehouse: warehouse,
        'uomid@odata.bind': `/uoms(${defaultuomid})`,
        extendedamount: item.priceDefinition.total,
      }

      await helmetHouseClient.addQuoteDetailLines(quoteDetailLinesData, token)
    })
  } catch (error) {
    console.error('Error in Order Submitted: ', error)
    throw error
  } finally {
  }

  await next()
}
