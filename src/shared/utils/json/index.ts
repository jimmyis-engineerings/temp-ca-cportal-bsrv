export function safeParseJson(jsonString: string | null) {
    try {
        return jsonString ? JSON.parse(jsonString) : null;
    } catch (e) {
        console.error("Error parsing JSON:", e);
        return undefined;
    }
}