import { NextRequest } from 'next/server';
import { getTopProducts } from '@/lib/db/queries/dashboard';
import { successResponse, serverErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/dashboard/top-products
 * Get top selling products
 * Query params:
 * - limit: number of products to return (default: 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    
    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return successResponse(await getTopProducts(5));
    }
    
    const topProducts = await getTopProducts(limit);
    
    return successResponse(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    return serverErrorResponse('Gagal mengambil data produk terlaris');
  }
}
