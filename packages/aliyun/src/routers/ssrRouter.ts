
import fs from 'fs'
import Router from 'koa-router'
import { ossClients } from '../clients/ali-oss'
import { envConfig } from '../modules/config'
import { renderHtmlStream } from '../modules/ssr'

const router = new Router()

router.get('/api/*', async (ctx, next) => {
    throw { code: -1, message: "api not found" }
})

router.get('/bff/*', async (ctx, next) => {
    throw { code: -1, message: "bff not found" }
})

const SPECIAL_PATHS = ['/dev', '/api', '/bff', '/ext']

router.get('*', async (ctx: any, next) => {

    if (SPECIAL_PATHS.find(p => ctx.url.startsWith(p))) {
        await next()
        return
    }

    const shtml = await readHtmlString(ctx.config.device)
    ctx.type = 'html'
    ctx.body  = shtml

    // TODO: 简单测试了并发场景，并没有出现数据污染的问题
    // 但理论上应该存在问题（store 和 axios 只有单例）
    // PS: 并发场景下请求会比较慢倒是事实
    // PS2: 代码迁移后未测试相关逻辑
    if (shtml.includes('isomorphic=yes')) {
        ctx.body = renderHtmlStream(ctx)
    }
})

export { router as ssrRouter }

async function readHtmlString(device: string) {
    const { aliyun } = envConfig
    const oss = ossClients['static']
    const { res: stati } = aliyun.env || {}
    if (!stati) {
        return ''
    }
    const staticPath = stati[device]
    const indexPath = `${staticPath}/index.html`
    if (stati.local) {
        return fs.readFileSync(indexPath, 'utf8')
    }
    const res = await oss.get(indexPath)
    return res.content.toString()
}

