// Products service for Cafe Merah Putih Management System
// Handles CRUD operations for products with local storage persistence

import { Product, ProductCategory } from '../types';
import { mockProducts } from '../data/mockData';

const STORAGE_KEY = 'cafe_merah_putih_products';

// Derive product status based on stock
export function deriveProductStatus(stock: number): 'Tersedia' | 'Habis' {
  return stock > 0 ? 'Tersedia' : 'Habis';
}

// Initialize products from local storage or mock data
function initializeProducts(): Product[] {
  if (typeof window === 'undefined') return mockProducts;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const products = JSON.parse(stored);
    return products.map((p: Product) => ({
      ...p,
      createdAt: new Date(p.createdAt),
    }));
  }
  
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
  return mockProducts;
}

// Save products to local storage
function saveProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// Get all products
export function getProducts(): Product[] {
  return initializeProducts();
}

// Get product by ID
export function getProductById(id: string): Product | undefined {
  const products = initializeProducts();
  return products.find((p) => p.id === id);
}

// Search products by name (case-insensitive)
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  const lowerQuery = query.toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(lowerQuery));
}

// Filter products by category
export function filterProductsByCategory(
  products: Product[],
  category: ProductCategory | 'Semua'
): Product[] {
  if (category === 'Semua') return products;
  return products.filter((p) => p.category === category);
}

// Generate new product ID
function generateProductId(): string {
  const products = initializeProducts();
  const maxId = products.reduce((max, p) => {
    const num = parseInt(p.id.replace('PRD', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `PRD${String(maxId + 1).padStart(3, '0')}`;
}

// Create new product
export function createProduct(
  data: Omit<Product, 'id' | 'status' | 'createdAt'>
): Product {
  const products = initializeProducts();
  const newProduct: Product = {
    ...data,
    id: generateProductId(),
    status: deriveProductStatus(data.stock),
    createdAt: new Date(),
  };
  
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

// Update existing product
export function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'status' | 'createdAt'>>
): Product | null {
  const products = initializeProducts();
  const index = products.findIndex((p) => p.id === id);
  
  if (index === -1) return null;
  
  const updatedProduct: Product = {
    ...products[index],
    ...data,
    status: deriveProductStatus(data.stock ?? products[index].stock),
  };
  
  products[index] = updatedProduct;
  saveProducts(products);
  return updatedProduct;
}

// Delete product
export function deleteProduct(id: string): boolean {
  const products = initializeProducts();
  const index = products.findIndex((p) => p.id === id);
  
  if (index === -1) return false;
  
  products.splice(index, 1);
  saveProducts(products);
  return true;
}
