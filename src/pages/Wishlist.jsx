import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { customerApiRequest, hasCustomerSession } from "../lib/customerSession.js";
import { resolveProductImage } from "../lib/api.js";

export default function Wishlist() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async (signal) => {
    try {
      const account = await customerApiRequest("customer-account.php", { signal });
      setProducts(account.wishlist);
      setError("");
    } catch (requestError) {
      if (requestError.name !== "AbortError") setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // The request resolves asynchronously and populates the customer's saved products.
    // eslint-disable-next-line react/set-state-in-effect
    void loadWishlist(controller.signal);
    return () => controller.abort();
  }, [loadWishlist]);

  const removeProduct = async (productId) => {
    setError("");
    try {
      await customerApiRequest(
        `customer-account.php?resource=wishlist&productId=${encodeURIComponent(productId)}`,
        { method: "DELETE" }
      );
      setProducts((current) => current.filter((product) => product.id !== productId));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (!hasCustomerSession()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <main className="min-h-[60vh] bg-[#fffcf0] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#917345]">YOUR ACCOUNT</p>
        <h1 className="mt-2 font-serif text-3xl text-[#1e3a2e]">Wishlist</h1>
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {loading ? (
          <p role="status" className="mt-8 text-sm text-[#536254]">Loading your saved products...</p>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#e8e0c8] bg-white p-7 text-center">
            <p className="text-sm text-[#66645b]">Your wishlist is empty.</p>
            <Link to="/products" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="flex gap-4 rounded-2xl border border-[#e8e0c8] bg-white p-4">
                <Link to={`/product/${product.id}`} className="grid h-28 w-28 shrink-0 place-items-center rounded-xl bg-[#f7f4eb]">
                  <img src={resolveProductImage(product.image)} alt={product.name} className="h-full w-full object-contain" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${product.id}`} className="font-semibold text-[#354b3c] hover:underline">{product.name}</Link>
                  <p className="mt-1 text-sm text-[#66645b]">₹{Number(product.price).toLocaleString("en-IN")}</p>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="mt-3 text-xs font-semibold text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
