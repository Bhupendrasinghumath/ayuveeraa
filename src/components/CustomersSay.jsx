import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const reviews = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=700&h=800&fit=crop&crop=top",
    title: "Saw Visible Changes in Just Weeks",
    desc: "Mera weight kaafi time se stuck tha. i-gain+ use karne ke baad dheere dheere difference dikhna start hua. Digest bhi easily ho gaya.",
    name: "Kunal Jaiswal",
    product: "i-Gain+",
    rating: 5,
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=700&h=800&fit=crop&crop=top",
    title: "PCOS symptoms finally under control",
    desc: "I've been dealing with PCOS for years. Tried Varnya & Niruja regularly and within 2 months my periods became regular and bloating reduced.",
    name: "Payal Mishra",
    product: "Varnya & Niruja",
    rating: 5,
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=700&h=800&fit=crop&crop=top",
    title: "Loved this product",
    desc: "i-Gain+ really worked for me! Visible results, no side effects. Perfect for anyone jisko weight gain karna hai. Highly recommend.",
    name: "Sona Sharma",
    product: "i-Gain+",
    rating: 5,
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1615102296061-e2cc9b5a050d?w=700&h=800&fit=crop&crop=top",
    title: "Gained 4kg in 1 month",
    desc: "Best ayurvedic product for girls, no side effects and fully natural. My skin glow also improved. Thank you Ayuvya!",
    name: "Anjali Singh",
    product: "i-Gain+",
    rating: 5,
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&h=800&fit=crop&crop=top",
    title: "Highly Recommended",
    desc: "I was very underweight since childhood. After using i-Gain+ for 2 months, I gained 5kg. Family noticed the difference!",
    name: "Rohit Sharma",
    product: "i-Gain+",
    rating: 5,
  },
];

export default function CustomersSay() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (dir) => {
    scrollRef.current.scrollBy({
      left: dir === "left" ? -380 : 380,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#faf9f6] py-12 md:py-20">
      <div className="max-w-[1240px] mx-auto px-4">
        {/* HEADER - Professional */}
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[3px] font-bold text-[#9ca87a] mb-2 uppercase">
            Real Results • Real People
          </p>
          <h2 className="text-[28px] md:text-[38px] font-black text-[#111] tracking-tight leading-none">
            What Our Customers Say
          </h2>
          <div className="w-[50px] h-[3px] bg-[#1a3a2a] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="relative">
          {/* Arrows - Professional */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-4 top-[42%] z-10 w-11 h-11 bg-white border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-full items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
          >
            <span className="text-[20px]">‹</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-4 top-[42%] z-10 w-11 h-11 bg-white border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-full items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
          >
            <span className="text-[20px]">›</span>
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth py-6 px-1 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {reviews.map((r) => (
              <div
                key={r.id}
                className="group min-w-[310px] md:min-w-[360px] max-w-[360px] bg-white rounded-[20px] overflow-hidden flex-shrink-0 flex flex-col border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image with Badge */}
                <div className="relative h-[340px] overflow-hidden bg-gray-100">
                  <img
                    src={r.img}
                    alt={r.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Shark Tank Badge - Professional */}
                  <div className="absolute top-3 left-3 bg-[#111] text-white text-[8px] font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    AS SEEN ON SHARK TANK INDIA
                  </div>
                  {/* Verified */}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    ✓ Verified Buyer
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-[#ffb800] text-[13px]">★</span>
                    ))}
                    <span className="text-[10px] text-gray-500 ml-2 font-medium">(5.0)</span>
                  </div>

                  <h3 className="font-bold text-[15px] leading-[20px] text-[#111] line-clamp-2 min-h-[40px]">
                    {r.title}
                  </h3>

                  <p className="text-[13px] leading-[19px] text-[#555] mt-3 font-[400] line-clamp-3">
                    "{r.desc}"
                  </p>

                  <div className="flex items-center gap-3 mt-5">
                    <div className="w-8 h-8 rounded-full bg-[#eef2e6] flex items-center justify-center font-bold text-[11px] text-[#1a3a2a]">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-[#111] leading-none">{r.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Ayuvya Customer</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/products")}
                    className="mt-6 w-full bg-[#1a3a2a] hover:bg-black text-white text-[12px] font-bold tracking-wide py-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    Shop {r.product}
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6 md:hidden">← Swipe to see more reviews →</p>
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
}