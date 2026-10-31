import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiSearch, FiShoppingBag, FiUser, FiMenu } from "react-icons/fi";
import SearchOverlay from "./SearchOverlay";
import { categories as productCategories } from "../data/categories";
import { CART_UPDATED_EVENT, getCartCount } from "../lib/cart";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const categories = productCategories.filter(
    (category) => !["Blood Purifier", "Eye Care", "Heart Care"].includes(category.name)
  );

  const oldLinks = [
    { name: "Home", to: "/" },
    { name: "Shop", to: "/products" },
    { name: "About Us", to: "/about" },
    { name: "Blogs", to: "/blogs" },
    { name: "Contact", to: "/contact" },
  ];

  const handleCategoryClick = (category) => {
    setOpen(false);
    if (category.name === "Home" || category.name === "Blogs") {
      navigate(category.path);
      return;
    }

    if (category.name === "All Products") {
      navigate(category.path);
      return;
    }

    const slug = category.path.split("/").pop();
    navigate(`/products?category=${encodeURIComponent(slug)}`);
  };

  const isCategoryActive = (category) => {
    if (category.name === "Home" || category.name === "Blogs") {
      return location.pathname === category.path;
    }

    if (category.name !== "All Products" && location.pathname === category.path) {
      return true;
    }

    if (location.pathname !== "/products") return false;
    const selectedSlug = new URLSearchParams(location.search).get("category");
    if (category.name === "All Products") return !selectedSlug;
    return selectedSlug === category.path.split("/").pop();
  };

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
    };
  }, [location]);

  return (
    <>
    <div data-site-header className="bg-[#0A1931] text-white text-[14px] tracking-[1px] py-2 overflow-hidden whitespace-nowrap">
  <div className="flex w-max animate-marquee">
    <span className="flex items-center">
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
    </span>
    <span className="flex items-center" aria-hidden="true">
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
      <span className="mx-6">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></span>
    </span>
  </div>
</div>
      
      <div data-site-header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="h-[56px] flex items-center border-b">
          <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center px-4 relative">
            <div className="flex items-center gap-4">
              <button onClick={() => setOpen(true)} className="text-[24px]"><FiMenu /></button>
              
            </div>
            <Link to="/" className="font-bold text-[24px] tracking-[4px] font-light">ΛYUVEERΛ™</Link>
            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative text-[24px]"><FiShoppingBag />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full grid place-items-center">{cartCount}</span>}</Link>
              <Link to="/login" className="text-[24px]"><FiUser /></Link>
            </div>
          </div>
        </nav>

        <div className="hidden md:block border-b bg-white overflow-x-auto scrollbar-hide">
          <div className="flex w-max min-w-full justify-center gap-6 px-8 py-2.5">
            {categories.map((cat) => (
              <button key={cat.path} onClick={() => handleCategoryClick(cat)} className={`whitespace-nowrap text-[15px] font-semibold ${isCategoryActive(cat) ? 'text-[#b85c00]' : ''}`}>{cat.name}</button>
            ))}
          </div>
        </div>

        {!searchOpen && (
          <div className="bg-[#FFD400] text-center py-[9px] text-[12px] md:text-[14px] font-medium text-black tracking-wide">
            Get <span className="font-extrabold text-black">extra discount</span> on online payment*
          </div>
        )}
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-[60]"></div>}
      
      <div className={`fixed top-0 left-0 h-full w-[320px] bg-white z-[70] shadow-xl transition-all duration-300 overflow-y-auto ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6"><b className="text-[22px] tracking-[4px] font-bold">ΛYUVEERΛ™</b><button onClick={() => setOpen(false)} className="text-[22px]">✕</button></div>

          <div className="flex flex-col">
            {categories.map((c) => (
              <button key={c.path} onClick={() => handleCategoryClick(c)} className="text-left py-2.5 text-[14px] font-bold border-b border-gray-50">{c.name}</button>
            ))}
          </div>
          <div className="flex flex-col mt-4">
            {oldLinks.map((l) => (
              <Link key={l.name} to={l.to} onClick={() => setOpen(false)} className="py-3 px-2 flex justify-between font-medium text-[15px] hover:bg-green-50 rounded">{l.name} <span>→</span></Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`
  @keyframes marquee { 
    0% { transform: translateX(0); } 
    100% { transform: translateX(-50%); } 
  } 
  .animate-marquee {
    animation: marquee 20s linear infinite;
    will-change: transform;
  }
  .scrollbar-hide::-webkit-scrollbar{display:none}
`}</style>
    </>
  );
}