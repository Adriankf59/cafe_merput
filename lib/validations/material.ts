import { z } from 'zod';

/**
 * Material unit enum matching database schema
 */
export const satuanEnum = z.enum(['kg', 'liter', 'pcs', 'gram', 'ml']);

/**
 * Create material validation schema
 * Requirements: 4.3, 4.4
 */
export const createMaterialSchema = z.object({
  nama_bahan: z
    .string({ message: 'Nama bahan wajib diisi' })
    .min(1, 'Nama bahan wajib diisi')
    .max(100, 'Nama bahan maksimal 100 karakter'),
  stok_saat_ini: z
    .number()
    .min(0, 'Stok tidak boleh negatif')
    .default(0),
  stok_minimum: z
    .number({ message: 'Stok minimum wajib diisi' })
    .min(0, 'Stok minimum tidak boleh negatif'),
  satuan: satuanEnum,
});

/**
 * Update material validation schema
 * Requirements: 4.3, 4.4
 */
export const updateMaterialSchema = z.object({
  nama_bahan: z
    .string()
    .min(1, 'Nama bahan wajib diisi')
    .max(100, 'Nama bahan maksimal 100 karakter')
    .optional(),
  stok_saat_ini: z
    .number()
    .min(0, 'Stok tidak boleh negatif')
    .optional(),
  stok_minimum: z
    .number()
    .min(0, 'Stok minimum tidak boleh negatif')
    .optional(),
  satuan: satuanEnum.optional(),
});

export type Satuan = z.infer<typeof satuanEnum>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
