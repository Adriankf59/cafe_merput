import { z } from 'zod';

/**
 * Login validation schema
 * Validates email and password for authentication
 * Requirements: 2.1, 2.2
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;
