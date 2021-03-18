// @ts-ignore
import OSS from 'ali-oss'
import { xSingleton } from '@basic-kits/js'
import { envConfig } from "../modules/config";
import { getLocalFiles } from './file';

export type IOSSOptions = {
    accessKeyId: string,
    accessKeySecret: string,
    region: string,
    internal?: boolean,
    bucket: string,
    endpoint: string,
}
export const ossClients = xSingleton(key => {
    const { aliyun: auth } = envConfig.auth
    const { oss: mItem } = envConfig.aliyun
    const item = mItem?.[key]
    if (!item || !auth) {
        throw new Error("Create ali-fc clients is failure!");
    }
    return createOSSClient({
        accessKeyId: auth.accessKeyId,
        accessKeySecret: auth.accessKeySecret,
        region: mItem?.region || item.region,
        internal: !envConfig.aliyun.dev,
        bucket: mItem?.bucket || item.bucket,
        endpoint: item.endpoint,
    })
})

export function createOSSClient(opts: IOSSOptions) {
    const internal = opts.internal ? '-internal' : '';
    const protocol = opts.internal ? 'https' : 'https';
    const endpoint = `${protocol}://${opts.bucket}.${opts.region}${internal}.aliyuncs.com`
    return new OSS({
        accessKeyId: opts.accessKeyId,
        accessKeySecret: opts.accessKeySecret!,
        region: opts.region,
        bucket: opts.bucket,
        endpoint,
        secure: true, 
        cname: true,
    })
}

export async function uploadFiles(fpath: string) {
    const files = getLocalFiles(fpath)

    console.log(files)
    // 上传单个文件时忽略文件路径, 直接上传到根目录
    if (typeof files === 'string') {
      const fname = files
        .replace('\\', '/')
        .replace(/.*?\//g, '')
      await uploadFile(files, fname)
      return
    }
    // 上传目录时忽略根目录
    for (const file of files) {
      const fname = file
        .replace('\\', '/')
        .replace(/^\.\//i, '')
        .replace(/.*?\//i, '')
      await uploadFile(file, fname)
    }
}

export async function uploadFile(fpath: string, rpath: string) {
    const { env } = envConfig.aliyun
    const client = ossClients[env?.oss.target!]
    const target = `/${env?.oss.package}/${rpath}`
    try {
      const res = await client.put(target, fpath)
      console.log(`Upload Success: ${fpath} --> ${res.name}`)
    } catch (e) {
      console.error(e)
    }
}
