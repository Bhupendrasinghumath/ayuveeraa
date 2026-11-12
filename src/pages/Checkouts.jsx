import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { notifyCartUpdated } from "../lib/cart";

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
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);

  const clearCart = () => {
    localStorage.removeItem("cart");
    notifyCartUpdated();
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
      clearCart();
      navigate("/order-success", {
        state: {
          orderNumber: verified.orderNumber,
          total: verified.total,
          payment: "RAZORPAY",
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

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError("");
    setPendingVerification(null);
    try {
      if (form.payment === "RAZORPAY") await loadRazorpayCheckout();

      const order = await apiRequest("orders.php", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          items: cart.map((item) => ({
            id: item.id,
            qty: item.quantity,
          })),
        }),
      });

      if (form.payment === "COD") {
        clearCart();
        navigate("/order-success", {
          state: {
            orderNumber: order.orderNumber,
            total: order.total,
            payment: "COD",
          },
        });
        return;
      }

      if (!order.keyId || !order.razorpayOrderId || !window.Razorpay) {
        throw new Error("Online payment could not be initialized. Please choose Cash on Delivery or try again.");
      }

      let paymentResultReceived = false;
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: Number(order.total) * 100,
        currency: "INR",
        name: "Ayuveera",
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        notes: { orderNumber: order.orderNumber },
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
      setError(requestError.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-8 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-black">Delivery Address</h2>
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">
          <input name="name" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full Name *" required maxLength={120} className="rounded-xl border p-3 text-sm" />
          <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone *" required maxLength={20} className="rounded-xl border p-3 text-sm" />
          <textarea name="address" autoComplete="street-address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Full Address *" required maxLength={500} rows="3" className="rounded-xl border p-3 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" autoComplete="address-level2" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="City" maxLength={100} className="rounded-xl border p-3 text-sm" />
            <input name="pincode" autoComplete="postal-code" value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} placeholder="Pincode *" required maxLength={12} className="rounded-xl border p-3 text-sm" />
          </div>
          <fieldset className="mt-2">
            <legend className="mb-2 text-sm font-bold">Payment method</legend>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className={`flex-1 cursor-pointer rounded-xl border p-3 text-sm ${form.payment === "COD" ? "border-[#0f3d2e] bg-[#f4f8f2]" : ""}`}>
                <input type="radio" name="payment" value="COD" checked={form.payment === "COD"} onChange={() => setForm({ ...form, payment: "COD" })} className="mr-2 accent-[#0f3d2e]" />
                Cash on Delivery
              </label>
              <label className={`flex-1 cursor-pointer rounded-xl border p-3 text-sm ${form.payment === "RAZORPAY" ? "border-[#0f3d2e] bg-[#f4f8f2]" : ""}`}>
                <input type="radio" name="payment" value="RAZORPAY" checked={form.payment === "RAZORPAY"} onChange={() => setForm({ ...form, payment: "RAZORPAY" })} className="mr-2 accent-[#0f3d2e]" />
                Pay Online · Razorpay
              </label>
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {pendingVerification && (
            <button type="button" onClick={() => verifyPayment(pendingVerification.paymentResponse, pendingVerification.localOrder)} disabled={submitting} className="rounded-xl border border-[#0f3d2e] py-3 font-bold text-[#0f3d2e] disabled:opacity-60">
              Retry order confirmation
            </button>
          )}
          <button type="submit" disabled={submitting || cart.length === 0 || Boolean(pendingVerification)} className="mt-3 rounded-full bg-[#0f3d2e] py-3 font-bold text-white disabled:opacity-60">
            {submitting ? "Please wait..." : form.payment === "COD" ? `Place Order · ₹${total.toLocaleString("en-IN")}` : `Pay Securely · ₹${total.toLocaleString("en-IN")}`}
          </button>
          {form.payment === "RAZORPAY" && <p className="text-center text-xs text-gray-500">Secure checkout powered by Razorpay. Your cart clears after payment is confirmed.</p>}
        </form>
      </div>

      <div className="h-fit rounded-2xl border bg-[#f9faf6] p-6">
        <h3 className="mb-3 font-black">Order Summary ({cart.length})</h3>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 border-b py-2 text-sm">
            <span>{item.name} × {item.quantity}</span>
            <b>₹{(getPrice(item) * item.quantity).toLocaleString("en-IN")}</b>
          </div>
        ))}
        <div className="mt-4 flex justify-between text-lg font-black">
          <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Final payable amount is calculated by the server using current product prices.</p>
        <Link to="/cart" className="mt-4 block text-center text-sm underline">Back to Cart</Link>
      </div>
    </div>
  );
}
