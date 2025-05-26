import { Hono, Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'

const bodyLimitMW = bodyLimit({
  maxSize: (1024 * 1024) * 2000, // Extend the limit to 2000MB
  onError: (c) => {
    return c.text('overflow :(', 413)
  },
})

export default new Hono()
  .get('*', get)
  .post('*', bodyLimitMW, post)

async function get(c: Context) {
    const path = c.req.path
    const query = c.req.query()
    const result = await reflect({ path, query })

    return c.json(result)
}

async function post(c: Context) {
    const path = c.req.path
    const body = await c.req.json()
    const result = await reflect({ path, body, permitted: true, key: "OK"})
    console.log(result)

    return c.json({ result })
}

async function reflect(data: any) {
  return { ...data, api: 'TEST/REFLECT', timestamp: Date.now() }
}
