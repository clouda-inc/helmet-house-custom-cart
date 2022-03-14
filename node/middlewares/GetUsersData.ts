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

  const user = (filteredUsers ?? [])?.find((u) => u)
  let costCenter

  if (filteredUsers) {
    const costCenterId = user?.costId

    const costCenters = await masterDatClient.searchDocuments<CostCenter>({
      dataEntity: 'cost_centers',
      fields: ['id', 'name', 'addresses', 'paymentTerms', 'organization'],
      pagination: { pageSize: 10, page: 1 },
      schema: 'v0.0.4',
      where: `id=${costCenterId}`,
    })

    costCenter = (costCenters ?? [])?.find((c) => c)
  }

  return {
    costId: user?.costId,
    costName: costCenter?.name,
    orgId: user?.orgId,
  }
}
