import { Book } from "./booksData";

const WISHLIST_KEY = "motanaby_wishlist";

export function getWishlist(): Book[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse wishlist from localStorage", e);
    return [];
  }
}

export function saveWishlist(wishlist: Book[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  window.dispatchEvent(new Event("wishlist-updated"));
}

export function toggleWishlist(book: Book): boolean {
  const wishlist = getWishlist();
  const existingIndex = wishlist.findIndex(item => item.id === book.id);
  let isAdded = false;
  if (existingIndex > -1) {
    wishlist.splice(existingIndex, 1);
  } else {
    wishlist.push(book);
    isAdded = true;
  }
  saveWishlist(wishlist);
  return isAdded;
}

export function isInWishlist(bookId: number): boolean {
  return getWishlist().some(item => item.id === bookId);
}

export function removeFromWishlist(bookId: number) {
  const wishlist = getWishlist().filter(item => item.id !== bookId);
  saveWishlist(wishlist);
}
