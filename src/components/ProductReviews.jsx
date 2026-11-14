import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";

function Stars({ rating, large = false }) {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <span
      aria-label={`${Number(rating).toFixed(2)} out of 5 stars`}
      className={`inline-flex gap-0.5 ${large ? "text-xl" : "text-base"}`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden="true" className={star <= roundedRating ? "text-[#16853b]" : "text-[#d7ddd6]"}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatReviewDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ProductReviews({ productId }) {
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    reviewCount: 0,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [totalPages, setTotalPages] = useState(0);
  const [loadedRequestKey, setLoadedRequestKey] = useState("");
  const [loadError, setLoadError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const requestKey = `${productId}:${page}:${sortBy}`;
  const loading = loadedRequestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    apiRequest(`reviews.php?product_id=${encodeURIComponent(productId)}&page=${page}&sort=${sortBy}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (
          !result ||
          !Array.isArray(result.reviews) ||
          !result.summary ||
          typeof result.summary !== "object"
        ) {
          throw new Error("Reviews response was not valid.");
        }

        setLoadError("");
        setSummary(result.summary);
        setTotalPages(Number(result.totalPages) || 0);
        setReviews((current) => (
          page === 1 ? result.reviews : [...current, ...result.reviews]
        ));
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedRequestKey(requestKey);
      });

    return () => controller.abort();
  }, [productId, page, requestKey, sortBy]);

  return (
    <section className="mt-12 border-t border-[#e8e3d6] pt-8 sm:mt-16 sm:pt-10" aria-labelledby="product-reviews-heading">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#917345]">CUSTOMER FEEDBACK</p>
        <h2 id="product-reviews-heading" className="mt-2 font-serif text-2xl text-[#1e3a2e] sm:text-3xl">
          Customer reviews
        </h2>
       
      </div>

      <div className="mt-6 grid gap-5 rounded-2xl border border-[#ece8dd] bg-[#fffefa] p-5 sm:grid-cols-[minmax(190px,0.7fr)_minmax(0,1.3fr)] sm:p-6">
        <div className="flex flex-col items-center justify-center border-b border-[#ece8dd] pb-5 text-center sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5">
          <p className="text-4xl font-semibold tabular-nums text-[#1e3a2e]">
            {summary.reviewCount ? Number(summary.averageRating).toFixed(2) : "—"}
          </p>
          <div className="mt-1"><Stars rating={summary.averageRating} large /></div>
          <p className="mt-2 text-sm text-[#6b6b63]">
            {summary.reviewCount} {summary.reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-2" aria-label="Rating breakdown">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = Number(summary.ratingCounts?.[star]) || 0;
            const percentage = summary.reviewCount ? (count / summary.reviewCount) * 100 : 0;
            return (
              <div key={star} className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs">
                <span className="text-right font-medium text-[#3d493e]">{star} ★</span>
                <div className="h-2 overflow-hidden rounded-full bg-[#eceee9]">
                  <div className="h-full rounded-full bg-[#16853b]" style={{ width: `${percentage}%` }} />
                </div>
                <span className="tabular-nums text-[#777a72]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e3d6] pb-3">
        <h3 className="font-semibold text-[#29382e]">All customer reviews ({summary.reviewCount})</h3>
        <label className="flex items-center gap-2 text-xs text-[#68736a]">
          Sort:
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(1);
            }}
            className="min-h-9 rounded-full border border-[#d8d1bd] bg-white px-3 text-xs text-[#354b3c] outline-none focus:border-[#1e3a2e]"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest rating</option>
            <option value="lowest">Lowest rating</option>
          </select>
        </label>
      </div>

      {loadError && (
        <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Reviews could not be loaded. {loadError}
        </p>
      )}

      {reviews.length === 0 && !loading && !loadError && (
        <p className="mt-5 rounded-xl bg-[#f7f6f1] p-5 text-sm text-[#68736a]">
          No verified customer reviews yet.
        </p>
      )}

      <div className="divide-y divide-[#e8e3d6]">
        {reviews.map((review) => (
          <article key={review.id} className="py-5">
            <div className="flex flex-wrap items-center gap-2">
              <Stars rating={review.rating} />
              <span className="font-semibold tabular-nums text-[#16853b]">{review.rating}.0</span>
              <span className="text-[#aaa99f]">·</span>
              <h4 className="text-sm font-semibold text-[#29382e]">{review.title}</h4>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4c514a]" dir="auto">{review.reviewText}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#777a72]">
              <span className="font-medium text-[#555d53]">{review.reviewerName}</span>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-[#16853b]">
                  <span aria-hidden="true">✓</span> Verified purchase
                </span>
              )}
              {review.createdAt && <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>}
            </div>
          </article>
        ))}
      </div>

      {loading && <p role="status" className="py-5 text-center text-sm text-[#68736a]">Loading reviews…</p>}
      {!loading && page < totalPages && (
        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          className="mt-4 min-h-10 rounded-full border border-[#1e3a2e]/30 px-5 text-sm font-medium text-[#1e3a2e] hover:border-[#1e3a2e]"
        >
          Show more reviews
        </button>
      )}
    </section>
  );
}
