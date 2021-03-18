import { Context, Next } from 'koa'
import { createVaildator, IValidatorCheck } from '@node-kits/http'
export const validateParams = async (ctx: Context, next: Next) => {
    const validator = createVaildator(ctx.query, ctx.request.body)
    ctx.validate = (checks: IValidatorCheck[]) => {
        try {
            return validator(checks)
        } catch(error) {
            ctx.throw({ code: 'VAILATEOR_ERROR', error })
        }
    }
    await next()
}