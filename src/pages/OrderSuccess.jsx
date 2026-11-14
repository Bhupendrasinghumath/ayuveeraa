import { Link, useLocation } from "react-router-dom";

const ORDER_STATUS_LABELS = {
  pending_payment: "Payment pending",
  placed: "Order placed",
  processing: "Being prepared",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatCurrency(value) {
  const amount = Number(value);
  return `₹${(Number.isFinite(amount) ? amount : 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function OrderSuccess() {
  const { state, search } = useLocation();
  const order = state?.order;
  const orderFromUrl = new URLSearchParams(search).get("order");
  const trackingLink = order?.orderNumber
    ? `/track-order?order=${encodeURIComponent(order.orderNumber)}`
    : orderFromUrl
      ? `/track-order?order=${encodeURIComponent(orderFromUrl)}`
      : "/track-order";

  if (!order?.orderNumber) {
    return (
      <main className="grid min-h-[65vh] place-items-center bg-[#fffcf0] px-4 py-12">
        <section className="w-full max-w-xl rounded-3xl border border-[#e8e0c8] bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f3f5ed] text-2xl text-[#1e3a2e]" aria-hidden="true">i</div>
          <h1 className="mt-5 font-serif text-3xl text-[#1e3a2e]">Order details unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-[#66645b]">
            This page was opened without the order confirmation details. No new order is being confirmed here. Enter your order number and checkout phone to view its latest status.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={trackingLink} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1e3a2e] px-6 text-sm font-semibold text-white">
              Track an order
            </Link>
            <Link to="/products" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8d1bd] px-6 text-sm font-semibold text-[#1e3a2e]">
              Continue shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const orderStatus = ORDER_STATUS_LABELS[order.status] || "Status unavailable";
  const paymentStatus = order.payment === "COD"
    ? order.paymentStatus === "paid"
      ? "Paid in full"
      : order.paymentStatus === "partially_paid"
        ? `${formatCurrency(order.paidAmount)} advance paid · ${formatCurrency(order.amountDue)} due on delivery`
        : order.paymentStatus === "failed"
          ? "Advance payment failed"
          : "Advance payment pending"
    : order.paymentStatus === "paid"
      ? "Paid"
      : order.paymentStatus === "failed"
        ? "Payment failed"
        : "Awaiting confirmation";
  const createdAt = formatDate(order.createdAt);
  const address = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal ?? order.total);
  const discount = Number(order.discount ?? 0);
  const onlineDiscount = Number(order.onlineDiscount ?? (order.payment === "RAZORPAY" ? discount : 0));
  const couponDiscount = Number(order.couponDiscount ?? 0);
  const paidAmount = Number(order.paidAmount ?? 0);
  const amountDue = Number(order.amountDue ?? (order.payment === "COD" ? Number(order.total) - paidAmount : 0));

  return (
    <main className="min-h-[70vh] bg-[#fffcf0] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-3xl border border-[#e8e0c8] bg-white shadow-sm">
          <div className="bg-[#1e3a2e] px-6 py-8 text-center text-white sm:px-10 sm:py-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-white/10 text-2xl" aria-hidden="true">
              ✓
            </div>
            <p className="mt-4 text-[10px] font-semibold tracking-[0.2em] text-[#d9c99f]">AYUVEERA ORDER CONFIRMATION</p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
              {order.status === "pending_payment" ? "Payment needs attention" : "Thank you for your order"}
            </h1>
            <p className="mt-2 text-sm text-white/75">
              {order.status === "pending_payment"
                ? "Your online payment is not confirmed yet. Check the latest status before trying again."
                : "Your order has been received. Here are the details for your records."}
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {state?.cartWarning && (
              <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">
                {state.cartWarning}
              </p>
            )}
            {state?.accountWarning && (
              <p role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">
                {state.accountWarning}
              </p>
            )}

            <div className="grid gap-4 rounded-2xl bg-[#f7f6ef] p-4 sm:grid-cols-3 sm:p-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777a72]">Order number</p>
                <p className="mt-1 font-semibold text-[#1e3a2e]">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777a72]">Order status</p>
                <p className="mt-1 font-semibold text-[#1e3a2e]">{orderStatus}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#777a72]">Placed on</p>
                <p className="mt-1 font-semibold text-[#1e3a2e]">{createdAt || "Date unavailable"}</p>
              </div>
            </div>

            <div className="mt-7 grid gap-7 md:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
              <section aria-labelledby="receipt-items-heading">
                <h2 id="receipt-items-heading" className="font-semibold text-[#1e3a2e]">Items in your order</h2>
                {items.length > 0 ? (
                  <div className="mt-3 divide-y divide-[#eee9dc]">
                    {items.map((item, index) => {
                      const quantity = Number(item.quantity) || 0;
                      const price = Number(item.price) || 0;
                      return (
                        <div key={`${item.productId || item.name}-${index}`} className="flex items-center gap-3 py-3">
                          {item.image && (
                            <img src={item.image} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-[#f7f4eb] object-contain" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-5 text-[#354b3c]">{item.name}</p>
                            <p className="mt-1 text-xs text-[#777a72]">{formatCurrency(price)} × {quantity}</p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-[#354b3c]">{formatCurrency(price * quantity)}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#777a72]">Item details are unavailable. Use the order number to check the latest status.</p>
                )}
              </section>

              <section className="rounded-2xl border border-[#eee9dc] p-4 sm:p-5" aria-labelledby="delivery-summary-heading">
                <h2 id="delivery-summary-heading" className="font-semibold text-[#1e3a2e]">Delivery & payment</h2>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-[#777a72]">Delivering to</p>
                    <p className="mt-1 font-medium text-[#354b3c]">{order.customer?.name || "Customer"}</p>
                    {order.customer?.phone && <p className="mt-0.5 text-[#66645b]">{order.customer.phone}</p>}
                    <p className="mt-1 leading-5 text-[#66645b]">
                      {[address.address, address.city, address.pincode].filter(Boolean).join(", ") || "Address unavailable"}
                    </p>
                  </div>
                  <div className="border-t border-[#eee9dc] pt-3">
                    <p className="text-xs text-[#777a72]">Payment</p>
                    <p className="mt-1 font-medium text-[#354b3c]">
                      {order.payment === "COD" ? "Cash on Delivery" : "Online payment"}
                    </p>
                    <p className="mt-0.5 text-[#66645b]">{paymentStatus}</p>
                    {order.couponCode && <p className="mt-1 text-[#1e3a2e]">Coupon applied: {order.couponCode}</p>}
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-6 space-y-2 border-t border-[#eee9dc] pt-5 text-sm">
              <div className="flex items-center justify-between text-[#66645b]">
                <span>Items subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {onlineDiscount > 0 && (
                <div className="flex items-center justify-between text-[#1e3a2e]">
                  <span>Online payment discount</span>
                  <span>−{formatCurrency(onlineDiscount)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-[#1e3a2e]">
                  <span>Coupon discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>−{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[#eee9dc] pt-3 text-base font-bold text-[#1e3a2e]">
                <span>Order total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              {paidAmount > 0 && (
                <div className="flex items-center justify-between text-[#66645b]">
                  <span>{order.payment === "COD" ? "Paid so far" : "Paid online"}</span>
                  <span>{formatCurrency(paidAmount)}</span>
                </div>
              )}
              {order.payment === "COD" && amountDue > 0 && (
                <div className="flex items-center justify-between font-semibold text-[#354b3c]">
                  <span>Balance due on delivery</span>
                  <span>{formatCurrency(amountDue)}</span>
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to={trackingLink} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#1e3a2e] px-6 text-sm font-semibold text-white">
                Track this order
              </Link>
              {state?.accountAvailable && (
                <Link to="/account" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#d8d1bd] px-6 text-sm font-semibold text-[#1e3a2e]">
                  View my account
                </Link>
              )}
              <Link to="/contact" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#d8d1bd] px-6 text-sm font-semibold text-[#1e3a2e]">
                Contact support
              </Link>
            </div>
            <p className="mt-4 text-center text-xs text-[#777a72]">
              Need help? Keep your order number handy when contacting support.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
