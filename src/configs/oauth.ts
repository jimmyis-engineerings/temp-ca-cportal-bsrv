const ENV = process.env //|| import.meta.env;
const {
    GOOGLE_OAUTH2_CLIENT_ID,
    GOOGLE_OAUTH2_CLIENT_SECRET,
    GOOGLE_OAUTH2_REDIRECT_URI
} = ENV;

export default {
    googleOAuth2: {
        clientId: GOOGLE_OAUTH2_CLIENT_ID,
        clientSecret: GOOGLE_OAUTH2_CLIENT_SECRET,
        redirectUri: GOOGLE_OAUTH2_REDIRECT_URI
    }
}
