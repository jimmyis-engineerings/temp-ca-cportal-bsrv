export function extractSessionFromRequestHeader(headers: any) {
    const { authorization } = headers;

    if (!authorization || !authorization.includes("Bearer")) {
        return undefined
    }

	return authorization?.replace("Bearer ", "")
}
