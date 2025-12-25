import { NextRequest } from 'next/server';
import * as productsQuery from '@/lib/db/queries/products';
import { updateProductSchema } from '@/lib/validations/product';
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
 * GET /api/products/[id]
 * Get product by ID with materials
 * Requirements: 3.5
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await productsQuery.getWithMaterials(id);
    
    if (!product) {
      return notFoundResponse('Produk tidak ditemukan');
    }
    
    return successResponse(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return serverErrorResponse('Gagal mengambil data produk');
  }
}

/**
 * PUT /api/products/[id]
 * Update product
 * Requirements: 3.5
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if product exists
    const existingProduct = await productsQuery.getById(id);
    if (!existingProduct) {
      return notFoundResponse('Produk tidak ditemukan');
    }
    
    // Validate input
    const validation = updateProductSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Update product
    const product = await productsQuery.update(id, validation.data);
    return successResponse(product, 'Produk berhasil diupdate');
  } catch (error) {
    console.error('Error updating product:', error);
    return serverErrorResponse('Gagal mengupdate produk');
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product (cascade deletes product_materials)
 * Requirements: 3.6
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if product exists
    const existingProduct = await productsQuery.getById(id);
    if (!existingProduct) {
      return notFoundResponse('Produk tidak ditemukan');
    }
    
    // Delete product
    const deleted = await productsQuery.deleteProduct(id);
    
    if (!deleted) {
      return serverErrorResponse('Gagal menghapus produk');
    }
    
    return successResponse(null, 'Produk berhasil dihapus');
  } catch (error) {
    console.error('Error deleting product:', error);
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('Produk tidak dapat dihapus karena masih digunakan dalam transaksi', 409);
    }
    return serverErrorResponse('Gagal menghapus produk');
  }
}
