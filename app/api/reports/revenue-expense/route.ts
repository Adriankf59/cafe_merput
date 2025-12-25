import { NextRequest } from 'next/server';
import { getRevenueExpense } from '@/lib/db/queries/reports';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/reports/revenue-expense
 * Get monthly revenue vs expense data
 * Query params:
 * - months: number of months to retrieve (default: 6, max: 24)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get('months');
    
    let months = 6; // default
    
    if (monthsParam) {
      const parsedMonths = parseInt(monthsParam, 10);
      
      if (isNaN(parsedMonths) || parsedMonths < 1) {
        return errorResponse('Parameter months harus berupa angka positif', 400);
      }
      
      if (parsedMonths > 24) {
        return errorResponse('Parameter months maksimal 24', 400);
      }
      
      months = parsedMonths;
    }
    
    const data = await getRevenueExpense(months);
    
    return successResponse(data);
  } catch (error) {
    console.error('Error fetching revenue-expense data:', error);
    return serverErrorResponse('Gagal mengambil data pendapatan vs pengeluaran');
  }
}
