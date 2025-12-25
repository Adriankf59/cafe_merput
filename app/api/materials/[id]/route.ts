import { NextRequest } from 'next/server';
import * as materialsQuery from '@/lib/db/queries/materials';
import { updateMaterialSchema } from '@/lib/validations/material';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/materials/[id]
 * Get material by ID
 * Requirements: 4.4
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const material = await materialsQuery.getById(id);
    
    if (!material) {
      return notFoundResponse('Bahan baku tidak ditemukan');
    }
    
    return successResponse(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return serverErrorResponse('Gagal mengambil data bahan baku');
  }
}

/**
 * PUT /api/materials/[id]
 * Update material
 * Requirements: 4.4
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if material exists
    const existingMaterial = await materialsQuery.getById(id);
    if (!existingMaterial) {
      return notFoundResponse('Bahan baku tidak ditemukan');
    }
    
    // Validate input
    const validation = updateMaterialSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Update material
    const material = await materialsQuery.update(id, validation.data);
    return successResponse(material, 'Bahan baku berhasil diupdate');
  } catch (error) {
    console.error('Error updating material:', error);
    return serverErrorResponse('Gagal mengupdate bahan baku');
  }
}

/**
 * DELETE /api/materials/[id]
 * Delete material
 * Requirements: 4.5
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if material exists
    const existingMaterial = await materialsQuery.getById(id);
    if (!existingMaterial) {
      return notFoundResponse('Bahan baku tidak ditemukan');
    }
    
    // Delete material
    const deleted = await materialsQuery.deleteMaterial(id);
    
    if (!deleted) {
      return serverErrorResponse('Gagal menghapus bahan baku');
    }
    
    return successResponse(null, 'Bahan baku berhasil dihapus');
  } catch (error) {
    console.error('Error deleting material:', error);
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('Bahan baku tidak dapat dihapus karena masih digunakan dalam produk atau pesanan', 409);
    }
    return serverErrorResponse('Gagal menghapus bahan baku');
  }
}
