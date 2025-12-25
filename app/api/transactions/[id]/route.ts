import { NextRequest } from 'next/server';
import * as transactionsQuery from '@/lib/db/queries/transactions';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/transactions/[id]
 * Get transaction by ID with items (Detail Penjualan)
 * Requirements: 6.4
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const transaction = await transactionsQuery.getById(id);
    
    if (!transaction) {
      return notFoundResponse('Transaksi tidak ditemukan');
    }

    return successResponse(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return serverErrorResponse('Gagal mengambil data transaksi');
  }
}
