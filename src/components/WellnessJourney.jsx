import { useNavigate } from "react-router-dom";

const pills = [
  { 
    title: "Weight Management", 
    slug: "weight-management",
    category: "Weight Management",
    img: "/src/assets/letsgain.webp" 
  },
  { 
    title: "Sugar Management", 
    slug: "sugar-management",
    category: "Sugar Management",
    img: "/src/assets/OIP.webp" 
  },
  { 
    title: "Daily Ayurveda", 
    slug: "daily-ayurveda",
    category: "Daily Ayurveda",
    img: "/src/assets/hero3.webp" 
  },
  { 
    title: "Shop Popular Combos", 
    slug: "popular-combos",
    category: "Popular Combos",
    img: "/src/assets/hero4.webp" 
  },
];

export default function WellnessJourney() {
  const navigate = useNavigate();

  const handlePillClick = (pill) => {
    navigate(`/products?category=${pill.slug}`, { 
      state: { categoryName: pill.category, categorySlug: pill.slug } 
    });
  };

  return (
    <div className="w-full bg-[#1e3d2c] mt-2">
        
      {/* === MARQUEE WAPAS LAGA DIYA - NO BREAK, CONTINUOUS === */}
      <div className="bg-[#1e3d2c] border-y border-white/10 py-[7px] overflow-hidden">
        <div className="animate-marquee flex w-max">
          <div className="flex gap-10 pr-10 whitespace-nowrap text-white text-[11px] md:text-[12px] tracking-wide">
            <span>✦ Crafted by Certified Ayurvedic Experts</span>
            <span>✦ Made to Support Your Wellness Journey</span>
            <span>✦ Ancient Wisdom, Modern Formulations</span>
            <span>✦ Crafted by Certified Ayurvedic Experts</span>
            <span>✦ Made to Support Your Wellness Journey</span>
          </div>
          <div className="flex gap-10 pr-10 whitespace-nowrap text-white text-[11px] md:text-[12px] tracking-wide" aria-hidden="true">
            <span>✦ Crafted by Certified Ayurvedic Experts</span>
            <span>✦ Made to Support Your Wellness Journey</span>
            <span>✦ Ancient Wisdom, Modern Formulations</span>
            <span>✦ Crafted by Certified Ayurvedic Experts</span>
            <span>✦ Made to Support Your Wellness Journey</span>
          </div>
        </div>
      </div>

      {/* === PILLS - CLICK PE DIRECT CATEGORY DETAILS === */}
      <div className="flex justify-center items-center gap-3 px-3 py-4 overflow-x-auto scrollbar-hide">
        {pills.map((pill) => (
          <button
            key={pill.slug}
            onClick={() => handlePillClick(pill)}
            className="min-w-[280px] md:min-w-[300px] h-[90px] bg-[#fdf6e3] rounded-[16px] flex items-center justify-between pl-5 pr-2.5 shrink-0 cursor-pointer hover:scale-[1.03] transition-all duration-200 shadow-md active:scale-[0.98]"
          >
            <p className="text-[13px] font-extrabold leading-[14px] text-[#122d22] w-[70px] text-left">
              {pill.title}
            </p>
            <div className="flex items-center gap-2">
              <img 
                src={pill.img} 
                alt={pill.title} 
                className="w-[125px] h-[68px] object-contain rounded-md" 
              />
              <div className="w-9 h-9 rounded-full bg-[#122d22] text-white flex items-center justify-center text-[16px]">
                →
              </div>
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 22s linear infinite;
        }
      `}</style>
    </div>
  );
}