import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { ensureCartItem, isProductInCart, toggleCartItem } from "../lib/cart.js";

const optionalValue = (value) => (
  value !== null && value !== undefined && String(value).trim() !== ""
);

function ProductState({ children, title, action }) {
  return (
    <main className="flex min-h-[55vh] items-center justify-center bg-[#fdf9ed] px-4 py-16">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-[#d8d1bd] bg-[#fffefa] p-8 text-center shadow-[0_18px_50px_-36px_rgba(16,46,34,0.42)] sm:p-10">
        <span aria-hidden="true" className="mx-auto mb-5 block h-1 w-12 rounded-full bg-[#b79558]" />
        <h1 className="text-2xl font-semibold tracking-tight text-[#102e22]">{title}</h1>
        <div className="mt-3 text-sm leading-6 text-[#4c5a50]">{children}</div>
        {action && <div className="mt-7">{action}</div>}
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
  const [inCart, setInCart] = useState(() => isProductInCart(id));
  const [infoTab, setInfoTab] = useState({ id: null, key: "description" });
  const infoTabRefs = useRef({});

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

  useEffect(() => {
    const syncCartState = () => setInCart(isProductInCart(id));
    syncCartState();
    window.addEventListener("cart:updated", syncCartState);
    window.addEventListener("storage", syncCartState);
    return () => {
      window.removeEventListener("cart:updated", syncCartState);
      window.removeEventListener("storage", syncCartState);
    };
  }, [id]);

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
            className="rounded-full bg-[#102e22] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#174632] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b79558]"
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
  const populatedIngredients = ingredients.filter((ingredient) => (
    optionalValue(typeof ingredient === "string" ? ingredient : ingredient?.ingredient_name)
  ));
  const descriptionSections = [
    { key: "how-to-use", title: "How to use", content: product.how_to_use },
    { key: "safety", title: "Safety information", content: product.safety_information },
    { key: "storage", title: "Storage instructions", content: product.storage_instructions },
  ].filter((section) => optionalValue(section.content));
  const hasDescription = optionalValue(product.description) || descriptionSections.length > 0;
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
  const infoTabs = [
    ...(populatedIngredients.length ? [{ key: "ingredients", title: "Ingredients" }] : []),
    ...(hasDescription ? [{ key: "description", title: "Description" }] : []),
    ...(specifications.length ? [{ key: "specifications", title: "Specification" }] : []),
  ];
  const selectedTabKey = infoTab.id === id ? infoTab.key : "description";
  const activeInfoTab = infoTabs.some((tab) => tab.key === selectedTabKey)
    ? selectedTabKey
    : infoTabs.some((tab) => tab.key === "description")
      ? "description"
      : infoTabs[0]?.key;
  const price = Number(product.price);
  const oldPrice = Number(product.oldPrice);
  const discount = oldPrice > price && oldPrice > 0
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  const addToCart = () => {
    toggleCartItem({ ...product, mainImg: images[0] || product.image }, qty);
    navigate("/cart");
  };

  const buyNow = () => {
    ensureCartItem({ ...product, mainImg: images[0] || product.image }, qty);
    navigate("/checkout");
  };

  return (
    <main className="min-h-screen w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pb-20 md:pt-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-y-1 text-xs tracking-wide text-[#68736a]">
          <Link to="/" className="transition-colors hover:text-[#102e22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b79558]">Home</Link>
          <span aria-hidden="true" className="px-2 text-[#b79558]">/</span>
          <Link to="/products" className="transition-colors hover:text-[#102e22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b79558]">All products</Link>
          <span aria-hidden="true" className="px-2 text-[#b79558]">/</span>
          <span className="max-w-full break-words font-medium text-[#23372b]">{product.name}</span>
        </nav>

        <div className="mt-6 grid min-w-0 grid-cols-1 items-start gap-8 md:mt-8 md:grid-cols-2 md:gap-10">
          <section aria-label="Product images" className="min-w-0">
            <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden bg-[#f9f3e8] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px]">
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-black/45">
                  No product image available
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mx-auto mt-4 flex w-full max-w-[320px] flex-wrap gap-3 sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px]">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setControls({ id, activeImg: index, qty })}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImg === index}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded border-2 bg-white sm:h-16 sm:w-16 md:h-[72px] md:w-[72px] lg:h-20 lg:w-20 ${activeImg === index ? "border-[#102e22]" : "border-gray-200"}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="block h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="min-w-0">
            {optionalValue(product.brand) && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7049]">{product.brand}</p>
            )}
            <h1 className="mt-3 break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{product.name}</h1>
            {optionalValue(product.category) && (
              <p className="mt-3 text-sm text-gray-600">{product.category}</p>
            )}
            {optionalValue(product.short_description) && (
              <p className="mt-3 text-sm leading-6 text-gray-700">{product.short_description}</p>
            )}
            {optionalValue(product.tag) && (
              <span className="mt-3 inline-block max-w-full rounded bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {product.tag}
              </span>
            )}

            {(Number(product.rating) > 0 || optionalValue(product.reviews)) && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                {Number(product.rating) > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-800"><span aria-hidden="true" className="text-yellow-500">★</span>{product.rating}</span>
                )}
                {optionalValue(product.reviews) && (
                  <span className="text-xs text-gray-600">{product.reviews} reviews</span>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="inline-flex items-baseline gap-1.5">
                <span className="text-sm font-medium text-gray-600">MRP</span>
                <span className="text-sm text-[#7b8179] line-through">₹{product.oldPrice}</span>
              </p>
              <p className="inline-flex items-baseline gap-1.5">
                <span className="text-sm font-medium text-gray-600">Price</span>
                <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
              </p>
              {discount > 0 && (
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{discount}% off</span>
              )}
            </div>

            {benefits.length > 0 && (
              <section className="mt-6" aria-label="Key benefits">
                <ul className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                  {benefits.map((benefit, index) => (
                    <li key={`${benefit}-${index}`} className="flex min-w-0 items-center gap-2 rounded-full border border-[#c8d8ca] bg-[#f2f7f1] px-3 py-2 text-[13px] leading-5 text-[#173b2b]">
                      <span aria-hidden="true" className="shrink-0 text-[12px] leading-none text-[#3f7451]">✦</span>
                      <span className="min-w-0 break-words font-semibold">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex h-11 shrink-0 items-center rounded border border-gray-300 px-1">
                <button type="button" onClick={() => setControls({ id, activeImg, qty: Math.max(1, qty - 1) })} aria-label="Decrease quantity" className="h-9 w-9 text-lg text-gray-700 hover:bg-gray-100">−</button>
                <span aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums text-gray-900">{qty}</span>
                <button type="button" onClick={() => setControls({ id, activeImg, qty: qty + 1 })} aria-label="Increase quantity" className="h-9 w-9 text-lg text-gray-700 hover:bg-gray-100">+</button>
              </div>
              <button type="button" onClick={addToCart} aria-pressed={inCart} className="min-w-[7.5rem] flex-1 rounded border border-gray-800 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100">
                {inCart ? "Remove from cart" : "Add to cart"}
              </button>
              <button type="button" onClick={buyNow} className="min-w-[7.5rem] flex-1 rounded bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800">
                Buy now
              </button>
            </div>
          </section>
        </div>

        {infoTabs.length > 0 && (
          <section className="mt-10 min-w-0 w-full border-t border-[#e8e3d6] pt-6" aria-label="Product information">
                <div className="-mx-1 max-w-full overflow-x-auto overscroll-x-contain px-1">
                  <div role="tablist" aria-label="Product information" className="flex w-max min-w-full border-b border-[#e8e3d6]">
                    {infoTabs.map((tab, index) => {
                      const selected = activeInfoTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          ref={(element) => {
                            infoTabRefs.current[tab.key] = element;
                          }}
                          id={`product-info-tab-${tab.key}`}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          aria-controls={`product-info-panel-${tab.key}`}
                          tabIndex={selected ? 0 : -1}
                          onClick={() => setInfoTab({ id, key: tab.key })}
                          onKeyDown={(event) => {
                            let nextIndex;
                            if (event.key === "ArrowRight") nextIndex = (index + 1) % infoTabs.length;
                            if (event.key === "ArrowLeft") nextIndex = (index - 1 + infoTabs.length) % infoTabs.length;
                            if (event.key === "Home") nextIndex = 0;
                            if (event.key === "End") nextIndex = infoTabs.length - 1;
                            if (nextIndex !== undefined) {
                              event.preventDefault();
                              const nextTab = infoTabs[nextIndex];
                              setInfoTab({ id, key: nextTab.key });
                              infoTabRefs.current[nextTab.key]?.focus();
                            }
                          }}
                          className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#b79558] sm:px-4 ${selected ? "border-[#0e766e] text-[#0e766e]" : "border-transparent text-[#68736a] hover:text-[#23372b]"}`}
                        >
                          {tab.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {infoTabs.map((tab) => (
                  <div
                    key={tab.key}
                    id={`product-info-panel-${tab.key}`}
                    role="tabpanel"
                    aria-labelledby={`product-info-tab-${tab.key}`}
                    tabIndex={0}
                    hidden={activeInfoTab !== tab.key}
                    className="min-w-0 pt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b79558]"
                  >
                    {tab.key === "ingredients" && (
                      <ul className="divide-y divide-[#ece8dd]">
                        {populatedIngredients.map((ingredient, index) => {
                          const name = typeof ingredient === "string" ? ingredient : ingredient.ingredient_name;
                          const quantity = ingredient.quantity;
                          const amount = optionalValue(quantity)
                            ? `${Number(quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}${optionalValue(ingredient.unit) ? ` ${ingredient.unit}` : ""}`
                            : "";
                          return (
                            <li key={`${name}-${index}`} className="flex min-w-0 items-start justify-between gap-4 py-3 text-sm">
                              <span className="min-w-0 break-words text-[#4c5a50]">{name}</span>
                              {amount && <span className="shrink-0 font-medium tabular-nums text-[#68736a]">{amount}</span>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {tab.key === "description" && (
                      <div>
                        {optionalValue(product.description) && (
                          <p className="whitespace-pre-line text-sm leading-6 text-[#4c5a50]">
                            {product.description}
                          </p>
                        )}
                        {descriptionSections.map((section) => (
                          <section
                            key={section.key}
                            className="mt-6 border-t border-[#ece8dd] pt-5"
                            aria-labelledby={`product-description-${section.key}-title`}
                          >
                            <h3
                              id={`product-description-${section.key}-title`}
                              className="text-sm font-semibold text-[#23372b]"
                            >
                              {section.title}
                            </h3>
                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4c5a50]">
                              {section.content}
                            </p>
                          </section>
                        ))}
                      </div>
                    )}
                    {tab.key === "specifications" && (
                      <dl className="divide-y divide-[#ece8dd]">
                        {specifications.map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 py-3 text-sm">
                            <dt className="text-[#68736a]">{label}</dt>
                            <dd className="min-w-0 break-words font-medium text-[#354b3c]">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                ))}
          </section>
        )}
      </div>
    </main>
  );
}
