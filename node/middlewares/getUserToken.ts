import querystring from 'querystring'

import axios from 'axios'

export const getUserToken = async () => {
  const autentiacation = await axios.post(
    'https://login.microsoftonline.com/8bbf4497-224a-4e9c-97eb-1c9567417325/oauth2/v2.0/token',
    querystring.stringify({
      grant_type: 'client_credentials',
      scope: 'https://org0a9bfbda.crm.dynamics.com/.default',
      client_id: 'be07fe4c-3afb-4ee0-b38d-4f6c91eed36c',
      client_secret: 'zEA7Q~qRkMxZ6-AFJjthir5ZnWkCa9Fyvjc.P',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Host: 'login.microsoftonline.com',
        'x-vtex-use-https': 'true',
        Connection: 'keep-alive',
        'X-Vtex-Proxy-To':
          'https://login.microsoftonline.com/8bbf4497-224a-4e9c-97eb-1c9567417325/oauth2/v2.0/token',
        'Content-Length': '188',
      },
    }
  )

  return autentiacation.data.access_token
}
