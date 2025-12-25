import { NextRequest } from 'next/server';
import * as materialsQuery from '@/lib/db/queries/materials';
import { createMaterialSchema } from '@/lib/validations/material';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

/**
 * GET /api/materials
 * Get all materials with optional search filter
 * Requirements: 4.1, 4.2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const materials = await materialsQuery.getAll(search);
    return successResponse(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return serverErrorResponse('Gagal mengambil data bahan baku');
  }
}

/**
 * POST /api/materials
 * Create a new material
 * Requirements: 4.3
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createMaterialSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Create material
    const material = await materialsQuery.create(validation.data);
    return createdResponse(material, 'Bahan baku berhasil dibuat');
  } catch (error) {
    console.error('Error creating material:', error);
    return serverErrorResponse('Gagal membuat bahan baku');
  }
}
