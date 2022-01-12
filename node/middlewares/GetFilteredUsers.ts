export async function getFilteredUsers(ctx: Context, next: () => Promise<any>) {
  const masterDatClient = ctx.clients.masterdata

  const filteredUsers = await masterDatClient.searchDocumentsWithPaginationInfo(
    {
      dataEntity: 'CC',
      fields: ['userId', 'shippingThreshold'],
      pagination: {
        page: 1,
        pageSize: 100,
      },
      where:
        `userId=${ctx.vtex.route.params.userId}` &&
        `shippingMethod=${ctx.vtex.route.params.shippingMethod}`,
      schema: 'mdv1',
    }
  )

  ctx.status = 200
  ctx.body = filteredUsers

  await next()
}
