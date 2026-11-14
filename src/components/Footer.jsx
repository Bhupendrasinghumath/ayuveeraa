import { Link, useNavigate } from 'react-router-dom';
import BrandWordmark from './BrandWordmark';
import { getAvailableProductCategories } from '../data/categories';
import { useProducts } from '../context/useProducts';

function Footer() {
  const navigate = useNavigate();
  const { products } = useProducts();

  const handleCategoryClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (to) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerCategories = getAvailableProductCategories(products)
    .filter((category) => category.name !== 'All Products');

  return (
    <footer className="w-full mt-12">

      {/* BEST DISCLAIMER  */}
      <div className="w-full bg-[#fdfcf8] border-t border-[#f0eee6]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-[7%] py-8">
          <p className="text-[11px] md:text-[12px] leading-[19px] text-[#8a8d88] text-center">
            <span className="font-bold text-[#6b6e68]">Disclaimer:</span> Our Ayurvedic formulations are rooted in traditional wellness practices and are intended to support your overall well-being. 
            They are not intended to diagnose, treat, cure or prevent any disease. Individual results may vary based on body type, lifestyle and consistent usage. 
            Please consult your Ayurvedic physician or healthcare professional before starting any new supplement, especially if you are pregnant, nursing, have a medical condition or allergies. 
            Please check the ingredient list carefully. This information is for educational purposes only and is not a replacement for professional medical advice.
          </p>
        </div>
      </div>



      {/* ===== 2. MAIN FOOTER ===== */}
      <div className="bg-[#fdf8e7] px-6 md:px-[7%] py-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">

          <div className="md:col-span-1">
            <h3 className="font-bold text-[#1e3a2a] text-[18px] mb-4">Follow Us</h3>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-7 h-7 bg-[#1e3a2a] text-white rounded-full flex items-center justify-center text-[14px]">f</a>
              <a href="#" className="w-7 h-7 bg-[#1e3a2a] text-white rounded-full flex items-center justify-center">◎</a>
              <a href="#" className="w-7 h-7 bg-[#1e3a2a] text-white rounded-full flex items-center justify-center">▶</a>
              <a href="#" className="w-7 h-7 bg-[#1e3a2a] text-white rounded-full flex items-center justify-center">P</a>
            </div>
            <p className="text-[#1e3a2a] text-[13px] leading-6 font-medium">
              © <BrandWordmark className="inline-block h-4 w-[90px] align-middle" />™ PRIVATE LIMITED<br/>INC 2026<br/>
              <span className="mt-2 block">34 A Ground Floor, Hauz Khas Fort Rd,<br/>Hauz Khas, New Delhi, Delhi 110016</span>
            </p>
          </div>

          {/* CATEGORIES - FIXED */}
          <div>
            <h3 className="font-bold text-[#1e3a2a] text-[16px] mb-4">Categories</h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#1e3a2a]">
              {footerCategories.map((cat) => (
                <button 
                  key={cat.path} 
                  onClick={() => handleCategoryClick(cat.path)}
                  className="text-left hover:text-[#b85c00] hover:font-semibold transition-all"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#1e3a2a] text-[16px] mb-4">Customer Services</h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#1e3a2a]">
              <button onClick={() => handleLinkClick('/contact')} className="text-left hover:underline">Contact Us</button>
              <Link onClick={() => window.scrollTo(0,0)} to="/faqs">FAQs</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="/track-order">Track Order</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="/refer-friend">Refer a Friend</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#1e3a2a] text-[16px] mb-4">Terms & Condition</h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#1e3a2a]">
            <Link onClick={() => window.scrollTo(0,0)} to="/terms-and-conditions">Terms & Condition</Link>
            <Link onClick={() => window.scrollTo(0,0)} to="/shipping-policy">Shipping Policy</Link>
            <Link onClick={() => window.scrollTo(0,0)} to="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#1e3a2a] text-[16px] mb-4">About</h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#1e3a2a]">
              <button onClick={() => handleLinkClick('/about')} className="text-left hover:underline">About Us</button>
              <Link onClick={() => window.scrollTo(0,0)} to="#">Media & Awards</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="#">Certificates</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="#">Careers</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[#f0eee6] bg-[#fdf8e7] px-6 py-4 overflow-hidden">
        <p className="relative z-10 text-center text-[#1e3a2a] text-[13px] md:text-[14px] font-bold tracking-wide">
          © 2026 <BrandWordmark className="inline-block h-5 w-[108px] align-middle" />™ All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;