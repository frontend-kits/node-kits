import Router from 'koa-router'
import Koa from 'koa'

export type IRouterHandlers<T = any, U = {}> = {
    [key: string]: Router.IMiddleware<T, U>
}

export type IKoaMiddleware<T = any, U = {}> = {
    [key: string]: Koa.Middleware<T, U>
}