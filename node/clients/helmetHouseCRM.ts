import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

// import { getUserToken } from '../middlewares/getUserToken'

export default class HelmetHouse extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super('https://org0a9bfbda.crm.dynamics.com', context, {
      ...options,
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Content-Type': 'application/json',
        Cookie:
          'ARRAffinity=476799dd6f4cad452a283e28412172e0c7ed8c0208c9daf13e2b5252d6b88ed1; ReqClientId=d56d4901-49ab-4701-9bbf-ead420a753bb; orgId=18a26c86-4ac3-4bf7-9935-43b00e75ab9d',
        Host: 'org0a9bfbda.crm.dynamics.com',
        'X-Vtex-Proxy-To':
          'https://org0a9bfbda.crm.dynamics.com/api/data/v9.0/salesorders',
        'x-vtex-use-https': 'true',
        'Cache-Control': 'no-cache',
      },
    })
  }

  public async addQuoteHeader(order: any, token: string): Promise<any> {
    try {
      const url = '/api/data/v9.0/quotes?$select=quoteid'

      return await this.http.post(url, order, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'return=representation',
        },
      })
    } catch (error) {
      console.error('addQuoteHeader: ', error)
      throw error
    }
  }

  public async addNotes(order: any, token: string): Promise<any> {
    try {
      var url = '/api/data/v9.0/hh_ordernotes'

      return await this.http.post(url, order, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'return=representation',
        },
      })
    } catch (error) {
      console.error('addNotes: ', error)
      throw error
    }
  }

  public async addQuoteDetailLines(order: any, token: string): Promise<any> {
    try {
      var url = '/api/data/v9.0/quotedetails'

      return await this.http.post(url, order, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'return=representation',
        },
      })
    } catch (error) {
      console.error('addQuoteDetailLines: ', error)
      throw error
    }
  }

  public async getAccountNumber(
    costCenterName: string,
    token: string
  ): Promise<any> {
    try {
      const query = `accounts?$filter=accountnumber eq '${costCenterName}'&$select=accountid,accountnumber,hh_paymentterms,hh_backorderpolicy,_ownerid_value,hh_primarywarehouse`

      const accountNumber = await this.http.get(`/api/data/v9.0/${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: `odata.maxpagesize=1`,
        },
      })

      return accountNumber
    } catch (error) {
      console.error('Get Account Number Error.. ', error)
      throw error
    }
  }

  public async getContactDetails(
    userEmail: string,
    token: string
  ): Promise<any> {
    try {
      const query = `contacts?$filter=hh_username eq '${userEmail}'&$select=contactid,hh_username`

      const contactDetails = await this.http.get(`/api/data/v9.0/${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: `odata.maxpagesize=1`,
        },
      })

      return contactDetails
    } catch (error) {
      console.error('Get Contact Details Error.. ', error)
      throw error
    }
  }

  public async getProduct(refId: string, token: string): Promise<any> {
    try {
      const query = `products?$filter=productnumber eq '${refId}'&$select=productid,productnumber,_defaultuomid_value`

      const productDetails = await this.http.get(`/api/data/v9.0/${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: `odata.maxpagesize=1`,
        },
      })

      return productDetails
    } catch (error) {
      console.error('Get Product Error.. ', error)
      throw error
    }
  }

  public async getSystemUsers(userEmail: string, token: string): Promise<any> {
    try {
      const query = `systemusers?$filter=internalemailaddress eq '${userEmail}'&$select=systemuserid,internalemailaddress`

      const systemUsers = await this.http.get(`/api/data/v9.0/${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: `odata.maxpagesize=1`,
        },
      })

      return systemUsers
    } catch (error) {
      console.error('Get System Users Error.. ', error)
      throw error
    }
  }

  public async updateQuoteHeader(quoteId: string, order: any, token: string): Promise<any> {
    try {
      const url = `/api/data/v9.0/quotes(${quoteId})`

      return await this.http.patch(url, order, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'return=representation',
        },
      })
    } catch (error) {
      console.error('addQuoteHeader: ', error)
      throw error
    }
  }
}
