import { Hono, Context } from 'hono'
import {google} from 'googleapis';
import crypto from 'crypto';

import * as authService from '@/services/auth'

import { authUtil, errorUtil } from '@/shared/utils';
import { oauthConfig } from '@/configs';

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
    // console.log("Google Auth Callback Body:", body)
    console.log({ oauthConfig, body })

    const { googleOAuth2 } = oauthConfig;

    const oauth2Client = new google.auth.OAuth2(
        googleOAuth2.clientId,
        googleOAuth2.clientSecret,
        googleOAuth2.redirectUrl
    );

    /*  
    const scopes = [
        body.scope,
        // 'https://www.googleapis.com/auth/drive.metadata.readonly',
        // 'https://www.googleapis.com/auth/calendar.readonly'
    ];

    // Generate a secure random state value.
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in the session
    // req.session.state = state;

    // Generate a url that asks permissions for the Drive activity and Google Calendar scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        //** Pass in the scopes array defined above.
        //    * Alternatively, if only one scope is needed, you can pass a scope URL as a string 
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        // Include the state parameter to reduce the risk of CSRF attacks.
        state: state
    });

    return c.json({ result: {
        state: state,
        authorizationUrl
    } }) 
    */
   // Receive the callback from Google's OAuth 2.0 server.

    try {
        let { tokens } = await oauth2Client.getToken(body.code);
        oauth2Client.setCredentials(tokens);
    
        return c.json({ 
            result: {
                tokens
            } 
        }) 
    } catch (error: any) {
        console.log("Error during OAuth callback:", error);

        return c.json({
            result: {
                success: false,
                error: {
                    message: error.message || "Unknown error during OAuth callback"
                }
            }
        })
    }

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
