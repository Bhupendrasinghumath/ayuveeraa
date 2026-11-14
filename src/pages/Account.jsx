import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiArrowUpRight,
  FiChevronRight,
  FiHeart,
  FiHelpCircle,
  FiHome,
  FiMapPin,
  FiPackage,
  FiShield,
  FiStar,
  FiTruck,
  FiUser,
} from "react-icons/fi";
import { TrackOrderLookup } from "./customerServices/TrackOrder.jsx";
import {
  customerApiRequest,
  hasCustomerSession,
} from "../lib/customerSession.js";
import { resolveProductImage } from "../lib/api.js";

const sections = [
  { id: "overview", label: "Overview", Icon: FiHome },
  { id: "orders", label: "My orders", Icon: FiPackage },
  { id: "tracking", label: "Track order", Icon: FiTruck },
  { id: "profile", label: "Profile", Icon: FiUser },
  { id: "security", label: "Security", Icon: FiShield },
  { id: "addresses", label: "Saved addresses", Icon: FiMapPin },
  { id: "wishlist", label: "Wishlist", Icon: FiHeart },
  { id: "support", label: "Help & support", Icon: FiHelpCircle },
  { id: "reviews", label: "Product reviews", Icon: FiStar },
];

const emptyAddress = {
  label: "Home",
  recipientName: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  isDefault: false,
};

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`block text-sm font-medium text-[#354b3c] ${className}`}>
      {label}
      <input
        {...props}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d8d1bd] bg-white px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
      />
    </label>
  );
}

function AccountCard({ title, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[#e8e0c8] bg-white p-4 shadow-[0_3px_14px_rgba(38,52,37,0.035)] sm:p-6">
      <h2 className="text-base font-semibold text-[#1e3a2e] sm:text-lg">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-[#66645b]">{children}</div>
    </section>
  );
}

function AccountLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#1e3a2e]/30 px-4 text-sm font-medium text-[#1e3a2e] transition hover:border-[#1e3a2e] hover:bg-[#f4f6ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e]"
    >
      {children}
    </Link>
  );
}

function AccountAccessPrompt({ expired = false }) {
  return (
    <main className="grid min-h-[65vh] place-items-center bg-[#fffcf0] px-4 py-10">
      <section className="w-full max-w-xl rounded-3xl border border-[#e8e0c8] bg-white p-6 text-center shadow-sm sm:p-9">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f3f5ed] text-2xl text-[#1e3a2e]" aria-hidden="true">
          <FiUser />
        </span>
        <p className="mt-5 text-[10px] font-semibold tracking-[0.18em] text-[#917345]">MY AYUVEERA</p>
        <h1 className="mt-2 font-serif text-3xl text-[#1e3a2e]">
          {expired ? "Your session has expired" : "Welcome to your account"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#66645b]">
          {expired
            ? "Sign in again to continue managing your profile, orders and saved addresses."
            : "Sign in or create an account to see your orders, addresses and favourites. Placed a guest order? You can track it without signing in."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/login"
            state={{ from: { pathname: "/account" } }}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1e3a2e] px-6 text-sm font-semibold text-white transition hover:bg-[#31513e]"
          >
            {expired ? "Sign in again" : "Sign in or create account"}
          </Link>
          <Link
            to="/track-order"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8d1bd] px-6 text-sm font-semibold text-[#1e3a2e] transition hover:bg-[#f4f6ef]"
          >
            Track a guest order
          </Link>
        </div>
        <Link to="/products" className="mt-5 inline-flex min-h-10 items-center text-sm font-medium text-[#68736a] underline underline-offset-2 hover:text-[#1e3a2e]">
          Continue shopping
        </Link>
      </section>
    </main>
  );
}

function ReviewForm({ item, onSubmit, submitting }) {
  const [draft, setDraft] = useState({ rating: "5", title: "", reviewText: "" });

  const submit = (event) => {
    event.preventDefault();
    onSubmit(item, draft);
  };

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 border-t border-[#e8e3d6] pt-4 sm:grid-cols-2">
      <p className="text-sm font-medium text-[#354b3c] sm:col-span-2">
        {item.productName} · {item.orderNumber}
      </p>
      <label className="block text-sm text-[#354b3c]">
        Rating
        <select
          required
          value={draft.rating}
          onChange={(event) => setDraft((current) => ({ ...current, rating: event.target.value }))}
          className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d8d1bd] bg-white px-3 text-sm"
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>{rating} stars</option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-[#354b3c]">
        Review title
        <input
          required
          maxLength={120}
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d8d1bd] px-3 text-sm"
        />
      </label>
      <label className="block text-sm text-[#354b3c] sm:col-span-2">
        Your review
        <textarea
          required
          minLength={5}
          maxLength={2000}
          rows={4}
          value={draft.reviewText}
          onChange={(event) => setDraft((current) => ({ ...current, reviewText: event.target.value }))}
          className="mt-1.5 w-full rounded-lg border border-[#d8d1bd] p-3 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="min-h-10 justify-self-start rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}

export default function Account() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(() => (
    location.state?.createdFromOrder ? "security" : "overview"
  ));
  const [account, setAccount] = useState(null);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingReview, setSavingReview] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expired, setExpired] = useState(false);

  const loadAccount = useCallback(async (signal) => {
    try {
      const result = await customerApiRequest("customer-account.php", { signal });
      setAccount(result);
      setProfileForm((current) => ({
        ...current,
        firstName: result.profile.firstName,
        lastName: result.profile.lastName,
      }));
      setError("");
      setExpired(false);
    } catch (requestError) {
      if (requestError.name === "AbortError") return;
      if (requestError.status === 401) {
        setExpired(true);
      } else {
        setError(requestError.message);
      }
    } finally {
      if (!signal?.aborted) setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // The request resolves asynchronously and populates server-owned account data.
    // eslint-disable-next-line react/set-state-in-effect
    void loadAccount(controller.signal);
    return () => controller.abort();
  }, [loadAccount]);

  const runMutation = async (path, options, successMessage) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await customerApiRequest(path, options);
      await loadAccount();
      setMessage(successMessage);
      return true;
    } catch (requestError) {
      if (requestError.status === 401) setExpired(true);
      else setError(requestError.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const body = {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
    };

    await runMutation(
      "customer-account.php",
      { method: "PATCH", body: JSON.stringify(body) },
      "Your profile has been updated."
    );
  };

  const handleSecuritySubmit = async (event) => {
    event.preventDefault();
    const needsInitialPassword = Boolean(account?.profile.passwordSetupRequired);
    if (needsInitialPassword && !securityForm.newPassword) {
      setError("Set a password to finish creating your account.");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    const body = {
      firstName: account.profile.firstName,
      lastName: account.profile.lastName,
      newPassword: securityForm.newPassword,
    };
    if (!needsInitialPassword) body.currentPassword = securityForm.currentPassword;

    const updated = await runMutation(
      "customer-account.php",
      { method: "PATCH", body: JSON.stringify(body) },
      needsInitialPassword ? "Your password has been set." : "Your password has been updated."
    );
    if (updated) setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    const created = await runMutation(
      "customer-account.php",
      {
        method: "POST",
        body: JSON.stringify({ action: "address", ...addressForm }),
      },
      "Address saved."
    );
    if (created) setAddressForm(emptyAddress);
  };

  const handleReviewSubmit = async (item, draft) => {
    const key = `${item.orderId}:${item.productId}`;
    setSavingReview(key);
    setError("");
    setMessage("");
    try {
      await customerApiRequest("reviews.php", {
        method: "POST",
        body: JSON.stringify({
          orderId: item.orderId,
          productId: item.productId,
          rating: Number(draft.rating),
          title: draft.title.trim(),
          reviewText: draft.reviewText.trim(),
        }),
      });
      await loadAccount();
      setMessage("Thank you. Your review has been submitted.");
    } catch (requestError) {
      if (requestError.status === 401) setExpired(true);
      else setError(requestError.message);
    } finally {
      setSavingReview("");
    }
  };

  const removeAddress = async (id) => {
    await runMutation(
      `customer-account.php?resource=address&id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
      "Address removed."
    );
  };

  const removeWishlistItem = async (productId) => {
    await runMutation(
      `customer-account.php?resource=wishlist&productId=${encodeURIComponent(productId)}`,
      { method: "DELETE" },
      "Item removed from your wishlist."
    );
  };

  if (expired || !hasCustomerSession()) return <AccountAccessPrompt expired={expired} />;

  if (pageLoading) {
    return (
      <main className="grid min-h-[50vh] place-items-center bg-[#fffcf0] px-4">
        <p role="status" className="text-sm text-[#536254]">Loading your account...</p>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="grid min-h-[50vh] place-items-center bg-[#fffcf0] px-4">
        <div className="max-w-md rounded-2xl border border-[#e8e0c8] bg-white p-7 text-center">
          <h1 className="font-serif text-2xl text-[#1e3a2e]">Account unavailable</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{error || "Your account could not be loaded."}</p>
          <button
            type="button"
            onClick={() => {
              setPageLoading(true);
              void loadAccount();
            }}
            className="mt-5 min-h-10 rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const { profile, orders, addresses, wishlist, reviewableItems } = account;

  const renderOrders = () => (
    <AccountCard title="My orders">
      {orders.length === 0 ? (
        <div className="py-2 text-center sm:py-5">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3f5ed] text-xl text-[#1e3a2e]" aria-hidden="true">
            <FiPackage />
          </span>
          <h3 className="mt-3 font-semibold text-[#354b3c]">Your orders will show up here</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6">
            Orders placed while signed in are saved to your account. Have a guest order? Track it using the order number and checkout phone.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <AccountLink to="/products">Browse products <FiArrowUpRight aria-hidden="true" /></AccountLink>
            <AccountLink to="/track-order?guest=1">Track a guest order</AccountLink>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="min-w-0 rounded-xl border border-[#ece8dd] p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-[#354b3c]">{order.orderNumber}</p>
                  <p className="text-xs text-[#777a72]">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="rounded-full bg-[#edf2e8] px-3 py-1 text-xs font-semibold capitalize text-[#1e3a2e]">
                    {order.status.replaceAll("_", " ")}
                  </span>
                  <span className="text-xs text-[#777a72]">
                    {order.payment === "COD"
                      ? `COD · ${order.paymentStatus === "partially_paid" ? "advance paid" : order.paymentStatus}`
                      : `Online · ${order.paymentStatus}`}
                  </span>
                </div>
              </div>
              <ul className="mt-3 space-y-2 border-t border-[#ece8dd] pt-3">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.productId}`} className="flex min-w-0 justify-between gap-3 text-sm">
                    <span className="min-w-0 break-words">{item.name} <span className="whitespace-nowrap">× {item.quantity}</span></span>
                    <span className="shrink-0 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 text-right text-sm">
                {Number(order.onlineDiscount) > 0 && (
                  <p className="text-[#1e3a2e]">Online discount: −{formatCurrency(order.onlineDiscount)}</p>
                )}
                {Number(order.couponDiscount) > 0 && (
                  <p className="text-[#1e3a2e]">Coupon {order.couponCode ? `(${order.couponCode}) ` : ""}discount: −{formatCurrency(order.couponDiscount)}</p>
                )}
                <p className="font-semibold text-[#354b3c]">Order total: {formatCurrency(order.total)}</p>
                {Number(order.paidAmount) > 0 && (
                  <p className="text-[#66645b]">{order.payment === "COD" ? "Paid so far" : "Paid online"}: {formatCurrency(order.paidAmount)}</p>
                )}
                {order.payment === "COD" && Number(order.amountDue) > 0 && (
                  <p className="font-medium text-[#354b3c]">Due on delivery: {formatCurrency(order.amountDue)}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountCard>
  );

  const renderAddresses = () => (
    <div className="space-y-4">
      <AccountCard title="Saved addresses">
        {addresses.length === 0 ? (
          <div className="py-2 text-center sm:py-5">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3f5ed] text-xl text-[#1e3a2e]" aria-hidden="true">
              <FiMapPin />
            </span>
            <h3 className="mt-3 font-semibold text-[#354b3c]">Add a delivery address</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6">Save an address to make your next checkout quicker.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <article key={address.id} className="min-w-0 rounded-xl border border-[#ece8dd] p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3f5ed] text-[#1e3a2e]" aria-hidden="true">
                    <FiMapPin />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-[#354b3c]">
                      {address.label}{address.isDefault && <span className="ml-1 text-xs font-medium text-[#71816d]">· Default</span>}
                    </p>
                    <p className="break-words">{address.recipientName} · {address.phone}</p>
                    <p className="break-words">{[address.address, address.city, address.pincode].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAddress(address.id)}
                  disabled={saving}
                  className="mt-3 min-h-10 rounded-full px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Remove address
                </button>
              </article>
            ))}
          </div>
        )}
      </AccountCard>

      <AccountCard title="Add a delivery address">
        <form onSubmit={handleAddressSubmit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Label" required maxLength={50} value={addressForm.label} onChange={(event) => setAddressForm({ ...addressForm, label: event.target.value })} />
          <Field label="Recipient name" required maxLength={120} value={addressForm.recipientName} onChange={(event) => setAddressForm({ ...addressForm, recipientName: event.target.value })} />
          <Field label="Phone" required type="tel" maxLength={20} value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} />
          <Field label="Pincode" required maxLength={12} value={addressForm.pincode} onChange={(event) => setAddressForm({ ...addressForm, pincode: event.target.value })} />
          <Field label="City" maxLength={100} value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} />
          <label className="flex items-center gap-2 self-end pb-3 text-sm text-[#354b3c]">
            <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm({ ...addressForm, isDefault: event.target.checked })} />
            Make default address
          </label>
          <label className="block text-sm font-medium text-[#354b3c] sm:col-span-2">
            Full address
            <textarea required maxLength={500} rows={3} value={addressForm.address} onChange={(event) => setAddressForm({ ...addressForm, address: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#d8d1bd] p-3 text-sm" />
          </label>
          <button type="submit" disabled={saving} className="min-h-10 justify-self-start rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save address"}
          </button>
        </form>
      </AccountCard>
    </div>
  );

  const renderWishlist = () => (
    <AccountCard title="Wishlist">
      {wishlist.length === 0 ? (
        <div className="py-2 text-center sm:py-5">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3f5ed] text-xl text-[#1e3a2e]" aria-hidden="true">
            <FiHeart />
          </span>
          <h3 className="mt-3 font-semibold text-[#354b3c]">Keep your favourites close</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6">Save products you like and find them here whenever you need them.</p>
          <div className="mt-4"><AccountLink to="/products">Explore products <FiArrowUpRight aria-hidden="true" /></AccountLink></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {wishlist.map((product) => (
            <article key={product.id} className="flex min-w-0 gap-3 rounded-xl border border-[#ece8dd] p-3 sm:gap-4">
              <Link to={`/product/${product.id}`} className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-[#f7f4eb]">
                <img src={resolveProductImage(product.image)} alt={product.name} className="h-full w-full object-contain" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${product.id}`} className="font-semibold text-[#354b3c] hover:underline">{product.name}</Link>
                <p className="mt-1">{formatCurrency(product.price)}</p>
                <button
                  type="button"
                  onClick={() => removeWishlistItem(product.id)}
                  disabled={saving}
                  className="mt-2 text-xs font-semibold text-red-700 underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountCard>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <AccountCard title="Profile details">
        <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required maxLength={60} value={profileForm.firstName} onChange={(event) => setProfileForm({ ...profileForm, firstName: event.target.value })} />
          <Field label="Last name" maxLength={60} value={profileForm.lastName} onChange={(event) => setProfileForm({ ...profileForm, lastName: event.target.value })} />
          <div className="sm:col-span-2">
            <p className="text-xs text-[#777a72]">Mobile number</p>
            <p className="mt-1 font-medium text-[#354b3c]">+91 {profile.phone}</p>
          </div>
          <button type="submit" disabled={saving} className="min-h-10 justify-self-start rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </AccountCard>
    </div>
  );

  const renderSecurity = () => (
    <AccountCard title={profile.passwordSetupRequired ? "Set your account password" : "Password & security"}>
      <p>
        {profile.passwordSetupRequired
          ? "Choose a password to sign in to this account again. Your mobile number has not been verified."
          : "Use your current password to choose a new one. Changing your password signs out your other active sessions."}
      </p>
      <form onSubmit={handleSecuritySubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        {!profile.passwordSetupRequired && (
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            value={securityForm.currentPassword}
            onChange={(event) => setSecurityForm({ ...securityForm, currentPassword: event.target.value })}
          />
        )}
        <Field
          label={profile.passwordSetupRequired ? "Create password" : "New password"}
          type="password"
          minLength={10}
          maxLength={72}
          autoComplete="new-password"
          required
          value={securityForm.newPassword}
          onChange={(event) => setSecurityForm({ ...securityForm, newPassword: event.target.value })}
        />
        <Field
          label="Confirm password"
          type="password"
          minLength={10}
          maxLength={72}
          autoComplete="new-password"
          required
          value={securityForm.confirmPassword}
          onChange={(event) => setSecurityForm({ ...securityForm, confirmPassword: event.target.value })}
        />
        <button type="submit" disabled={saving} className="min-h-10 justify-self-start rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
          {saving ? "Saving..." : profile.passwordSetupRequired ? "Set password" : "Update password"}
        </button>
      </form>
    </AccountCard>
  );

  const renderReviews = () => (
    <AccountCard title="Product reviews">
      {reviewableItems.length === 0 ? (
        <div className="py-2 text-center sm:py-5">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3f5ed] text-xl text-[#1e3a2e]" aria-hidden="true">
            <FiStar />
          </span>
          <h3 className="mt-3 font-semibold text-[#354b3c]">No reviews to write yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6">After an order is delivered, you can share your experience here.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#ece8dd]">
          {reviewableItems.map((item) => (
            <ReviewForm
              key={`${item.orderId}-${item.productId}`}
              item={item}
              onSubmit={handleReviewSubmit}
              submitting={savingReview === `${item.orderId}:${item.productId}`}
            />
          ))}
        </div>
      )}
    </AccountCard>
  );

  const sectionContent = {
    overview: (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#1e3a2e] sm:text-xl">Your account at a glance</h2>
          <p className="mt-1 text-sm leading-6 text-[#777a72]">Pick up where you left off or jump to a section below.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Orders", value: orders.length, Icon: FiPackage, section: "orders" },
            { label: "Saved addresses", value: addresses.length, Icon: FiMapPin, section: "addresses" },
            { label: "Wishlist", value: wishlist.length, Icon: FiHeart, section: "wishlist" },
          ].map(({ label, value, Icon, section }) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className="flex min-h-[88px] items-center gap-3 rounded-2xl border border-[#e8e0c8] bg-white p-4 text-left shadow-[0_3px_14px_rgba(38,52,37,0.035)] transition hover:border-[#9ca995] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f3f5ed] text-lg text-[#1e3a2e]" aria-hidden="true">
                <Icon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-semibold text-[#1e3a2e]">{value}</span>
                <span className="block text-xs leading-5 text-[#777a72]">{label}</span>
              </span>
              <FiChevronRight className="shrink-0 text-[#8b9787]" aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <AccountCard title="Profile">
            <p className="break-words font-medium text-[#354b3c]">{[profile.firstName, profile.lastName].filter(Boolean).join(" ")}</p>
            <p className="mt-1">+91 {profile.phone}</p>
            <button type="button" onClick={() => setActiveSection("profile")} className="mt-3 inline-flex min-h-10 items-center gap-1 font-semibold text-[#1e3a2e] underline underline-offset-2">
              Edit profile <FiArrowUpRight aria-hidden="true" />
            </button>
          </AccountCard>
          <AccountCard title="Need a hand?">
            <p>We’re here to help with your orders and products.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AccountLink to="/contact">Contact us</AccountLink>
              <AccountLink to="/faqs">FAQs</AccountLink>
            </div>
          </AccountCard>
        </div>
      </div>
    ),
    orders: renderOrders(),
    tracking: <TrackOrderLookup embedded customerOrders={orders} />,
    profile: renderProfile(),
    security: renderSecurity(),
    addresses: renderAddresses(),
    wishlist: renderWishlist(),
    support: (
      <AccountCard title="Help & support">
        <p>For order or product assistance, contact the Ayuveera support team.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AccountLink to="/contact">Contact us</AccountLink>
          <AccountLink to="/faqs">FAQs</AccountLink>
        </div>
      </AccountCard>
    ),
    reviews: renderReviews(),
  };

  return (
    <main className="min-h-[70vh] bg-[#fffcf0] px-3 py-6 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-[#777a72] sm:text-sm">
          <Link to="/" className="hover:text-[#1e3a2e] hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-[#354b3c]">My account</span>
        </nav>

        {(error || message) && (
          <p role={error ? "alert" : "status"} className={`mt-4 rounded-xl border p-3 text-sm leading-5 ${error ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>
            {error || message}
          </p>
        )}
        {location.state?.createdFromOrder && (
          <p role="status" className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm leading-5 text-green-900">
            Your order is placed and this new account is signed in. Your checkout details and order are saved here.
          </p>
        )}
        {profile.passwordSetupRequired && (
          <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">
            Your order created this account and its delivery details. Set a password in Security to sign in again. The mobile number itself has not been verified, and this account is not linked to any older account data.
          </p>
        )}

        <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[235px_minmax(0,1fr)] lg:gap-6">
          <nav aria-label="Account sections" className="min-w-0 rounded-2xl border border-[#e8e0c8] bg-white p-3 shadow-[0_3px_14px_rgba(38,52,37,0.035)] sm:p-4">
            <p className="px-1 pb-2 text-[10px] font-semibold tracking-[0.16em] text-[#92958b]">ACCOUNT MENU</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {sections.map(({ id, label, Icon }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      setActiveSection(id);
                      setError("");
                      setMessage("");
                    }}
                    className={`flex min-h-12 min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium leading-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e] sm:text-sm ${
                      active
                        ? "border-[#1e3a2e] bg-[#1e3a2e] text-white shadow-sm"
                        : "border-transparent bg-[#faf9f4] text-[#49564a] hover:border-[#e8e0c8] hover:bg-[#f4f6ef]"
                    }`}
                  >
                    <Icon className={`shrink-0 text-base ${active ? "text-[#f4dfae]" : "text-[#71816d]"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">{label}</span>
                    <FiChevronRight className={`hidden shrink-0 lg:block ${active ? "text-white/70" : "text-[#a5aa9f]"}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </nav>

          <section aria-label={sections.find((section) => section.id === activeSection)?.label || "Account details"} className="min-w-0">
            {sectionContent[activeSection]}
          </section>
        </div>
      </div>
    </main>
  );
}
