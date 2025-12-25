import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'cafe_merah_putih',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool (singleton pattern)
let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool created');
  }
  return pool;
}

/**
 * Get a connection from the pool
 */
export async function getConnection(): Promise<PoolConnection> {
  const pool = getPool();
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Failed to get database connection:', error);
    throw new Error('Database connection failed. Please check your database configuration.');
  }
}


/**
 * Execute a SELECT query with prepared statements
 * @param sql - SQL query string with placeholders (?)
 * @param params - Array of parameters to bind
 * @returns Array of rows
 */
export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: (string | number | boolean | Date | null)[] = []
): Promise<T> {
  const pool = getPool();
  try {
    const [rows] = await pool.execute<T>(sql, params);
    return rows;
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

/**
 * Execute an INSERT, UPDATE, or DELETE query with prepared statements
 * @param sql - SQL query string with placeholders (?)
 * @param params - Array of parameters to bind
 * @returns ResultSetHeader with affectedRows, insertId, etc.
 */
export async function execute(
  sql: string,
  params: (string | number | boolean | Date | null)[] = []
): Promise<ResultSetHeader> {
  const pool = getPool();
  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (error) {
    console.error('Execute failed:', error);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param callback - Function that receives a connection and executes queries
 * @returns Result of the callback function
 */
export async function transaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed, rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Test database connection
 * @returns true if connection is successful
 * @throws Error if connection fails (for detailed error handling)
 */
export async function testConnection(): Promise<boolean> {
  const pool = getPool();
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  console.log('Database connection test successful');
  return true;
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL connection pool closed');
  }
}
