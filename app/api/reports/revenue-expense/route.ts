import { NextRequest } from 'next/server';
import { getRevenueExpense, getDailyRevenueExpense, getWeeklyRevenueExpense } from '@/lib/db/queries/reports';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/reports/revenue-expense
 * Get revenue vs expense data (monthly, weekly, or daily)
 * Query params:
 * - months: number of months to retrieve (default: 6, max: 24)
 * - days: number of days to retrieve (7) - returns daily data
 * - weeks: number of weeks to retrieve (4) - returns weekly data (for 30 days filter)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthsParam = searchParams.get('months');
    const daysParam = searchParams.get('days');
    const weeksParam = searchParams.get('weeks');
    
    // If weeks parameter is provided, return weekly data
    if (weeksParam) {
      const parsedWeeks = parseInt(weeksParam, 10);
      
      if (isNaN(parsedWeeks) || parsedWeeks < 1) {
        return errorResponse('Parameter weeks harus berupa angka positif', 400);
      }
      
      if (parsedWeeks > 12) {
        return errorResponse('Parameter weeks maksimal 12', 400);
      }
      
      const data = await getWeeklyRevenueExpense(parsedWeeks);
      
      return successResponse(data);
    }
    
    // If days parameter is provided, return daily data
    if (daysParam) {
      const parsedDays = parseInt(daysParam, 10);
      
      if (isNaN(parsedDays) || parsedDays < 1) {
        return errorResponse('Parameter days harus berupa angka positif', 400);
      }
      
      if (parsedDays > 90) {
        return errorResponse('Parameter days maksimal 90', 400);
      }
      
      const data = await getDailyRevenueExpense(parsedDays);
      
      return successResponse(data);
    }
    
    // Otherwise return monthly data
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
