/**
 * Checkpoint Test Script for Products, Materials, and Employees API
 * Tests all CRUD operations and search/filter functionality
 * 
 * Run with: npx ts-node scripts/test-api-checkpoint.ts
 */

import { v4 as uuidv4 } from 'uuid';
import * as productsQuery from '../lib/db/queries/products';
import * as materialsQuery from '../lib/db/queries/materials';
import * as productMaterialsQuery from '../lib/db/queries/product-materials';
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

async function testProductsCRUD() {
  console.log('\n=== Testing Products CRUD ===\n');
  
  let createdProductId: string | null = null;
  
  try {
    // CREATE
    const newProduct = {
      nama_produk: 'Test Kopi Checkpoint ' + Date.now(),
      harga: 25000,
      deskripsi: 'Test product for checkpoint',
      jenis_produk: 'Kopi' as const,
    };
    
    const created = await productsQuery.create(newProduct);
    createdProductId = created.produk_id;
    logTest('Products CREATE', !!created && !!created.produk_id);
    
    // READ (getById)
    const fetched = await productsQuery.getById(createdProductId);
    logTest('Products READ (getById)', !!fetched && fetched.nama_produk === newProduct.nama_produk);
    
    // READ (getAll)
    const allProducts = await productsQuery.getAll();
    logTest('Products READ (getAll)', Array.isArray(allProducts) && allProducts.length > 0);
    
    // UPDATE
    const updateData = { nama_produk: 'Updated Test Kopi ' + Date.now() };
    const updated = await productsQuery.update(createdProductId, updateData);
    logTest('Products UPDATE', !!updated && updated.nama_produk === updateData.nama_produk);
    
    // SEARCH filter
    const searchResults = await productsQuery.getAll('Updated Test');
    const foundInSearch = searchResults.some(p => p.produk_id === createdProductId);
    logTest('Products SEARCH filter', foundInSearch);
    
    // JENIS_PRODUK filter
    const kopiProducts = await productsQuery.getAll(undefined, 'Kopi');
    const allAreKopi = kopiProducts.every(p => p.jenis_produk === 'Kopi');
    logTest('Products JENIS_PRODUK filter', allAreKopi);
    
    // DELETE
    const deleted = await productsQuery.deleteProduct(createdProductId);
    logTest('Products DELETE', deleted === true);
    
    // Verify deletion
    const afterDelete = await productsQuery.getById(createdProductId);
    logTest('Products DELETE verification', afterDelete === null);
    
  } catch (error) {
    logTest('Products CRUD', false, error instanceof Error ? error.message : String(error));
    // Cleanup on error
    if (createdProductId) {
      try { await productsQuery.deleteProduct(createdProductId); } catch {}
    }
  }
}

async function testMaterialsCRUD() {
  console.log('\n=== Testing Materials CRUD ===\n');
  
  let createdMaterialId: string | null = null;
  
  try {
    // CREATE
    const newMaterial = {
      nama_bahan: 'Test Bahan Checkpoint ' + Date.now(),
      stok_saat_ini: 100,
      stok_minimum: 20,
      satuan: 'kg' as const,
    };
    
    const created = await materialsQuery.create(newMaterial);
    createdMaterialId = created.bahan_id;
    logTest('Materials CREATE', !!created && !!created.bahan_id);
    
    // READ (getById)
    const fetched = await materialsQuery.getById(createdMaterialId);
    logTest('Materials READ (getById)', !!fetched && fetched.nama_bahan === newMaterial.nama_bahan);
    
    // READ (getAll)
    const allMaterials = await materialsQuery.getAll();
    logTest('Materials READ (getAll)', Array.isArray(allMaterials) && allMaterials.length > 0);
    
    // UPDATE
    const updateData = { nama_bahan: 'Updated Test Bahan ' + Date.now() };
    const updated = await materialsQuery.update(createdMaterialId, updateData);
    logTest('Materials UPDATE', !!updated && updated.nama_bahan === updateData.nama_bahan);
    
    // SEARCH filter
    const searchResults = await materialsQuery.getAll('Updated Test');
    const foundInSearch = searchResults.some(m => m.bahan_id === createdMaterialId);
    logTest('Materials SEARCH filter', foundInSearch);
    
    // LOW STOCK test - update to low stock first
    await materialsQuery.update(createdMaterialId, { stok_saat_ini: 5 });
    const lowStockMaterials = await materialsQuery.getLowStock();
    const foundInLowStock = lowStockMaterials.some(m => m.bahan_id === createdMaterialId);
    logTest('Materials LOW STOCK filter', foundInLowStock);
    
    // UPDATE STOCK
    const beforeStockUpdate = await materialsQuery.getById(createdMaterialId);
    const beforeStock = Number(beforeStockUpdate?.stok_saat_ini) || 0;
    await materialsQuery.updateStock(createdMaterialId, 50);
    const afterStockUpdate = await materialsQuery.getById(createdMaterialId);
    const afterStock = Number(afterStockUpdate?.stok_saat_ini) || 0;
    const expectedStock = beforeStock + 50;
    const stockUpdatePassed = Math.abs(afterStock - expectedStock) < 0.01;
    logTest('Materials UPDATE STOCK', stockUpdatePassed, 
      stockUpdatePassed ? undefined : `Expected ${expectedStock}, got ${afterStock} (before: ${beforeStock})`);
    
    // DELETE
    const deleted = await materialsQuery.deleteMaterial(createdMaterialId);
    logTest('Materials DELETE', deleted === true);
    
    // Verify deletion
    const afterDelete = await materialsQuery.getById(createdMaterialId);
    logTest('Materials DELETE verification', afterDelete === null);
    
  } catch (error) {
    logTest('Materials CRUD', false, error instanceof Error ? error.message : String(error));
    // Cleanup on error
    if (createdMaterialId) {
      try { await materialsQuery.deleteMaterial(createdMaterialId); } catch {}
    }
  }
}

async function testEmployeesCRUD() {
  console.log('\n=== Testing Employees CRUD ===\n');
  
  let createdEmployeeId: string | null = null;
  let testRoleId: string | null = null;
  
  try {
    // First, get or create a role for testing
    const roles = await rolesQuery.getAll();
    if (roles.length > 0) {
      testRoleId = roles[0].role_id;
    } else {
      const newRole = await rolesQuery.create({ nama_role: 'Test Role ' + Date.now() });
      testRoleId = newRole.role_id;
    }
    
    // CREATE
    const timestamp = Date.now();
    const newEmployee = {
      username: 'Test Employee ' + timestamp,
      email: `test${timestamp}@checkpoint.com`,
      password: await hashPassword('password123'),
      role_id: testRoleId,
      status: 'Aktif' as const,
    };
    
    const created = await usersQuery.create(newEmployee);
    createdEmployeeId = created.user_id;
    logTest('Employees CREATE', !!created && !!created.user_id);
    
    // Verify password is NOT in response
    const hasNoPassword = !('password' in created);
    logTest('Employees CREATE (password excluded)', hasNoPassword);
    
    // READ (getById)
    const fetched = await usersQuery.getById(createdEmployeeId);
    logTest('Employees READ (getById)', !!fetched && fetched.username === newEmployee.username);
    logTest('Employees READ (password excluded)', fetched ? !('password' in fetched) : false);
    
    // READ (getAll)
    const allEmployees = await usersQuery.getAll();
    logTest('Employees READ (getAll)', Array.isArray(allEmployees) && allEmployees.length > 0);
    
    // Verify all employees have no password
    const allHaveNoPassword = allEmployees.every(e => !('password' in e));
    logTest('Employees READ ALL (password excluded)', allHaveNoPassword);
    
    // UPDATE
    const updateData = { username: 'Updated Test Employee ' + timestamp };
    const updated = await usersQuery.update(createdEmployeeId, updateData);
    logTest('Employees UPDATE', !!updated && updated.username === updateData.username);
    logTest('Employees UPDATE (password excluded)', updated ? !('password' in updated) : false);
    
    // SEARCH filter
    const searchResults = await usersQuery.getAll('Updated Test');
    const foundInSearch = searchResults.some(e => e.user_id === createdEmployeeId);
    logTest('Employees SEARCH filter', foundInSearch);
    
    // EMAIL EXISTS check
    const emailExists = await usersQuery.emailExists(newEmployee.email);
    logTest('Employees EMAIL EXISTS check', emailExists === true);
    
    // EMAIL EXISTS with exclusion
    const emailExistsExcluding = await usersQuery.emailExists(newEmployee.email, createdEmployeeId);
    logTest('Employees EMAIL EXISTS (excluding self)', emailExistsExcluding === false);
    
    // DELETE
    const deleted = await usersQuery.deleteUser(createdEmployeeId);
    logTest('Employees DELETE', deleted === true);
    
    // Verify deletion
    const afterDelete = await usersQuery.getById(createdEmployeeId);
    logTest('Employees DELETE verification', afterDelete === null);
    
  } catch (error) {
    logTest('Employees CRUD', false, error instanceof Error ? error.message : String(error));
    // Cleanup on error
    if (createdEmployeeId) {
      try { await usersQuery.deleteUser(createdEmployeeId); } catch {}
    }
  }
}

async function testProductMaterialsCRUD() {
  console.log('\n=== Testing Product-Materials CRUD ===\n');
  
  let createdProductId: string | null = null;
  let createdMaterialId: string | null = null;
  
  try {
    // Create a product for testing
    const newProduct = {
      nama_produk: 'Test Product for Materials ' + Date.now(),
      harga: 30000,
      deskripsi: 'Test product',
      jenis_produk: 'Kopi' as const,
    };
    const product = await productsQuery.create(newProduct);
    createdProductId = product.produk_id;
    
    // Create a material for testing
    const newMaterial = {
      nama_bahan: 'Test Material for Product ' + Date.now(),
      stok_saat_ini: 100,
      stok_minimum: 20,
      satuan: 'gram' as const,
    };
    const material = await materialsQuery.create(newMaterial);
    createdMaterialId = material.bahan_id;
    
    // CREATE product-material relationship
    const productMaterial = await productMaterialsQuery.create({
      produk_id: createdProductId,
      bahan_id: createdMaterialId,
      jumlah: 50,
    });
    logTest('Product-Materials CREATE', !!productMaterial && Number(productMaterial.jumlah) === 50);
    
    // READ (getByProductId)
    const materialsByProduct = await productMaterialsQuery.getByProductId(createdProductId);
    logTest('Product-Materials READ (getByProductId)', 
      materialsByProduct.length === 1 && materialsByProduct[0].bahan_id === createdMaterialId);
    
    // READ (getByMaterialId)
    const productsByMaterial = await productMaterialsQuery.getByMaterialId(createdMaterialId);
    logTest('Product-Materials READ (getByMaterialId)', 
      productsByMaterial.length === 1 && productsByMaterial[0].produk_id === createdProductId);
    
    // READ (getOne)
    const one = await productMaterialsQuery.getOne(createdProductId, createdMaterialId);
    logTest('Product-Materials READ (getOne)', !!one && Number(one.jumlah) === 50);
    
    // UPDATE
    const updated = await productMaterialsQuery.update(createdProductId, createdMaterialId, 75);
    logTest('Product-Materials UPDATE', Number(updated.jumlah) === 75);
    
    // DELETE
    const deleted = await productMaterialsQuery.deleteProductMaterial(createdProductId, createdMaterialId);
    logTest('Product-Materials DELETE', deleted === true);
    
    // Verify deletion
    const afterDelete = await productMaterialsQuery.getOne(createdProductId, createdMaterialId);
    logTest('Product-Materials DELETE verification', afterDelete === null);
    
    // Cleanup
    await productsQuery.deleteProduct(createdProductId);
    await materialsQuery.deleteMaterial(createdMaterialId);
    
  } catch (error) {
    logTest('Product-Materials CRUD', false, error instanceof Error ? error.message : String(error));
    // Cleanup on error
    if (createdProductId) {
      try { await productsQuery.deleteProduct(createdProductId); } catch {}
    }
    if (createdMaterialId) {
      try { await materialsQuery.deleteMaterial(createdMaterialId); } catch {}
    }
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('  CHECKPOINT 12: API CRUD Tests');
  console.log('========================================');
  
  await testProductsCRUD();
  await testMaterialsCRUD();
  await testEmployeesCRUD();
  await testProductMaterialsCRUD();
  
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
