
import fs from 'fs'
import toml from 'toml'
import path from 'path'
import _merge from 'lodash/merge'

export const envConfig = readEnvConfigs()

export type IMysqlItem = {
    database: string,
    host?: string
}

export type IAliyunApiItem = {
    alias: string,
    host?: string,
}

export type IAliyunOSSItem = {
    region: string,
    bucket: string,
    endpoint: string,
}
export type IAliyunFCItem = {
    region: string,
    alias: string,
}

export type IProxyConfigs = {
    [key in string]?: {
        to: string,
        target: string,
    }
}

export type IMysqlAuth = {
    user: string,
    password: string,
}

export type IRedisAuth = {
    password: string,
}

export type IRedisItem = {
    host: string,
}

type MapKeyTypes<T> = { [key in string] : T } & T

type IAuthConfigs = {
    aliyun: IAliyunAuth,
    mysql?: MapKeyTypes<IMysqlAuth>,
    redis?: MapKeyTypes<IRedisAuth>,
}

type IAliyunEnvConfigs = {
    oss: {
        target: string,
        package: string,
    },
    fc: {
        alias: string,
    },
    res: any,
}

type IAliyunConfigs = {
    dev?: boolean,
    env: IAliyunEnvConfigs,
    oss?: MapKeyTypes<IAliyunOSSItem>,
    fc?: MapKeyTypes<IAliyunFCItem>,
    mysql?:  MapKeyTypes<IMysqlItem>,
    redis?: MapKeyTypes<IRedisItem>,
}

type IAliyunAuth = {
    accessKeyId: string,
    accessKeySecret: string,
    accountId: number,
}

function readEnvConfigs() {
    const auth = readAsToml<IAuthConfigs>('auth')
    const aliyun = readAsToml<IAliyunConfigs>('aliyun')
    const proxy = readAsToml<IProxyConfigs>('proxy')
    return { auth, aliyun, proxy }
}

function readAsToml<T = any>(resolvePath: string): Partial<T> {
    const rootPathStr = process.env.CONFIG_PATHS || './config'
    const rootPaths = rootPathStr.split(' ')
    let res = {} as T
    for (const rootPath of rootPaths) {
        const mpath = path.resolve(`${rootPath}/${resolvePath}.toml`)
        const devpath = path.resolve(`${rootPath}/${resolvePath}.dev.toml`)
        
        if (fs.existsSync(mpath)) {
            const str = fs.readFileSync(mpath, 'utf-8')
            res = _merge(res, toml.parse(str))
        }
        if (fs.existsSync(devpath)) {
            const str = fs.readFileSync(devpath, 'utf-8')
            res = _merge(res, toml.parse(str), { dev: true })
        }
    }
    return res
}
