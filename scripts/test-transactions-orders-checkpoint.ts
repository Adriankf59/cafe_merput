/**
 * Checkpoint Test Script for Transactions and Orders API
 * Tests all CRUD operations and verifies stock updates
 * 
 * Run with: npx ts-node scripts/test-transactions-orders-checkpoint.ts
 */

import * as transactionsQuery from '../lib/db/queries/transactions';
import * as ordersQuery from '../lib/db/queries/orders';
import * as productsQuery from '../lib/db/queries/products';
import * as materialsQuery from '../lib/db/queries/materials';
import * as usersQuery from '../lib/db/queries/users';
import * as rolesQuery from '../lib/db/queries/roles';
import { hashPassword } from '../lib/utils/password';
import { closePool } from '../lib/db/connection';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string) {
  results.push({ name, passed, error });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (error) console.log(`   Error: ${error}`);
}

// Helper to create test user
async function createTestUser(): Promise<string> {
  const roles = await rolesQuery.getAll();
  let roleId: string;
  if (roles.length > 0) {
    roleId = roles[0].role_id;
  } else {
    const newRole = await rolesQuery.create({ nama_role: 'Test Role ' + Date.now() });
    roleId = newRole.role_id;
  }

  const timestamp = Date.now();
  const user = await usersQuery.create({
    username: 'Test User ' + timestamp,
    email: `testuser${timestamp}@checkpoint.com`,
    password: await hashPassword('password123'),
    role_id: roleId,
    status: 'Aktif' as const,
  });
  return user.user_id;
}

// Helper to create test product
async function createTestProduct(): Promise<{ produk_id: string; harga: number }> {
  const product = await productsQuery.create({
    nama_produk: 'Test Product ' + Date.now(),
    harga: 25000,
    deskripsi: 'Test product for transactions',
    jenis_produk: 'Kopi' as const,
  });
  return { produk_id: product.produk_id, harga: product.harga };
}

// Helper to create test material
async function createTestMaterial(): Promise<string> {
  const material = await materialsQuery.create({
    nama_bahan: 'Test Material ' + Date.now(),
    stok_saat_ini: 100,
    stok_minimum: 20,
    satuan: 'kg' as const,
  });
  return material.bahan_id;
}


async function testTransactionsCRUD() {
  console.log('\n=== Testing Transactions CRUD ===\n');
  
  let testUserId: string | null = null;
  let testProductId: string | null = null;
  let createdTransactionId: string | null = null;
  
  try {
    // Setup: Create test user and product
    testUserId = await createTestUser();
    const product = await createTestProduct();
    testProductId = product.produk_id;
    
    // CREATE transaction
    const transactionData = {
      user_id: testUserId,
      items: [
        { produk_id: testProductId, jumlah: 2 },
      ],
    };
    
    const created = await transactionsQuery.create(transactionData);
    createdTransactionId = created.transaksi_id;
    logTest('Transactions CREATE', !!created && !!created.transaksi_id);
    
    // Verify total_harga calculation (product.harga * jumlah)
    const expectedTotal = product.harga * 2;
    const actualTotal = Number(created.total_harga);
    logTest('Transactions TOTAL calculation', 
      Math.abs(actualTotal - expectedTotal) < 0.01,
      `Expected ${expectedTotal}, got ${actualTotal}`);
    
    // Verify items are included
    logTest('Transactions CREATE (items included)', 
      Array.isArray(created.items) && created.items.length === 1);
    
    // READ (getById with items)
    const fetched = await transactionsQuery.getById(createdTransactionId);
    logTest('Transactions READ (getById)', 
      !!fetched && fetched.transaksi_id === createdTransactionId);
    logTest('Transactions READ (items included)', 
      !!fetched && Array.isArray(fetched.items) && fetched.items.length === 1);
    logTest('Transactions READ (username included)', 
      !!fetched && !!fetched.username);
    
    // READ (getAll)
    const allTransactions = await transactionsQuery.getAll();
    logTest('Transactions READ (getAll)', 
      Array.isArray(allTransactions) && allTransactions.length > 0);
    
    // DATE filter test
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayTransactions = await transactionsQuery.getAll(startOfDay, endOfDay);
    const foundInToday = todayTransactions.some(t => t.transaksi_id === createdTransactionId);
    logTest('Transactions DATE filter', foundInToday);
    
    // Test with multiple items
    const product2 = await createTestProduct();
    const multiItemTransaction = await transactionsQuery.create({
      user_id: testUserId,
      items: [
        { produk_id: testProductId, jumlah: 1 },
        { produk_id: product2.produk_id, jumlah: 3 },
      ],
    });
    
    const expectedMultiTotal = (product.harga * 1) + (product2.harga * 3);
    const actualMultiTotal = Number(multiItemTransaction.total_harga);
    logTest('Transactions MULTI-ITEM total calculation', 
      Math.abs(actualMultiTotal - expectedMultiTotal) < 0.01,
      `Expected ${expectedMultiTotal}, got ${actualMultiTotal}`);
    logTest('Transactions MULTI-ITEM items count', 
      multiItemTransaction.items.length === 2);
    
    // Cleanup product2
    await productsQuery.deleteProduct(product2.produk_id);
    
  } catch (error) {
    logTest('Transactions CRUD', false, error instanceof Error ? error.message : String(error));
  } finally {
    // Cleanup
    if (testProductId) {
      try { await productsQuery.deleteProduct(testProductId); } catch {}
    }
    if (testUserId) {
      try { await usersQuery.deleteUser(testUserId); } catch {}
    }
  }
}


async function testOrdersCRUD() {
  console.log('\n=== Testing Material Orders CRUD ===\n');
  
  let testUserId: string | null = null;
  let testMaterialId: string | null = null;
  let createdOrderId: string | null = null;
  
  try {
    // Setup: Create test user and material
    testUserId = await createTestUser();
    testMaterialId = await createTestMaterial();
    
    // Get initial stock
    const initialMaterial = await materialsQuery.getById(testMaterialId);
    const initialStock = Number(initialMaterial?.stok_saat_ini) || 0;
    
    // CREATE order
    const orderData = {
      bahan_id: testMaterialId,
      user_id: testUserId,
      jumlah: 50,
      tanggal_pesan: new Date(),
    };
    
    const created = await ordersQuery.create(orderData);
    createdOrderId = created.pengadaan_id;
    logTest('Orders CREATE', !!created && !!created.pengadaan_id);
    logTest('Orders CREATE (status is Pending)', created.status === 'Pending');
    logTest('Orders CREATE (material name included)', !!created.nama_bahan);
    logTest('Orders CREATE (username included)', !!created.username);
    
    // READ (getById)
    const fetched = await ordersQuery.getById(createdOrderId);
    logTest('Orders READ (getById)', 
      !!fetched && fetched.pengadaan_id === createdOrderId);
    
    // READ (getAll)
    const allOrders = await ordersQuery.getAll();
    logTest('Orders READ (getAll)', 
      Array.isArray(allOrders) && allOrders.length > 0);
    
    // SEARCH filter
    const searchResults = await ordersQuery.getAll(createdOrderId.substring(0, 8));
    const foundInSearch = searchResults.some(o => o.pengadaan_id === createdOrderId);
    logTest('Orders SEARCH filter', foundInSearch);
    
    // STATUS filter
    const pendingOrders = await ordersQuery.getByStatus('Pending');
    const foundInPending = pendingOrders.some(o => o.pengadaan_id === createdOrderId);
    logTest('Orders STATUS filter (Pending)', foundInPending);
    
    // UPDATE status to 'Dikirim'
    const updatedToDikirim = await ordersQuery.updateStatus(createdOrderId, {
      status: 'Dikirim',
    });
    logTest('Orders UPDATE status (Dikirim)', updatedToDikirim.status === 'Dikirim');
    
    // Verify stock NOT updated yet
    const materialAfterDikirim = await materialsQuery.getById(testMaterialId);
    const stockAfterDikirim = Number(materialAfterDikirim?.stok_saat_ini) || 0;
    logTest('Orders UPDATE (stock NOT changed on Dikirim)', 
      Math.abs(stockAfterDikirim - initialStock) < 0.01,
      `Expected ${initialStock}, got ${stockAfterDikirim}`);
    
    // UPDATE status to 'Diterima' - should update stock
    const updatedToDiterima = await ordersQuery.updateStatus(createdOrderId, {
      status: 'Diterima',
      tanggal_terima: new Date(),
    });
    logTest('Orders UPDATE status (Diterima)', updatedToDiterima.status === 'Diterima');
    logTest('Orders UPDATE (tanggal_terima set)', !!updatedToDiterima.tanggal_terima);
    
    // Verify stock IS updated
    const materialAfterDiterima = await materialsQuery.getById(testMaterialId);
    const stockAfterDiterima = Number(materialAfterDiterima?.stok_saat_ini) || 0;
    const expectedStock = initialStock + 50;
    logTest('Orders UPDATE (stock UPDATED on Diterima)', 
      Math.abs(stockAfterDiterima - expectedStock) < 0.01,
      `Expected ${expectedStock}, got ${stockAfterDiterima}`);
    
    // Test getByMaterialId
    const ordersByMaterial = await ordersQuery.getByMaterialId(testMaterialId);
    const foundByMaterial = ordersByMaterial.some(o => o.pengadaan_id === createdOrderId);
    logTest('Orders getByMaterialId', foundByMaterial);
    
    // Test getPendingCount
    const pendingCount = await ordersQuery.getPendingCount();
    logTest('Orders getPendingCount', typeof pendingCount === 'number');
    
  } catch (error) {
    logTest('Orders CRUD', false, error instanceof Error ? error.message : String(error));
  } finally {
    // Cleanup
    if (testMaterialId) {
      try { await materialsQuery.deleteMaterial(testMaterialId); } catch {}
    }
    if (testUserId) {
      try { await usersQuery.deleteUser(testUserId); } catch {}
    }
  }
}


async function testStockUpdateIntegration() {
  console.log('\n=== Testing Stock Update Integration ===\n');
  
  let testUserId: string | null = null;
  let testMaterialId: string | null = null;
  
  try {
    // Setup
    testUserId = await createTestUser();
    testMaterialId = await createTestMaterial();
    
    // Get initial stock
    const initialMaterial = await materialsQuery.getById(testMaterialId);
    const initialStock = Number(initialMaterial?.stok_saat_ini) || 0;
    console.log(`   Initial stock: ${initialStock}`);
    
    // Create multiple orders
    const order1 = await ordersQuery.create({
      bahan_id: testMaterialId,
      user_id: testUserId,
      jumlah: 30,
      tanggal_pesan: new Date(),
    });
    
    const order2 = await ordersQuery.create({
      bahan_id: testMaterialId,
      user_id: testUserId,
      jumlah: 20,
      tanggal_pesan: new Date(),
    });
    
    // Receive first order
    await ordersQuery.updateStatus(order1.pengadaan_id, {
      status: 'Diterima',
      tanggal_terima: new Date(),
    });
    
    const afterFirst = await materialsQuery.getById(testMaterialId);
    const stockAfterFirst = Number(afterFirst?.stok_saat_ini) || 0;
    console.log(`   Stock after first order received: ${stockAfterFirst}`);
    logTest('Stock Update (first order)', 
      Math.abs(stockAfterFirst - (initialStock + 30)) < 0.01);
    
    // Receive second order
    await ordersQuery.updateStatus(order2.pengadaan_id, {
      status: 'Diterima',
      tanggal_terima: new Date(),
    });
    
    const afterSecond = await materialsQuery.getById(testMaterialId);
    const stockAfterSecond = Number(afterSecond?.stok_saat_ini) || 0;
    console.log(`   Stock after second order received: ${stockAfterSecond}`);
    logTest('Stock Update (second order)', 
      Math.abs(stockAfterSecond - (initialStock + 50)) < 0.01);
    
    // Verify idempotency - updating already received order should NOT add stock again
    await ordersQuery.updateStatus(order1.pengadaan_id, {
      status: 'Diterima',
    });
    
    const afterIdempotent = await materialsQuery.getById(testMaterialId);
    const stockAfterIdempotent = Number(afterIdempotent?.stok_saat_ini) || 0;
    console.log(`   Stock after re-receiving first order: ${stockAfterIdempotent}`);
    logTest('Stock Update (idempotent - no double add)', 
      Math.abs(stockAfterIdempotent - (initialStock + 50)) < 0.01);
    
  } catch (error) {
    logTest('Stock Update Integration', false, error instanceof Error ? error.message : String(error));
  } finally {
    // Cleanup
    if (testMaterialId) {
      try { await materialsQuery.deleteMaterial(testMaterialId); } catch {}
    }
    if (testUserId) {
      try { await usersQuery.deleteUser(testUserId); } catch {}
    }
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('  CHECKPOINT 15: Transactions & Orders');
  console.log('========================================');
  
  await testTransactionsCRUD();
  await testOrdersCRUD();
  await testStockUpdateIntegration();
  
  // Summary
  console.log('\n========================================');
  console.log('  TEST SUMMARY');
  console.log('========================================\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error || 'Unknown error'}`);
    });
  }
  
  console.log('\n========================================\n');
  
  // Close database connection
  await closePool();
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(async (error) => {
  console.error('Test runner error:', error);
  await closePool();
  process.exit(1);
});
