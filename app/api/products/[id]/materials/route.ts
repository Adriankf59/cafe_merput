import { NextRequest } from 'next/server';
import * as productsQuery from '@/lib/db/queries/products';
import * as productMaterialsQuery from '@/lib/db/queries/product-materials';
import * as materialsQuery from '@/lib/db/queries/materials';
import { addMaterialToProductSchema } from '@/lib/validations/product-material';
import {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]/materials
 * Get all materials used by a product
 * Requirements: 3.4
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if product exists
    const product = await productsQuery.getById(id);
    if (!product) {
      return notFoundResponse('Produk tidak ditemukan');
    }
    
    const materials = await productMaterialsQuery.getByProductId(id);
    return successResponse(materials);
  } catch (error) {
    console.error('Error fetching product materials:', error);
    return serverErrorResponse('Gagal mengambil data bahan baku produk');
  }
}

/**
 * POST /api/products/[id]/materials
 * Add a material to a product
 * Requirements: 3.4
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if product exists
    const product = await productsQuery.getById(id);
    if (!product) {
      return notFoundResponse('Produk tidak ditemukan');
    }
    
    // Validate input
    const validation = addMaterialToProductSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Check if material exists
    const material = await materialsQuery.getById(validation.data.bahan_id);
    if (!material) {
      return notFoundResponse('Bahan baku tidak ditemukan');
    }

    // Check if relationship already exists
    const existingRelation = await productMaterialsQuery.getOne(id, validation.data.bahan_id);
    if (existingRelation) {
      return errorResponse('Bahan baku sudah ditambahkan ke produk ini', 409);
    }

    // Create product-material relationship
    const productMaterial = await productMaterialsQuery.create({
      produk_id: id,
      bahan_id: validation.data.bahan_id,
      jumlah: validation.data.jumlah,
    });
    
    return createdResponse(productMaterial, 'Bahan baku berhasil ditambahkan ke produk');
  } catch (error) {
    console.error('Error adding material to product:', error);
    return serverErrorResponse('Gagal menambahkan bahan baku ke produk');
  }
}
