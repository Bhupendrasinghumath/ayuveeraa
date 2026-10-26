import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { products } from "../data/product.js";

// Sirf 2-3 special products ke liye extra likho, baaki automatic
const extraDetails = {
  1: {
    tagline: "Healthy Weight Gain | 100% Ayurvedic",
    discount: "30% OFF",
    benefits: [
      { icon: "💪", title: "Healthy Weight Gain", desc: "Gain weight naturally without fat" },
      { icon: "🌿", title: "100% Ayurvedic", desc: "No side effects, lab tested" },
      { icon: "⚡", title: "Boosts Energy", desc: "Improves strength & stamina" },
      { icon: "😋", title: "Improves Appetite", desc: "Boosts digestion naturally" },
    ],
    ingredients: "Ashwagandha - 150mg, Shatavari - 100mg, Safed Musli - 100mg, Kaunch Beej - 75mg, Vidarikand - 75mg",
    howToUse: "Take 2 capsules twice a day with milk after meals. Continue for 90 days.",
  },
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseProduct = products.find(p => p.id === parseInt(id));
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [openAcc, setOpenAcc] = useState("desc");

  if (!baseProduct) {
    return <div className="p-10 text-center">Product Not Found - <Link to="/products" className="underline">Go to Products</Link></div>;
  }

  // AUTOMATIC DETAILS FOR ALL 42 PRODUCTS
  const autoExtra = {
    tagline: `${baseProduct.category} | 100% Ayurvedic | Lab Tested`,
    discount: `SAVE ₹${baseProduct.oldPrice - baseProduct.price}`,
    benefits: [
      { icon: "🌿", title: "100% Ayurvedic", desc: "Lab tested, natural herbs" },
      { icon: "✅", title: "No Side Effects", desc: "Safe for daily use" },
      { icon: "⭐", title: `${baseProduct.rating} Rated`, desc: `${baseProduct.reviews} happy customers` },
      { icon: "💪", title: baseProduct.category, desc: "Trusted by thousands" },
    ],
    highlights: [baseProduct.category, "60 Capsules", "Free Shipping", "Made in India"],
    description: baseProduct.description || `${baseProduct.name} is a powerful Ayurvedic formulation for ${baseProduct.category}. Made with pure herbs, no side effects.`,
    ingredients: `${baseProduct.category} herbs blend - As per Ayurveda classical formulation`,
    howToUse: "Take as directed on pack. For best results continue for 90 days.",
    faq: [
      { q: `${baseProduct.name} kaise kaam karta hai?`, a: baseProduct.description },
      { q: "Koi side effect hai?", a: "Nahi, ye 100% Ayurvedic hai, lab tested hai." },
      { q: "Kitne din me result ayega?", a: "15-20 din me fark dikhna shuru, 90 din me best result." },
    ]
  };

  const extra = { ...autoExtra, ...(extraDetails[baseProduct.id] || {}) };
  const product = { ...baseProduct, ...extra };
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const ex = cart.find(c => c.id === product.id);
    if (ex) ex.quantity += qty; else cart.push({ ...product, quantity: qty, mainImg: images[0] });
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/cart");
  };

  return (
    <div className="w-full bg-[#fdf9ed] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="text-[11px] text-black/50"><Link to="/">Home</Link> / <Link to="/products">All Products</Link> / <span className="font-bold text-black">{product.name}</span></div>
        <div className="flex flex-col md:flex-row gap-8 mt-6">
          <div className="md:w-[55%]">
            <div className="bg-white border rounded-[18px] p-3">
              <img src={images[activeImg]} alt={product.name} className="w-full h-[380px] md:h-[520px] object-contain md:object-cover rounded-[14px]" />
            </div>
            <div className="flex gap-3 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-[80px] h-[80px] rounded-[12px] overflow-hidden border-2 shrink-0 ${activeImg === i ? "border-[#102e22]" : "border-black/10"}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="md:w-[45%]">
            <p className="text-[10px] font-bold tracking-[2px] text-[#0e8a7f]">AYUVYA • 100% AYURVEDIC</p>
            <h1 className="text-[22px] md:text-[30px] font-bold leading-tight mt-2">{product.name}</h1>
            <p className="text-[13px] text-black/60 mt-1">{product.tagline}</p>
            <div className="flex items-center gap-2 mt-3"><span className="bg-black text-white text-[11px] px-2.5 py-1 rounded-full font-bold">★ {product.rating}</span><span className="text-[11px] underline">{product.reviews} Reviews</span><span className="text-[11px] text-green-700 ml-2">✓ In Stock</span></div>
            <div className="flex items-end gap-3 mt-4"><p className="text-[28px] font-bold">₹{product.price}</p><p className="text-[15px] line-through text-black/40">₹{product.oldPrice}</p><span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full">{product.discount}</span></div>
            <div className="flex flex-wrap gap-2 mt-4">{product.highlights.map((h, i) => (<span key={i} className="text-[10px] font-bold border bg-white px-3 py-1.5 rounded-full">{h}</span>))}</div>
            <div className="grid grid-cols-2 gap-2 mt-5">
              {product.benefits.map((b, i) => (
                <div key={i} className="bg-white border rounded-[12px] p-3 flex gap-2"><span className="text-[18px]">{b.icon}</span><div><p className="text-[11px] font-bold">{b.title}</p><p className="text-[10px] text-black/60 leading-3 mt-0.5">{b.desc}</p></div></div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <div className="flex items-center border bg-white rounded-full px-2"><button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-10">-</button><span className="w-8 text-center font-bold text-[13px]">{qty}</span><button onClick={() => setQty(qty + 1)} className="w-8 h-10">+</button></div>
              <button onClick={addToCart} className="flex-1 bg-white border border-black rounded-full text-[13px] font-bold py-3">Add to Cart</button>
              <button onClick={addToCart} className="flex-1 bg-[#102e22] text-white rounded-full text-[13px] font-bold py-3">Buy Now</button>
            </div>
            <div className="bg-[#FFD400] text-[11px] font-bold text-center py-2.5 rounded-full mt-4">GET EXTRA 5% OFF ON PREPAID ORDERS</div>
            <div className="mt-6 bg-white border rounded-[16px] divide-y">
              {[{ k: "desc", t: "Description", c: product.description },{ k: "ing", t: "Ingredients", c: product.ingredients },{ k: "use", t: "How To Use", c: product.howToUse }].map(item => (
                <div key={item.k}><button onClick={() => setOpenAcc(openAcc === item.k ? "" : item.k)} className="w-full flex justify-between p-4 text-[13px] font-bold">{item.t}<span className="text-[16px]">{openAcc === item.k ? "−" : "+"}</span></button>{openAcc === item.k && <p className="px-4 pb-4 text-[12px] text-black/70 leading-5">{item.c}</p>}</div>
              ))}
            </div>
            <div className="mt-4 bg-white border rounded-[16px] p-4"><h3 className="font-bold text-[13px] mb-3">Frequently Asked Questions</h3>{product.faq.map((f, i) => (<div key={i} className="mb-3 last:mb-0"><p className="text-[12px] font-bold">Q. {f.q}</p><p className="text-[11px] text-black/60 mt-1">Ans: {f.a}</p></div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}