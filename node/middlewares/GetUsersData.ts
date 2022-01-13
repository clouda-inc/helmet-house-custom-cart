interface B2BUSER {
  orgId: string
  costId: string
  name: string
  email: string
}

export async function getUserData(ctx: Context) {
  const masterDatClient = ctx.clients.masterdata
  const userEmail = ctx.vtex.route.params.emailId

  const filteredUsers = await masterDatClient.searchDocuments<B2BUSER>({
    dataEntity: 'b2b_users',
    fields: ['orgId', 'costId', 'name', 'email'],
    pagination: {
      page: 1,
      pageSize: 100,
    },
    where: `email=${userEmail}`,
    schema: 'v0.1.0',
  })

  return filteredUsers
}
