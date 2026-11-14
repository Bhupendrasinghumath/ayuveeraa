import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api.js";
import { hasCustomerSession, saveCustomerToken } from "../lib/customerSession.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (hasCustomerSession()) {
    return <Navigate to="/account" replace />;
  }

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "register" && form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const result = await apiRequest("customer-auth.php", {
        method: "POST",
        body: JSON.stringify({
          action: mode === "register" ? "register" : "login",
          phone: form.phone,
          password: form.password,
          ...(mode === "register" ? {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
          } : {}),
        }),
      });

      saveCustomerToken(result?.token);
      const nextPath = location.state?.from?.pathname;
      const returnPath = nextPath?.startsWith("/") && !nextPath.startsWith("//") && nextPath !== "/login"
        ? nextPath
        : "/account";
      navigate(returnPath, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isRegistering = mode === "register";

  return (
    <main className="min-h-[70vh] bg-[#fffcf0] px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[#e8e0c8] bg-white p-6 shadow-sm sm:p-9">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#917345]">AYUVEERA ACCOUNT</p>
        <h1 className="mt-2 font-serif text-3xl text-[#1e3a2e]">
          {isRegistering ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#66645b]">
          {isRegistering
            ? "Create an account with your mobile number and a password."
            : "Enter your registered mobile number and password."}
        </p>
        <p className="mt-4 rounded-xl border border-[#e8e0c8] bg-[#fffefa] p-3 text-xs leading-5 text-[#555d53]">
          No SMS is sent; your mobile number is used as your sign-in name and is not independently verified. Only orders placed while signed in appear here.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegistering && (
            <>
              <label className="block text-sm font-medium text-[#354b3c]">
                First name
                <input
                  required
                  maxLength={60}
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(event) => updateForm("firstName", event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
                />
              </label>
              <label className="block text-sm font-medium text-[#354b3c]">
                Last name
                <input
                  required
                  maxLength={60}
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(event) => updateForm("lastName", event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
                />
              </label>
            </>
          )}

          <label className="block text-sm font-medium text-[#354b3c]">
            Mobile number
            <div className="mt-1.5 flex min-h-11 items-center rounded-lg border border-[#d8d1bd] px-3 focus-within:border-[#1e3a2e] focus-within:ring-2 focus-within:ring-[#1e3a2e]/10">
              <span className="mr-3 border-r border-[#e8e0c8] pr-3 text-sm text-[#68736a]">+91</span>
              <input
                required
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className="min-w-0 flex-1 bg-transparent text-sm font-normal outline-none"
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-[#354b3c]">
            Password
            <input
              required
              type="password"
              minLength={10}
              maxLength={72}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              value={form.password}
              onChange={(event) => updateForm("password", event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
            />
            {isRegistering && <span className="mt-1 block text-xs font-normal text-[#777a72]">Use 10–72 characters.</span>}
          </label>

          {isRegistering && (
            <label className="block text-sm font-medium text-[#354b3c]">
              Confirm password
              <input
                required
                type="password"
                minLength={10}
                maxLength={72}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => updateForm("confirmPassword", event.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d8d1bd] px-3 text-sm font-normal outline-none focus:border-[#1e3a2e] focus:ring-2 focus:ring-[#1e3a2e]/10"
              />
            </label>
          )}

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white transition hover:bg-[#31513e] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#66645b]">
          {isRegistering ? "Already have an account?" : "New to Ayuveera?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isRegistering ? "login" : "register");
              setError("");
            }}
            className="font-semibold text-[#1e3a2e] underline underline-offset-2"
          >
            {isRegistering ? "Sign in" : "Create account"}
          </button>
        </p>
        {!isRegistering && (
          <p className="mt-3 text-center text-xs text-[#777a72]">
            Forgot your password? <Link to="/contact" className="font-semibold text-[#1e3a2e] underline">Contact support</Link>.
          </p>
        )}

        <p className="mt-5 text-center text-xs leading-5 text-[#777a72]">
          By continuing, you agree to our <Link to="/terms-and-conditions" className="underline underline-offset-2">Terms</Link> and <Link to="/privacy-policy" className="underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
