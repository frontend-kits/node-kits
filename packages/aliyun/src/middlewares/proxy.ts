import { Context, Next } from 'koa';
import { urlProxies } from '../modules/aliyun';
// @ts-ignore
import k2c from 'koa2-connect'
import send from 'koa-send'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { envConfig } from '../modules/config';
import { fcClients } from '../clients/ali-fc';

const { aliyun } = envConfig

export async function FCServiceProxy(ctx: any, name: any) {
    const { request: req } = ctx
    const { from , to } = urlProxies.apiProxy[name]
    const fc = fcClients[name]
    const res = await fc.request(
        req.method, 
        ctx.url.replace(from, to),
    )
    ctx.body = res 
}


export function requestProxy() {
    return async function (ctx: any, next: any) {
        const { path } = ctx;
        const { httpProxy, apiProxy: serviceProxy } = urlProxies

        for (const route of Object.keys(httpProxy)) {
            if (path.match(route)) {
                await k2c(createProxyMiddleware(urlProxies.httpProxy[route]))(ctx, next)
                return
            }
        }

        for (const name of Object.keys(serviceProxy)) {
            const p = serviceProxy[name]
            if (path.startsWith(p.from)) {
                await FCServiceProxy(ctx, name)
                return
            }
        }
        await next();
    }
}


export function staticProxy() {
    return async function(ctx: Context, next: Next) {
        const { res: stati } = aliyun.env!
        const mpath = ctx.path

        if (!stati
            || (!stati.local && mpath.startsWith('/dev')
            || ['/bff', '/api'].find(pre => mpath.startsWith(pre))
        )) {
            await next()
            return
        }

        let done: any = false
        const path = ctx.path.replace('/dev', '')
        const root = stati[ctx.config.device]

        if (ctx.method === 'HEAD' || ctx.method === 'GET') {
            try {
                done = await send(ctx, path, { root })
            } catch (err) {
                console.error(err)
                if (err.status !== 404) {
                    throw err
                }
            }
        }
    
        if (!done) {
            await next()
        }
    }
}