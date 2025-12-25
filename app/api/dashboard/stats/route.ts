import { NextRequest } from 'next/server';
import { getStats } from '@/lib/db/queries/dashboard';
import { successResponse, serverErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics: total sales, transactions, employees, products sold
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await getStats();
    
    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return serverErrorResponse('Gagal mengambil statistik dashboard');
  }
}
