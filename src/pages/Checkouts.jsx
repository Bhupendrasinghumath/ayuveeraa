import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { notifyCartUpdated } from "../lib/cart";
import { customerApiRequest, hasCustomerSession, saveCustomerToken } from "../lib/customerSession.js";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Could not load the secure payment window. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

function normalizeCart(savedCart) {
  if (!Array.isArray(savedCart)) return [];
  return savedCart.map((item) => ({
    ...item,
    quantity: Math.min(99, Math.max(1, Number(item.quantity ?? item.qty) || 1)),
  }));
}

function getPrice(item) {
  const raw = item.price ?? 0;
  const amount = typeof raw === "number"
    ? raw
    : Number(String(raw).replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function orderReceipt(order, overrides = {}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    subtotal: overrides.subtotal ?? order.subtotal,
    discount: overrides.discount ?? order.discount,
    onlineDiscount: overrides.onlineDiscount ?? order.onlineDiscount,
    couponDiscount: overrides.couponDiscount ?? order.couponDiscount,
    couponCode: overrides.couponCode ?? order.couponCode,
    total: overrides.total ?? order.total,
    paymentAmount: order.paymentAmount,
    paidAmount: overrides.paidAmount ?? order.paidAmount,
    amountDue: overrides.amountDue ?? order.amountDue,
    payment: order.payment,
    paymentStatus: overrides.paymentStatus ?? order.paymentStatus,
    status: overrides.status ?? order.status,
    createdAt: order.createdAt,
    customer: order.customer,
    shippingAddress: order.shippingAddress,
    items: order.items,
  };
}

function activateOrderAccount(customerSession) {
  if (!customerSession?.token) return { activated: false, error: "" };
  try {
    saveCustomerToken(customerSession.token);
    return { activated: true, error: "" };
  } catch (sessionError) {
    console.error("Order succeeded but automatic account sign-in failed.", sessionError);
    return {
      activated: false,
      error: "Your order is confirmed, but automatic sign-in could not be saved in this browser. You can still track the order using its number and checkout phone.",
    };
  }
}

export default function Checkouts() {
  const [initialCart] = useState(() => {
    try {
      return { cart: normalizeCart(JSON.parse(localStorage.getItem("cart") || "[]")), error: "" };
    } catch {
      return {
        cart: [],
        error: "Your saved cart could not be read. Please return to your cart and try again.",
      };
    }
  });
  const [cart] = useState(initialCart.cart);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "COD",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialCart.error);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [accountLoadError, setAccountLoadError] = useState("");
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [promotionOffer, setPromotionOffer] = useState(null);
  const [promotionError, setPromotionError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);
  const onlineDiscountPercent = Number(promotionOffer?.onlineDiscountPercent) || 0;
  const onlineDiscount = Math.min(
    Math.max(0, total - 1),
    Math.round(total * onlineDiscountPercent / 100),
  );
  const onlineCouponBase = Math.max(0, total - onlineDiscount);
  const couponDiscount = form.payment === 'RAZORPAY' && appliedCoupon
    ? Math.min(
      Math.max(0, onlineCouponBase - 1),
      Math.round(onlineCouponBase * appliedCoupon.discountPercent / 100),
    )
    : 0;
  const onlineTotal = total - onlineDiscount - couponDiscount;
  const codAdvance = Math.min(99, total);
  const codBalance = total - codAdvance;

  useEffect(() => {
    const controller = new AbortController();
    apiRequest('promotions.php', { signal: controller.signal })
      .then(setPromotionOffer)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setPromotionError(requestError.message);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!hasCustomerSession()) return undefined;

    const controller = new AbortController();
    customerApiRequest("customer-account.php", { signal: controller.signal })
      .then((account) => {
        const addresses = account.addresses || [];
        const preferredAddress = addresses.find((address) => address.isDefault) || addresses[0];
        setSavedAddresses(addresses);
        setSelectedAddressId(preferredAddress ? String(preferredAddress.id) : "");
        setForm((current) => ({
          ...current,
          name: current.name || `${account.profile.firstName} ${account.profile.lastName}`.trim(),
          phone: current.phone || account.profile.phone,
          address: current.address || preferredAddress?.address || "",
          city: current.city || preferredAddress?.city || "",
          pincode: current.pincode || preferredAddress?.pincode || "",
        }));
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        if (requestError.status === 401) {
          setRequiresSignIn(true);
          setAccountLoadError("Your sign-in expired. Sign in again to link this order to your account.");
        } else {
          setAccountLoadError(`Saved account details could not be loaded. ${requestError.message}`);
        }
      });

    return () => controller.abort();
  }, []);

  const clearCart = () => {
    try {
      localStorage.removeItem("cart");
      notifyCartUpdated();
      return "";
    } catch (storageError) {
      console.error("Order was created but the cart could not be cleared.", storageError);
      return "Your order is confirmed, but the cart could not be cleared on this device. Please check it before placing another order.";
    }
  };

  const verifyPayment = async (paymentResponse, localOrder) => {
    setSubmitting(true);
    setError("");
    try {
      const verified = await apiRequest("verify-payment.php", {
        method: "POST",
        body: JSON.stringify({
          orderId: localOrder.id,
          ...paymentResponse,
        }),
      });
      setPendingVerification(null);
      const cartWarning = clearCart();
      const customerLogin = activateOrderAccount(verified.customerSession);
      const confirmation = orderReceipt(localOrder, {
        subtotal: verified.subtotal,
        discount: verified.discount,
        onlineDiscount: verified.onlineDiscount,
        couponDiscount: verified.couponDiscount,
        couponCode: verified.couponCode,
        total: verified.total,
        paidAmount: verified.paidAmount,
        amountDue: verified.amountDue,
        paymentStatus: verified.paymentStatus || (localOrder.payment === "COD" ? "partially_paid" : "paid"),
        status: verified.status || "placed",
      });
      if (customerLogin.activated) {
        navigate("/account", { state: { createdFromOrder: true } });
        return;
      }
      navigate(`/order-success?order=${encodeURIComponent(confirmation.orderNumber)}`, {
        state: {
          order: { ...confirmation, orderNumber: verified.orderNumber },
          cartWarning,
          accountWarning: customerLogin.error,
          accountAvailable: hasCustomerSession(),
        },
      });
    } catch (requestError) {
      setPendingVerification({ paymentResponse, localOrder });
      setError(`Payment was received but order confirmation is pending. ${requestError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const markPaymentFailed = async (localOrder, message) => {
    try {
      await apiRequest("payment-failed.php", {
        method: "POST",
        body: JSON.stringify({
          orderId: localOrder.id,
          razorpayOrderId: localOrder.razorpayOrderId,
        }),
      });
      setError(message);
    } catch (requestError) {
      setError(`${message} We could not update the order status: ${requestError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const applyCoupon = async (event) => {
    event.preventDefault();
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const coupon = await apiRequest('validate-coupon.php', {
        method: 'POST',
        body: JSON.stringify({ code: couponInput, payment: 'RAZORPAY' }),
      });
      setAppliedCoupon(coupon);
    } catch (requestError) {
      setAppliedCoupon(null);
      setCouponError(requestError.message);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (requiresSignIn) {
      setError("Sign in again before placing this order so it is saved to your account.");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError("");
    setPendingVerification(null);
    let order;
    try {
      await loadRazorpayCheckout();

      const createOrderRequest = hasCustomerSession() ? customerApiRequest : apiRequest;
      order = await createOrderRequest("orders.php", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          couponCode: form.payment === 'RAZORPAY' ? appliedCoupon?.code || '' : '',
          items: cart.map((item) => ({
            id: item.id,
            qty: item.quantity,
          })),
        }),
      });

      if (!order.keyId || !order.razorpayOrderId || !window.Razorpay) {
        await markPaymentFailed(order, "Secure payment could not be initialized. Your cart is unchanged; please try again.");
        return;
      }

      let paymentResultReceived = false;
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: Number(order.paymentAmount) * 100,
        currency: "INR",
        name: "Ayuveera",
        description: form.payment === "COD"
          ? `₹${order.paymentAmount} advance for COD order ${order.orderNumber}`
          : `Order ${order.orderNumber}${appliedCoupon ? ` · ${appliedCoupon.code}` : ''}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        notes: { orderNumber: order.orderNumber, payment: form.payment },
        theme: { color: "#0f3d2e" },
        handler: async (paymentResponse) => {
          paymentResultReceived = true;
          await verifyPayment(paymentResponse, order);
        },
        modal: {
          ondismiss: () => {
            if (!paymentResultReceived) {
              paymentResultReceived = true;
              void markPaymentFailed(order, "Payment was cancelled. Your cart is unchanged; you can try again.");
            }
          },
        },
      });
      checkout.on("payment.failed", (paymentEvent) => {
        paymentResultReceived = true;
        const message = paymentEvent?.error?.description || "Payment could not be completed. Please try again.";
        void markPaymentFailed(order, message);
      });
      checkout.open();
      setSubmitting(false);
    } catch (requestError) {
      if (order) {
        await markPaymentFailed(order, `Secure payment could not be opened. ${requestError.message}`);
        return;
      }
      setError(requestError.message);
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="grid min-h-[65vh] place-items-center bg-[#fffcf0] px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-[#e8e0c8] bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f3f5ed] text-2xl text-[#1e3a2e]" aria-hidden="true">🛍</div>
          <h1 className="mt-5 font-serif text-3xl text-[#1e3a2e]">
            {initialCart.error ? "Cart unavailable" : "Your cart is empty"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#66645b]">
            {initialCart.error ? "We couldn’t load your saved cart. Please return to your cart and try again." : "Add a product to your cart before continuing to checkout."}
          </p>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <Link to="/products" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#1e3a2e] px-6 text-sm font-semibold text-white">
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#fffcf0] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Checkout progress" className="mb-8 flex items-center justify-center gap-2 text-xs font-medium sm:gap-4 sm:text-sm">
          <Link to="/cart" className="text-[#68736a] hover:text-[#1e3a2e]">01 <span className="hidden sm:inline">Cart</span></Link>
          <span aria-hidden="true" className="h-px w-8 bg-[#d8d1bd] sm:w-16" />
          <span aria-current="step" className="text-[#1e3a2e]">02 <span className="hidden sm:inline">Delivery & payment</span></span>
          <span aria-hidden="true" className="h-px w-8 bg-[#d8d1bd] sm:w-16" />
          <span className="text-[#9b9b91]">03 <span className="hidden sm:inline">Confirmation</span></span>
        </nav>

        <header className="mb-6">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#917345]">SECURE CHECKOUT</p>
          <h1 className="mt-2 font-serif text-3xl text-[#1e3a2e] sm:text-4xl">Delivery & payment</h1>
          <p className="mt-2 text-sm text-[#66645b]">Add your delivery details and choose how you’d like to pay.</p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-8">
          <section className="rounded-3xl border border-[#e8e0c8] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="delivery-heading">
            <div className="flex items-start gap-3 border-b border-[#eee9dc] pb-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf2e8] text-sm font-bold text-[#1e3a2e]">1</span>
              <div>
                <h2 id="delivery-heading" className="font-semibold text-[#1e3a2e]">Delivery details</h2>
                <p className="mt-1 text-xs text-[#777a72]">We’ll use these details to deliver your order.</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="mt-5 flex flex-col gap-4">
              {accountLoadError && (
                <p role={requiresSignIn ? "alert" : "status"} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                  {accountLoadError}{" "}
                  {requiresSignIn && <Link to="/login" state={{ from: { pathname: "/checkout" } }} className="font-semibold underline">Sign in</Link>}
                </p>
              )}
              {savedAddresses.length > 0 && (
                <label className="block text-sm font-medium text-[#354b3c]">
                  Choose a saved address
                  <select
                    value={selectedAddressId}
                    onChange={(event) => {
                      const address = savedAddresses.find((savedAddress) => String(savedAddress.id) === event.target.value);
                      setSelectedAddressId(event.target.value);
                      if (address) {
                        setForm((current) => ({
                          ...current,
                          name: address.recipientName,
                          phone: address.phone,
                          address: address.address,
                          city: address.city,
                          pincode: address.pincode,
                        }));
                      }
                    }}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d1bd] bg-white px-3 text-sm outline-none focus:border-[#1e3a2e]"
                  >
                    {savedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.label} · {address.recipientName} · {address.pincode}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#354b3c]">
                  Full name *
                  <input
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Name on the delivery"
                    required
                    maxLength={120}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
                  />
                </label>
                <label className="block text-sm font-medium text-[#354b3c]">
                  Mobile number *
                  <input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="10-digit mobile number"
                    required
                    maxLength={20}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
                  />
                </label>
                <label className="block text-sm font-medium text-[#354b3c] sm:col-span-2">
                  Full address *
                  <textarea
                    name="address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                    placeholder="House/flat, street, area, landmark"
                    required
                    maxLength={500}
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-[#d8d1bd] p-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
                  />
                </label>
                <label className="block text-sm font-medium text-[#354b3c]">
                  City
                  <input
                    name="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    placeholder="City"
                    maxLength={100}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
                  />
                </label>
                <label className="block text-sm font-medium text-[#354b3c]">
                  PIN code *
                  <input
                    name="pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={form.pincode}
                    onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value }))}
                    placeholder="6-digit PIN code"
                    required
                    maxLength={12}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
                  />
                </label>
              </div>

              <fieldset className="mt-2 border-t border-[#eee9dc] pt-5">
                <legend className="font-semibold text-[#1e3a2e]">2. Payment method</legend>
                <p className="mt-1 text-xs text-[#777a72]">Choose the option that works best for you.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: "COD",
                      title: `${formatCurrency(codAdvance)} advance + Cash on Delivery`,
                      description: `Pay ${formatCurrency(codAdvance)} securely now; ${formatCurrency(codBalance)} is due when your order arrives.`,
                    },
                    {
                      value: "RAZORPAY",
                      title: `Pay online · save ${onlineDiscountPercent}%`,
                      description: `Pay the full total of ${formatCurrency(onlineTotal)} now${appliedCoupon ? ` with ${appliedCoupon.code}` : ''}.`,
                    },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${form.payment === method.value ? "border-[#1e3a2e] bg-[#f4f8f2] ring-1 ring-[#1e3a2e]" : "border-[#e8e0c8] hover:border-[#9ca995]"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={form.payment === method.value}
                        onChange={() => setForm((current) => ({ ...current, payment: method.value }))}
                        className="mt-1 accent-[#1e3a2e]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[#354b3c]">{method.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#777a72]">{method.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {form.payment === 'RAZORPAY' && (
                <section className="rounded-2xl border border-[#e8e0c8] bg-[#fffdf8] p-4" aria-label="Coupon code">
                  <label htmlFor="checkout-coupon" className="text-sm font-semibold text-[#354b3c]">Coupon code</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="checkout-coupon"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value.toUpperCase());
                        setAppliedCoupon(null);
                        setCouponError('');
                      }}
                      maxLength={40}
                      placeholder="Enter code"
                      className="min-h-11 min-w-0 flex-1 rounded-xl border border-[#d8d1bd] px-3 text-sm uppercase outline-none focus:border-[#1e3a2e]"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={validatingCoupon || !couponInput.trim()}
                      className="min-h-11 rounded-xl bg-[#1e3a2e] px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {validatingCoupon ? 'Checking…' : appliedCoupon ? 'Apply again' : 'Apply'}
                    </button>
                  </div>
                  {appliedCoupon && <p role="status" className="mt-2 text-xs font-medium text-green-800">{appliedCoupon.code} applied: extra {appliedCoupon.discountPercent}% off after the online discount.</p>}
                  {couponError && <p role="alert" className="mt-2 text-xs text-red-700">{couponError}</p>}
                </section>
              )}
              {form.payment === 'RAZORPAY' && !promotionOffer && (
                <p role={promotionError ? 'alert' : 'status'} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                  {promotionError ? `Online payment offers could not be loaded. ${promotionError}` : 'Loading current online offers…'}
                </p>
              )}

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800">
                  {error}
                </p>
              )}
              {pendingVerification && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-950">Payment received — confirmation is still pending.</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900">Please retry confirmation. Do not make another payment for this order.</p>
                  <button
                    type="button"
                    onClick={() => verifyPayment(pendingVerification.paymentResponse, pendingVerification.localOrder)}
                    disabled={submitting}
                    className="mt-3 min-h-10 rounded-full border border-amber-800 px-4 text-sm font-semibold text-amber-950 disabled:opacity-60"
                  >
                    Retry order confirmation
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || Boolean(pendingVerification) || requiresSignIn || (form.payment === 'RAZORPAY' && !promotionOffer)}
                className="mt-1 min-h-12 w-full rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white transition hover:bg-[#31513e] disabled:cursor-wait disabled:opacity-60"
              >
                {submitting
                  ? "Please wait..."
                  : form.payment === "COD"
                    ? `Pay ${formatCurrency(codAdvance)} now · ${formatCurrency(codBalance)} due on delivery`
                    : `Pay online · ${formatCurrency(onlineTotal)}`}
              </button>
              <p className="text-center text-xs leading-5 text-[#777a72]">
                COD requires an advance of up to ₹99. Full online payment gets {promotionOffer ? `${onlineDiscountPercent}% off` : 'the current online offer'}; coupon discounts stack on online orders only. Final amounts are confirmed by the server.
              </p>
            </form>
          </section>

          <aside className="h-fit rounded-3xl border border-[#e8e0c8] bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-[#eee9dc] pb-4">
              <div>
                <h2 className="font-semibold text-[#1e3a2e]">Your order</h2>
                <p className="mt-1 text-xs text-[#777a72]">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              </div>
              <Link to="/cart" className="text-xs font-semibold text-[#1e3a2e] underline underline-offset-2">Edit cart</Link>
            </div>

            <div className="divide-y divide-[#eee9dc]">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f4eb]">
                    <img src={item.image} alt="" className="h-full w-full object-contain" />
                    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#1e3a2e] px-1 text-[10px] font-semibold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-5 text-[#354b3c]">{item.name}</p>
                    <p className="mt-1 text-xs text-[#777a72]">{formatCurrency(getPrice(item))} each</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[#354b3c]">
                    {formatCurrency(getPrice(item) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-[#eee9dc] pt-4 text-sm">
              <div className="flex justify-between text-[#66645b]">
                <span>Items subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {form.payment === "RAZORPAY" ? (
                <>
                  <div className="flex justify-between text-[#1e3a2e]">
                    <span>Online discount ({onlineDiscountPercent}%)</span>
                    <span>−{formatCurrency(onlineDiscount)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-[#1e3a2e]">
                      <span>Coupon {appliedCoupon.code} ({appliedCoupon.discountPercent}%)</span>
                      <span>−{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between text-[#66645b]">
                    <span>Pay now (advance)</span>
                    <span>{formatCurrency(codAdvance)}</span>
                  </div>
                  <div className="flex justify-between text-[#66645b]">
                    <span>Due on delivery</span>
                    <span>{formatCurrency(codBalance)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-[#eee9dc] pt-3 text-base font-bold text-[#1e3a2e]">
                <span>Order total</span>
                <span>{formatCurrency(form.payment === "RAZORPAY" ? onlineTotal : total)}</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[#777a72]">
              Final amount is calculated using current product prices before your order is confirmed.
            </p>
            <Link to="/products" className="mt-4 inline-flex text-xs font-semibold text-[#1e3a2e] underline underline-offset-2">
              Continue shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
