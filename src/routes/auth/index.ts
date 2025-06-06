import { Hono, Context } from 'hono'
import * as authService from '@/services/auth'

import { authUtil, errorUtil } from '@/shared/utils';

export default new Hono()
  .get('/', get)
  .post('/signup', signup)
  .post('/signin', signin)
  .get('/signout', signout)
  .get('/session', session)
  .post('/oauth/google/callback', oAuthGoogleCallback)

async function get(c: Context) {
    // const result = await authService.get()

    // return c.json({ result })

	return c.json({ 
		result: {
			success: false,
			httpStatusCode: 501,
			error: {
				message: 'Not implemented'
			}
		}
	})
}

async function signup(c: Context) {
    // c.header('Content-Type', 'application/json');
    const body = await c.req.json()
    const result = await authService.signup(body)

    return c.json({ result })
}

async function signin(c: Context) {
    // c.header('Content-Type', 'application/json');
    const body = await c.req.json()
    const result = await authService.signin(body)

    return c.json({ result })
}

async function signout(c: Context) {
    // c.header('Content-Type', 'application/json');
	const sessionId = 
        authUtil.extractSessionFromRequestHeader(c.req.header())
	
    if (!sessionId) {
        return c.json(errorUtil.responseErrorNoSessionHeader())
    }

    const result = await authService.signout(sessionId)

    // return c.json({ result: { success: true } })
    return c.json({ result })
}

async function oAuthGoogleCallback(c: Context) {

    // c.header('Content-Type', 'application/json');
    const body = await c.req.json()
    console.log("Google Auth Callback Body:", body)

    return c.json({ result: "TEST" })
}

async function session(c: Context) {
	const sessionId = 
        authUtil.extractSessionFromRequestHeader(c.req.header())
	const queries = 
        c.req.query()

    const isFreshStart = "fresh_start" in queries;

    console.log({ sessionId, queries, isFreshStart })

    if (!sessionId) {
        return c.json(errorUtil.responseErrorNoSessionHeader())
    }

    const result = await authService.checkSession(sessionId, isFreshStart)

    console.log({ result })

    return c.json({ result })
}



// export default new Hono()
//   .get('*', get)
//   .post('*', post)

// async function get(c: Context) {
//     const path = c.req.path
//     const query = c.req.query()
//     const result = await reflect({ path, query })

//     return c.json(result)
// }

// async function post(c: Context) {
//     const path = c.req.path
//     try {
//       const body = await c.req.json()
//       console.log(body)
//       const result = await reflect({ path, body, permitted: true, key: "OK"})
//       console.log(result)
  
//       return c.json({ result })
//     } catch (error: any) {
//       return c.json({ error: error.message })
//     }
// }

// async function reflect(data: any) {
//   return { ...data, api: 'ACCOUNT/REFLECT', timestamp: Date.now() }
// }
