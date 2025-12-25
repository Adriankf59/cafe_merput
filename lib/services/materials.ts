// Materials service for Cafe Merah Putih Management System
// Handles CRUD operations for materials (bahan baku) via API endpoints

import { Material, MaterialCategory, MaterialUnit } from '../types';
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

// Map API satuan to MaterialUnit
function mapSatuan(satuan: string): MaterialUnit {
  const mapping: Record<string, MaterialUnit> = {
    'kg': 'kg',
    'liter': 'liter',
    'pcs': 'pcs',
    'gram': 'kg', // Map gram to kg for display
    'ml': 'liter', // Map ml to liter for display
  };
  return mapping[satuan] || 'pcs';
}

// Map API response to Material type
function mapApiMaterial(apiMaterial: Record<string, unknown>): Material {
  const stock = Number(apiMaterial.stok_saat_ini || 0);
  const minStock = Number(apiMaterial.stok_minimum || 0);
  
  return {
    id: apiMaterial.bahan_id as string,
    name: apiMaterial.nama_bahan as string,
    category: 'Lainnya' as MaterialCategory, // API doesn't have category, default to Lainnya
    stock: stock,
    unit: mapSatuan(apiMaterial.satuan as string),
    minStock: minStock,
    supplierId: '',
    supplierName: '',
    status: stock >= minStock ? 'Aman' : 'Stok Rendah',
    createdAt: new Date(apiMaterial.created_at as string),
  };
}

// Derive material status based on stock vs minStock
export function deriveMaterialStatus(stock: number, minStock: number): 'Aman' | 'Stok Rendah' {
  return stock >= minStock ? 'Aman' : 'Stok Rendah';
}

// Get all materials
export async function getMaterials(search?: string): Promise<Material[]> {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const url = `/api/materials${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Failed to fetch materials:', data.error);
      return [];
    }

    return data.data.map(mapApiMaterial);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}

// Get material by ID
export async function getMaterialById(id: string): Promise<Material | undefined> {
  try {
    const response = await fetch(`/api/materials/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return undefined;
    }

    return mapApiMaterial(data.data);
  } catch (error) {
    console.error('Error fetching material:', error);
    return undefined;
  }
}

// Search materials by name (client-side filtering for already fetched materials)
export function searchMaterials(materials: Material[], query: string): Material[] {
  if (!query.trim()) return materials;
  const lowerQuery = query.toLowerCase();
  return materials.filter((m) => m.name.toLowerCase().includes(lowerQuery));
}

// Filter materials by category (client-side filtering)
export function filterMaterialsByCategory(
  materials: Material[],
  category: MaterialCategory | 'Semua'
): Material[] {
  if (category === 'Semua') return materials;
  return materials.filter((m) => m.category === category);
}

// Get materials with low stock
export async function getLowStockMaterials(): Promise<Material[]> {
  try {
    const response = await fetch('/api/materials/low-stock', {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error('Failed to fetch low stock materials:', data.error);
      return [];
    }

    return data.data.map(mapApiMaterial);
  } catch (error) {
    console.error('Error fetching low stock materials:', error);
    return [];
  }
}

// Count materials with low stock (client-side for already fetched materials)
export function countLowStockMaterials(materials: Material[]): number {
  return materials.filter((m) => m.stock < m.minStock).length;
}

// Create new material
export async function createMaterial(
  data: Omit<Material, 'id' | 'status' | 'createdAt'>
): Promise<Material | null> {
  try {
    // Map unit to API satuan
    const satuanMapping: Record<MaterialUnit, string> = {
      'kg': 'kg',
      'liter': 'liter',
      'pcs': 'pcs',
    };

    const response = await fetch('/api/materials', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        nama_bahan: data.name,
        stok_saat_ini: data.stock,
        stok_minimum: data.minStock,
        satuan: satuanMapping[data.unit] || 'pcs',
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to create material:', result.error);
      return null;
    }

    return mapApiMaterial(result.data);
  } catch (error) {
    console.error('Error creating material:', error);
    return null;
  }
}

// Update existing material
export async function updateMaterial(
  id: string,
  data: Partial<Omit<Material, 'id' | 'status' | 'createdAt'>>
): Promise<Material | null> {
  try {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.nama_bahan = data.name;
    if (data.stock !== undefined) updateData.stok_saat_ini = data.stock;
    if (data.minStock !== undefined) updateData.stok_minimum = data.minStock;
    if (data.unit !== undefined) {
      const satuanMapping: Record<MaterialUnit, string> = {
        'kg': 'kg',
        'liter': 'liter',
        'pcs': 'pcs',
      };
      updateData.satuan = satuanMapping[data.unit] || 'pcs';
    }

    const response = await fetch(`/api/materials/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to update material:', result.error);
      return null;
    }

    return mapApiMaterial(result.data);
  } catch (error) {
    console.error('Error updating material:', error);
    return null;
  }
}

// Delete material
export async function deleteMaterial(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to delete material:', result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting material:', error);
    return false;
  }
}

// Export types for convenience
export type { Material, MaterialCategory, MaterialUnit };
