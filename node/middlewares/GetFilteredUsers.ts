export const getFilteredUsers = async (
  ctx: Context,
  next: () => Promise<any>
) => {
  const masterDatClient = ctx.clients.masterdata
  const { params } = ctx
  const filteredUsers = await masterDatClient.searchDocumentsWithPaginationInfo(
    {
      dataEntity: 'CC',
      fields: ['userId', 'shippingThreshold'],
      pagination: {
        page: 1,
        pageSize: 100,
      },
      where: `userId=${params.userId}`,
    }
  )

  ctx.status = 200
  ctx.body = filteredUsers

  await next()
}
