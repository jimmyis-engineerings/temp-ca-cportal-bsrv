import { Hono, Context } from 'hono'

export default new Hono()
  .get('*', get)
  .post('*', post)

async function get(c: Context) {
    const path = c.req.path
    const query = c.req.query()
    const result = await reflect({ path, query })

    return c.json(result)
}

async function post(c: Context) {
    const path = c.req.path
    try {
      const body = await c.req.json()
      console.log(body)
      const result = await reflect({ path, body, permitted: true, key: "OK"})
      console.log(result)
  
      return c.json({ result })
    } catch (error: any) {
      return c.json({ error: error.message })
    }
}

async function reflect(data: any) {
  return { ...data, api: 'ACCOUNT/REFLECT', timestamp: Date.now() }
}
