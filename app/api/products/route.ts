import { NextRequest } from 'next/server';
import * as productsQuery from '@/lib/db/queries/products';
import { createProductSchema } from '@/lib/validations/product';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

/**
 * GET /api/products
 * Get all products with optional search and jenis_produk filter
 * Includes availability status based on material stock
 * Requirements: 3.1, 3.2, 3.3
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const jenisProduk = searchParams.get('jenis_produk') || searchParams.get('category') || undefined;

    // Get products with availability status
    const products = await productsQuery.getAllWithAvailability(search, jenisProduk);
    return successResponse(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return serverErrorResponse('Gagal mengambil data produk');
  }
}

/**
 * POST /api/products
 * Create a new product
 * Requirements: 3.4
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Create product
    const product = await productsQuery.create(validation.data);
    return createdResponse(product, 'Produk berhasil dibuat');
  } catch (error) {
    console.error('Error creating product:', error);
    return serverErrorResponse('Gagal membuat produk');
  }
}
