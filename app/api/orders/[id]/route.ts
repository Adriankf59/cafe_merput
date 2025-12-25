import { NextRequest } from 'next/server';
import * as ordersQuery from '@/lib/db/queries/orders';
import { updateOrderStatusSchema } from '@/lib/validations/order';
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orders/[id]
 * Get material order by ID
 * Requirements: 7.5
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const order = await ordersQuery.getById(id);

    if (!order) {
      return notFoundResponse('Pesanan bahan tidak ditemukan');
    }

    return successResponse(order);
  } catch (error) {
    console.error('Error fetching material order:', error);
    return serverErrorResponse('Gagal mengambil data pesanan bahan');
  }
}

/**
 * PUT /api/orders/[id]
 * Update material order status (update stock when 'Diterima')
 * Requirements: 7.4
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if order exists
    const existing = await ordersQuery.getById(id);
    if (!existing) {
      return notFoundResponse('Pesanan bahan tidak ditemukan');
    }

    // Validate input
    const validation = updateOrderStatusSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Update order status (stock is updated automatically when status is 'Diterima')
    const order = await ordersQuery.updateStatus(id, {
      status: validation.data.status,
      tanggal_terima: validation.data.tanggal_terima 
        ? new Date(validation.data.tanggal_terima) 
        : undefined,
    });

    return successResponse(order, 'Status pesanan berhasil diperbarui');
  } catch (error) {
    console.error('Error updating material order:', error);
    return serverErrorResponse('Gagal memperbarui pesanan bahan');
  }
}
