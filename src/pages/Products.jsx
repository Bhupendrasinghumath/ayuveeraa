import { useState } from 'react';
import { products, categories as catLinks } from '../data/product.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Products() {
  const [selected, setSelected] = useState("All Products");
  
  // Sir wale 12 + All Products
  const categories = ["All Products","Weight Management","Hair Care","Skin Care","Stress Management","Blood Purifier","Digestion Support","Eye Care","Heart Care","Migraine Support","Herbal Shots","Plant Protein Supplement","Sugar Management"];

  const filtered = selected === "All Products" ? products : products.filter(p => p.category === selected);

  return (
    <div className="bg-[#fffcf0] min-h-screen">
      <div className="max-w-[1350px] mx-auto flex">
        <div className="hidden md:block w-[220px] shrink-0 p-6">
          <p className="text-[11px] tracking-[2px] text-gray-400 font-bold mb-4">CATEGORIES</p>
          <div className="space-y-1">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={()=>setSelected(cat)} 
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
              {filtered.map(p => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>

            {selected === "All Products" && (
              <div className="mt-16 border-t pt-10 text-[#333] leading-7">
                <h2 className="text-[22px] font-bold mb-3">Understanding Ayurvedic Medicine</h2>
                <p className="text-[13px] text-gray-600">Ayurvedic medicine, with its roots in ancient India, is more than just a method of treating illness it's a way of life...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}