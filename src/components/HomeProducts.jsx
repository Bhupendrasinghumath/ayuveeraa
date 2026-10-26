import { Link } from "react-router-dom";

const products = [
  { id: 1, name: "i-Gain+ Weight Gain Capsules", price: 699, cut: 999, img: "🌿" },
  { id: 2, name: "Diabo Plus Shots - 30 Shots", price: 799, cut: 1199, img: "🍃" },
  { id: 3, name: "Weight Support Combo", price: 1898, cut: 2499, img: "💪" },
  { id: 4, name: "Liver Detox Capsules", price: 599, cut: 899, img: "🌱" },
];

export default function HomeProducts() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <Link key={p.id} to={`/product/${p.id}`} className="bg-white border rounded-[16px] p-3 hover:shadow-md transition">
          <div className="bg-[#f9f7ef] rounded-[12px] h-[160px] grid place-items-center text-[50px]">{p.img}</div>
          <h3 className="font-semibold text-[13px] mt-3 leading-4 line-clamp-2">{p.name}</h3>
          <p className="mt-2"><span className="font-bold text-[14px]">₹{p.price}</span> <s className="text-[11px] text-black/40 ml-1">₹{p.cut}</s></p>
          <p className="text-[10px] text-green-700 font-bold mt-1">★ 4.8 | View Details →</p>
        </Link>
      ))}
    </div>
  );
}