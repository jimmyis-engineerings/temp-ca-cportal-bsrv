// import { sqlite } from "@/shared/services/db/sqlite";
import { sqlite } from "../../db/sqlite";

import { hashUtil, errorUtil, jsonUtil } from '@/shared/utils'
import * as authUtil from './util'
// import { userModel } from "@/model";
// import { contentController, userController } from "@/controller";

// TODO: Making this to be a dictionary config
const USER_SESSION_TABLE = 'UserSession';
const USER_OAUTH_TABLE = 'USER_OAUTH';

// TODO: CONFIG: Making this to be an permanenet secured config
const SALT = "ABC"

export async function signup(data: any) {
    try {

        console.log("Signup data:", { data })

        if (!authUtil.checkSignupInput(data)) {
            return { success: false, error: { message: "Required inputs is missing" }}
        }

        const { 
            oauthRegistration,
            includePassword,
            firstname,
            lastname,
            email,
            password,
            organizationId
        } = data

        const now = new Date()    
        const hash = hashUtil.createSHA256Hash([now, Math.random()])
        const id = hash.substring(0, 16)
        const created_epoch = now.getTime()
        // const created_at = convertDateTimetoISO8601(now)
        const updated_epoch = created_epoch
        const password_hash = oauthRegistration && !includePassword ? null :
            await authUtil.hashPassword(password)
        
        // const result = {
        //     ...data,
        //     now,
        //     hash,
        //     id,
        //     created_epoch,
        //     updated_epoch,
        //     password_hash,
        //     success: true
        // }

        const result = await createUserAccount(
            {
                ...data,
                now,
                hash,
                id,
                created_epoch,
                updated_epoch,
                password_hash,
            }
        )
        console.log("User account creation result:", { result })


        return { result: { success: true, ...result } }

    } catch (e: any) {
        console.error(e)
        console.error(e.message)

        return { success: false, error: e.message || "UNKNOWN_ERROR_CREATE_USER_ACCOUNT"  }
    }
}

export async function signin(data: any) {
    try {
        const { user } = data
        const { email, password: rawPassword } = user
        
        const now = new Date()   
        const latestSignin = now.getTime()

        if (!authUtil.checkSigninInput(user)) {
            return { success: false, error: { message: "Required inputs is missing" }}
        }

        const userAccountData = await getUserAccount(email);

        if (!userAccountData) {
            return { success: false, error: { message: "User not found" }}
        }

        
        const isPasswordValid = 
            await authUtil.verifyPassword(
                rawPassword,
                userAccountData?.secret
        )

        if (!isPasswordValid) {
            return { success: false, error: { message: "Wrong Password" }}
        }
        
        // Create and Store User Session
        const sessionId =
            await createUserSession(userAccountData.id, "0")
      
        const response = {
            success: true,
            data: {
                account: userAccountData,
                session: {
                    id: sessionId
                }
            }
             //await userModel.userSession.getSessionWithFreshStartData(sessionId)
        }
            
        console.group("SIGNIN", { response })
        console.groupEnd()

        return response

    } catch (e: any) {
        console.error(e)
        console.error(e.code)

        return { success: false, error: { message: e.message || "Unknown error" } }
    }
}

export async function signout(sessionId: string) {
    try {

        if (!sessionId) {
            return {
                success: false,
                code: "INVALID_SESSION_ID"
            }
        }

        // const result = await removeSession(sessionId)
        const result = {}

        return result

    } catch (e: any) {
        console.error(e)
        console.error(e.code)
        return { success: false, error: { message: e.message || "Unknown error" } }
    }
}

export async function createUserSession(userId: string, deviceId: string) {
    // Generate a unique session ID based on user ID and device ID
    const hash = hashUtil.createSHA256Hash([userId, deviceId, new Date().getTime(), Math.random()]);
    const id = hash.substring(0, 16);
    const now = Math.floor(new Date().getTime() / 1000); // Current time in seconds
    const retention = 7 * 24 * 60; // 7 days in minutes (default retention period)

    try {
        console.log("Creating session with ID:", id);
        
        // Insert into UserSession table with the correct schema
        const { changes } = sqlite.run(
            `INSERT INTO UserSession (id, user_id, created_epoch, expires_epoch, last_active_epoch) 
             VALUES (?, ?, ?, ?, ?) 
             ON CONFLICT(id) DO UPDATE SET 
                created_epoch = excluded.created_epoch,
                expires_epoch = excluded.expires_epoch
             RETURNING *`,
            [id, userId, now, now + retention, now]
            // `INSERT INTO UserSession (id, created_, retention) 
            //  VALUES (?, ?, ?) 
            //  ON CONFLICT(id) DO UPDATE SET 
            //     created_at = excluded.created_at,
            //     retention = excluded.retention
            //  RETURNING *`,
            // [id, now, retention]
        );

        if (changes < 1) {
            console.error("No changes made when creating session");
            throw Error("Error creating session id");
        }
    
        console.log("Session created successfully");
        return id;
    } catch (e) {
        console.error("Error creating session:", e);
        throw e; // Re-throw to handle in the calling function
    }
}

export async function storeUserOAuthTokens(
    userId: string,
    sessionId: string,
    tokens: any
) {

    console.log("Storing user OAuth tokens:", { userId, sessionId, tokens });

    if (!userId || !sessionId || !tokens) {
        throw new Error("Missing required parameters: userId, sessionId, or tokens");
    }
    
    const now = Math.floor(new Date().getTime() / 1000); // Current time in seconds
    const provider = "google"; // TODO: Replace with actual provider, Remove hardcoded value
    const access_token = tokens.access_token || null;
    const refresh_token = tokens.refresh_token || null;
    const expires_epoch = now + (tokens.expires_in || 3600); // Default to 1 hour if not provided
    const id_token = tokens.id_token || null;
    const scope = tokens.scope || null;
    const token_type = tokens.token_type || "Bearer";
    const id = hashUtil.createSHA256Hash([userId, provider]).substring(0, 16);

    try {
        console.log("Storing user oauth tokens");
        
        // Insert into USER_OAUTH table with the correct schema
        const result = sqlite.run(
            `INSERT 
                INTO USER_OAUTH (
                    id,
                    user_id,
                    session_id,
                    provider,
                    token_type,
                    access_token,
                    refresh_token,
                    id_token,
                    scope,
                    created_epoch,
                    expires_epoch
                ) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
             ON CONFLICT(id) DO UPDATE SET 
                created_epoch = excluded.created_epoch,
                expires_epoch = excluded.expires_epoch,
                session_id = excluded.session_id,
                refresh_token = excluded.refresh_token,
                access_token = excluded.access_token,
                id_token = excluded.id_token,
                scope = excluded.scope,
                token_type = excluded.token_type

             RETURNING *`,
            [
                id, userId, sessionId, provider, token_type,
                access_token, refresh_token, id_token,
                scope, now, expires_epoch
            ]
        );

        console.log("OAuth tokens stored successfully:", { result });

        const { changes } = result;

        if (changes < 1) {
            console.error("No changes made when creating session");
            throw Error("Error creating session id");
        }
    
        console.log("Session created successfully");
        return id;
    } catch (e) {
        console.error("Error creating session:", e);
        throw e; // Re-throw to handle in the calling function
    }
}


export async function checkSession(
    sessionId: string
) {
    try {
        const now = Math.floor(new Date().getTime() / 1000); // Current time in seconds

        if (!sessionId) {
            console.error("Missing session ID in request");
            
            return errorUtil.responseErrorNoSessionHeader()
        }

        console.log("Checking session ID:", sessionId);
        
        const result = await getSession(sessionId);

        console.log({ result })

        if (!result) {
            console.log("Session not found");
            return errorUtil.responseErrorNoSessionFound();
        }

        // Check if session is still valid based on creation time and retention period
        // const sessionCreatedAt = result.created_epoch;
        // const expiresAt = result.expires_epoch;
        const expiresAt = now + 7 * 24 * 60 * 60; // Example: 7 days from now
        
        if (now > expiresAt) {
            console.log("Session expired");

            return errorUtil.responseErrorSessionExpired();
        }

        return errorUtil.createSuccessResponse(result)
        
    } catch (e: any) {
        console.error("Error checking session:", e);
        return { success: false, error: { message: e.message || "Unknown error" } };
    }
}

async function createUserAccount(params: any) {
    const {
        oauthRegistration,
        // includePassword,
        // firstname,
        // lastname,
        email,
        // password,
        // organizationId,
        // now,
        // hash,
        id,
        created_epoch,
        updated_epoch,
        password_hash,
    } = params;

    const isUserExists = await getUserAccount(email);

    if (isUserExists) {
        throw new Error("USER_ALREADY_EXISTS");
    }

    const email_verified = oauthRegistration ? 1 : 0;
    const active_status = 1;
    const last_login_epoch = 0;
    const oauth = oauthRegistration ? 1 : 0;
    const linked_google = oauthRegistration ? 1 : 0;

    console.log("createUserAccount", { params })

    // TODO: ADD-TRY_CATCH:
    // Insert user account
    const { changes, /* lastInsertRowid */ }
        = sqlite.run(
            `
            INSERT 
                INTO UserAccount (
                    id, email, password_hash, email_verified, active_status,
                    last_login_epoch, created_epoch, updated_epoch, oauth, linked_google
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                email,
                password_hash,
                email_verified,
                active_status,
                last_login_epoch,
                created_epoch,
                updated_epoch,
                oauth,
                linked_google
            ]
        )

    const isInsertSuccess = changes > 0

    return { isInsertSuccess, changes }
    
    // const { isInsertSuccess: isInsertUserAccountSuccess } = 
    //     await userModel.userAccount.insert(userAccountInput)
    
    // if (isInsertUserAccountSuccess) {
    //     const userProfileInsertResult = 
    //         await userModel.userProfile.insertBlank(
    //             userAccountInput.id,
    //             name,
    //             userAccountInput.created_epoch,
    //             userAccountInput.updated_epoch
    //         );

    //     const isInsertUserProfileSuccess = userProfileInsertResult?.isInsertSuccess || false;

    //     return {
    //         isInsertUserAccountSuccess,
    //         isInsertUserProfileSuccess
    //     }
    // }

    // return { isInsertUserAccountSuccess }
}
// async function createUserAccountWithoutProfile(
//     userAccountInput: User.UserAccount.UserAccountInput,
//     name: string
// ) {
//     const { isInsertSuccess: isInsertUserAccountSuccess } = 
//         await userModel.userAccount.insert(userAccountInput)
    
//     if (isInsertUserAccountSuccess) {
//         const userProfileInsertResult = 
//             await userModel.userProfile.insertBlank(
//                 userAccountInput.id,
//                 name,
//                 userAccountInput.created_epoch,
//                 userAccountInput.updated_epoch
//             );

//         const isInsertUserProfileSuccess = userProfileInsertResult?.isInsertSuccess || false;

//         return {
//             isInsertUserAccountSuccess,
//             isInsertUserProfileSuccess
//         }
//     }

//     return { isInsertUserAccountSuccess }
// }

// async function removeSession(sessionId: string) {

//     return await userModel.userSession.deleteById(sessionId)
// }

async function getSession(
    sessionId: string
) {
    // TODO: Complete the try catch block
    try {
        // TODO: Migrate to use userModel.userSession.getSession(sessionId)
        const query = sqlite.query(
            `SELECT 
                json_object(
                    'id', ${USER_SESSION_TABLE}.id,
                    'created_epoch', ${USER_SESSION_TABLE}.created_epoch,
                    'expires_epoch', ${USER_SESSION_TABLE}.expires_epoch,
                    'last_active_epoch', ${USER_SESSION_TABLE}.last_active_epoch
                ) AS sessionJson,

                json_object(
                    'provider', ${USER_OAUTH_TABLE}.provider,
                    'token_type', ${USER_OAUTH_TABLE}.token_type,
                    'access_token', ${USER_OAUTH_TABLE}.access_token,
                    'id_token', ${USER_OAUTH_TABLE}.id_token,
                    'scope', ${USER_OAUTH_TABLE}.scope,
                    'created_epoch', ${USER_OAUTH_TABLE}.created_epoch,
                    'expires_epoch', ${USER_OAUTH_TABLE}.expires_epoch  
                ) AS tokensJson

            FROM ${USER_SESSION_TABLE}
            JOIN ${USER_OAUTH_TABLE} 
                ON ${USER_SESSION_TABLE}.id = ${USER_OAUTH_TABLE}.session_id
            WHERE ${USER_SESSION_TABLE}.id = $sessionId
            ORDER BY ${USER_SESSION_TABLE}.created_epoch DESC
            LIMIT 1
        `);

        const result = await query.get({ $sessionId: sessionId });
        console.log("getSession=>", { result }, { sessionId})
        const session = jsonUtil.safeParseJson(result?.sessionJson);
        const tokens = jsonUtil.safeParseJson(result?.tokensJson);

        return { session, tokens };

    } catch (e: any) {
        console.error("Error getting session:", e);

        throw new Error(e.message || "Unknown error while getting session");
    }
}

// async function getUserAccount(
//     username: User.UserAccount.USERNAME
// ) {
//     const makeAlias = userModel
//             .userAccount
//             .makeAliasForUserAccountColumn

//     const requestFields = [
//         DBSchema.Table.UserAccountColumns.ID,
//         DBSchema.Table.UserAccountColumns.USERNAME,
//         makeAlias(
//             DBSchema.Table.UserAccountColumns.ACTIVE_ALIAS,
//             'alias'
//         ),
//         makeAlias(
//             DBSchema.Table.UserAccountColumns.PASSWORD_HASH,
//             'secret'
//         ),
//         DBSchema.Table.UserAccountColumns.CREATED_EPOCH
//     ]
        
//     return await userModel
//         .userAccount
//         .selectByUsername(
//             username,
//             requestFields
//         )
// }
export async function getUserAccount(
    email: string
) {
    // const makeAlias = authUtil.makeAliasForUserAccountColumn;

    const requestFields = [
        'id',
        'email',
        'password_hash as secret',
        'created_epoch',
        'oauth',
        'linked_google',
    ];

    const query = sqlite.query(
        `SELECT ${requestFields.join(', ')} FROM UserAccount WHERE email = $email`
    );

    return await query.get({ $email: email});
}
