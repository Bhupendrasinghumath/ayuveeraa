import { FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

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
  const price = getAmount(p.price);
  const oldPrice = getAmount(p.oldPrice);
  const discount = price !== null && oldPrice !== null && oldPrice > 0 && price >= 0 && oldPrice > price
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;
  const hasDiscount = discount > 0;
  const savings = hasDiscount ? oldPrice - price : null;
  const rating = getAmount(p.rating);

  const addToCart = () => {
    let cart = [];
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (Array.isArray(savedCart)) cart = savedCart;
    } catch {
      cart = [];
    }

    const product = price === null ? p : { ...p, price };
    const existing = cart.find((item) => String(item.id) === String(p.id));
    const updatedCart = existing
      ? cart.map((item) => (
        String(item.id) === String(p.id)
          ? { ...item, quantity: (Number(item.quantity) || 0) + 1 }
          : item
      ))
      : [...cart, { ...product, quantity: 1 }];

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleBuyNow = () => {
    addToCart();
    navigate('/cart');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-[12px] overflow-hidden">
      <div className="bg-black text-white text-[12px] font-bold tracking-wide text-center py-[5px]">
        5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span>
      </div>
      <div className="relative aspect-square w-full bg-[#f9f3e8]">
        <Link to={`/product/${p.id}`} className="block h-full w-full">
          <img src={p.image} className="h-full w-full object-contain" alt={p.name}/>
        </Link>
        <button
          type="button"
          aria-label={`Add ${p.name} to cart`}
          onClick={addToCart}
          className="absolute left-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-[#0f3d2e]/15 bg-white/95 text-[#0f3d2e] shadow-sm transition hover:bg-[#0f3d2e] hover:text-white active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3d2e] md:h-10 md:w-10"
        >
          <FaShoppingCart aria-hidden="true" size={15}/>
        </button>
        {hasDiscount && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded bg-[#0f3d2e] px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>
      <div className="p-0 text-center">
        <h3 className="text-[15px] font-bold leading-[16px] line-clamp-2 min-h-[32px]">{p.name}</h3>
        {(rating > 0 || p.reviews) && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {rating > 0 && (
              <>
                <span className="text-[#ffc800] text-[15px]" aria-hidden="true">
                  {'★'.repeat(Math.min(5, Math.max(0, Math.round(rating))))}
                </span>
                <span className="sr-only">{rating} out of 5 stars</span>
              </>
            )}
            {p.reviews && <span className="text-[11px] text-gray-600">{p.reviews} Reviews</span>}
          </div>
        )}
        <div className="mt-1">
          {hasDiscount && <span className="text-[13px] text-gray-400 line-through">₹{formatAmount(oldPrice)}</span>}
          {price !== null && <span className="text-[15px] font-bold ml-1">₹ {formatAmount(price)}</span>}
        </div>
        {savings !== null && <p className="text-[11px] text-gray-500">(save ₹ {formatAmount(savings)})</p>}
        <button
          type="button"
          onClick={handleBuyNow}
          className="mt-3 block w-full bg-[#111] text-white text-[13px] font-bold py-[10px] rounded-[8px] text-center transition hover:bg-[#0f3d2e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3d2e]"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}