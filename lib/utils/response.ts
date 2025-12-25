import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a success response with data
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  
  if (message) {
    response.message = message;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

/**
 * Create a not found response (404)
 */
export function notFoundResponse(
  message: string = 'Resource tidak ditemukan'
): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 404);
}

/**
 * Create an unauthorized response (401)
 */
export function unauthorizedResponse(
  message: string = 'Tidak terautentikasi'
): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 401);
}

/**
 * Create a server error response (500)
 */
export function serverErrorResponse(
  message: string = 'Terjadi kesalahan server'
): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 500);
}
