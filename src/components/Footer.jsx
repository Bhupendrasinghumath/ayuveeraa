import { Link, useNavigate } from 'react-router-dom';

function Footer() {
  const navigate = useNavigate();

  const handleCategoryClick = (slug) => {
    navigate(`/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (to) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerCategories = [
    { name: "Weight Management", slug: "products/weight-management" },
    { name: "Hair Care", slug: "products/hair-care" },
    { name: "Skin Care", slug: "products/skin-care" },
    { name: "Stress Management", slug: "products/stress-management" },
    { name: "Blood Purifier", slug: "products/blood-purifier" },
    { name: "Digestion Support", slug: "products/digestion-support" },
    { name: "Heart Care", slug: "products/heart-care" },
    { name: "Sugar Management", slug: "products/sugar-management" },
  ];

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
      
      {/* ===== 1. TOP BANNER  ===== */}
      <div className="relative w-full h-[180px] md:h-[220px] bg-[#c2c67e] flex items-center justify-center overflow-hidden">
        {/* Left Flowers */}
        <div className="absolute left-0 bottom-0 top-0 w-[200px] md:w-[300px] pointer-events-none">
          <svg viewBox="0 0 300 220" className="w-full h-full" fill="none">
            <g>
              <ellipse cx="20" cy="80" rx="28" ry="32" fill="#f4a261"/>
              <ellipse cx="20" cy="80" rx="12" ry="14" fill="#1a1a1a"/>
              <circle cx="45" cy="130" r="24" fill="#e85d3f"/>
              <circle cx="45" cy="130" r="12" fill="#1a1a1a"/>
              <circle cx="95" cy="155" r="18" fill="#e85d3f"/>
              <circle cx="95" cy="155" r="8" fill="#1a1a1a"/>
              <path d="M30 180 Q60 160 110 140" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
              <ellipse cx="95" cy="180" rx="32" ry="12" fill="#1a1a1a" transform="rotate(-20 95 180)"/>
              <ellipse cx="115" cy="165" rx="28" ry="10" fill="#1a1a1a" transform="rotate(-15 115 165)"/>
            </g>
          </svg>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-[200px] md:w-[300px] pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 300 220" className="w-full h-full" fill="none">
            <g>
              <ellipse cx="20" cy="80" rx="28" ry="32" fill="#f4a261"/>
              <ellipse cx="20" cy="80" rx="12" ry="14" fill="#1a1a1a"/>
              <circle cx="45" cy="130" r="24" fill="#e85d3f"/>
              <circle cx="45" cy="130" r="12" fill="#1a1a1a"/>
              <circle cx="95" cy="155" r="18" fill="#e85d3f"/>
              <circle cx="95" cy="155" r="8" fill="#1a1a1a"/>
              <path d="M30 180 Q60 160 110 140" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
              <ellipse cx="95" cy="180" rx="32" ry="12" fill="#1a1a1a" transform="rotate(-20 95 180)"/>
              <ellipse cx="115" cy="165" rx="28" ry="10" fill="#1a1a1a" transform="rotate(-15 115 165)"/>
            </g>
          </svg>
        </div>
        <h2 className="relative z-10 text-[42px] md:text-[64px] font-extralight tracking-[12px] md:tracking-[18px] text-white font-sans">
           ΛYUVEERΛ™
         </h2>
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
              © ΛYUVEERΛ™ PRIVATE LIMITED<br/>INC 2026<br/>
              <span className="mt-2 block">34 A Ground Floor, Hauz Khas Fort Rd,<br/>Hauz Khas, New Delhi, Delhi 110016</span>
            </p>
          </div>

          {/* CATEGORIES - FIXED */}
          <div>
            <h3 className="font-bold text-[#1e3a2a] text-[16px] mb-4">Categories</h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#1e3a2a]">
              {footerCategories.map((cat) => (
                <button 
                  key={cat.slug} 
                  onClick={() => handleCategoryClick(cat.slug)}
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
              <Link onClick={() => window.scrollTo(0,0)} to="#">FAQs</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="#">Track Order</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="#">Refer a Friend</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#1e3a2a] text-[16px] mb-4">Terms & Condition</h3>
            <div className="flex flex-col gap-2 text-[13px] text-[#1e3a2a]">
              <Link onClick={() => window.scrollTo(0,0)} to="#">Terms & Condition</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="#">Shipping Policy</Link>
              <Link onClick={() => window.scrollTo(0,0)} to="#">Privacy Policy</Link>
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

      <div className="relative bg-[#1a3526] px-6 py-4 overflow-hidden">
        <p className="relative z-10 text-center text-white text-[13px] md:text-[14px] font-bold tracking-wide">
          © 2026 ΛYUVEERΛ™ All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;