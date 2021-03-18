import Redis from 'ioredis';

export type IRedisOptions = {
    host: string,
    password?: string,
}

// 好像不需要线程池, 所以只剩这么一点了 orz
export function createRedisClient(opts: IRedisOptions) {
  const client = new Redis({
    host: opts.host,
    password: opts.password || undefined,
  })
  return client
}