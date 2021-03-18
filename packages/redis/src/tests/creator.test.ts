
import { createRedisClient } from "../modules/creator"

test('test redis client', async () => {
    const redis = createRedisClient({ 
        host: 'r-uf6b4a74bc1d3ab4pd.redis.rds.aliyuncs.com',
        password: 'r-uf6b4a74bc1d3ab4:Smoex123456',
    })
    const val = Math.random().toString()
    await redis.set('redis-test', val)
    const res = await redis.get('redis-test')
    expect(val).toEqual(res)
    redis.quit()
})