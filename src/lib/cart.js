export const CART_UPDATED_EVENT = "cart:updated";

export function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function isProductInCart(productId) {
  return getCart().some((item) => String(item?.id) === String(productId));
}

export function getCartCount() {
  return getCart().reduce((total, item) => {
    const quantity = Number(item?.quantity ?? item?.qty ?? 1);
    return total + (Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0);
  }, 0);
}

export function toggleCartItem(product, quantity = 1) {
  const cart = getCart();
  const exists = cart.some((item) => String(item?.id) === String(product.id));
  const updatedCart = exists
    ? cart.filter((item) => String(item?.id) !== String(product.id))
    : [...cart, { ...product, quantity }];

  localStorage.setItem("cart", JSON.stringify(updatedCart));
  notifyCartUpdated();
  return !exists;
}

export function ensureCartItem(product, quantity = 1) {
  const cart = getCart();
  if (cart.some((item) => String(item?.id) === String(product.id))) return;

  localStorage.setItem("cart", JSON.stringify([...cart, { ...product, quantity }]));
  notifyCartUpdated();
}

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
