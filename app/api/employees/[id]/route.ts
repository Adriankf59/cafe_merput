import { NextRequest } from 'next/server';
import * as usersQuery from '@/lib/db/queries/users';
import { updateEmployeeSchema } from '@/lib/validations/employee';
import { hashPassword } from '@/lib/utils/password';
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
 * GET /api/employees/[id]
 * Get employee by ID (password excluded)
 * Requirements: 5.4, 5.6
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const employee = await usersQuery.getById(id);
    
    if (!employee) {
      return notFoundResponse('Pegawai tidak ditemukan');
    }
    
    // Password is already excluded by getById query
    return successResponse(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return serverErrorResponse('Gagal mengambil data pegawai');
  }
}

/**
 * PUT /api/employees/[id]
 * Update employee (password excluded from response)
 * Requirements: 5.4, 5.6
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if employee exists
    const existingEmployee = await usersQuery.getById(id);
    if (!existingEmployee) {
      return notFoundResponse('Pegawai tidak ditemukan');
    }
    
    // Validate input
    const validation = updateEmployeeSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Check if email already exists (excluding current employee)
    if (validation.data.email) {
      const emailExists = await usersQuery.emailExists(validation.data.email, id);
      if (emailExists) {
        return errorResponse('Email sudah terdaftar', 409);
      }
    }

    // Hash password if provided
    const updateData = { ...validation.data };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // Update employee (response excludes password)
    const employee = await usersQuery.update(id, updateData);
    return successResponse(employee, 'Pegawai berhasil diupdate');
  } catch (error) {
    console.error('Error updating employee:', error);
    return serverErrorResponse('Gagal mengupdate pegawai');
  }
}

/**
 * DELETE /api/employees/[id]
 * Delete employee
 * Requirements: 5.5
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if employee exists
    const existingEmployee = await usersQuery.getById(id);
    if (!existingEmployee) {
      return notFoundResponse('Pegawai tidak ditemukan');
    }
    
    // Delete employee
    const deleted = await usersQuery.deleteUser(id);
    
    if (!deleted) {
      return serverErrorResponse('Gagal menghapus pegawai');
    }
    
    return successResponse(null, 'Pegawai berhasil dihapus');
  } catch (error) {
    console.error('Error deleting employee:', error);
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('foreign key')) {
      return errorResponse('Pegawai tidak dapat dihapus karena masih memiliki transaksi atau pesanan terkait', 409);
    }
    return serverErrorResponse('Gagal menghapus pegawai');
  }
}
