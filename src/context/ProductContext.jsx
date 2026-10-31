import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, apiRequest } from '../lib/api.js';
import { ProductContext } from './productContext.js';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(API_BASE_URL));
  const [catalogError, setCatalogError] = useState(
    API_BASE_URL ? '' : 'Product API is not configured. Set VITE_API_BASE_URL and rebuild the app.',
  );

  useEffect(() => {
    if (!API_BASE_URL) return undefined;

    const controller = new AbortController();
    apiRequest('products.php', { signal: controller.signal })
      .then((catalog) => {
        setProducts(catalog.map((product) => ({
          ...product,
          save: product.oldPrice - product.price,
        })));
        setCatalogError('');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setProducts([]);
          setCatalogError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const value = useMemo(
    () => ({ products, loading, catalogError }),
    [products, loading, catalogError],
  );
  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
