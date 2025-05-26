/**
 * Database Service
 * 
 * Provides a clean API for database access using the schema definitions.
 * This service uses the schema constants to ensure consistent column and table names.
 */

export { sqlite } from './sqlite';

/**
 * Database Service Class
 */
export class DatabaseService {
  /**
   * Initialize the database service
   */
  async initialize(): Promise<void> {
    // TODO: Run any pending migrations

  }

  // /**
  //  * Build a parametrized SELECT query with an optional WHERE clause
  //  */
  // private buildSelectQuery(
  //   tableName: string,
  //   columns: string[] = ['*'],
  //   whereConditions?: Record<string, any>,
  //   orderBy?: string,
  //   orderDirection?: 'ASC' | 'DESC',
  //   limit?: number,
  //   offset?: number
  // ): { sql: string; params: any[] } {
  //   const columnsStr = columns.map(col => `"${col}"`).join(', ');
  //   let sql = `SELECT ${columnsStr} FROM "${tableName}"`;
  //   const params: any[] = [];
    
  //   if (whereConditions && Object.keys(whereConditions).length > 0) {
  //     const conditions = Object.entries(whereConditions)
  //       .filter(([_, value]) => value !== undefined)
  //       .map(([column, _]) => `"${column}" = ?`);
      
  //     if (conditions.length > 0) {
  //       sql += ` WHERE ${conditions.join(' AND ')}`;
  //       params.push(...Object.entries(whereConditions)
  //         .filter(([_, value]) => value !== undefined)
  //         .map(([_, value]) => value));
  //     }
  //   }
    
  //   if (orderBy) {
  //     sql += ` ORDER BY "${orderBy}" ${orderDirection || 'ASC'}`;
  //   }
    
  //   if (limit !== undefined) {
  //     sql += ` LIMIT ${limit}`;
  //   }
    
  //   if (offset !== undefined) {
  //     sql += ` OFFSET ${offset}`;
  //   }
    
  //   return { sql, params };
  // }

  // /**
  //  * Generic method to find records by conditions
  //  */
  // async findBy<T>(
  //   tableName: string,
  //   conditions: Record<string, any>,
  //   options: {
  //     columns?: string[];
  //     orderBy?: string;
  //     orderDirection?: 'ASC' | 'DESC';
  //     limit?: number;
  //     offset?: number;
  //   } = {}
  // ): Promise<T[]> {
  //   const { sql, params } = this.buildSelectQuery(
  //     tableName,
  //     options.columns,
  //     conditions,
  //     options.orderBy,
  //     options.orderDirection,
  //     options.limit,
  //     options.offset
  //   );
    
  //   const rows = await sqlite.query(sql).all(...params);
  //   return rows.map((row: Record<string, any>) => this.mapDatabaseRowToModel<T>(row));
  // }

  // /**
  //  * Find a single record by conditions
  //  */
  // async findOneBy<T>(
  //   tableName: string,
  //   conditions: Record<string, any>,
  //   options: {
  //     columns?: string[];
  //     orderBy?: string;
  //     orderDirection?: 'ASC' | 'DESC';
  //   } = {}
  // ): Promise<T | null> {
  //   const { sql, params } = this.buildSelectQuery(
  //     tableName,
  //     options.columns,
  //     conditions,
  //     options.orderBy,
  //     options.orderDirection,
  //     1
  //   );
    
  //   const row = await sqlite.query(sql).get(...params);
  //   return row ? this.mapDatabaseRowToModel<T>(row) : null;
  // }

  // /**
  //  * Find a record by ID
  //  */
  // async findById<T>(
  //   tableName: string,
  //   id: number | string,
  //   options: {
  //     columns?: string[];
  //   } = {}
  // ): Promise<T | null> {
  //   return await this.findOneBy<T>(tableName, { id }, options);
  // }

  // /**
  //  * Create a new record
  //  */
  // async create<T>(
  //   tableName: string,
  //   data: Record<string, any>
  // ): Promise<T> {
  //   const dbColumns = this.mapModelToDatabaseColumns(data);
  //   const columns = Object.keys(dbColumns);
  //   const placeholders = columns.map(() => '?').join(', ');
  //   const values = Object.values(dbColumns);
    
  //   const sql = `
  //     INSERT INTO "${tableName}" ("${columns.join('", "')}") 
  //     VALUES (${placeholders})
  //     RETURNING *
  //   `;
    
  //   const result = await sqlite.query(sql).get(...values);
  //   return this.mapDatabaseRowToModel<T>(result);
  // }

  // /**
  //  * Update a record by ID
  //  */
  // async update<T>(
  //   tableName: string,
  //   id: number | string,
  //   data: Record<string, any>
  // ): Promise<T | null> {
  //   const dbColumns = this.mapModelToDatabaseColumns(data);
  //   const updates = Object.keys(dbColumns).map(column => `"${column}" = ?`);
  //   const values = Object.values(dbColumns);
    
  //   if (updates.length === 0) {
  //     return await this.findById<T>(tableName, id);
  //   }
    
  //   const sql = `
  //     UPDATE "${tableName}" 
  //     SET ${updates.join(', ')} 
  //     WHERE "id" = ?
  //     RETURNING *
  //   `;
    
  //   const result = await sqlite.query(sql).get(...values, id);
  //   return result ? this.mapDatabaseRowToModel<T>(result) : null;
  // }

  // /**
  //  * Delete a record by ID
  //  */
  // async delete(
  //   tableName: string,
  //   id: number | string
  // ): Promise<boolean> {
  //   const sql = `DELETE FROM "${tableName}" WHERE "id" = ?`;
  //   const result = await sqlite.run(sql, [id]);
  //   return true; // In SQLite, DELETE doesn't return anything specific
  // }

  // /**
  //  * Execute a raw SQL query
  //  */
  // async query<T>(
  //   sql: string,
  //   params: any[] = []
  // ): Promise<T[]> {
  //   const rows = await sqlite.query(sql).all(...params);
  //   return rows.map((row: Record<string, any>) => this.mapDatabaseRowToModel<T>(row));
  // }

  // /**
  //  * Execute a raw SQL query and return the first row
  //  */
  // async queryOne<T>(
  //   sql: string,
  //   params: any[] = []
  // ): Promise<T | null> {
  //   const row = await sqlite.query(sql).get(...params);
  //   return row ? this.mapDatabaseRowToModel<T>(row) : null;
  // }

  // /**
  //  * Execute a raw SQL command (INSERT, UPDATE, DELETE)
  //  */
  // async execute(
  //   sql: string,
  //   params: any[] = []
  // ): Promise<any> {
  //   return await sqlite.run(sql, params);
  // }

  // /**
  //  * Get the comments for a content post
  //  */
  // async getCommentsForContent(
  //   contentId: number,
  //   options: {
  //     limit?: number;
  //     offset?: number;
  //   } = {}
  // ): Promise<any[]> {
  //   const sql = `
  //     SELECT c.*, u.username, u.avatar_url
  //     FROM "${Tables.COMMENT}" c
  //     JOIN "${Tables.USER_ACCOUNT}" u ON c.${CommentColumns.AUTHOR_ID} = u.${UserAccountColumns.ID}
  //     WHERE c.${CommentColumns.CONTENT_ID} = ?
  //     ORDER BY c.${CommentColumns.CREATED} ASC
  //     ${options.limit ? `LIMIT ${options.limit}` : ''}
  //     ${options.offset ? `OFFSET ${options.offset}` : ''}
  //   `;
    
  //   const rows = await sqlite.query(sql).all(contentId);
  //   return rows.map((row: Record<string, any>) => this.mapDatabaseRowToModel(row));
  // }

  // /**
  //  * Get the reactions for a content post
  //  */
  // async getReactionsForContent(
  //   contentId: number
  // ): Promise<any[]> {
  //   const sql = `
  //     SELECT r.*, u.username
  //     FROM "${Tables.REACTION}" r
  //     JOIN "${Tables.USER_ACCOUNT}" u ON r.${ReactionColumns.USER_ID} = u.${UserAccountColumns.ID}
  //     WHERE r.${ReactionColumns.CONTENT_ID} = ?
  //   `;
    
  //   const rows = await sqlite.query(sql).all(contentId);
  //   return rows.map((row: Record<string, any>) => this.mapDatabaseRowToModel(row));
  // }

  // /**
  //  * Count reactions by type for a content post
  //  */
  // async countReactionsByType(
  //   contentId: number
  // ): Promise<Record<string, number>> {
  //   const sql = `
  //     SELECT ${ReactionColumns.REACTION_TYPE} as type, COUNT(*) as count
  //     FROM "${Tables.REACTION}"
  //     WHERE ${ReactionColumns.CONTENT_ID} = ?
  //     GROUP BY ${ReactionColumns.REACTION_TYPE}
  //   `;
    
  //   const rows = await sqlite.query(sql).all(contentId);
  //   return rows.reduce((acc: Record<string, number>, row: { type: string; count: number }) => {
  //     acc[row.type] = row.count;
  //     return acc;
  //   }, {});
  // }
}

// Create and export a singleton instance
export const db = new DatabaseService(); 