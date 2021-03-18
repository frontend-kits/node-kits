export * from './normalize'
export * from './proxy'
export * from './vaildate'

import { Context, Next } from 'koa'
import { revertRequestUrl } from '../clients/ali-fc'

export const initialize = async (ctx: Context, next: Next) => {
    ctx.url = revertRequestUrl(ctx.url)
    const ua = ctx.header['user-agent']
    const isMobile = /AppleWebKit.*Mobile.*/i.test(ua)
    const device = isMobile ? 'mobile' : 'web'
    ctx.config = { device }
    await next()
}