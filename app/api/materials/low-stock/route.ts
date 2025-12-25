import * as materialsQuery from '@/lib/db/queries/materials';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

/**
 * GET /api/materials/low-stock
 * Get materials with stok_saat_ini < stok_minimum
 * Requirements: 4.6
 */
export async function GET() {
  try {
    const materials = await materialsQuery.getLowStock();
    return successResponse(materials);
  } catch (error) {
    console.error('Error fetching low stock materials:', error);
    return serverErrorResponse('Gagal mengambil data bahan baku stok rendah');
  }
}
