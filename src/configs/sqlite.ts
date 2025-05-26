// TODO: Make this to be only config loading, no hardcoded config
const ENV = process.env //|| import.meta.env;
const { SQLITE_DATABASE_PATH } = ENV;
const databasePath = SQLITE_DATABASE_PATH;
const shouldCreate = false;
const shouldReadOnly = false;
const shouldStrictMode = false; // Will automatically create the database if it does not exist
const shouldSafeIntegers = false;

const options = (!shouldCreate && !shouldReadOnly && !shouldStrictMode && !shouldSafeIntegers) 
    ? null 
    : {
        create: shouldCreate,
        readonly: shouldReadOnly,
        strict: shouldStrictMode,
        safeIntegers: shouldSafeIntegers
    }

export default {
    databasePath,
    options
}
