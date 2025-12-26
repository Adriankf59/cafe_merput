import { NextRequest } from 'next/server';
import * as usersQuery from '@/lib/db/queries/users';
import { createEmployeeSchema } from '@/lib/validations/employee';
import { hashPassword } from '@/lib/utils/password';
import {
  successResponse,
  createdResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/utils/response';

/**
 * GET /api/employees
 * Get all employees with optional search filter
 * Requirements: 5.1, 5.2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const employees = await usersQuery.getAll(search);
    return successResponse(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return serverErrorResponse('Gagal mengambil data pegawai');
  }
}

/**
 * POST /api/employees
 * Create a new employee with password hashing
 * Requirements: 5.3
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createEmployeeSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Data tidak valid';
      return errorResponse(errorMessage, 400);
    }

    // Check if email already exists
    const emailExists = await usersQuery.emailExists(validation.data.email);
    if (emailExists) {
      return errorResponse('Email sudah terdaftar', 409);
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(validation.data.password);

    // Create employee with hashed password
    const employee = await usersQuery.create({
      ...validation.data,
      password: hashedPassword,
      phone: validation.data.phone,
    });

    return createdResponse(employee, 'Pegawai berhasil dibuat');
  } catch (error) {
    console.error('Error creating employee:', error);
    return serverErrorResponse('Gagal membuat pegawai');
  }
}
