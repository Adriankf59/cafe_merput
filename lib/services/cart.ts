// Cart service for Cafe Merah Putih Management System
// Handles cart operations and calculations

import { CartItem, Product } from '../types';

const TAX_RATE = 0.1; // 10% tax

// Calculate item subtotal
export function calculateItemSubtotal(price: number, quantity: number): number {
  return price * quantity;
}

// Calculate cart subtotal (sum of all item subtotals)
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

// Calculate tax (10% of subtotal)
export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}

// Calculate total (subtotal + tax)
export function calculateTotal(subtotal: number, tax: number): number {
  return subtotal + tax;
}

// Calculate all cart totals
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal, tax);
  return { subtotal, tax, total };
}

// Add item to cart
export function addItemToCart(
  cart: CartItem[],
  product: Product
): CartItem[] {
  const existingIndex = cart.findIndex(
    (item) => item.productId === product.id
  );

  if (existingIndex >= 0) {
    // Product already in cart, increment quantity
    const updatedCart = [...cart];
    const existingItem = updatedCart[existingIndex];
    const newQuantity = existingItem.quantity + 1;
    updatedCart[existingIndex] = {
      ...existingItem,
      quantity: newQuantity,
      subtotal: calculateItemSubtotal(existingItem.price, newQuantity),
    };
    return updatedCart;
  }

  // New product, add to cart
  const newItem: CartItem = {
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity: 1,
    subtotal: product.price,
  };

  return [...cart, newItem];
}

// Remove item from cart
export function removeItemFromCart(
  cart: CartItem[],
  productId: string
): CartItem[] {
  return cart.filter((item) => item.productId !== productId);
}

// Update item quantity in cart
export function updateItemQuantity(
  cart: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeItemFromCart(cart, productId);
  }

  return cart.map((item) => {
    if (item.productId === productId) {
      return {
        ...item,
        quantity,
        subtotal: calculateItemSubtotal(item.price, quantity),
      };
    }
    return item;
  });
}

// Clear cart
export function clearCart(): CartItem[] {
  return [];
}
