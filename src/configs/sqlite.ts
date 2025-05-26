// TODO: Make this to be only config loading, no hardcoded config
const ENV = process.env //|| import.meta.env;
const { SQLITE_DATABASE_PATH } = ENV;
const databasePath = SQLITE_DATABASE_PATH;
const shouldCreate = true;
const shouldReadOnly = false;
const shouldStrictMode = true;
const shouldSafeIntegers = false;

export default {
    databasePath,
    options: {
        create: shouldCreate,
        readonly: shouldReadOnly,
        strict: shouldStrictMode,
        safeIntegers: shouldSafeIntegers
    }
}
