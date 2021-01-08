import app from '../modules/app'
import request from 'supertest'
import Router from 'koa-router'
import { IRouterHandlers } from '../modules/base'
import { validateParams } from '../middlewares'

const route: IRouterHandlers = {
    test1: async(ctx: any) => {
        const x = ctx.validate([
            { name: 'name', type: 'number', rules: []},
            { name: 'desc', param:'name2', type: 'string', rules: []},
            { name: 'xxx', type: 'string[]', rules: []},
        ])
        ctx.body = x
    },
    testerror: async(ctx: any) => {
        ctx.xxx()
    }
}


const router = new Router()
router.get('/test', route.test1)
router.get('/error', route.testerror)

app.use(validateParams)
app.use(router.middleware())
app.use(router.allowedMethods())


const mockQuery = {
    name: '123',
    name2: '123abc',
}

const mockBody = {
    xxx: ['abc', '456']
}


test('test for app base', async () => {
    const res = await request(app.callback())
        .get('/test')
        .query(mockQuery)
        .send(mockBody)
    expect(res.body).toMatchObject({
        "desc": "123abc", "name": 123, "xxx": ["abc", "456"]
    })
})

test('test for app error', async () => {
    const res = await request(app.callback())
        .get('/error')
        .query(mockQuery)
        .send(mockBody)
    expect(res.body).toMatchObject({})
})