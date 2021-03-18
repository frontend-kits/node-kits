
process.env.CONFIG_PATHS = './test-configs ./test-configs/subconfig'
import { redisClients } from "../clients/redis"
import { mysqlClients } from "../clients/mysql"
import { fcClients } from "../clients/ali-fc"
import { ossClients, uploadFiles } from "../clients/ali-oss"

test('test redis connection', async () => {
    const redis = redisClients['user']
    const val = Math.random().toString()
    console.log(val)
    await redis.set('redis-test', val)
    const res = await redis.get('redis-test')
    expect(val).toEqual(res)
    redis.quit()
})

test('test mysql connection', async () => {
    const mysql = mysqlClients['search']
    const conn = await mysql.getConnection()
    const [row] = await conn.query<any>('SELECT * FROM `kanji` LIMIT 1')
    // console.log(row)
    expect(row.length).toEqual(1)
    conn.destroy()
})


test('test ali-fc connection', async () => {
    const fc = fcClients['search']
    const res = await fc.get('/search/kanji?keyword=[3]')
    expect(res.code).toEqual(0)
})

test('test ali-oss connection', async () => {
    const oss = ossClients['static']
    const res = await oss.get('/master-web/index.html')
    expect(String(res.content).length > 0).toEqual(true)
})

test('test ali-oss upload', async done => {
    await uploadFiles('./test-configs/aliyun.toml')
    await uploadFiles('./test-configs')
    done()
})