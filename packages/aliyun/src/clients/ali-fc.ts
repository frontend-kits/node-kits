
// @ts-ignore
import FC from '@alicloud/fc2'
import { xSingleton } from '@basic-kits/js'
import { envConfig } from "../modules/config";

export type IFCOptions = {
    accessKeyID: string,
    accessKeySecret: string,
    accountId: number,
    region: string,
    internal?: boolean,
    alias: string,
}

export const fcClients = xSingleton(key => {
    const { aliyun: auth } = envConfig.auth
    const { fc: mItem } = envConfig.aliyun
    const item = mItem?.[key]
    if (!item || !auth) {
        throw new Error("Create ali-fc clients is failure!");
    }
    return createFCClient({
        accountId: auth.accountId,
        accessKeyID: auth.accessKeyId,
        accessKeySecret: auth.accessKeySecret,
        region: mItem?.region || item.region,
        alias: item.alias,
        internal: !envConfig.aliyun.dev
    })
})

type IFCClient = {
    get: (path: string, ...args: any[]) => Promise<any>
    post: (path: string, ...args: any[]) => Promise<any>
    put: (path: string, ...args: any[]) => Promise<any>
    delete: (path: string, ...args: any[]) => Promise<any>
    request: (method: string, path: string, ...args: any[]) => Promise<any>
}

export function createFCClient(opts: IFCOptions) {
    const client = new FC(opts.accountId, {
        accessKeyID: opts.accessKeyID,
        accessKeySecret: opts.accessKeySecret,
        region: opts.region,
        internal: opts.internal,
    })

    const methods = ['get', 'post', 'put', 'delete']
    const { serviceName, functionName } = revertAliasrName(opts.alias)
    const proxy = { } as any
    const pathPrefix = `/proxy/${serviceName}/${functionName}`
    for (const key of methods) {
        proxy[key] = async (mpath: string, ...args: any[]) => {
            const res = await client[key](`${pathPrefix}${mpath}`, ...args)
            return res.data
        }
    }
    proxy['request'] = async (method: string, mpath: string, ...args: any[]) => {
        const res = await client.request(method, `${pathPrefix}${mpath}`, ...args)
        return res.data
    }
    return proxy as IFCClient
}

function revertAliasrName(serverName: string) {
    const [name, code, version] = serverName.split('\.')
    const serviceName = `${name}-${name}-${code}.${version || name}`
    return { serviceName, functionName: name }
}

export function revertRequestUrl(url: string) {
    const fcVersion = '2016-08-15'
    const { env } = envConfig.aliyun
    const { functionName } = revertAliasrName(env?.fc.alias!)
    return url.replace(new RegExp(`/${fcVersion}/proxy(\/.*?\/)${functionName}`), '')
}
