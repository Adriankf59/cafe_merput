import { NextRequest } from 'next/server';
import * as baristaOrdersQuery from '@/lib/db/queries/barista-orders';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

/**
 * GET /api/barista-orders
 * Get all barista orders with optional status filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as baristaOrdersQuery.BaristaOrderStatus | 'active' | null;

    const orders = await baristaOrdersQuery.getAll(status || undefined);
    return successResponse(orders);
  } catch (error) {
    console.error('Error fetching barista orders:', error);
    return serverErrorResponse('Gagal mengambil data pesanan barista');
  }
}

/**
 * POST /api/barista-orders
 * Create a new barista order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.cashier_id) {
      return errorResponse('cashier_id diperlukan', 400);
    }
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return errorResponse('items diperlukan dan tidak boleh kosong', 400);
    }

    // Validate items
    for (const item of body.items) {
      if (!item.produk_id || !item.jumlah) {
        return errorResponse('Setiap item harus memiliki produk_id dan jumlah', 400);
      }
    }

    const order = await baristaOrdersQuery.create({
      transaksi_id: body.transaksi_id,
      cashier_id: body.cashier_id,
      items: body.items,
    });

    return createdResponse(order, 'Pesanan berhasil dibuat');
  } catch (error) {
    console.error('Error creating barista order:', error);
    return serverErrorResponse('Gagal membuat pesanan barista');
  }
}
