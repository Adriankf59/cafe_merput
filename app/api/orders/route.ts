import { NextRequest } from 'next/server';
import * as ordersQuery from '@/lib/db/queries/orders';
import { createOrderSchema } from '@/lib/validations/order';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

/**
 * GET /api/orders
 * Get all material orders with optional search filter
 * Requirements: 7.1, 7.2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') as 'Pending' | 'Dikirim' | 'Diterima' | null;

    let orders;
    if (status) {
      orders = await ordersQuery.getByStatus(status);
    } else {
      orders = await ordersQuery.getAll(search);
    }

    return successResponse(orders);
  } catch (error) {
    console.error('Error fetching material orders:', error);
    return serverErrorResponse('Gagal mengambil data pesanan bahan');
  }
}

/**
 * POST /api/orders
 * Create a new material order
 * Requirements: 7.3
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Create material order
    const order = await ordersQuery.create({
      bahan_id: validation.data.bahan_id,
      user_id: validation.data.user_id,
      jumlah: validation.data.jumlah,
      tanggal_pesan: new Date(validation.data.tanggal_pesan),
    });

    return createdResponse(order, 'Pesanan bahan berhasil dibuat');
  } catch (error) {
    console.error('Error creating material order:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return errorResponse('Bahan atau user tidak ditemukan', 400);
      }
    }

    return serverErrorResponse('Gagal membuat pesanan bahan');
  }
}
