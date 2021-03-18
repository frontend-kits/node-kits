import { PassThrough } from 'stream'
import { Context, Next } from 'koa'

export const ERROR_CODE = {
    UNKNOW: 100_0000_0000,
    NOTFOUND: 400_0000_0000,
}


export const normalizeError = async (ctx: Context, next: Next) => {
    try {
        await next()
    } catch(err) {
        console.log(err)
        if (!err.message) {
            err.message = 'Unknow Error'
        }
        if (!err.code) {
            err.code = -1
        }
        
        if (err.code >= ERROR_CODE.UNKNOW) {
            const { code, message, ...context } = err
            ctx.body = { code, data: { message }, ...context }
            return
        }
        const logMessage = `Internal Server Error: ${err.message}; ${JSON.stringify(err)}; ${new Date().toISOString()}`
        console.error(logMessage + `; ${JSON.stringify(ctx)}`)
        if (err.code >= 100 && err.code <= 9999) {
            ctx.body = logMessage
            ctx.status = err.code
        } else {
            ctx.body = logMessage
            ctx.status = 500
        }
    }
}

export const normalizeData = async (ctx: Context, next: Next) => {
    await next()
    // TODO: 寻求更好的判断方法 ing
    const isObject = typeof ctx.body === 'object' && !(ctx.body instanceof PassThrough)
    if (isObject && typeof ctx.body.code === 'undefined') {
        const data = JSON.parse(JSON.stringify(ctx.body))
        ctx.body = { code: 0, data }
    }
}