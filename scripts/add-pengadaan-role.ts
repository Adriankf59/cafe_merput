/**
 * Migration script to add Pengadaan role and user
 */

import { v4 as uuidv4 } from 'uuid';
import { execute, query, getPool, closePool } from '../lib/db/connection';
import { hashPassword } from '../lib/utils/password';
import { RowDataPacket } from 'mysql2/promise';

async function migrate() {
  console.log('Adding Pengadaan role and user...');
  
  try {
    getPool();

    // Check if role already exists
    interface RoleRow extends RowDataPacket {
      role_id: string;
    }
    
    const existingRoles = await query<RoleRow[]>(
      'SELECT role_id FROM roles WHERE nama_role = ?',
      ['Pengadaan']
    );

    let roleId: string;
    
    if (existingRoles.length > 0) {
      roleId = existingRoles[0].role_id;
      console.log('Pengadaan role already exists');
    } else {
      // Create Pengadaan role
      roleId = uuidv4();
      await execute(
        'INSERT INTO roles (role_id, nama_role) VALUES (?, ?)',
        [roleId, 'Pengadaan']
      );
      console.log('Created Pengadaan role');
    }

    // Check if user already exists
    interface UserRow extends RowDataPacket {
      user_id: string;
    }
    
    const existingUsers = await query<UserRow[]>(
      'SELECT user_id FROM users WHERE email = ?',
      ['pengadaan@cafemerahputih.com']
    );

    if (existingUsers.length > 0) {
      console.log('Pengadaan user already exists');
    } else {
      // Create Pengadaan user
      const userId = uuidv4();
      const hashedPassword = await hashPassword('pengadaan123');
      
      await execute(
        'INSERT INTO users (user_id, username, password, email, role_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'Pengadaan User', hashedPassword, 'pengadaan@cafemerahputih.com', roleId, 'Aktif']
      );
      console.log('Created Pengadaan user');
    }

    console.log('\nMigration completed!');
    console.log('New user: pengadaan@cafemerahputih.com / pengadaan123 (Pengadaan)');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();
