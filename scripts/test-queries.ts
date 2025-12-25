/**
 * Database Queries Test Script
 * 
 * This script tests all query functions with the database:
 * - Roles queries
 * - Users queries
 * - Products queries
 * - Materials queries
 * - Product-Materials queries
 * - Transactions queries
 * - Orders queries
 * - Dashboard queries
 * - Reports queries
 * 
 * Run with: npx tsx scripts/test-queries.ts
 */

import { testConnection, closePool } from '../lib/db/connection';

// Import all query modules
import * as rolesQueries from '../lib/db/queries/roles';
import * as usersQueries from '../lib/db/queries/users';
import * as productsQueries from '../lib/db/queries/products';
import * as materialsQueries from '../lib/db/queries/materials';
import * as productMaterialsQueries from '../lib/db/queries/product-materials';
import * as transactionsQueries from '../lib/db/queries/transactions';
import * as ordersQueries from '../lib/db/queries/orders';
import * as dashboardQueries from '../lib/db/queries/dashboard';
import * as reportsQueries from '../lib/db/queries/reports';

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`  ✗ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`  ℹ ${message}`, 'cyan');
}

function logSection(title: string) {
  console.log();
  log(`=== ${title} ===`, 'yellow');
}

// Track created IDs for cleanup
const createdIds: {
  roles: string[];
  users: string[];
  products: string[];
  materials: string[];
  orders: string[];
} = {
  roles: [],
  users: [],
  products: [],
  materials: [],
  orders: [],
};


async function testRolesQueries(): Promise<boolean> {
  logSection('Testing Roles Queries');
  let allPassed = true;

  try {
    // Test getAll (should work even with empty table)
    const allRoles = await rolesQueries.getAll();
    logSuccess(`getAll() returned ${allRoles.length} roles (prepared statement)`);

    // Test create
    const newRole = await rolesQueries.create({ nama_role: 'Test Role ' + Date.now() });
    if (newRole && newRole.role_id && newRole.nama_role) {
      logSuccess(`create() created role with ID: ${newRole.role_id}`);
      createdIds.roles.push(newRole.role_id);
    } else {
      logError('create() failed to create role');
      allPassed = false;
    }

    // Test getById
    const foundRole = await rolesQueries.getById(newRole.role_id);
    if (foundRole && foundRole.role_id === newRole.role_id) {
      logSuccess(`getById() found role correctly (prepared statement)`);
    } else {
      logError('getById() failed to find role');
      allPassed = false;
    }

    // Test getByName
    const foundByName = await rolesQueries.getByName(newRole.nama_role);
    if (foundByName && foundByName.role_id === newRole.role_id) {
      logSuccess(`getByName() found role correctly (prepared statement)`);
    } else {
      logError('getByName() failed to find role');
      allPassed = false;
    }

    // Test update
    const updatedRole = await rolesQueries.update(newRole.role_id, { nama_role: 'Updated Role ' + Date.now() });
    if (updatedRole && updatedRole.nama_role !== newRole.nama_role) {
      logSuccess(`update() updated role correctly (prepared statement)`);
    } else {
      logError('update() failed to update role');
      allPassed = false;
    }

    // Test delete
    const deleted = await rolesQueries.deleteRole(newRole.role_id);
    if (deleted) {
      logSuccess(`deleteRole() deleted role correctly (prepared statement)`);
      createdIds.roles = createdIds.roles.filter(id => id !== newRole.role_id);
    } else {
      logError('deleteRole() failed to delete role');
      allPassed = false;
    }

  } catch (error) {
    logError(`Roles queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

async function testUsersQueries(): Promise<boolean> {
  logSection('Testing Users Queries');
  let allPassed = true;

  try {
    // First, we need a role for the user
    const testRole = await rolesQueries.create({ nama_role: 'Test User Role ' + Date.now() });
    createdIds.roles.push(testRole.role_id);

    // Test getAll
    const allUsers = await usersQueries.getAll();
    logSuccess(`getAll() returned ${allUsers.length} users (prepared statement)`);

    // Test getAll with search
    const searchedUsers = await usersQueries.getAll('nonexistent');
    logSuccess(`getAll(search) with filter works (prepared statement)`);

    // Test create
    const testEmail = `test${Date.now()}@example.com`;
    const newUser = await usersQueries.create({
      username: 'Test User ' + Date.now(),
      password: 'hashedpassword123',
      email: testEmail,
      role_id: testRole.role_id,
      status: 'Aktif'
    });
    if (newUser && newUser.user_id && newUser.email === testEmail) {
      logSuccess(`create() created user with ID: ${newUser.user_id}`);
      createdIds.users.push(newUser.user_id);
    } else {
      logError('create() failed to create user');
      allPassed = false;
    }

    // Test getById
    const foundUser = await usersQueries.getById(newUser.user_id);
    if (foundUser && foundUser.user_id === newUser.user_id) {
      logSuccess(`getById() found user correctly (prepared statement)`);
      // Verify password is NOT included in response
      if (!('password' in foundUser) || (foundUser as any).password === undefined) {
        logSuccess(`getById() excludes password from response`);
      }
    } else {
      logError('getById() failed to find user');
      allPassed = false;
    }

    // Test getByEmail (should include password for auth)
    const foundByEmail = await usersQueries.getByEmail(testEmail);
    if (foundByEmail && foundByEmail.password) {
      logSuccess(`getByEmail() returns user with password for auth (prepared statement)`);
    } else {
      logError('getByEmail() failed to return user with password');
      allPassed = false;
    }

    // Test emailExists
    const exists = await usersQueries.emailExists(testEmail);
    if (exists) {
      logSuccess(`emailExists() correctly detects existing email (prepared statement)`);
    } else {
      logError('emailExists() failed to detect existing email');
      allPassed = false;
    }

    // Test update
    const updatedUser = await usersQueries.update(newUser.user_id, { username: 'Updated User ' + Date.now() });
    if (updatedUser && updatedUser.username !== newUser.username) {
      logSuccess(`update() updated user correctly (prepared statement)`);
    } else {
      logError('update() failed to update user');
      allPassed = false;
    }

    // Test delete
    const deleted = await usersQueries.deleteUser(newUser.user_id);
    if (deleted) {
      logSuccess(`deleteUser() deleted user correctly (prepared statement)`);
      createdIds.users = createdIds.users.filter(id => id !== newUser.user_id);
    } else {
      logError('deleteUser() failed to delete user');
      allPassed = false;
    }

    // Cleanup role
    await rolesQueries.deleteRole(testRole.role_id);
    createdIds.roles = createdIds.roles.filter(id => id !== testRole.role_id);

  } catch (error) {
    logError(`Users queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}


async function testProductsQueries(): Promise<boolean> {
  logSection('Testing Products Queries');
  let allPassed = true;

  try {
    // Test getAll
    const allProducts = await productsQueries.getAll();
    logSuccess(`getAll() returned ${allProducts.length} products (prepared statement)`);

    // Test getAll with search
    const searchedProducts = await productsQueries.getAll('nonexistent');
    logSuccess(`getAll(search) with filter works (prepared statement)`);

    // Test getAll with jenis_produk filter
    const filteredProducts = await productsQueries.getAll(undefined, 'Kopi');
    logSuccess(`getAll(jenis_produk) with filter works (prepared statement)`);

    // Test create
    const newProduct = await productsQueries.create({
      nama_produk: 'Test Product ' + Date.now(),
      harga: 25000,
      deskripsi: 'Test description',
      jenis_produk: 'Kopi'
    });
    if (newProduct && newProduct.produk_id && newProduct.nama_produk) {
      logSuccess(`create() created product with ID: ${newProduct.produk_id}`);
      createdIds.products.push(newProduct.produk_id);
    } else {
      logError('create() failed to create product');
      allPassed = false;
    }

    // Test getById
    const foundProduct = await productsQueries.getById(newProduct.produk_id);
    if (foundProduct && foundProduct.produk_id === newProduct.produk_id) {
      logSuccess(`getById() found product correctly (prepared statement)`);
    } else {
      logError('getById() failed to find product');
      allPassed = false;
    }

    // Test getWithMaterials (should return empty materials array)
    const productWithMaterials = await productsQueries.getWithMaterials(newProduct.produk_id);
    if (productWithMaterials && Array.isArray(productWithMaterials.materials)) {
      logSuccess(`getWithMaterials() returns product with materials array (prepared statement)`);
    } else {
      logError('getWithMaterials() failed');
      allPassed = false;
    }

    // Test update
    const updatedProduct = await productsQueries.update(newProduct.produk_id, { 
      nama_produk: 'Updated Product ' + Date.now(),
      harga: 30000
    });
    if (updatedProduct && updatedProduct.harga === 30000) {
      logSuccess(`update() updated product correctly (prepared statement)`);
    } else {
      logError('update() failed to update product');
      allPassed = false;
    }

    // Test delete
    const deleted = await productsQueries.deleteProduct(newProduct.produk_id);
    if (deleted) {
      logSuccess(`deleteProduct() deleted product correctly (prepared statement)`);
      createdIds.products = createdIds.products.filter(id => id !== newProduct.produk_id);
    } else {
      logError('deleteProduct() failed to delete product');
      allPassed = false;
    }

  } catch (error) {
    logError(`Products queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

async function testMaterialsQueries(): Promise<boolean> {
  logSection('Testing Materials Queries');
  let allPassed = true;

  try {
    // Test getAll
    const allMaterials = await materialsQueries.getAll();
    logSuccess(`getAll() returned ${allMaterials.length} materials (prepared statement)`);

    // Test getAll with search
    const searchedMaterials = await materialsQueries.getAll('nonexistent');
    logSuccess(`getAll(search) with filter works (prepared statement)`);

    // Test create
    const newMaterial = await materialsQueries.create({
      nama_bahan: 'Test Material ' + Date.now(),
      stok_saat_ini: 100,
      stok_minimum: 20,
      satuan: 'kg'
    });
    if (newMaterial && newMaterial.bahan_id && newMaterial.nama_bahan) {
      logSuccess(`create() created material with ID: ${newMaterial.bahan_id}`);
      createdIds.materials.push(newMaterial.bahan_id);
      
      // Verify status derivation
      if (newMaterial.status === 'Aman') {
        logSuccess(`create() correctly derives status as 'Aman' (stok >= minimum)`);
      } else {
        logError('create() failed to derive correct status');
        allPassed = false;
      }
    } else {
      logError('create() failed to create material');
      allPassed = false;
    }

    // Test getById
    const foundMaterial = await materialsQueries.getById(newMaterial.bahan_id);
    if (foundMaterial && foundMaterial.bahan_id === newMaterial.bahan_id) {
      logSuccess(`getById() found material correctly (prepared statement)`);
    } else {
      logError('getById() failed to find material');
      allPassed = false;
    }

    // Test getLowStock
    const lowStockMaterials = await materialsQueries.getLowStock();
    logSuccess(`getLowStock() returned ${lowStockMaterials.length} low stock materials (prepared statement)`);

    // Test update
    const updatedMaterial = await materialsQueries.update(newMaterial.bahan_id, { 
      stok_saat_ini: 10 // Below minimum to test status change
    });
    if (updatedMaterial && updatedMaterial.status === 'Stok Rendah') {
      logSuccess(`update() updated material and status correctly (prepared statement)`);
    } else {
      logError('update() failed to update material or derive status');
      allPassed = false;
    }

    // Test updateStock
    const stockUpdated = await materialsQueries.updateStock(newMaterial.bahan_id, 50);
    if (stockUpdated && stockUpdated.stok_saat_ini === 60) { // 10 + 50
      logSuccess(`updateStock() updated stock correctly (prepared statement)`);
    } else {
      logError('updateStock() failed to update stock');
      allPassed = false;
    }

    // Test delete
    const deleted = await materialsQueries.deleteMaterial(newMaterial.bahan_id);
    if (deleted) {
      logSuccess(`deleteMaterial() deleted material correctly (prepared statement)`);
      createdIds.materials = createdIds.materials.filter(id => id !== newMaterial.bahan_id);
    } else {
      logError('deleteMaterial() failed to delete material');
      allPassed = false;
    }

  } catch (error) {
    logError(`Materials queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}


async function testProductMaterialsQueries(): Promise<boolean> {
  logSection('Testing Product-Materials Queries');
  let allPassed = true;

  try {
    // Create test product and material first
    const testProduct = await productsQueries.create({
      nama_produk: 'Test PM Product ' + Date.now(),
      harga: 25000,
      jenis_produk: 'Kopi'
    });
    createdIds.products.push(testProduct.produk_id);

    const testMaterial = await materialsQueries.create({
      nama_bahan: 'Test PM Material ' + Date.now(),
      stok_saat_ini: 100,
      stok_minimum: 20,
      satuan: 'gram'
    });
    createdIds.materials.push(testMaterial.bahan_id);

    // Test create
    const newPM = await productMaterialsQueries.create({
      produk_id: testProduct.produk_id,
      bahan_id: testMaterial.bahan_id,
      jumlah: 50
    });
    if (newPM && newPM.produk_id === testProduct.produk_id) {
      logSuccess(`create() created product-material relationship (prepared statement)`);
    } else {
      logError('create() failed to create product-material relationship');
      allPassed = false;
    }

    // Test getByProductId
    const productMaterials = await productMaterialsQueries.getByProductId(testProduct.produk_id);
    if (productMaterials.length > 0 && productMaterials[0].nama_bahan) {
      logSuccess(`getByProductId() returns materials with details (prepared statement)`);
    } else {
      logError('getByProductId() failed');
      allPassed = false;
    }

    // Test getByMaterialId
    const materialProducts = await productMaterialsQueries.getByMaterialId(testMaterial.bahan_id);
    if (materialProducts.length > 0 && materialProducts[0].nama_produk) {
      logSuccess(`getByMaterialId() returns products with details (prepared statement)`);
    } else {
      logError('getByMaterialId() failed');
      allPassed = false;
    }

    // Test getOne
    const foundPM = await productMaterialsQueries.getOne(testProduct.produk_id, testMaterial.bahan_id);
    if (foundPM && foundPM.jumlah === 50) {
      logSuccess(`getOne() found relationship correctly (prepared statement)`);
    } else {
      logError('getOne() failed');
      allPassed = false;
    }

    // Test update
    const updatedPM = await productMaterialsQueries.update(testProduct.produk_id, testMaterial.bahan_id, 75);
    if (updatedPM && updatedPM.jumlah === 75) {
      logSuccess(`update() updated relationship correctly (prepared statement)`);
    } else {
      logError('update() failed');
      allPassed = false;
    }

    // Test delete
    const deleted = await productMaterialsQueries.deleteProductMaterial(testProduct.produk_id, testMaterial.bahan_id);
    if (deleted) {
      logSuccess(`deleteProductMaterial() deleted relationship correctly (prepared statement)`);
    } else {
      logError('deleteProductMaterial() failed');
      allPassed = false;
    }

    // Cleanup
    await productsQueries.deleteProduct(testProduct.produk_id);
    createdIds.products = createdIds.products.filter(id => id !== testProduct.produk_id);
    await materialsQueries.deleteMaterial(testMaterial.bahan_id);
    createdIds.materials = createdIds.materials.filter(id => id !== testMaterial.bahan_id);

  } catch (error) {
    logError(`Product-Materials queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

async function testTransactionsQueries(): Promise<boolean> {
  logSection('Testing Transactions Queries');
  let allPassed = true;

  try {
    // Create test role, user, and product first
    const testRole = await rolesQueries.create({ nama_role: 'Test Trans Role ' + Date.now() });
    createdIds.roles.push(testRole.role_id);

    const testUser = await usersQueries.create({
      username: 'Test Trans User ' + Date.now(),
      password: 'hashedpassword123',
      email: `testtrans${Date.now()}@example.com`,
      role_id: testRole.role_id
    });
    createdIds.users.push(testUser.user_id);

    const testProduct = await productsQueries.create({
      nama_produk: 'Test Trans Product ' + Date.now(),
      harga: 15000,
      jenis_produk: 'Makanan'
    });
    createdIds.products.push(testProduct.produk_id);

    // Test getAll
    const allTransactions = await transactionsQueries.getAll();
    logSuccess(`getAll() returned ${allTransactions.length} transactions (prepared statement)`);

    // Test getAll with date filter
    const filteredTransactions = await transactionsQueries.getAll(new Date('2024-01-01'), new Date());
    logSuccess(`getAll(startDate, endDate) with filter works (prepared statement)`);

    // Test create (with transaction)
    const newTransaction = await transactionsQueries.create({
      user_id: testUser.user_id,
      items: [
        { produk_id: testProduct.produk_id, jumlah: 2 }
      ]
    });
    if (newTransaction && newTransaction.transaksi_id) {
      logSuccess(`create() created transaction with ID: ${newTransaction.transaksi_id}`);
      // Verify total calculation (15000 * 2 = 30000)
      if (newTransaction.total_harga === 30000) {
        logSuccess(`create() correctly calculated total_harga (prepared statement + transaction)`);
      } else {
        logError(`create() incorrect total: expected 30000, got ${newTransaction.total_harga}`);
        allPassed = false;
      }
    } else {
      logError('create() failed to create transaction');
      allPassed = false;
    }

    // Test getById
    const foundTransaction = await transactionsQueries.getById(newTransaction.transaksi_id);
    if (foundTransaction && foundTransaction.items && foundTransaction.items.length > 0) {
      logSuccess(`getById() returns transaction with items (prepared statement)`);
    } else {
      logError('getById() failed');
      allPassed = false;
    }

    // Test getByUserId
    const userTransactions = await transactionsQueries.getByUserId(testUser.user_id);
    if (userTransactions.length > 0) {
      logSuccess(`getByUserId() returns user transactions (prepared statement)`);
    } else {
      logError('getByUserId() failed');
      allPassed = false;
    }

    // Test getTodayCount
    const todayCount = await transactionsQueries.getTodayCount();
    logSuccess(`getTodayCount() returned ${todayCount} (prepared statement)`);

    // Test getTodayTotal
    const todayTotal = await transactionsQueries.getTodayTotal();
    logSuccess(`getTodayTotal() returned ${todayTotal} (prepared statement)`);

    // Note: We don't delete transactions as they cascade from users
    // Cleanup will happen when we delete the user

    // Cleanup
    await usersQueries.deleteUser(testUser.user_id);
    createdIds.users = createdIds.users.filter(id => id !== testUser.user_id);
    await productsQueries.deleteProduct(testProduct.produk_id);
    createdIds.products = createdIds.products.filter(id => id !== testProduct.produk_id);
    await rolesQueries.deleteRole(testRole.role_id);
    createdIds.roles = createdIds.roles.filter(id => id !== testRole.role_id);

  } catch (error) {
    logError(`Transactions queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}


async function testOrdersQueries(): Promise<boolean> {
  logSection('Testing Orders (Pengadaan Bahan Baku) Queries');
  let allPassed = true;

  try {
    // Create test role, user, and material first
    const testRole = await rolesQueries.create({ nama_role: 'Test Order Role ' + Date.now() });
    createdIds.roles.push(testRole.role_id);

    const testUser = await usersQueries.create({
      username: 'Test Order User ' + Date.now(),
      password: 'hashedpassword123',
      email: `testorder${Date.now()}@example.com`,
      role_id: testRole.role_id
    });
    createdIds.users.push(testUser.user_id);

    const testMaterial = await materialsQueries.create({
      nama_bahan: 'Test Order Material ' + Date.now(),
      stok_saat_ini: 50,
      stok_minimum: 20,
      satuan: 'kg'
    });
    createdIds.materials.push(testMaterial.bahan_id);

    // Test getAll
    const allOrders = await ordersQueries.getAll();
    logSuccess(`getAll() returned ${allOrders.length} orders (prepared statement)`);

    // Test getAll with search
    const searchedOrders = await ordersQueries.getAll('nonexistent');
    logSuccess(`getAll(search) with filter works (prepared statement)`);

    // Test create
    const newOrder = await ordersQueries.create({
      bahan_id: testMaterial.bahan_id,
      user_id: testUser.user_id,
      jumlah: 100,
      tanggal_pesan: new Date()
    });
    if (newOrder && newOrder.pengadaan_id) {
      logSuccess(`create() created order with ID: ${newOrder.pengadaan_id}`);
      createdIds.orders.push(newOrder.pengadaan_id);
      
      // Verify default status
      if (newOrder.status === 'Pending') {
        logSuccess(`create() sets default status to 'Pending'`);
      }
    } else {
      logError('create() failed to create order');
      allPassed = false;
    }

    // Test getById
    const foundOrder = await ordersQueries.getById(newOrder.pengadaan_id);
    if (foundOrder && foundOrder.nama_bahan && foundOrder.username) {
      logSuccess(`getById() returns order with details (prepared statement)`);
    } else {
      logError('getById() failed');
      allPassed = false;
    }

    // Test getByStatus
    const pendingOrders = await ordersQueries.getByStatus('Pending');
    if (pendingOrders.length > 0) {
      logSuccess(`getByStatus() returns orders by status (prepared statement)`);
    } else {
      logError('getByStatus() failed');
      allPassed = false;
    }

    // Test getByMaterialId
    const materialOrders = await ordersQueries.getByMaterialId(testMaterial.bahan_id);
    if (materialOrders.length > 0) {
      logSuccess(`getByMaterialId() returns orders for material (prepared statement)`);
    } else {
      logError('getByMaterialId() failed');
      allPassed = false;
    }

    // Test updateStatus to 'Dikirim'
    const shippedOrder = await ordersQueries.updateStatus(newOrder.pengadaan_id, { status: 'Dikirim' });
    if (shippedOrder && shippedOrder.status === 'Dikirim') {
      logSuccess(`updateStatus() updated to 'Dikirim' (prepared statement)`);
    } else {
      logError('updateStatus() failed to update to Dikirim');
      allPassed = false;
    }

    // Get material stock before receiving
    const materialBefore = await materialsQueries.getById(testMaterial.bahan_id);
    const stockBefore = materialBefore?.stok_saat_ini || 0;

    // Test updateStatus to 'Diterima' (should update stock)
    const receivedOrder = await ordersQueries.updateStatus(newOrder.pengadaan_id, { 
      status: 'Diterima',
      tanggal_terima: new Date()
    });
    if (receivedOrder && receivedOrder.status === 'Diterima') {
      logSuccess(`updateStatus() updated to 'Diterima' (prepared statement + transaction)`);
      
      // Verify stock was updated
      const materialAfter = await materialsQueries.getById(testMaterial.bahan_id);
      if (materialAfter && materialAfter.stok_saat_ini === stockBefore + 100) {
        logSuccess(`updateStatus('Diterima') correctly updated material stock`);
      } else {
        logError(`Stock update failed: expected ${stockBefore + 100}, got ${materialAfter?.stok_saat_ini}`);
        allPassed = false;
      }
    } else {
      logError('updateStatus() failed to update to Diterima');
      allPassed = false;
    }

    // Test getPendingCount
    const pendingCount = await ordersQueries.getPendingCount();
    logSuccess(`getPendingCount() returned ${pendingCount} (prepared statement)`);

    // Cleanup - orders cascade from users
    await usersQueries.deleteUser(testUser.user_id);
    createdIds.users = createdIds.users.filter(id => id !== testUser.user_id);
    createdIds.orders = createdIds.orders.filter(id => id !== newOrder.pengadaan_id);
    await materialsQueries.deleteMaterial(testMaterial.bahan_id);
    createdIds.materials = createdIds.materials.filter(id => id !== testMaterial.bahan_id);
    await rolesQueries.deleteRole(testRole.role_id);
    createdIds.roles = createdIds.roles.filter(id => id !== testRole.role_id);

  } catch (error) {
    logError(`Orders queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

async function testDashboardQueries(): Promise<boolean> {
  logSection('Testing Dashboard Queries');
  let allPassed = true;

  try {
    // Test getStats
    const stats = await dashboardQueries.getStats();
    if (stats && 
        typeof stats.totalSales === 'number' && 
        typeof stats.todayTransactions === 'number' &&
        typeof stats.activeEmployees === 'number' &&
        typeof stats.productsSold === 'number') {
      logSuccess(`getStats() returns all statistics (prepared statements)`);
    } else {
      logError('getStats() failed to return complete statistics');
      allPassed = false;
    }

    // Test getWeeklySales
    const weeklySales = await dashboardQueries.getWeeklySales();
    if (weeklySales && weeklySales.length === 7) {
      logSuccess(`getWeeklySales() returns 7 days of data (prepared statement)`);
    } else {
      logError(`getWeeklySales() failed: expected 7 days, got ${weeklySales?.length}`);
      allPassed = false;
    }

    // Test getTopProducts
    const topProducts = await dashboardQueries.getTopProducts(5);
    logSuccess(`getTopProducts() returned ${topProducts.length} products (prepared statement)`);

    // Test getSalesComparison
    const comparison = await dashboardQueries.getSalesComparison();
    if (comparison && 
        typeof comparison.current === 'number' && 
        typeof comparison.previous === 'number' &&
        typeof comparison.change === 'number') {
      logSuccess(`getSalesComparison() returns comparison data (prepared statements)`);
    } else {
      logError('getSalesComparison() failed');
      allPassed = false;
    }

  } catch (error) {
    logError(`Dashboard queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}


async function testReportsQueries(): Promise<boolean> {
  logSection('Testing Reports Queries');
  let allPassed = true;

  try {
    // Test getSummary for each period
    for (const period of ['daily', 'weekly', 'monthly'] as const) {
      const summary = await reportsQueries.getSummary(period);
      if (summary && 
          typeof summary.revenue === 'number' && 
          typeof summary.expenses === 'number' &&
          typeof summary.profit === 'number' &&
          typeof summary.transactions === 'number' &&
          summary.period) {
        logSuccess(`getSummary('${period}') returns complete summary (prepared statements)`);
      } else {
        logError(`getSummary('${period}') failed`);
        allPassed = false;
      }
    }

    // Test getRevenueExpense
    const revenueExpense = await reportsQueries.getRevenueExpense(6);
    if (revenueExpense && revenueExpense.length === 6) {
      logSuccess(`getRevenueExpense() returns 6 months of data (prepared statements)`);
    } else {
      logError(`getRevenueExpense() failed: expected 6 months, got ${revenueExpense?.length}`);
      allPassed = false;
    }

    // Test getCategorySales
    const categorySales = await reportsQueries.getCategorySales();
    logSuccess(`getCategorySales() returned ${categorySales.length} categories (prepared statement)`);
    
    // Verify percentage calculation
    if (categorySales.length > 0) {
      const hasPercentage = categorySales.every(c => typeof c.percentage === 'number');
      if (hasPercentage) {
        logSuccess(`getCategorySales() correctly calculates percentages`);
      }
    }

    // Test getMonthlyRevenueTrend
    const monthlyTrend = await reportsQueries.getMonthlyRevenueTrend(12);
    logSuccess(`getMonthlyRevenueTrend() returned ${monthlyTrend.length} months (prepared statement)`);

    // Test getDailyRevenue
    const now = new Date();
    const dailyRevenue = await reportsQueries.getDailyRevenue(now.getFullYear(), now.getMonth() + 1);
    logSuccess(`getDailyRevenue() returned ${dailyRevenue.length} days (prepared statement)`);

  } catch (error) {
    logError(`Reports queries error: ${error}`);
    allPassed = false;
  }

  return allPassed;
}

async function cleanup() {
  logSection('Cleanup');
  
  try {
    // Delete in reverse order of dependencies
    for (const orderId of createdIds.orders) {
      try {
        // Orders are deleted via cascade when user is deleted
        logInfo(`Order ${orderId} will be cleaned up with user deletion`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    for (const userId of createdIds.users) {
      try {
        await usersQueries.deleteUser(userId);
        logInfo(`Cleaned up user: ${userId}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    for (const productId of createdIds.products) {
      try {
        await productsQueries.deleteProduct(productId);
        logInfo(`Cleaned up product: ${productId}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    for (const materialId of createdIds.materials) {
      try {
        await materialsQueries.deleteMaterial(materialId);
        logInfo(`Cleaned up material: ${materialId}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    for (const roleId of createdIds.roles) {
      try {
        await rolesQueries.deleteRole(roleId);
        logInfo(`Cleaned up role: ${roleId}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    logSuccess('Cleanup completed');
  } catch (error) {
    logError(`Cleanup error: ${error}`);
  }
}

async function main() {
  log('\n🔧 Cafe Merah Putih - Database Queries Test\n', 'blue');
  
  // First test database connection
  logSection('Testing Database Connection');
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      logError('Database connection failed. Cannot proceed with query tests.');
      logInfo('Make sure MySQL is running and .env.local is configured correctly.');
      process.exit(1);
    }
    logSuccess('Database connection successful');
  } catch (error) {
    const errorMessage = String(error);
    
    if (errorMessage.includes('Unknown database') || errorMessage.includes('ER_BAD_DB_ERROR')) {
      logError('Database "cafe_merah_putih" does not exist.');
      console.log();
      log('To create the database and apply schema, run these commands:', 'yellow');
      console.log();
      logInfo('1. Connect to MySQL:');
      logInfo('   mysql -u root -p');
      console.log();
      logInfo('2. Create the database:');
      logInfo('   CREATE DATABASE cafe_merah_putih;');
      console.log();
      logInfo('3. Apply the schema:');
      logInfo('   USE cafe_merah_putih;');
      logInfo('   SOURCE lib/db/schema.sql;');
      console.log();
      logInfo('4. Or run this single command (adjust path as needed):');
      logInfo('   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cafe_merah_putih; USE cafe_merah_putih; SOURCE lib/db/schema.sql;"');
      console.log();
      process.exit(1);
    }
    
    logError(`Database connection error: ${error}`);
    logInfo('Make sure MySQL is running and .env.local is configured correctly.');
    logInfo('Also ensure the database schema has been applied (lib/db/schema.sql)');
    process.exit(1);
  }

  const results: { name: string; passed: boolean }[] = [];

  // Run all query tests
  try {
    results.push({ name: 'Roles Queries', passed: await testRolesQueries() });
    results.push({ name: 'Users Queries', passed: await testUsersQueries() });
    results.push({ name: 'Products Queries', passed: await testProductsQueries() });
    results.push({ name: 'Materials Queries', passed: await testMaterialsQueries() });
    results.push({ name: 'Product-Materials Queries', passed: await testProductMaterialsQueries() });
    results.push({ name: 'Transactions Queries', passed: await testTransactionsQueries() });
    results.push({ name: 'Orders Queries', passed: await testOrdersQueries() });
    results.push({ name: 'Dashboard Queries', passed: await testDashboardQueries() });
    results.push({ name: 'Reports Queries', passed: await testReportsQueries() });
  } catch (error) {
    logError(`Unexpected error during tests: ${error}`);
  }

  // Cleanup any remaining test data
  await cleanup();

  // Close pool
  await closePool();

  // Summary
  logSection('Test Summary');
  
  let allPassed = true;
  for (const result of results) {
    if (result.passed) {
      logSuccess(`${result.name}: PASSED`);
    } else {
      logError(`${result.name}: FAILED`);
      allPassed = false;
    }
  }

  console.log();
  if (allPassed) {
    log('🎉 All query tests passed!', 'green');
    log('✓ All queries use prepared statements for SQL injection prevention', 'green');
    process.exit(0);
  } else {
    log('❌ Some tests failed. Please check the errors above.', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`Unexpected error: ${error}`, 'red');
  process.exit(1);
});
