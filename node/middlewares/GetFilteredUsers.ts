import { getUserData } from './GetUsersData'

export async function getFilteredUsers(ctx: Context, next: () => Promise<any>) {
  const masterDatClient = ctx.clients.masterdata
  const orgarnizationalId = await getUserData(ctx)
  const filteredUsers = await masterDatClient.searchDocumentsWithPaginationInfo(
    {
      dataEntity: 'CC',
      fields: ['userId', 'shippingThreshold'],
      pagination: {
        page: 1,
        pageSize: 100,
      },
      where: `userId=${
        orgarnizationalId.find((u) => u)?.orgId
      } AND shippingMethod='Ground'`,
      // where: `userId=${orgarnizationalId.find((u) => u)?.orgId}`,
      schema: 'mdv1',
    }
  )

  ctx.status = 200
  ctx.body = filteredUsers
  await next()
}
