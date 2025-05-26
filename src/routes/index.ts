import { Hono } from 'hono'
import { cors } from 'hono/cors'
import test from './test'
import account from './account'

// TODO: Making this to be a configurable list
const enabledRoutes: string[] = [
    "test",
    "account"
]

const apiRoutes: { [key: string]: Hono } = {
    test,
    account
}

const api = new Hono()
  .use('/*', cors({
    origin: '*',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  }))

enabledRoutes.forEach((route: string) => {
    api.route(`/${route}`, apiRoutes[route])
})

export { api }
