import { Book } from "./booksData";

export interface CartItem {
  book: Book;
  quantity: number;
}

const CART_KEY = "motanaby_cart";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse cart from localStorage", e);
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(book: Book, quantity: number = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.book.id === book.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ book, quantity });
  }
  saveCart(cart);
}

export function removeFromCart(bookId: number) {
  const cart = getCart().filter(item => item.book.id !== bookId);
  saveCart(cart);
}

export function updateQuantity(bookId: number, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(bookId);
    return;
  }
  const cart = getCart();
  const existing = cart.find(item => item.book.id === bookId);
  if (existing) {
    existing.quantity = quantity;
    saveCart(cart);
  }
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.book.price * item.quantity, 0);
}

export function clearCart() {
  saveCart([]);
}
