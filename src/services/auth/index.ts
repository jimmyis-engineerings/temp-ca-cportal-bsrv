// import { sqlite } from "@/shared/services/db/sqlite";
import { sqlite } from "../../db/sqlite";

import { hashUtil, errorUtil } from '@/shared/utils'
import * as authUtil from './util'
// import { userModel } from "@/model";
// import { contentController, userController } from "@/controller";

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
        console.error(e.code)
    }
}

export async function signin(data: any) {
    try {
        const { user } = data
        const { email, password: rawPassword } = user
        const username = email
        
        const now = new Date()   
        const latestSignin = now.getTime()

        if (!authUtil.checkSigninInput(user)) {
            return { success: false, error: { message: "Required inputs is missing" }}
        }

        const userAccountData = await getUserAccount(username);

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

async function createUserSession(userId: string, deviceId: string) {
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


export async function checkSession(
    sessionId: string,
    isFreshStart?: boolean
) {
    try {
        const now = Math.floor(new Date().getTime() / 1000); // Current time in seconds

        if (!sessionId) {
            console.error("Missing session ID in request");
            
            return errorUtil.responseErrorNoSessionHeader()
        }

        console.log("Checking session ID:", sessionId);
        
        // const result = await getSession(sessionId, isFreshStart);
        const result = {}

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

// async function getSession(
//     sessionId: string,
//     isFreshStart?: boolean
// ) {
//     if (!isFreshStart) {
//         const data = await userModel
//             .userSession
//             .getSessionData(sessionId);
        
//         return data;
//     }

//     const data = await userModel
//         .userSession
//         .getSessionWithFreshStartData(sessionId);

//     return data;
// }

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
    username: string
) {
    // const makeAlias = authUtil.makeAliasForUserAccountColumn;

    const requestFields = [
        'id',
        'username',
        'alias',
        'password_hash as secret',
        'created_epoch'
    ];

    const query = sqlite.query(
        `SELECT ${requestFields.join(', ')} FROM UserAccount WHERE username = $username`
    );

    return await query.get({ $username: username});
}
