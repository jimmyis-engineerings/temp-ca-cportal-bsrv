import { Hono } from 'hono'
import { cors } from 'hono/cors'
import test from './test'
import auth from './auth'
import gcp from './gcp-resource'

// TODO: Making this to be a configurable list
const enabledRoutes: string[] = [
    "test",
    "auth",
    "services/gcp"
]

const apiRoutes: { [key: string]: Hono } = {
    test,
    auth,
    ['services/gcp']: gcp
}

const api = new Hono()
  .use('/*', cors({
    origin: [
      'https://portal-dev.cloud-ace.co.th',
      'https://portal.cloud-ace.co.th',
      'https://cloudace-portal-dev.jimmyis.com',
      'https://cloudace-portal-admin.jimmyis.com',
      'https://cloudace-portal-admin-dev.jimmyis.com',
      'http://192.168.1.111:5173',
      'http://192.168.1.111:5174',
      'https://192.168.1.111:5173',
      'https://192.168.1.111:5174',
      'http://linux-hs-1:5173',
      'http://linux-hs-1:5174',
      'https://linux-hs-1:5173',
      'https://linux-hs-1:5174',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://localhost:5173',
      'https://localhost:5174',
    ],
    allowHeaders: [
      'X-Custom-Header',
      'X-Session',
      'Upgrade-Insecure-Requests'
    ],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  }))

enabledRoutes.forEach((route: string) => {
    api.route(`/${route}`, apiRoutes[route])
})

export { api }
