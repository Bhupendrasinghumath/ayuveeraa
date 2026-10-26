import { Link } from 'react-router-dom';

export default function ProductCard({ p }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[12px] overflow-hidden">
      <div className="bg-black text-white text-[9px] font-bold tracking-wide text-center py-[5px]">
        As Seen On <span className="text-[#5ab0e6]">SHARK TANK</span> <span className="text-[#f7d54a]">INDIA</span>
      </div>
      <Link to={`/product/${p.id}`} className="bg-[#f9f3e8] h-[210px] flex items-center justify-center p-4">
        <img src={p.image} className="h-[160px] object-contain" alt={p.name}/>
      </Link>
      <div className="p-3 text-center">
        <h3 className="text-[13px] font-bold leading-[16px] line-clamp-2 min-h-[32px]">{p.name}</h3>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="text-[#ffc800] text-[12px]">★★★★★</span>
          <span className="text-[11px] text-gray-600">{p.reviews || "25000+"} Reviews</span>
        </div>
        <div className="mt-1">
          <span className="text-[13px] text-gray-400 line-through">₹{p.oldPrice || 1968}</span>
          <span className="text-[15px] font-bold ml-1">₹ {p.price}</span>
        </div>
        <p className="text-[11px] text-gray-500">(save ₹ {p.save || 569})</p>
        <Link to={`/product/${p.id}`} className="mt-3 block bg-[#111] text-white text-[13px] font-bold py-[10px] rounded-[8px] text-center">
          Add To Cart
        </Link>
      </div>
    </div>
  );
}