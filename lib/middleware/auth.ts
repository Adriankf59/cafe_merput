import { NextRequest } from 'next/server';
import { getTokenFromHeader, verifyToken, JWTPayload } from '@/lib/utils/jwt';
import { unauthorizedResponse } from '@/lib/utils/response';

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

/**
 * Higher-order function that wraps an API route handler with authentication
 * Verifies JWT token and attaches user data to the request
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest): Promise<Response> => {
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return unauthorizedResponse('Token tidak ditemukan');
    }
    
    const payload = verifyToken(token);
    
    if (!payload) {
      return unauthorizedResponse('Token tidak valid atau sudah expired');
    }
    
    // Attach user data to request
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = payload;
    
    return handler(authenticatedReq);
  };
}

/**
 * Extract user from request (for use in handlers wrapped with withAuth)
 */
export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = getTokenFromHeader(req);
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}
