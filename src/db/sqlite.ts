// SQLite driver with support for both Bun and Node.js environments
import sqliteConfig from "../configs/sqlite";

let sqlite: any;

// Try to import Bun's SQLite driver first, then fall back to better-sqlite3
try {
  // This will work in the Bun environment
  const { Database } = require('bun:sqlite');
  sqlite = new Database(
    sqliteConfig.databasePath,
    sqliteConfig.options
  );
} catch (error) {
  try {
    // Fall back to better-sqlite3 for Node.js
    const Database = require('better-sqlite3');
    const db = new Database(sqliteConfig.databasePath, {
      fileMustExist: false,
      readonly: sqliteConfig.options.readonly,
      verbose: console.log
    });
    
    // Create a compatibility layer to match Bun's SQLite API
    sqlite = {
      Database: Database,
      run: (sql: string, params: any[] = []) => {
        try {
          return db.prepare(sql).run(...params);
        } catch (err) {
          console.error(`Error executing SQL: ${sql}`);
          console.error(`With params: ${JSON.stringify(params)}`);
          throw err;
        }
      },
      query: (sql: string) => {
        const stmt = db.prepare(sql);
        return {
          get: (...args: any[]) => {
            try {
              // Handle different parameter formats
              if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
                // Named parameters object
                return stmt.get(args[0]);
              } else {
                // Positional parameters
                return stmt.get(...args);
              }
            } catch (err) {
              console.error(`Error executing SQL query.get: ${sql}`);
              console.error(`With args: ${JSON.stringify(args)}`);
              throw err;
            }
          },
          all: (...args: any[]) => {
            try {
              // Handle different parameter formats
              if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
                // Named parameters object
                return stmt.all(args[0]);
              } else {
                // Positional parameters
                return stmt.all(...args);
              }
            } catch (err) {
              console.error(`Error executing SQL query.all: ${sql}`);
              console.error(`With args: ${JSON.stringify(args)}`);
              throw err;
            }
          }
        };
      }
    };
  } catch (fallbackError) {
    console.error('Failed to load SQLite driver for Bun or better-sqlite3:', fallbackError);
    throw new Error('No compatible SQLite driver found. Please install better-sqlite3 for Node.js or use Bun.');
  }
}

console.log(`Using database at: ${sqliteConfig.databasePath}`);

export { sqlite };
