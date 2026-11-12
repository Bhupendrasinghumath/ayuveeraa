import { useEffect, useState } from "react";
import { FiSearch, FiPlus, FiMinus } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { getCart, toggleCartItem } from "../lib/cart";

export default function SearchOverlay({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [cartIds, setCartIds] = useState(() => new Set(getCart().map((item) => String(item.id))));

  useEffect(() => {
    const syncCart = () => setCartIds(new Set(getCart().map((item) => String(item.id))));
    window.addEventListener("cart:updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("cart:updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const trendingSearches = ["Weight Gainer", "Muscle Gainer", "Cholesterol", "Diabetes", "Fat Loss", "Liver"];
  
  const mostLiked = [
    { id: 1, name: "Ayurveda Weight Gainer Combo", price: 699, image: "https://via.placeholder.com/150" },
    { id: 2, name: "Ayurveda Liver Detox Kit", price: 599, image: "https://via.placeholder.com/150" },
    { id: 3, name: "Ayurveda Fat Burner Capsule", price: 799, image: "https://via.placeholder.com/150" },
    { id: 4, name: "Ayurveda Cholesterol Care", price: 649, image: "https://via.placeholder.com/150" },
  ];

  const blogs = [
    { title: "Indian Breakfast for Cholesterol: 5 Recipes for a Happy Heart", link: "/blogs/1" },
    { title: "Foods to Avoid at Night: Stop Eating These 5 Things After Dark", link: "/blogs/2" },
  ];

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    toggleCartItem(product);
  };

  const handleSearch = (term) => {
    onClose();
    navigate(`/products?search=${term}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[100] overflow-y-auto">
      <div className="sticky top-0 bg-[#f5f5ef] border-b px-4 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full max-w-[700px]">
          <FiSearch className="text-[18px]" />
          <input autoFocus placeholder="Search Products" className="bg-transparent outline-none text-[15px] w-full" />
        </div>
        <button onClick={onClose} className="text-[22px]"><IoClose /></button>
      </div>

      <div className="max-w-[1250px] mx-auto px-4 md:px-10 py-6 grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
        <div>
          <h3 className="text-[13px] font-bold mb-3">↗ Trending Searches</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {trendingSearches.map((t) => (
              <button key={t} onClick={() => handleSearch(t)} className="border rounded-full px-4 py-1.5 text-[13px] hover:bg-black hover:text-white">{t}</button>
            ))}
          </div>

          <h3 className="text-[15px] font-bold">Most Liked</h3>
          <p className="text-[11px] text-gray-500 mb-3">Best selling</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mostLiked.map((p) => (
              <div key={p.id} className="relative border rounded-xl p-3 bg-white hover:shadow-lg transition">
                <button
                  type="button"
                  aria-label={cartIds.has(String(p.id)) ? `Remove ${p.name} from cart` : `Add ${p.name} to cart`}
                  aria-pressed={cartIds.has(String(p.id))}
                  onClick={(e) => handleAddToCart(e, p)}
                  className={`absolute top-2 right-2 z-10 grid h-7 w-7 place-items-center rounded-full border shadow transition ${cartIds.has(String(p.id)) ? "bg-[#0f3d2e] text-white" : "bg-white hover:bg-black hover:text-white"}`}
                >
                  {cartIds.has(String(p.id)) ? <FiMinus className="text-[14px]" /> : <FiPlus className="text-[14px]" />}
                </button>
                <div onClick={() => handleSearch(p.name)} className="cursor-pointer">
                  <div className="bg-[#f8f8f4] rounded-lg h-[110px] grid place-items-center mb-2"><img src={p.image} alt="" className="h-[90px]" /></div>
                  <p className="text-[12px] font-medium line-clamp-2">{p.name}</p>
                  <p className="text-[13px] font-bold mt-1">₹{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t md:border-l md:pl-10 pt-6 md:pt-0">
          <h3 className="text-[14px] font-bold mb-5">Latest in our Blog</h3>
          <div className="flex flex-col gap-4">
            {blogs.map((b, i) => (<div key={i} className="pb-4 border-b"><Link to={b.link} onClick={onClose} className="text-[14px] font-medium hover:underline block">{b.title}</Link><Link to={b.link} onClick={onClose} className="text-[11px] underline text-gray-600 mt-2 inline-block">Read More</Link></div>))}
          </div>
        </div>
      </div>
    </div>
  );
}