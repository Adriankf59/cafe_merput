import { NextRequest } from 'next/server';
import { getWeeklySales } from '@/lib/db/queries/dashboard';
import { successResponse, serverErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/dashboard/weekly-sales
 * Get weekly sales data (last 7 days)
 */
export async function GET(request: NextRequest) {
  try {
    const weeklySales = await getWeeklySales();
    
    return successResponse(weeklySales);
  } catch (error) {
    console.error('Error fetching weekly sales:', error);
    return serverErrorResponse('Gagal mengambil data penjualan mingguan');
  }
}
