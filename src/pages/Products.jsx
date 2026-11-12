import ProductCard from '../components/ProductCard.jsx';
import { useProducts } from '../context/useProducts.js';
import { categories as productCategories } from '../data/categories.js';
import { useSearchParams } from 'react-router-dom';

export default function Products() {
  const { products, loading, catalogError } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get("category");
  const selectedCategory = productCategories.find(
    (category) => category.path.split("/").pop() === selectedSlug
  );
  const selected = selectedCategory?.name ?? "All Products";
  const categories = productCategories.map((category) => category.name);

  const filtered = selected === "All Products" ? products : products.filter(p => p.category === selected);

  const selectCategory = (categoryName) => {
    if (categoryName === "All Products") {
      setSearchParams({});
      return;
    }

    const category = productCategories.find((item) => item.name === categoryName);
    if (!category) return;
    setSearchParams({ category: category.path.split("/").pop() });
  };

  return (
    <div className="bg-[#fffcf0] min-h-screen">
      <div className="max-w-[1350px] mx-auto flex">
        <div className="hidden md:block w-[220px] shrink-0 p-6">
          <p className="text-[11px] tracking-[2px] text-gray-400 font-bold mb-4">CATEGORIES</p>
          <div className="space-y-1">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={()=>selectCategory(cat)}
                className={`block w-full text-left text-[13px] py-2.5 px-2 rounded ${selected===cat ? 'bg-[#fff3e0] text-[#b85c00] font-bold' : 'text-[#333] hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white md:border-l">
          <div className="p-5 md:p-7">
            <p className="text-[11px] text-gray-500">Home / {selected}</p>
            <h1 className="text-[22px] font-bold mt-2">{selected === "All Products" ? "Ayurvedic Products" : selected}</h1>
            <p className="text-[12px] text-gray-600 mt-2 leading-6 max-w-[900px]">
              Discover Ayuvya, your Gateway to Natural Wellness. Our carefully selected range of Ayurvedic health supplements and herbal health care products, crafted by expert vaidyas.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {filtered.map(p => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
            {!loading && !catalogError && filtered.length === 0 && (
              <p className="mt-8 text-center text-sm text-gray-500">No products found in this category.</p>
            )}

          
          </div>
        </div>
      </div>
    </div>
  );
}