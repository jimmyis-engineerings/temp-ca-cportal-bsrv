export function extractSessionIdFromRequestHeader(headers: any) {
    console.log(headers);
    
    const sessionId = headers['x-session'] || headers['X-Session'];

    if (!sessionId) {
        return undefined
    }

	return sessionId
}
