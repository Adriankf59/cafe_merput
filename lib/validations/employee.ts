import { z } from 'zod';

/**
 * Employee status enum matching database schema
 */
export const statusEnum = z.enum(['Aktif', 'Nonaktif']);

/**
 * Create employee validation schema
 * Requirements: 5.3, 5.4
 */
export const createEmployeeSchema = z.object({
  username: z
    .string({ message: 'Username wajib diisi' })
    .min(1, 'Username wajib diisi')
    .max(100, 'Username maksimal 100 karakter'),
  email: z
    .string({ message: 'Email wajib diisi' })
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(100, 'Email maksimal 100 karakter'),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(6, 'Password minimal 6 karakter'),
  role_id: z
    .string({ message: 'Role wajib diisi' })
    .uuid('Format role ID tidak valid'),
  status: statusEnum.default('Aktif'),
});

/**
 * Update employee validation schema
 * Requirements: 5.3, 5.4
 */
export const updateEmployeeSchema = z.object({
  username: z
    .string()
    .min(1, 'Username wajib diisi')
    .max(100, 'Username maksimal 100 karakter')
    .optional(),
  email: z
    .string()
    .email('Format email tidak valid')
    .max(100, 'Email maksimal 100 karakter')
    .optional(),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .optional(),
  role_id: z
    .string()
    .uuid('Format role ID tidak valid')
    .optional(),
  status: statusEnum.optional(),
});

export type EmployeeStatus = z.infer<typeof statusEnum>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
