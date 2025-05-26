// import * as bcrypt from "bcrypt";

export function checkSignupInput({ name, email, password }: any) {
    return email.length > 0
        && password.length > 0
        && name.length > 0
}

export function checkSigninInput({ email, password }: any) {
    return email.length > 0
        && password.length > 0
}

export async function hashPassword(
    password: string
) {   
    return await bunHashPassword(password)
    // // use built-in bcrypt in bun
    // if (Bun) {
    //     return await Bun.password.hash(password, {
    //         algorithm: "bcrypt",
    //         cost
    //     });
    // }

    // // Fallback to bcrypt in node
    // return await bcrypt.hash(password, cost);
}

async function bunHashPassword (
    password: string,
    cost: number = 10 /* between 4-31, 10 is default */
) {
    return await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost
    });
}

export async function verifyPassword(
    password: string,
    hash: string
) {
    if (!password || !hash) return false

    return await bunVerifyPassword(password, hash)
    
    // // use built-in bcrypt in bun
    // if (Bun) {
    //     return await Bun.password.verify(password, hash);
    // }
    // return await bcrypt.compare(password, hash);
}

async function bunVerifyPassword(
    password: string,
    hash: string
) {
    return await Bun.password.verify(password, hash);
}
