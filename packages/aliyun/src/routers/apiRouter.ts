import Router from 'koa-router'
import { ERROR_CODE } from '../middlewares'

const router = new Router()

router.get('*', async ctx => {
    throw { code: ERROR_CODE.NOTFOUND, message: 'api notfound' }
})

export { router as apiRouter }