import { NextRequest } from 'next/server';
import * as transactionsQuery from '@/lib/db/queries/transactions';
import { createTransactionSchema } from '@/lib/validations/transaction';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

/**
 * GET /api/transactions
 * Get all transactions with optional date filter
 * Requirements: 6.1, 6.2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse date filters
    const startDateStr = searchParams.get('start_date') || searchParams.get('startDate');
    const endDateStr = searchParams.get('end_date') || searchParams.get('endDate');
    const dateStr = searchParams.get('date'); // Single date filter
    
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (dateStr) {
      // Single date filter - get transactions for that specific date
      startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      if (startDateStr) {
        startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0);
      }
      if (endDateStr) {
        endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const transactions = await transactionsQuery.getAll(startDate, endDate);
    return successResponse(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return serverErrorResponse('Gagal mengambil data transaksi');
  }
}

/**
 * POST /api/transactions
 * Create a new transaction - calculates total_harga from items
 * Requirements: 6.3, 6.5
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createTransactionSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Create transaction (total_harga calculated in query from product prices)
    const transaction = await transactionsQuery.create(validation.data);
    return createdResponse(transaction, 'Transaksi berhasil dibuat');
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Product not found')) {
        return errorResponse('Produk tidak ditemukan. Silakan refresh halaman dan pilih produk kembali.', 404);
      }
      if (error.message.includes('Insufficient stock')) {
        return errorResponse(error.message, 400);
      }
      if (error.message.includes('foreign key') || error.message.includes('user_id')) {
        return errorResponse('User tidak valid. Silakan logout dan login kembali.', 400);
      }
      // Return the actual error message for debugging
      return errorResponse(`Gagal membuat transaksi: ${error.message}`, 500);
    }
    
    return serverErrorResponse('Gagal membuat transaksi');
  }
}
