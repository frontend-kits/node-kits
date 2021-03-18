import path from 'path'
import { PassThrough } from 'stream'
import { Context } from 'koa'
import { AxiosInstance } from 'axios'
import { Store } from 'redux'
import qs from 'qs'
import { envConfig } from './config'

type ISSRRefs = {
    store: Store
    proxy: AxiosInstance
}

type ISSRModule = {
    render: (url: string) => NodeJS.ReadableStream
    dispatch?: (url: string) => any
    getRefs: () => ISSRRefs
}

type ISSRStreamOpts = {
    url: string,
    shtml: string,
}

export async function renderHtmlStream(ctx: any) {
    const { aliyun } = envConfig
    const { res: stati } = aliyun.env!
    if (!stati) {
        return ''
    }
    const { device } = ctx.config
    const staticPath = stati[device]

    const indexPath = `${staticPath}/ssr.node.js`
    const ssr = await getSSRModule(indexPath) as ISSRModule
    const shtml = ctx.body as string
    const { proxy } = ssr.getRefs?.() || {}
    if (proxy) {
        setServerProxyOptions(ctx, proxy)
    }
    const opts = { shtml, url: ctx.url }
    return await mrenderHtmlStream(ssr, opts)
}


function splitHtmlString(shtml: string) {
    return shtml
        .replace('</head>', '@{head-before}' + '</head>')
        .replace('</body>', '@{body-before}' + '</body>')
        .replace('</main>',  '</main>' + '@{main-after}')
        .replace(/<main.*?>.*?<\/main>/, str => {
            const root = str.match(/>.*</)?.[0].slice(1, -1)
            return root ? str.replace(root, '@{render}') : str
        })
        .split(/@{body-before}|@{head-before}|@{main-after}|@{render}/)
}

async function mrenderHtmlStream(ssr: ISSRModule, opts: ISSRStreamOpts) {
    const stream = new PassThrough()
    const [headBefore, mainBefore, mainAfter, bodyBefore, htmlEnd] = splitHtmlString(opts.shtml)
    stream.push(headBefore)
    stream.push(mainBefore)

    const { store } = ssr.getRefs()
    
    await ssr.dispatch?.(opts.url)
    const state = store.getState()
    const render = ssr.render(opts.url)
    console.log(render)
    render.pipe(stream, { end: false })
    
    render.on('end', () => {
        stream.push(mainAfter)
        if (state) {
            const windowState = 'window.__PRELOAD_STATE__'
            const data = `<script>${windowState} = ${JSON.stringify(state)}</script>`
            stream.push(data)
        }
        stream.push(bodyBefore)
        stream.push(htmlEnd)
        stream.push(null)
    })
    return stream
}

const acceptRespHeaders = [
    'set-cookie', 
]

function setServerProxyOptions(ctx: Context, proxy: AxiosInstance) {
    proxy.defaults.transformRequest = params => {
        return qs.stringify(params)
    }
    proxy.defaults.baseURL = 'http://localhost:9000/api'
    const reqHeaders = proxy.defaults.headers
    proxy.defaults.headers = {
        ...reqHeaders,
        ...ctx.headers,
    }

    proxy.interceptors.response.use(resp => {
        for (const name of Object.keys(resp.headers || {})) {
            if (acceptRespHeaders.includes(name)) {
                ctx.res.setHeader(name, resp.headers[name])
            }
        }
        return resp.data
    })
}

async function getSSRModule(filepath: string) {
    const ssrPath = path.resolve(filepath)
    delete require.cache[ssrPath]
    return await require(ssrPath)
}