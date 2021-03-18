import { Context, Next } from 'koa'

function udpateParams(params: any, name: string, value: any) {
    const [curname, subname] = name.split('.')
    if (subname) {
        params[curname] = { ...params[curname], [subname]: value }
    } else {
        params[curname] = value
    }
}

const simpleParser = {
    // @ts-ignore
    number: (value: string) => [!isNaN(value), Number(value)],
    boolean: (value: string) => [value === 'true' || value === 'false', value === 'true' ? true : false],
    array: (value?: string[]) => [Array.isArray(value), value],
    string: (value?: string) => [true, value],
}

export const vaildateParams = async (ctx: Context, next: Next) => {
    ctx.vailate = (checks: any) => {
        const errors = [] as any
        const params = {} as any
        for (const check of checks) {
            const { name: names, type: types, rules=[] } = check
            const [paramName, fromName] = names.split('|')
            const name = fromName || paramName
            const value = ctx.query[name] || ctx.request.body[name]
            const [type, subtype] = types.split('|')

            if (!subtype && Object.keys(simpleParser).includes(type)) {
                // @ts-ignore
                const [isPass, parsedValue] = simpleParser[type](value)
                if (isPass) {
                    udpateParams(params, paramName, parsedValue)
                } else {
                    errors.push({ value, message: `${name} filed is not ${types}` }) 
                }
            } else if (type === 'array') {
                let error = null as any
                if (!Array.isArray(value)) {
                    errors.push({ value, message: `${name} filed is not ${types}` }) 
                } else {
                    const resvalue = [] as any[]
                    for (const arrvalue of value) {
                        // @ts-ignore
                        const [isPass, parsedValue] = simpleParser[subtype](arrvalue)
                        if (!isPass) {
                            error = { value, message: `${name} filed is not ${types}` }
                            break
                        } else {
                            resvalue.push(parsedValue)
                        }
                    }
                    if (error) {
                        errors.push(error)
                    } else {
                        udpateParams(params, paramName, resvalue)
                    }
                }
            }
        }
        if (Object.keys(errors).length) {
            ctx.throw({ code: 10, message: 'vailate failed', errors })
        }
        return params
    }
    await next()
}
