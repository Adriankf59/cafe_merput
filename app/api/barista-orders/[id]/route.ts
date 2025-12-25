import { NextRequest } from 'next/server';
import * as baristaOrdersQuery from '@/lib/db/queries/barista-orders';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/barista-orders/[id]
 * Get barista order by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const order = await baristaOrdersQuery.getById(id);
    
    if (!order) {
      return notFoundResponse('Pesanan tidak ditemukan');
    }

    return successResponse(order);
  } catch (error) {
    console.error('Error fetching barista order:', error);
    return serverErrorResponse('Gagal mengambil data pesanan');
  }
}

/**
 * PATCH /api/barista-orders/[id]
 * Update barista order status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate status
    const validStatuses: baristaOrdersQuery.BaristaOrderStatus[] = ['waiting', 'processing', 'ready', 'completed'];
    if (!body.status || !validStatuses.includes(body.status)) {
      return errorResponse('Status tidak valid. Gunakan: waiting, processing, ready, atau completed', 400);
    }

    const existingOrder = await baristaOrdersQuery.getById(id);
    if (!existingOrder) {
      return notFoundResponse('Pesanan tidak ditemukan');
    }

    // If completing order, reduce material stock
    if (body.status === 'completed' && existingOrder.status !== 'completed') {
      await baristaOrdersQuery.reduceMaterialStock(id);
    }

    const order = await baristaOrdersQuery.updateStatus(id, body.status);
    return successResponse(order, 'Status pesanan berhasil diperbarui');
  } catch (error) {
    console.error('Error updating barista order:', error);
    return serverErrorResponse('Gagal memperbarui status pesanan');
  }
}

/**
 * DELETE /api/barista-orders/[id]
 * Delete barista order
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const existingOrder = await baristaOrdersQuery.getById(id);
    if (!existingOrder) {
      return notFoundResponse('Pesanan tidak ditemukan');
    }

    await baristaOrdersQuery.deleteOrder(id);
    return successResponse(null, 'Pesanan berhasil dihapus');
  } catch (error) {
    console.error('Error deleting barista order:', error);
    return serverErrorResponse('Gagal menghapus pesanan');
  }
}
