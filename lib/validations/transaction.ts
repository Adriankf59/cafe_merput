import { z } from 'zod';

/**
 * Transaction item validation schema for API input
 * Note: harga_satuan is optional - will be fetched from products table
 */
export const transactionItemSchema = z.object({
  produk_id: z
    .string({ required_error: 'ID produk wajib diisi' })
    .uuid('Format ID produk tidak valid'),
  jumlah: z
    .number({ required_error: 'Jumlah wajib diisi' })
    .int('Jumlah harus bilangan bulat')
    .positive('Jumlah harus lebih dari 0'),
});

/**
 * Create transaction validation schema
 * Requirements: 6.3
 * Note: total_harga is calculated from items (product.harga × jumlah)
 */
export const createTransactionSchema = z.object({
  user_id: z
    .string({ required_error: 'ID user wajib diisi' })
    .uuid('Format ID user tidak valid'),
  items: z
    .array(transactionItemSchema)
    .min(1, 'Transaksi harus memiliki minimal 1 item'),
});

export type TransactionItemInput = z.infer<typeof transactionItemSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
