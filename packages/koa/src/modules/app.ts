import Koa from 'koa'
import json from 'koa-json'
import bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'

const app = new Koa()

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
  console.error(`Internal Server Error: ${JSON.stringify(err)}, ${JSON.stringify(ctx)}; ${new Date().toISOString()}`);
});

export default app
