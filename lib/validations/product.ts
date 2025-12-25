import { z } from 'zod';

/**
 * Product type enum matching database schema
 */
export const jenisProductEnum = z.enum(['Kopi', 'Non-Kopi', 'Makanan']);

/**
 * Create product validation schema
 * Requirements: 3.4, 3.5
 */
export const createProductSchema = z.object({
  nama_produk: z
    .string({ message: 'Nama produk wajib diisi' })
    .min(1, 'Nama produk wajib diisi')
    .max(100, 'Nama produk maksimal 100 karakter'),
  harga: z
    .number({ message: 'Harga wajib diisi' })
    .positive('Harga harus lebih dari 0'),
  deskripsi: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .nullable(),
  jenis_produk: jenisProductEnum,
});

/**
 * Update product validation schema
 * Requirements: 3.4, 3.5
 */
export const updateProductSchema = z.object({
  nama_produk: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .max(100, 'Nama produk maksimal 100 karakter')
    .optional(),
  harga: z
    .number()
    .positive('Harga harus lebih dari 0')
    .optional(),
  deskripsi: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .nullable(),
  jenis_produk: jenisProductEnum.optional(),
});

export type JenisProduct = z.infer<typeof jenisProductEnum>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
