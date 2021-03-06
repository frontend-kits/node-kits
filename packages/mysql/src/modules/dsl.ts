import { createSampleSQL } from './builder'

const keywords = [
    'SELECT',
    'INSERT',
    'UPDATE',
    'DELETE',
    'WHERE',
    'ORDER',
    'TOTAL',
    'DELETE',
    'LIMIT',
    'JOIN',
    'ON',
]

function parseArg(arg: string) {
    try {
        return JSON.parse(arg)
    } catch(e) {
        return arg
    }
}

export function createSampleDSL(name: string, mapper: any) {
    const builder = createSampleSQL(name, mapper)
    const exec = (key: string, arg: any[]) => {
        if (!key) {
            return
        }
        (builder as any)[key](...arg)
    }
    return function (strs: TemplateStringsArray, ...args: any[]) {
        let mkey = ''
        let margs = [] as any[]
        strs.forEach((str, idx) => {
            // 获得非空可用 keywords
            const arr = str.split(/\s/g).filter(Boolean)
            arr.forEach(key => {
                if (keywords.includes(key)) {
                    exec(mkey, margs)
                    margs = []
                    mkey = key
                } else {
                    margs.push(parseArg(key))
                }
            })
            margs.push(args[idx])
            exec(mkey, margs)
            mkey = ''
        })
        
        return builder.END()
    }
}
