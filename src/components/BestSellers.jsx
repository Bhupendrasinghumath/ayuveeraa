import { Link } from "react-router-dom";
import ProductCard from './ProductCard';
import { useProducts } from '../context/useProducts';

export default function BestSellers() {
  const { products } = useProducts();

  return (
    <div className="bg-[#fbf8ee] py-14 px-6">
      <div className="max-w-[1200px] mx-auto">
        <p className="text-center text-[11px] tracking-[0.3em] font-bold text-[#5a6d3a]">OUR POPULAR PICKS</p>
        <h2 className="text-center text-[26px] md:text-3xl font-black text-[#1a3d2e] mt-3">Our Best Sellers</h2>
        <p className="text-center text-[13px] text-gray-500 mt-2">Explore our collection of nature-inspired essentials.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/products" className="inline-block bg-black text-white px-8 py-3 rounded-full text-xs font-bold">Shop All Products</Link>
        </div>
      </div>
    </div>
  );
}