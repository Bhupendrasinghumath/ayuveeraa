import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../../lib/api.js";
import { customerApiRequest, hasCustomerSession } from "../../lib/customerSession.js";

const ORDER_STAGES = [
  { key: "placed", label: "Order placed" },
  { key: "processing", label: "Being prepared" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function formatCurrency(value) {
  const amount = Number(value);
  return `₹${(Number.isFinite(amount) ? amount : 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (typeof value !== "string" || !value) return "Date unavailable";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function CustomerOrderCard({ order }) {
  const currentStage = ORDER_STAGES.findIndex((stage) => stage.key === order.status);
  const isCancelled = order.status === "cancelled";
  const isPaymentPending = order.status === "pending_payment";

  return (
    <article className="rounded-2xl border border-[#e8e0c8] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee9dc] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777a72]">Order number</p>
          <h3 className="mt-1 text-lg font-bold text-[#1e3a2e]">{order.orderNumber}</h3>
          <p className="mt-1 text-xs text-[#777a72]">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="rounded-full bg-[#edf2e8] px-4 py-2 text-sm font-semibold text-[#1e3a2e]">
          {isPaymentPending ? "Payment pending" : isCancelled ? "Cancelled" : ORDER_STAGES[currentStage]?.label || "Status unavailable"}
        </div>
      </div>

      {isCancelled ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          This order has been cancelled. Contact support if you need help.
        </p>
      ) : (
        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ORDER_STAGES.map((stage, index) => {
            const complete = currentStage >= index && currentStage >= 0;
            return (
              <li key={stage.key} className="flex items-start gap-2">
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${complete ? "bg-[#1e3a2e] text-white" : "border border-[#d8d1bd] text-[#8b8b81]"}`}>
                  {complete ? "✓" : index + 1}
                </span>
                <span className={`text-xs leading-5 ${complete ? "font-semibold text-[#1e3a2e]" : "text-[#777a72]"}`}>{stage.label}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-5 grid gap-4 border-t border-[#eee9dc] pt-4 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-[#1e3a2e]">Items</h4>
          <ul className="mt-2 space-y-2">
            {order.items.map((item, index) => (
              <li key={`${order.id}-${item.productId || index}`} className="flex justify-between gap-3 text-sm">
                <span className="text-[#66645b]">{item.name} × {item.quantity}</span>
                <span className="shrink-0 font-medium text-[#354b3c]">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
            {order.items.length === 0 && <li className="text-sm text-[#777a72]">Item details are unavailable.</li>}
          </ul>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-[#66645b]">Payment</span>
            <span className="text-right font-medium text-[#354b3c]">{order.payment === "COD" ? "Cash on Delivery" : "Online payment"} · {order.paymentStatus}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-[#eee9dc] pt-2 font-bold text-[#1e3a2e]">
            <span>Order total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          {Number(order.paidAmount) > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-[#66645b]">{order.payment === "COD" ? "Paid so far" : "Paid online"}</span>
              <span className="font-medium text-[#354b3c]">{formatCurrency(order.paidAmount)}</span>
            </div>
          )}
          {order.payment === "COD" && !isPaymentPending && Number(order.amountDue) > 0 && (
            <div className="flex justify-between gap-3 font-semibold text-[#354b3c]">
              <span>Due on delivery</span>
              <span>{formatCurrency(order.amountDue)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function TrackOrderLookup({ embedded = false, customerOrders }) {
  const [searchParams] = useSearchParams();
  const [accountOrders, setAccountOrders] = useState(() => (
    Array.isArray(customerOrders) ? customerOrders : null
  ));
  const [accountLoading, setAccountLoading] = useState(() => (
    !Array.isArray(customerOrders) && hasCustomerSession()
  ));
  const [accountError, setAccountError] = useState("");
  const [showGuestLookup, setShowGuestLookup] = useState(() => searchParams.get("guest") === "1");
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Array.isArray(customerOrders)) {
      setAccountOrders(customerOrders);
      setAccountLoading(false);
      return undefined;
    }
    if (!hasCustomerSession()) {
      setAccountOrders(null);
      setAccountLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setAccountLoading(true);
    customerApiRequest("customer-account.php", { signal: controller.signal })
      .then((result) => {
        if (active) setAccountOrders(Array.isArray(result.orders) ? result.orders : []);
      })
      .catch((requestError) => {
        if (active && requestError.name !== "AbortError") {
          setAccountOrders([]);
          setAccountError(requestError.message || "Your order history could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setAccountLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [customerOrders]);

  const lookupOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const result = await apiRequest("track-order.php", {
        method: "POST",
        body: JSON.stringify({
          orderNumber: orderNumber.trim().toUpperCase(),
          phone: phone.trim(),
        }),
      });
      setOrder(result);
    } catch (requestError) {
      setError(requestError.message || "We could not look up your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const orderStatus = order?.status;
  const items = Array.isArray(order?.items) ? order.items : [];
  const currentStage = ORDER_STAGES.findIndex((stage) => stage.key === orderStatus);
  const isCancelled = orderStatus === "cancelled";
  const isPaymentPending = orderStatus === "pending_payment";
  const isPaymentFailed = isPaymentPending && order?.paymentStatus === "failed";
  const advanceAmount = Math.min(99, Number(order?.total) || 0);
  const hasCODAdvance = order?.payment === "COD"
    && (order?.paymentStatus === "partially_paid" || isPaymentPending);
  const paymentLabel = order?.payment === "COD"
    ? order?.paymentStatus === "partially_paid"
      ? `${formatCurrency(order.paidAmount)} advance paid · ${formatCurrency(order.amountDue)} due on delivery`
      : isPaymentPending
        ? isPaymentFailed ? `${formatCurrency(advanceAmount)} advance payment failed` : `${formatCurrency(advanceAmount)} advance payment pending`
        : Number(order?.amountDue) > 0
          ? `${formatCurrency(order.amountDue)} due on delivery`
          : "Paid"
    : order?.paymentStatus === "paid"
      ? "Paid"
      : order?.paymentStatus === "failed"
        ? "Failed"
        : "Pending";
  const Heading = embedded ? "h2" : "h1";

  if (accountLoading) {
    return (
      <div role="status" className="py-10 text-center text-sm text-[#536254]">
        Loading your orders...
      </div>
    );
  }

  if (accountOrders !== null && !showGuestLookup) {
    return (
      <div className="mx-auto max-w-3xl">
        <header className="mb-7 text-center">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#917345]">AYUVEERA CUSTOMER CARE</p>
          <Heading className="mt-2 font-serif text-3xl text-[#1e3a2e] sm:text-4xl">Track your orders</Heading>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#66645b]">
            Order updates for your signed-in account are shown below.
          </p>
        </header>

        {accountError && (
          <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {accountError}
          </p>
        )}

        {accountOrders.length > 0 ? (
          <div className="space-y-4">
            {accountOrders.map((accountOrder) => (
              <CustomerOrderCard key={accountOrder.id} order={accountOrder} />
            ))}
          </div>
        ) : (
          <section className="rounded-3xl border border-[#e8e0c8] bg-white p-6 text-center shadow-sm">
            <p className="text-sm leading-6 text-[#66645b]">No orders are linked to your account yet.</p>
            <Link to="/products" className="mt-4 inline-flex min-h-10 items-center rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white">
              Explore products
            </Link>
          </section>
        )}

        <div className="mt-5 text-center">
          <button type="button" onClick={() => setShowGuestLookup(true)} className="text-sm font-semibold text-[#1e3a2e] underline underline-offset-2">
            Track a guest order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
        <header className="mb-7 text-center">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#917345]">AYUVEERA CUSTOMER CARE</p>
          <Heading className="mt-2 font-serif text-3xl text-[#1e3a2e] sm:text-4xl">Track your order</Heading>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#66645b]">
            Enter your order number and the mobile number used at checkout to view the latest status.
          </p>
        </header>

        <section className="rounded-3xl border border-[#e8e0c8] bg-white p-5 shadow-sm sm:p-7" aria-labelledby="lookup-heading">
          <h2 id="lookup-heading" className="font-semibold text-[#1e3a2e]">Find an order</h2>
          {accountOrders !== null && (
            <button type="button" onClick={() => setShowGuestLookup(false)} className="mt-2 text-sm font-semibold text-[#1e3a2e] underline underline-offset-2">
              Back to my orders
            </button>
          )}
          <form onSubmit={lookupOrder} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#354b3c]">
              Order number
              <input
                value={orderNumber}
                onChange={(event) => {
                  setOrderNumber(event.target.value.toUpperCase());
                  setOrder(null);
                }}
                placeholder="AYU-000123"
                required
                maxLength={24}
                autoComplete="off"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
              />
            </label>
            <label className="block text-sm font-medium text-[#354b3c]">
              Checkout mobile number
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setOrder(null);
                }}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                required
                maxLength={24}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
              />
            </label>
            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-800 sm:col-span-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 rounded-full bg-[#1e3a2e] px-6 text-sm font-semibold text-white transition hover:bg-[#31513e] disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
            >
              {loading ? "Checking order..." : "Track order"}
            </button>
          </form>
          <p className="mt-3 text-xs leading-5 text-[#777a72]">
            For your privacy, the order number and phone number must match. Your delivery address is not shown on this page.
          </p>
        </section>

        {order && (
          <section aria-live="polite" className="mt-6 rounded-3xl border border-[#e8e0c8] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee9dc] pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777a72]">Order number</p>
                <h2 className="mt-1 text-lg font-bold text-[#1e3a2e]">{order.orderNumber}</h2>
                <p className="mt-1 text-xs text-[#777a72]">Placed {formatDate(order.createdAt)}</p>
              </div>
              <div className="rounded-full bg-[#edf2e8] px-4 py-2 text-sm font-semibold text-[#1e3a2e]">
                {isPaymentPending ? "Payment pending" : isCancelled ? "Cancelled" : ORDER_STAGES[currentStage]?.label || "Status unavailable"}
              </div>
            </div>

            {isPaymentPending ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-950">
                  {order.payment === "COD"
                    ? isPaymentFailed ? "COD advance payment failed or was cancelled" : `Pay the ${formatCurrency(advanceAmount)} advance to confirm this COD order`
                    : isPaymentFailed ? "Payment failed or was cancelled" : "Payment not confirmed"}
                </p>
                <p className="mt-1 text-sm leading-5 text-amber-900">
                  {order.payment === "COD"
                    ? isPaymentFailed
                      ? "The order is not confirmed until the advance is paid. Contact support if your payment was charged."
                      : "The order will be confirmed after the advance payment is verified."
                    : isPaymentFailed
                      ? "This online payment was not completed. Contact support with your order number if your payment was charged."
                      : "This online order is waiting for payment confirmation. Contact support with your order number if you have already paid."}
                </p>
              </div>
            ) : isCancelled ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-900">
                This order has been cancelled. Contact support if you need help.
              </div>
            ) : (
              <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {ORDER_STAGES.map((stage, index) => {
                  const complete = currentStage >= index && currentStage >= 0;
                  return (
                    <li key={stage.key} className="flex items-start gap-2">
                      <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${complete ? "bg-[#1e3a2e] text-white" : "border border-[#d8d1bd] text-[#8b8b81]"}`}>
                        {complete ? "✓" : index + 1}
                      </span>
                      <span className={`text-xs leading-5 ${complete ? "font-semibold text-[#1e3a2e]" : "text-[#777a72]"}`}>{stage.label}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="mt-6 grid gap-5 border-t border-[#eee9dc] pt-5 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-[#1e3a2e]">Items</h3>
                <div className="mt-2 space-y-2">
                  {items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex justify-between gap-3 text-sm">
                      <span className="text-[#66645b]">{item.name} × {item.quantity}</span>
                      <span className="shrink-0 font-medium text-[#354b3c]">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-sm text-[#777a72]">Item details are unavailable.</p>}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#66645b]">Payment</span>
                  <span className="text-right font-medium text-[#354b3c]">
                    {order.payment === "COD"
                      ? `${hasCODAdvance ? `${formatCurrency(advanceAmount)} advance + ` : ""}Cash on Delivery`
                      : "Online payment"} · {paymentLabel}
                  </span>
                </div>
                {Number(order.onlineDiscount) > 0 && (
                  <div className="flex justify-between gap-3 text-[#1e3a2e]">
                    <span>Online discount</span>
                    <span>−{formatCurrency(order.onlineDiscount)}</span>
                  </div>
                )}
                {Number(order.couponDiscount) > 0 && (
                  <div className="flex justify-between gap-3 text-[#1e3a2e]">
                    <span>Coupon {order.couponCode ? `(${order.couponCode})` : ""}</span>
                    <span>−{formatCurrency(order.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#eee9dc] pt-3 font-bold text-[#1e3a2e]">
                  <span>Order total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
                {Number(order.paidAmount) > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[#66645b]">{order.payment === "COD" ? "Paid so far" : "Paid online"}</span>
                    <span className="font-medium text-[#354b3c]">{formatCurrency(order.paidAmount)}</span>
                  </div>
                )}
                {order.payment === "COD" && !isPaymentPending && Number(order.amountDue) > 0 && (
                  <div className="flex justify-between gap-3 font-semibold text-[#354b3c]">
                    <span>Due on delivery</span>
                    <span>{formatCurrency(order.amountDue)}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/account" className="font-semibold text-[#1e3a2e] underline underline-offset-2">View account</Link>
          <Link to="/contact" className="font-semibold text-[#1e3a2e] underline underline-offset-2">Contact support</Link>
          <Link to="/products" className="font-semibold text-[#1e3a2e] underline underline-offset-2">Continue shopping</Link>
        </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-[70vh] bg-[#fffcf0] px-4 py-8 sm:py-12">
      <TrackOrderLookup />
    </main>
  );
}
