import { Hono, Context } from 'hono'
import * as gcpService from '@/services/gcp-resource'


export default new Hono()
    .post('/projects/save', saveProjects)
    .post('/projects/load', loadProjects)


async function saveProjects(c: Context) {
    // c.header('Content-Type', 'application/json');
    const body = await c.req.json()
    const result = await gcpService.saveProjects(body)

    return c.json({ ...result, debug: { body }})
}

async function loadProjects(c: Context) {
    // c.header('Content-Type', 'application/json');
    const body = await c.req.json()
    const result = await gcpService.loadProjects(body)

    return c.json({ result, debug: { body }})
}
