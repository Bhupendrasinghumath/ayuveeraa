import { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ensureCartItem, isProductInCart, toggleCartItem } from '../lib/cart';

const getAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;

  const amount = Number(value.replace(/,/g, '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(amount) ? amount : null;
};

const formatAmount = (amount) => amount.toLocaleString('en-IN', {
  maximumFractionDigits: 2,
});

export default function ProductCard({ p }) {
  const navigate = useNavigate();
  const [inCart, setInCart] = useState(() => isProductInCart(p.id));
  const price = getAmount(p.price);
  const oldPrice = getAmount(p.oldPrice);
  const discount = price !== null && oldPrice !== null && oldPrice > 0 && price >= 0 && oldPrice > price
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
  const hasDiscount = discount > 0;
  const savings = hasDiscount ? oldPrice - price : null;
  const rating = getAmount(p.rating);

  useEffect(() => {
    const syncCartState = () => setInCart(isProductInCart(p.id));
    window.addEventListener('cart:updated', syncCartState);
    window.addEventListener('storage', syncCartState);
    return () => {
      window.removeEventListener('cart:updated', syncCartState);
      window.removeEventListener('storage', syncCartState);
    };
  }, [p.id]);

  const product = price === null ? p : { ...p, price };
  const handleAddButton = () => {
    toggleCartItem(product);
  };

  const handleBuyNow = () => {
    ensureCartItem(product);
    navigate('/cart');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[12px] overflow-hidden [container-type:inline-size]">
      <div className="bg-black text-white text-[9px] [@container(min-width:220px)]:text-[10px] [@container(min-width:280px)]:text-[11px] font-bold tracking-wide text-center leading-tight px-1.5 py-1">
        5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span>
      </div>
      <div className="relative aspect-square w-full bg-[#f9f3e8]">
        <Link to={`/product/${p.id}`} className="block h-full w-full">
          <img src={p.image} className="h-full w-full object-contain" alt={p.name}/>
        </Link>
        <button
          type="button"
          aria-label={inCart ? `Remove ${p.name} from cart` : `Add ${p.name} to cart`}
          aria-pressed={inCart}
          onClick={handleAddButton}
          className={`absolute left-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border shadow-sm transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3d2e] md:h-10 md:w-10 ${inCart ? 'border-[#0f3d2e] bg-[#0f3d2e] text-white' : 'border-[#0f3d2e]/15 bg-white/95 text-[#0f3d2e] hover:bg-[#0f3d2e] hover:text-white'}`}
        >
          <FaShoppingCart aria-hidden="true" size={15}/>
        </button>
        {hasDiscount && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded bg-[#0f3d2e] px-1.5 py-1 text-[9px] [@container(min-width:220px)]:text-[10px] [@container(min-width:220px)]:px-2 font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>
      <div className="p-0 text-center">
        <h3 className="text-[12px] [@container(min-width:220px)]:text-[14px] [@container(min-width:280px)]:text-[15px] font-bold leading-[14px] [@container(min-width:220px)]:leading-[17px] [@container(min-width:280px)]:leading-[18px] line-clamp-2 min-h-[28px] [@container(min-width:220px)]:min-h-[34px] [@container(min-width:280px)]:min-h-[36px]">{p.name}</h3>
        {(rating > 0 || p.reviews) && (
          <div className="flex flex-wrap items-center justify-center gap-x-1 mt-1.5 [@container(min-width:220px)]:mt-2">
            {rating > 0 && (
              <>
                <span className="text-[#ffc800] text-[12px] [@container(min-width:220px)]:text-[14px]" aria-hidden="true">
                  {'★'.repeat(Math.min(5, Math.max(0, Math.round(rating))))}
                </span>
                <span className="sr-only">{rating} out of 5 stars</span>
              </>
            )}
            {p.reviews && <span className="text-[10px] [@container(min-width:220px)]:text-[11px] [@container(min-width:280px)]:text-[12px] text-gray-600">{p.reviews} Reviews</span>}
          </div>
        )}
        <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-1 gap-y-0 px-1">
          {hasDiscount && <span className="text-[11px] [@container(min-width:220px)]:text-[13px] [@container(min-width:280px)]:text-[14px] text-gray-400 line-through">₹{formatAmount(oldPrice)}</span>}
          {price !== null && <span className="text-[12px] [@container(min-width:220px)]:text-[14px] [@container(min-width:280px)]:text-[16px] font-bold">₹ {formatAmount(price)}</span>}
        </div>
        {savings !== null && <p className="px-1 text-[10px] [@container(min-width:220px)]:text-[11px] [@container(min-width:280px)]:text-[12px] text-gray-500 break-words">(save ₹ {formatAmount(savings)})</p>}
        <button
          type="button"
          onClick={handleBuyNow}
          className="mt-2 [@container(min-width:220px)]:mt-3 block w-full min-h-9 bg-[#111] text-white text-[11px] [@container(min-width:220px)]:text-[12px] [@container(min-width:280px)]:text-[13px] font-bold py-2 [@container(min-width:220px)]:py-2.5 rounded-[8px] text-center transition hover:bg-[#0f3d2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3d2e]"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}