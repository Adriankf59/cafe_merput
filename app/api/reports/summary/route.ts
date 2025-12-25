import { NextRequest } from 'next/server';
import { getSummary } from '@/lib/db/queries/reports';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/reports/summary
 * Get report summary: revenue, expenses, profit, transactions
 * Query params:
 * - period: 'daily' | 'weekly' | 'monthly' (default: 'daily')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period') || 'daily';
    
    // Validate period parameter
    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(periodParam)) {
      return errorResponse(
        `Period tidak valid. Gunakan: ${validPeriods.join(', ')}`,
        400
      );
    }
    
    const period = periodParam as 'daily' | 'weekly' | 'monthly';
    const summary = await getSummary(period);
    
    return successResponse(summary);
  } catch (error) {
    console.error('Error fetching report summary:', error);
    return serverErrorResponse('Gagal mengambil ringkasan laporan');
  }
}
