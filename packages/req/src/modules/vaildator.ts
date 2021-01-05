import { xArray, xParse } from '@basic-kits/js'

type IValidatorRule = RegExp | string | ((str: string) => boolean)
type IValilatorType = 'number' | 'string' | 'boolean' | 'number[]' | 'string[]' | 'boolean[]' | 'date' | 'date[]'
export type IValidatorCheck = {
    name: string,
    param?: string,
    from?: 'query' | 'body',
    type?: IValilatorType,
    rules?: IValidatorRule[] | string,
}

export const RULES = {
    NOT_NULL: (text: string) => text.trim().length > 0,
    REQUIRED: (text: string) => text !== undefined,
}

export function createVaildator(query: any = {}, body: any = {}) {
    return function (checks: IValidatorCheck[]) {
        const errors = [] as any
        const params = {} as any
        for (const check of checks) {
            const { name: checkName, param, type: checkType, from, rules = [] } = check
            const name = param || checkName
            let value: string | string[] = ''
            if (!from) {
                value = query[name] || body[name] || ''
            } else if (from && from === 'query') {
                value = query[name] || ''
            } else if (from && from === 'body') {
                value = body[name] || ''
            }
            if (value && !Array.isArray(value)) {
                value = value.toString()
            }
            let type = checkType as string
            let isArray = false
            if (checkType?.endsWith('[]')) {
                isArray = true
                type = checkType.slice(0, -2)
            }

            if (isArray) {
                value = xArray(value)
            }
            if (!value) {
                continue
            }
            const parsedValue = xParse(value, type)

            params[checkName] = parsedValue
        }
        return params
    }
}