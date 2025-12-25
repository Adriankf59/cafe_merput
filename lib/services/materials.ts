// Materials service for Cafe Merah Putih Management System
// Handles CRUD operations for materials (bahan baku) with local storage persistence

import { Material, MaterialCategory, MaterialUnit } from '../types';
import { mockMaterials } from '../data/mockData';

const STORAGE_KEY = 'cafe_merah_putih_materials';

// Derive material status based on stock vs minStock
export function deriveMaterialStatus(stock: number, minStock: number): 'Aman' | 'Stok Rendah' {
  return stock >= minStock ? 'Aman' : 'Stok Rendah';
}

// Initialize materials from local storage or mock data
function initializeMaterials(): Material[] {
  if (typeof window === 'undefined') return mockMaterials;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const materials = JSON.parse(stored);
    return materials.map((m: Material) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
  }
  
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMaterials));
  return mockMaterials;
}

// Save materials to local storage
function saveMaterials(materials: Material[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
}

// Get all materials
export function getMaterials(): Material[] {
  return initializeMaterials();
}

// Get material by ID
export function getMaterialById(id: string): Material | undefined {
  const materials = initializeMaterials();
  return materials.find((m) => m.id === id);
}

// Search materials by name (case-insensitive)
export function searchMaterials(materials: Material[], query: string): Material[] {
  if (!query.trim()) return materials;
  const lowerQuery = query.toLowerCase();
  return materials.filter((m) => m.name.toLowerCase().includes(lowerQuery));
}

// Filter materials by category
export function filterMaterialsByCategory(
  materials: Material[],
  category: MaterialCategory | 'Semua'
): Material[] {
  if (category === 'Semua') return materials;
  return materials.filter((m) => m.category === category);
}

// Get materials with low stock
export function getLowStockMaterials(materials: Material[]): Material[] {
  return materials.filter((m) => m.stock < m.minStock);
}

// Count materials with low stock
export function countLowStockMaterials(materials: Material[]): number {
  return getLowStockMaterials(materials).length;
}

// Generate new material ID
function generateMaterialId(): string {
  const materials = initializeMaterials();
  const maxId = materials.reduce((max, m) => {
    const num = parseInt(m.id.replace('MAT', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `MAT${String(maxId + 1).padStart(3, '0')}`;
}

// Create new material
export function createMaterial(
  data: Omit<Material, 'id' | 'status' | 'createdAt'>
): Material {
  const materials = initializeMaterials();
  const newMaterial: Material = {
    ...data,
    id: generateMaterialId(),
    status: deriveMaterialStatus(data.stock, data.minStock),
    createdAt: new Date(),
  };
  
  materials.push(newMaterial);
  saveMaterials(materials);
  return newMaterial;
}

// Update existing material
export function updateMaterial(
  id: string,
  data: Partial<Omit<Material, 'id' | 'status' | 'createdAt'>>
): Material | null {
  const materials = initializeMaterials();
  const index = materials.findIndex((m) => m.id === id);
  
  if (index === -1) return null;
  
  const currentMaterial = materials[index];
  const newStock = data.stock ?? currentMaterial.stock;
  const newMinStock = data.minStock ?? currentMaterial.minStock;
  
  const updatedMaterial: Material = {
    ...currentMaterial,
    ...data,
    status: deriveMaterialStatus(newStock, newMinStock),
  };
  
  materials[index] = updatedMaterial;
  saveMaterials(materials);
  return updatedMaterial;
}

// Delete material
export function deleteMaterial(id: string): boolean {
  const materials = initializeMaterials();
  const index = materials.findIndex((m) => m.id === id);
  
  if (index === -1) return false;
  
  materials.splice(index, 1);
  saveMaterials(materials);
  return true;
}

// Export types for convenience
export type { Material, MaterialCategory, MaterialUnit };
