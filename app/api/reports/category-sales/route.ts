import { NextRequest } from 'next/server';
import { getCategorySales } from '@/lib/db/queries/reports';
import { successResponse, serverErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/reports/category-sales
 * Get sales percentage per jenis_produk (product category)
 * Returns sales data for the last 30 days grouped by category
 */
export async function GET(_request: NextRequest) {
  try {
    const data = await getCategorySales();
    
    return successResponse(data);
  } catch (error) {
    console.error('Error fetching category sales data:', error);
    return serverErrorResponse('Gagal mengambil data penjualan per kategori');
  }
}
