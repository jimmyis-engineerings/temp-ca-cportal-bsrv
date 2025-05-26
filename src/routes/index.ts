import { Hono } from 'hono'
import { cors } from 'hono/cors'
import test from './test'
import auth from './auth'

// TODO: Making this to be a configurable list
const enabledRoutes: string[] = [
    "test",
    "auth"
]

const apiRoutes: { [key: string]: Hono } = {
    test,
    auth
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
