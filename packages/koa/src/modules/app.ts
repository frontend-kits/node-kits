import Koa from 'koa'
import json from 'koa-json'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
// @ts-ignore
import onerror from 'koa-onerror'

const app = new Koa()

// error handler
onerror(app, { all: onError })

function onError(err: any, ctx: any) {
  ctx.body = `Server Error: ${err.message}`
  console.error(`server error: ${err}, ${JSON.stringify(ctx)}; ${new Date().toISOString()}`)
}

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json({ pretty: false }))
app.use(logger())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const end = new Date()
  const ms = +end - +start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms; ${start.toISOString()} - ${end.toISOString()}`)
})

// error-handling
app.on('error', (err, ctx) => {
  // console.error('server error: ', err, JSON.stringify(ctx))
})

export default app
