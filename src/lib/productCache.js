const CACHE_MAX_AGE = 5 * 60 * 1000;
const CATALOG_CACHE_KEY = "ayuveera:product-catalog:v1";
const PRODUCT_CACHE_PREFIX = "ayuveera:product-detail:v1:";

function readCache(key) {
  if (typeof window === "undefined") return null;

  try {
    const serialized = window.localStorage.getItem(key);
    if (!serialized) return null;

    const entry = JSON.parse(serialized);
    if (
      !entry ||
      typeof entry !== "object" ||
      !Number.isFinite(entry.savedAt) ||
      Date.now() - entry.savedAt > CACHE_MAX_AGE
    ) {
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("Could not read the product cache.", error);
    return null;
  }
}

function writeCache(key, data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (error) {
    console.warn("Could not save the product cache.", error);
  }
}

export function readCachedProductCatalog() {
  const products = readCache(CATALOG_CACHE_KEY);
  return Array.isArray(products) ? products : null;
}

export function writeCachedProductCatalog(products) {
  if (Array.isArray(products)) writeCache(CATALOG_CACHE_KEY, products);
}

export function readCachedProductDetail(id) {
  const product = readCache(`${PRODUCT_CACHE_PREFIX}${id}`);
  return product && typeof product === "object" && !Array.isArray(product)
    ? product
    : null;
}

export function writeCachedProductDetail(id, product) {
  if (product && typeof product === "object" && !Array.isArray(product)) {
    writeCache(`${PRODUCT_CACHE_PREFIX}${id}`, product);
  }
}
