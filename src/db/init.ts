/**
 * Database Initialization
 * 
 * This file initializes the database:
 * 1. Ensures the database file exists
 * 2. Runs all pending migrations
 * 3. Initializes the database service
 */

import { db } from './service';

/**
 * Initialize the database
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // Run pending migrations
    await db.initialize();
    
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Initialize the database if this file is executed directly
 */
if (require.main === module) {
  (async () => {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('Database initialization failed:', error);
      process.exit(1);
    }
  })();
} 