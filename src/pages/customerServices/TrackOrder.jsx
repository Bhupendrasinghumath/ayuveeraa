import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mostLikedProducts = [
  { id: 1, name: "AyuVeeraa Lets Gain & i-Gain+ Combo", price: 799, mrp: 999, off: "28% OFF", rating: 4.6, img: "/products/lets-gain.png", link: "/product/lets-gain" },
  { id: 2, name: "AyuVeeraa Pyl-Ease Kit - Science-Backed", price: 899, mrp: 1199, off: "24% OFF", rating: 4.5, img: "/products/pyl-ease.png", link: "/product/pyl-ease-1" },
  { id: 3, name: "AyuVeeraa Pyl-Ease Kit | 2 Month Pack", price: 1499, mrp: 1999, off: "31% OFF", rating: 4.5, img: "/products/pyl-ease-2.png", link: "/product/pyl-ease-2" },
  { id: 4, name: "AyuVeeraa Dropit Shots | 1 Month Pack", price: 599, mrp: 999, off: "47% OFF", rating: 4.5, img: "/products/dropit.png", link: "/product/dropit" },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [timer, setTimer] = useState({ h: 2, m: 29, s: 48 });
  const navigate = useNavigate();

  useEffect(() => {
    const i = setInterval(() => {
      setTimer(t => {
        let {h,m,s} = t; if(s>0) s--; else {s=59; if(m>0) m--; else {m=59; if(h>0) h--;}} return {h,m,s}
      })
    }, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      
      
      <div className="text-center py-8 bg-[#FFFBF0]">
        <h1 className="text-3xl font-bold">Track Your Order</h1>
        <div className="mt-4 flex justify-center">
          <div className="relative w-[90%] max-w-lg">
            <input value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="Enter Order Id" className="w-full border rounded-full py-3 px-6" />
            <button onClick={()=>alert('Tracking '+orderId)} className="absolute right-3 top-2.5">🔍</button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-bold text-lg mb-4">Most Liked</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {mostLikedProducts.map(p => (
            <div key={p.id} className="min-w-[180px] md:min-w-[220px] bg-[#FDF6EF] rounded-xl overflow-hidden border">
              <div className="relative p-2 cursor-pointer" onClick={()=>navigate(p.link)}>
                <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full">★ {p.rating}</span>
                <span className="absolute top-2 right-2 bg-black text-white text-[10px] w-10 h-10 rounded-full flex items-center justify-center text-center leading-3">{p.off}</span>
                <img src={p.img} className="h-40 w-full object-contain" />
                <div className="bg-[#B91C2C] text-white text-center text-xs py-1">⚡ Flash Deal ⚡</div>
                <div className="flex justify-center gap-1 mt-1 text-[10px]">
                  <span className="bg-red-900 text-white px-1">{String(timer.h).padStart(2,'0')}</span>:
                  <span className="bg-red-900 text-white px-1">{String(timer.m).padStart(2,'0')}</span>:
                  <span className="bg-red-900 text-white px-1">{String(timer.s).padStart(2,'0')}</span>
                </div>
              </div>
              <div className="bg-white p-3">
                <p className="text-xs h-8 line-clamp-2">{p.name}</p>
                <p className="text-xs mt-1">₹{p.price} <span className="line-through text-gray-400">₹{p.mrp}</span></p>
                <button onClick={()=>navigate(`/checkout?product=${p.id}`)} className="w-full bg-[#1a3c34] text-white rounded-full py-1.5 mt-2 text-sm">Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}