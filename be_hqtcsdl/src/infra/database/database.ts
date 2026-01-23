import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { config } from '../../config';

class Database {
  private pool: Pool | null = null;

  async connect(): Promise<void> {
    if (this.pool) return;

    this.pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.username,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    try {
      const connection = await this.pool.getConnection();
      console.log('📦 Database pool created & connected');
      connection.release();
    } catch (error) {
      console.error('❌ Database connection failed:', (error as Error).message);
      throw error;
    }
  }

  async getConnection(): Promise<PoolConnection> {
    if (!this.pool) {
      await this.connect();
    }
    return this.pool!.getConnection();
  }

  // Execute SELECT queries - returns rows
  async query<T>(sql: string, params?: unknown[]): Promise<T> {
    if (!this.pool) {
      await this.connect();
    }
    const [rows] = await this.pool!.query(sql, params);
    return rows as T;
  }

  // Execute INSERT, UPDATE, DELETE - returns result info
  async execute(sql: string, params?: unknown[]): Promise<ResultSetHeader> {
    if (!this.pool) {
      await this.connect();
    }
    const [result] = await this.pool!.execute<ResultSetHeader>(sql, params);
    return result;
  }

  // Execute raw query with EXPLAIN for performance analysis
  async explain<T>(sql: string, params?: unknown[]): Promise<T> {
    return this.query<T>(`EXPLAIN ${sql}`, params);
  }

  // Execute EXPLAIN ANALYZE for detailed performance metrics
  async explainAnalyze<T>(sql: string, params?: unknown[]): Promise<T> {
    return this.query<T>(`EXPLAIN ANALYZE ${sql}`, params);
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('📦 Database pool closed');
    }
  }
}

export const database = new Database();
