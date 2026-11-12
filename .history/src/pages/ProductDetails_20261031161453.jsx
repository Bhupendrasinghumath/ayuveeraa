import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";

const optionalValue = (value) => (
  value !== null && value !== undefined && String(value).trim() !== ""
);

function ProductState({ children, title, action }) {
  return (
    <main className="flex min-h-[55vh] items-center justify-center bg-[#fdf9ed] px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-[#102e22]">{title}</h1>
        <div className="mt-3 text-sm leading-6 text-black/65">{children}</div>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </main>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [controls, setControls] = useState({ id: null, activeImg: 0, qty: 1 });
  const [openAcc, setOpenAcc] = useState("description");

  useEffect(() => {
    const controller = new AbortController();

    apiRequest(`products.php?id=${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((result) => {
        if (!result || typeof result !== "object" || Array.isArray(result)) {
          throw new Error("The product response was not valid.");
        }
        setResponse({ id, requestVersion, product: result });
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        setResponse({
          id,
          requestVersion,
          notFound: /product not found/i.test(requestError.message),
          error: requestError.message || "Please try again in a moment.",
        });
      });

    return () => controller.abort();
  }, [id, requestVersion]);

  const currentResponse = response?.id === id && response.requestVersion === requestVersion
    ? response
    : null;
  const loading = !currentResponse;
  const product = currentResponse?.product;
  const error = currentResponse?.error || "";
  const notFound = currentResponse?.notFound || false;
  const activeImg = controls.id === id ? controls.activeImg : 0;
  const qty = controls.id === id ? controls.qty : 1;

  if (loading) {
    return (
      <ProductState title="Loading product">
        <span role="status">Fetching product details…</span>
      </ProductState>
    );
  }

  if (notFound) {
    return (
      <ProductState
        title="Product not found"
        action={<Link to="/products" className="font-semibold text-[#0e766e] underline underline-offset-4">Browse all products</Link>}
      >
        This product may have been removed or is no longer available.
      </ProductState>
    );
  }

  if (error || !product) {
    return (
      <ProductState
        title="We couldn't load this product"
        action={(
          <button
            type="button"
            onClick={() => setRequestVersion((version) => version + 1)}
            className="rounded-full bg-[#102e22] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#174632]"
          >
            Try again
          </button>
        )}
      >
        {error || "Please try again in a moment."}
      </ProductState>
    );
  }

  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : optionalValue(product.image) ? [product.image] : [];
  const benefits = Array.isArray(product.key_benefits) ? product.key_benefits : [];
  const ingredientRows = Array.isArray(product.ingredientRows) ? product.ingredientRows : [];
  const ingredients = ingredientRows.length
    ? ingredientRows
    : (Array.isArray(product.ingredients) ? product.ingredients : []).map((name) => ({ ingredient_name: name }));
  const sections = [
    { key: "description", title: "Description", content: product.description },
    { key: "how-to-use", title: "How to use", content: product.how_to_use },
    { key: "safety", title: "Safety information", content: product.safety_information },
    { key: "storage", title: "Storage instructions", content: product.storage_instructions },
  ].filter((section) => optionalValue(section.content));
  const specifications = [
    ["Dosage form", product.dosage_form],
    ["Pack size", product.pack_size],
    ["Product type", product.product_type],
    ["Suitable for", product.suitable_for],
    ["Manufacturer", product.manufacturer],
    ["Country of origin", product.country_of_origin],
    ["Shelf life", product.shelf_life],
    ["License number", product.license_number],
  ].filter(([, value]) => optionalValue(value));
  const price = Number(product.price);
  const oldPrice = Number(product.oldPrice);
  const discount = oldPrice > price && oldPrice > 0
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => Number(item.id) === Number(product.id));
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty, mainImg: images[0] || product.image });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  return (
    <main className="min-h-screen w-full bg-[#fdf9ed]">
      <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6 md:py-8">
        <nav aria-label="Breadcrumb" className="text-xs text-black/55">
          <Link to="/" className="hover:text-[#102e22]">Home</Link>
          <span className="px-2">/</span>
          <Link to="/products" className="hover:text-[#102e22]">All products</Link>
          <span className="px-2">/</span>
          <span className="font-semibold text-black">{product.name}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-8 md:mt-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          <section aria-label="Product images" className="min-w-0">
            <div
              className="relative mx-auto overflow-hidden rounded-[20px] border border-black/10 bg-white"
              style={{
                width: "min(100%, 480px)",
                aspectRatio: "1 / 1",
                marginInline: "auto",
                overflow: "hidden",
              }}
            >
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-contain p-3"
                  style={{
                    position: "absolute",
                    inset: 12,
                    width: "calc(100% - 24px)",
                    height: "calc(100% - 24px)",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center text-sm text-black/45"
                  style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}
                >
                  No product image available
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div
                className="mx-auto mt-3 flex w-full flex-wrap gap-2 pb-1"
                style={{
                  width: "min(100%, 480px)",
                  marginInline: "auto",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setControls({ id, activeImg: index, qty })}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImg === index}
                    className={`shrink-0 overflow-hidden rounded-xl border-2 bg-white ${activeImg === index ? "border-[#102e22]" : "border-black/10"}`}
                    style={{
                      width: 64,
                      height: 64,
                      flex: "0 0 64px",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-contain"
                      style={{ display: "block", width: "100%", height: "100%" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0">
            {optionalValue(product.brand) && (
              <p className="text-[11px] font-bold uppercase tracking-[2px] text-[#0e766e]">{product.brand}</p>
            )}
            <h1 className="mt-2 text-2xl font-bold leading-tight text-[#102e22] md:text-3xl">{product.name}</h1>
            {optionalValue(product.category) && (
              <p className="mt-2 text-sm text-black/60">{product.category}</p>
            )}
            {optionalValue(product.short_description) && (
              <p className="mt-3 text-sm leading-6 text-black/70">{product.short_description}</p>
            )}
            {optionalValue(product.tag) && (
              <span className="mt-4 inline-flex rounded-full border border-[#102e22]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#102e22]">
                {product.tag}
              </span>
            )}

            {(Number(product.rating) > 0 || optionalValue(product.reviews)) && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                {Number(product.rating) > 0 && (
                  <span className="rounded-full bg-[#102e22] px-3 py-1 text-xs font-bold text-white">★ {product.rating}</span>
                )}
                {optionalValue(product.reviews) && (
                  <span className="text-black/65">{product.reviews} reviews</span>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-bold text-[#102e22]">₹{product.price}</p>
              {oldPrice > price && (
                <>
                  <p className="text-base text-black/40 line-through">₹{product.oldPrice}</p>
                  {discount > 0 && (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">{discount}% off</span>
                  )}
                </>
              )}
            </div>

            {benefits.length > 0 && (
              <section className="mt-6" aria-labelledby="benefits-title">
                <h2 id="benefits-title" className="text-base font-bold text-[#102e22]">Key benefits</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {benefits.map((benefit, index) => (
                    <li key={`${benefit}-${index}`} className="flex gap-2 rounded-xl border border-black/10 bg-white p-3 text-sm leading-5 text-black/75">
                      <span aria-hidden="true" className="mt-0.5 text-[#0e766e]">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-6 flex gap-3">
              <div className="flex items-center rounded-full border border-black/15 bg-white px-2">
                <button type="button" onClick={() => setControls({ id, activeImg, qty: Math.max(1, qty - 1) })} aria-label="Decrease quantity" className="h-11 w-8 text-lg">−</button>
                <span aria-live="polite" className="w-8 text-center text-sm font-bold">{qty}</span>
                <button type="button" onClick={() => setControls({ id, activeImg, qty: qty + 1 })} aria-label="Increase quantity" className="h-11 w-8 text-lg">+</button>
              </div>
              <button type="button" onClick={addToCart} className="flex-1 rounded-full border border-[#102e22] bg-white px-4 py-3 text-sm font-bold text-[#102e22] transition hover:bg-[#102e22]/5">
                Add to cart
              </button>
              <button type="button" onClick={addToCart} className="flex-1 rounded-full bg-[#102e22] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#174632]">
                Buy now
              </button>
            </div>

            {ingredients.length > 0 && (
              <section className="mt-7 rounded-2xl border border-black/10 bg-white p-4 sm:p-5" aria-labelledby="ingredients-title">
                <h2 id="ingredients-title" className="text-base font-bold text-[#102e22]">Ingredients</h2>
                <ul className="mt-3 divide-y divide-black/5">
                  {ingredients.map((ingredient, index) => {
                    const name = typeof ingredient === "string" ? ingredient : ingredient.ingredient_name;
                    if (!optionalValue(name)) return null;
                    const quantity = ingredient.quantity;
                    const amount = optionalValue(quantity)
                      ? `${Number(quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}${optionalValue(ingredient.unit) ? ` ${ingredient.unit}` : ""}`
                      : "";
                    return (
                      <li key={`${name}-${index}`} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                        <span className="text-black/75">{name}</span>
                        {amount && <span className="shrink-0 font-medium text-black/60">{amount}</span>}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {sections.length > 0 && (
              <section className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white divide-y divide-black/10" aria-label="Product information">
                {sections.map((section) => (
                  <div key={section.key}>
                    <button
                      type="button"
                      onClick={() => setOpenAcc(openAcc === section.key ? "" : section.key)}
                      aria-expanded={openAcc === section.key}
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-bold text-[#102e22] sm:px-5"
                    >
                      {section.title}
                      <span aria-hidden="true" className="text-lg">{openAcc === section.key ? "−" : "+"}</span>
                    </button>
                    {openAcc === section.key && (
                      <p className="whitespace-pre-line px-4 pb-4 text-sm leading-6 text-black/70 sm:px-5">{section.content}</p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {specifications.length > 0 && (
              <section className="mt-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-5" aria-labelledby="specifications-title">
                <h2 id="specifications-title" className="text-base font-bold text-[#102e22]">Product specifications</h2>
                <dl className="mt-3 divide-y divide-black/5">
                  {specifications.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-2.5 text-sm">
                      <dt className="text-black/55">{label}</dt>
                      <dd className="break-words font-medium text-black/80">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
