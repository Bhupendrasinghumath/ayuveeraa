import { Link } from "react-router-dom";

const products = [
  { id: 1, category: "Hair Care", name: "Herbal Hair Oil", rating: "4.8", desc: "A nature-inspired hair care essential.", price: 499, mrp: 699, off: "29% OFF", emoji: "🌿" },
  { id: 2, category: "Skin Care", name: "Herbal Face Wash", rating: "4.6", desc: "A gentle cleanser for your daily routine.", price: 299, mrp: 399, off: "25% OFF", emoji: "🧴" },
  { id: 3, category: "Skin Care", name: "Aloe Vera Gel", rating: "4.7", desc: "A refreshing addition to your skincare routine.", price: 249, mrp: 349, off: "29% OFF", emoji: "🌵" },
  { id: 4, category: "Body Care", name: "Boob Growth Oil", rating: "4.9", desc: "With Shatavari & Ashwagandha", price: 549, mrp: 999, off: "45% OFF", emoji: "💧" },
  { id: 5, category: "Men's Wellness", name: "Boost Performance", rating: "4.8", desc: "With Ashwagandha & Safed Musli", price: 699, mrp: 1299, off: "46% OFF", emoji: "⚡" },
  { id: 6, category: "Weight Management", name: "Weight Gain Capsule", rating: "4.7", desc: "Lose Weight Naturally", price: 599, mrp: 1199, off: "50% OFF", emoji: "💪" },
];

export default function BestSellers() {
  return (
    <div className="bg-[#fbf8ee] py-14 px-6">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-center text-[11px] tracking-[0.3em] font-bold text-[#5a6d3a]">OUR POPULAR PICKS</p>
        <h2 className="text-center text-[26px] md:text-3xl font-black text-[#1a3d2e] mt-3">Our Best Sellers</h2>
        <p className="text-center text-[13px] text-gray-500 mt-2">Explore our collection of nature-inspired essentials.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8">
          {products.map((p) => (
            <div key={p.id} className="bg-[#f5f1e6] rounded-2xl overflow-hidden border border-[#e5e8dc] hover:shadow-lg transition">
              <div className="relative h-[180px] md:h-[220px] bg-[#f5f1e6] grid place-items-center">
                <span className="absolute top-3 left-3 bg-[#1a3d2e] text-white text-[10px] font-bold px-2 py-1 rounded">{p.off}</span>
                <span className="text-[56px]">{p.emoji}</span>
              </div>

              <div className="bg-white p-4">
                <p className="text-[11px] text-[#8a9a6a] font-bold">{p.category}</p>
                <h3 className="font-bold text-[#1a3d2e] mt-1 text-[14px] line-clamp-1">{p.name}</h3>
                <p className="text-[11px] text-gray-500 mt-1">★ {p.rating} / 5 • {p.desc}</p>
                <div className="flex gap-2 items-center mt-3">
                  <b className="text-[#1a3d2e]">₹{p.price}</b>
                  <span className="text-xs line-through text-gray-400">₹{p.mrp}</span>
                </div>
                <Link to="/products" className="block text-center w-full mt-4 bg-[#1a3d2e] text-white py-2.5 rounded-lg text-[12px] font-bold hover:bg-black transition">
                  Add to Cart
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/products" className="inline-block bg-black text-white px-8 py-3 rounded-full text-xs font-bold">Shop All Products</Link>
        </div>
      </div>
    </div>
  );
}