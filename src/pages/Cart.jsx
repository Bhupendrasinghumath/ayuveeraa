import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { notifyCartUpdated } from "../lib/cart";

function getPrice(item) {
  const raw = item.price ?? 0;
  const amount = typeof raw === "number"
    ? raw
    : Number(String(raw).replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

export default function Cart() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(saved)
        ? saved.map((item) => ({ ...item, quantity: Math.min(99, Math.max(1, Number(item.quantity ?? item.qty) || 1)) }))
        : [];
    } catch {
      return [];
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateQty = (id, type) => {
    const newCart = cart.map((item) => {
      if (item.id === id) {
        const quantity = type === "inc"
          ? Math.min(99, item.quantity + 1)
          : Math.max(1, item.quantity - 1);
        return { ...item, quantity };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    notifyCartUpdated();
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    notifyCartUpdated();
  };

  const total = cart.reduce((acc, item) => acc + getPrice(item) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[65vh] grid place-items-center text-center">
        <div>
          <h1 className="text-[28px] font-black text-[#0f3d2e]">Your Cart is Empty 🛒</h1>
          <Link to="/products" className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-full font-bold text-[13px]">Go to Shop →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-[5%] py-10">
      <h1 className="text-[24px] font-black text-[#0f3d2e]">Your Cart ({cart.length})</h1>
      <div className="mt-6 grid gap-4">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 border rounded-2xl bg-white items-center">
            <img src={item.image} className="w-20 h-20 rounded-xl object-cover bg-[#fdf8f3]" alt="" />
            <div className="flex-1">
              <p className="font-bold text-[14px]">{item.name}</p>
              <p className="font-black mt-1 text-[14px]">₹{getPrice(item).toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-2 mt-2">
                <button aria-label={`Decrease ${item.name} quantity`} disabled={item.quantity <= 1} onClick={() => updateQty(item.id, "dec")} className="w-7 h-7 border rounded-full grid place-items-center disabled:opacity-40">-</button>
                <span className="text-[13px] font-bold">{item.quantity}</span>
                <button aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= 99} onClick={() => updateQty(item.id, "inc")} className="w-7 h-7 border rounded-full grid place-items-center disabled:opacity-40">+</button>
              </div>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-[12px] font-bold text-red-500">Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-[#f5f5f0] rounded-[1.5rem] flex justify-between items-center">
        <div><p className="text-[13px] text-gray-500">Total</p><b className="text-[22px]">₹{total}</b></div>
        <button onClick={() => navigate("/checkout")} className="bg-[#0f3d2e] text-white px-8 py-3 rounded-full font-bold text-[13px]">Buy Now ⚡</button>
      </div>
    </div>
  );
}