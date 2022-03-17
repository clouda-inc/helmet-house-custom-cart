interface UserData {
  id: string
  roleId: string
  userId: string
  clId: string
  orgId: string
  costId: string
  name: string
  email: string
  canImpersonate: boolean
}

interface CostCenter {
  id: string
  name: string
}

export const getUserByEmail = async (params: any, ctx: StatusChangeContext) => {
  const {
    clients: { masterdata },
  } = ctx

  const { email } = params

  try {
    const userData = await masterdata.searchDocuments<UserData>({
      dataEntity: 'b2b_users',
      fields: [
        'id',
        'roleId',
        'userId',
        'clId',
        'orgId',
        'costId',
        'name',
        'email',
        'canImpersonate',
      ],
      schema: 'v0.1.0',
      pagination: { page: 1, pageSize: 50 },
      where: `email=${email}`,
    })

    return userData
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getCostCenterById = async (
  params: any,
  ctx: StatusChangeContext
) => {
  const {
    clients: { masterdata },
  } = ctx

  const { id } = params

  // create schema if it doesn't exist
  // await checkConfig(ctx)

  try {
    const costCenter = await masterdata.getDocument<CostCenter>({
      dataEntity: 'cost_centers',
      fields: ['id', 'name'],
      id,
    })

    return costCenter
  } catch (e) {
    console.error('Error: Get cost center by id....')
    if (e.message) {
      throw new Error(e.message)
    } else if (e.response?.data?.message) {
      throw new Error(e.response.data.message)
    } else {
      throw new Error(e)
    }
  }
}

type CRMOrderData = {
  orderId: string
  status: string
  order: string
  quoteId: string
}

export const createCRMOrder = async (
  params: CRMOrderData,
  ctx: StatusChangeContext
) => {
  const {
    clients: { masterdata },
  } = ctx

  const { orderId, status, order, quoteId } = params

  try {
    await masterdata.createDocument({
      schema: 'crm-order-schema-v1',
      dataEntity: 'CRMOrders',
      fields: {
        orderId: orderId,
        status: status,
        order: order,
        quoteId: quoteId,
      },
    })
  } catch (error) {
    console.error(error)
  }
}

type CRMOrderResponse = {
  orderId: string
  status: string
  quoteId: string
}

export const getCRMOrder = async (params: any, ctx: StatusChangeContext) => {
  const {
    clients: { masterdata },
  } = ctx

  const { orderId } = params

  try {
    const crmOrder = await masterdata.searchDocuments<CRMOrderResponse>({
      schema: 'crm-order-schema-v1',
      dataEntity: 'CRMOrders',
      fields: ['orderId', 'status', 'quoteId'],
      where: `orderId=${orderId}`,
      pagination: { page: 1, pageSize: 50 },
    })

    return crmOrder
  } catch (error) {
    console.error(error)
    return []
  }
}
