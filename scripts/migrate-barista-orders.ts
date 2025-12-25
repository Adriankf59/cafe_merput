/**
 * Migration script to add barista_orders tables
 */

import { execute, getPool, closePool } from '../lib/db/connection';

async function migrate() {
  console.log('Starting migration for barista_orders tables...');
  
  try {
    getPool();

    // Drop tables if exist (for clean migration)
    try {
      await execute('DROP TABLE IF EXISTS barista_order_items');
      await execute('DROP TABLE IF EXISTS barista_orders');
      console.log('Dropped existing tables (if any)');
    } catch (e) {
      // Ignore errors
    }

    // Create barista_orders table
    await execute(`
      CREATE TABLE barista_orders (
        order_id VARCHAR(36) PRIMARY KEY,
        order_number VARCHAR(20) NOT NULL,
        transaksi_id VARCHAR(36),
        cashier_id VARCHAR(36) NOT NULL,
        status ENUM('waiting', 'processing', 'ready', 'completed') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (transaksi_id) REFERENCES transactions(transaksi_id) ON DELETE SET NULL,
        FOREIGN KEY (cashier_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('Created barista_orders table');

    // Create barista_order_items table
    await execute(`
      CREATE TABLE barista_order_items (
        item_id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        produk_id VARCHAR(36) NOT NULL,
        jumlah INT NOT NULL,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES barista_orders(order_id) ON DELETE CASCADE,
        FOREIGN KEY (produk_id) REFERENCES products(produk_id) ON DELETE CASCADE
      )
    `);
    console.log('Created barista_order_items table');

    // Create indexes
    await execute(`CREATE INDEX idx_barista_orders_status ON barista_orders(status)`);
    await execute(`CREATE INDEX idx_barista_orders_cashier ON barista_orders(cashier_id)`);
    await execute(`CREATE INDEX idx_barista_orders_created ON barista_orders(created_at)`);
    await execute(`CREATE INDEX idx_barista_order_items_order ON barista_order_items(order_id)`);
    console.log('Created indexes');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();
