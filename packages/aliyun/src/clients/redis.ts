
import Redis from 'ioredis';
import { xSingleton } from '@basic-kits/js'
import { envConfig } from "../modules/config";

export type IRedisOptions = {
    host: string,
    password?: string,
}

export function createRedisClient(opts: IRedisOptions) {
  const client = new Redis({
    host: opts.host,
    password: opts.password || undefined,
  })
  return client
}

export const redisClients = xSingleton(key => {
  const { redis: mAuth } = envConfig.auth
  const { redis: mItem } = envConfig.aliyun
  const auth = mAuth?.[key]
  const item = mItem?.[key]
  if (!item || !auth) {
      throw new Error("Create redis clients is failure!");
  }
  return createRedisClient({
      host: mItem?.host || item.host,
      password: auth?.password
  })
})
