import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  const updateQty = (id, type) => {
    let newCart = cart.map(item => {
      if (item.id === id) {
        let newQty = type === "inc" ? (item.qty || 1) + 1 : (item.qty || 1) - 1;
        if (newQty < 1) newQty = 1;
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);

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
              <p className="font-black mt-1 text-[14px]">₹{item.price}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => updateQty(item.id, "dec")} className="w-7 h-7 border rounded-full grid place-items-center">-</button>
                <span className="text-[13px] font-bold">{item.qty || 1}</span>
                <button onClick={() => updateQty(item.id, "inc")} className="w-7 h-7 border rounded-full grid place-items-center">+</button>
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