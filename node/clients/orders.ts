import {
  InstanceOptions,
  IOContext,
  JanusClient,
} from '@vtex/api'

export default class OMS extends JanusClient {
  public constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        ...(options && options.headers),
        ...(ctx.storeUserAuthToken
          ? { VtexIdclientAutCookie: ctx.storeUserAuthToken }
          : null),
      },
    })
  }

  public order = (id: string) =>
    this.http.get(this.routes.order(id), {
      headers: { VtexIdclientAutCookie: this.context.authToken },
      metric: 'insurance-order',
    })

  private get routes() {
    const base = '/api/oms'
    return {
      order: (id: string) => `${base}/pvt/orders/${id}`,
    }
  }
}
