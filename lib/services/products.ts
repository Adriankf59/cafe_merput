// Products service for Cafe Merah Putih Management System
// Handles CRUD operations for products via API endpoints

import { Product, ProductCategory } from '../types';
import { getAuthToken } from './auth';

// Helper to get auth headers
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Map API response to Product type
function mapApiProduct(apiProduct: Record<string, unknown>): Product {
  // Check availability based on is_available field from API
  const isAvailable = apiProduct.is_available !== false;
  
  return {
    id: apiProduct.produk_id as string,
    name: apiProduct.nama_produk as string,
    category: apiProduct.jenis_produk as ProductCategory,
    price: Number(apiProduct.harga),
    stock: isAvailable ? 1 : 0, // Use availability for stock indicator
    status: isAvailable ? 'Tersedia' : 'Habis',
    image: apiProduct.image as string | undefined,
    createdAt: new Date(apiProduct.created_at as string),
  };
}

// Derive product status based on stock
export function deriveProductStatus(stock: number): 'Tersedia' | 'Habis' {
  return stock > 0 ? 'Tersedia' : 'Habis';
}

// Get all products
export async function getProducts(search?: string, category?: ProductCategory | 'Semua'): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'Semua') params.append('jenis_produk', category);
    
    const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Failed to fetch products:', data.error);
      return [];
    }

    return data.data.map(mapApiProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return undefined;
    }

    return mapApiProduct(data.data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return undefined;
  }
}

// Search products by name (client-side filtering for already fetched products)
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  const lowerQuery = query.toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(lowerQuery));
}

// Filter products by category (client-side filtering for already fetched products)
export function filterProductsByCategory(
  products: Product[],
  category: ProductCategory | 'Semua'
): Product[] {
  if (category === 'Semua') return products;
  return products.filter((p) => p.category === category);
}

// Create new product
export async function createProduct(
  data: Omit<Product, 'id' | 'status' | 'createdAt'>
): Promise<Product | null> {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        nama_produk: data.name,
        harga: data.price,
        deskripsi: '',
        jenis_produk: data.category,
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to create product:', result.error);
      return null;
    }

    return mapApiProduct(result.data);
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// Update existing product
export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'status' | 'createdAt'>>
): Promise<Product | null> {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.nama_produk = data.name;
    if (data.price !== undefined) updateData.harga = data.price;
    if (data.category !== undefined) updateData.jenis_produk = data.category;

    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to update product:', result.error);
      return null;
    }

    return mapApiProduct(result.data);
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to delete product:', result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// Get product materials
export async function getProductMaterials(productId: string): Promise<Array<{
  materialId: string;
  materialName: string;
  quantity: number;
}>> {
  try {
    const response = await fetch(`/api/products/${productId}/materials`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return [];
    }

    return data.data.map((item: Record<string, unknown>) => ({
      materialId: item.bahan_id,
      materialName: item.nama_bahan,
      quantity: Number(item.jumlah),
    }));
  } catch (error) {
    console.error('Error fetching product materials:', error);
    return [];
  }
}

// Add material to product
export async function addProductMaterial(
  productId: string,
  materialId: string,
  quantity: number
): Promise<boolean> {
  try {
    const response = await fetch(`/api/products/${productId}/materials`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        bahan_id: materialId,
        jumlah: quantity,
      }),
    });

    const result = await response.json();
    return response.ok && result.success;
  } catch (error) {
    console.error('Error adding product material:', error);
    return false;
  }
}
