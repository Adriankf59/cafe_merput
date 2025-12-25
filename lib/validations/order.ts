import { z } from 'zod';

/**
 * Order status enum matching database schema
 */
export const orderStatusEnum = z.enum(['Pending', 'Dikirim', 'Diterima']);

/**
 * Create material order validation schema
 * Requirements: 7.3, 7.4
 */
export const createOrderSchema = z.object({
  bahan_id: z
    .string({ message: 'ID bahan wajib diisi' })
    .uuid('Format ID bahan tidak valid'),
  user_id: z
    .string({ message: 'ID user wajib diisi' })
    .uuid('Format ID user tidak valid'),
  jumlah: z
    .number({ message: 'Jumlah wajib diisi' })
    .positive('Jumlah harus lebih dari 0'),
  tanggal_pesan: z
    .string({ message: 'Tanggal pesan wajib diisi' })
    .refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid'),
});

/**
 * Update order status validation schema
 * Requirements: 7.3, 7.4
 */
export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  tanggal_terima: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Format tanggal tidak valid')
    .optional()
    .nullable(),
});

export type OrderStatus = z.infer<typeof orderStatusEnum>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
