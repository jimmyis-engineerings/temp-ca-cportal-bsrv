import { Hono, Context } from 'hono'
import {google} from 'googleapis';
import crypto from 'crypto';

import * as authService from '@/services/auth'

import { authUtil, errorUtil } from '@/shared/utils';
import { oauthConfig } from '@/configs';

const { googleOAuth2 } = oauthConfig;
const oauth2ClientOptions = oauthConfig.googleOAuth2;
const oauth2Client = new google.auth.OAuth2(
    oauth2ClientOptions
);


export default new Hono()
  .get('/', get)
  .post('/signup', signup)
  .post('/signin', signin)
  .get('/signout', signout)
  .get('/session', session)
  .get('/oauth/google', oAuthGoogle)
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


async function oAuthGoogle(c: Context) {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
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
        prompt: 'consent', // Prompt the user for consent every time
        //** Pass in the scopes array defined above.
        //    * Alternatively, if only one scope is needed, you can pass a scope URL as a string 
        response_type: 'code',
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        // Include the state parameter to reduce the risk of CSRF attacks.
        state: state,
        ux_mode: 'popup', // Use 'popup' for a popup window, or 'redirect' for a full redirect
    
        redirect_uri: googleOAuth2.redirectUri,
    });

    return c.json({ result: {
        state: state,
        authorizationUrl
    } }) 
   
   // Receive the callback from Google's OAuth 2.0 server.
}

async function oAuthGoogleCallback(c: Context) {
    const body = await c.req.json()
    // console.log("OAuth2 Client Options:", oauth2ClientOptions);
    // console.log("OAuth2 Client:", oauth2Client);

    try {
        const tokens = await googleOAuth2TokenExchange(body.code);

        // console.log("OAuth2 Auth Code exchange result:", { tokens });
        // 
        /* Sample of token response
        tokens: {
            id_token: string
            access_token: string
            refresh_token: string
            token_type: "Bearer"
            expires_in: number (3599)
            scope: "https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email"
        }
        */
        // If any error occurs during the token exchange, it will be caught in the catch block.

        oauth2Client.setCredentials(tokens);
    
        const isRefreshTokenExists = tokens.refresh_token && tokens.refresh_token.length > 0;
        
        if (!isRefreshTokenExists) {
            throw new Error("Refresh token is missing in the response from Google OAuth2 token exchange. This may be due to the access_type not being set to 'offline' or the user not granting permission for offline access.");
        }

        // check if the token is valid
        const isAccessTokenExists = tokens.access_token && tokens.access_token.length > 0;

        if (!isAccessTokenExists) {
            // TODO: Use the refresh token to get a new access token
        }
 
        // TODO: OAuth Info (Profile): Use access token to fetch user profile information
        const userProfile = await getUserProfileOnGoogle(tokens.access_token);

        console.log("User Profile from Google:", userProfile);

        // TODO: Store tokens (especially refresh token) securely in the database or session store.


        // TODO: User Existence: Check if the user exists in your database.
        const existsUserAccount = await authService.getUserAccount(userProfile.email);
        
        console.log("User Account Existence Check:", { existsUserAccount });
        
        // CASE #1: If not, send response for user to create a new user account with the info from OAuth.
            // TODO: Send response to the user to create a new account with the info from OAuth. (Opt-in to create a new account or link to an existing account)
        if (!existsUserAccount) {
            return c.json({
                result: {
                    success: true,
                    tokens,
                    userProfile,
                    message: "User account does not exist. Please create a new account.",
                    signal: "CREATE_NEW_ACCOUNT", // Signal to the client to create a new account
                }
            })
        }

        // CASE #2: If the user exists, check to see if they have linked their account with the system.
        if (!existsUserAccount.linked_google) {
        // CASE #2.1 : User has not linked their account with the system yet.
            // TODO: Send signal response to the user to link their account with the system. (Opt-in to link to an existing account)
            return c.json({
                result: {
                    success: true,
                    tokens,
                    userProfile, 
                    signal: "ACCOUNT_EXISTS_LINKING_NEEDED", // Signal to the client that the account exists
                }
            })

        } else {
        // CASE #2.2 : User has linked their account with the system.
            // TODO: Create a session for the user and return the session ID.
            const sessionId = await authService.createUserSession(existsUserAccount.id, "0");

            return c.json({
                result: {
                    success: true,
                    tokens,
                    account: existsUserAccount,
                    session: {
                        id: sessionId
                    },
                    userProfile, // TODO: Change user profile to the existing user profile in the system.
                    signal: "LOGIN_SUCCESSFULLY", // Signal to the client that the account exists
                }
            })
        }


    } catch (error: any) {
        console.log("Error during OAuth callback:", error);
        console.log("Error details:", {
            message: error.message,
            code: error.code,
            description: error.description,
        })

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


// Services
async function googleOAuth2TokenExchange(code: string) {
    try {
        if (!code) {
            throw new Error("Authorization code is required for token exchange.");
        }

        const url = "https://oauth2.googleapis.com/token";
        const method = "POST";
        const payload = {
            code,
            client_id: oauth2ClientOptions.clientId ?? "",
            client_secret: oauth2ClientOptions.clientSecret ?? "",
            redirect_uri: oauth2ClientOptions.redirectUri ?? "",
            grant_type: "authorization_code"
        }
        const formBody = new URLSearchParams(payload).toString();

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody,
        });

        return response.json();

    } catch (error: any) {
        console.error("Error during Google OAuth2 token exchange:", error);

        throw new Error(error.message || "Unknown error during OAuth2 token exchange");
    }
}

async function getUserProfileOnGoogle(access_token: string) {
    try {
        if (!access_token) {
            throw new Error("Access token is required to fetch user profile.");
        }

        const url = "https://www.googleapis.com/oauth2/v2/userinfo";
        const method = "GET";
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.json();

    } catch (error: any) {
        console.error("Error on getting user profile:", error);

        throw new Error(error.message || "Unknown error on getting user profile");
    }
}
