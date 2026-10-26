import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Checkouts() {
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    address: "", 
    city: "", 
    pincode: "", 
    payment: "COD" 
  });
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  //  FIX ADDED  - 
  const getPrice = (item) => {
    const raw = item.price || 0;
    
    const num = parseInt(String(raw).replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  const getQty = (item) => {
    return item.quantity || item.qty || 1;
  };

  const total = cart.reduce((sum, item) => {
    return sum + getPrice(item) * getQty(item);
  }, 0);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.pincode) {
        alert("Please fill all required fields!");
      return;
    }
    alert(`Order Placed! 🎉 Total: ₹${total}`);
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("storage"));
    navigate("/order-success");
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="bg-white border p-6 rounded-2xl">
        <h2 className="font-black text-lg mb-4">Delivery Address</h2>
        <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">
          <input name="name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Full Name *" className="border p-3 rounded-xl text-sm" />
          <input name="phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="Phone *" className="border p-3 rounded-xl text-sm" />
          <textarea name="address" value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} placeholder="Full Address *" rows="3" className="border p-3 rounded-xl text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})} placeholder="City" className="border p-3 rounded-xl text-sm" />
            <input name="pincode" value={form.pincode} onChange={(e)=>setForm({...form, pincode:e.target.value})} placeholder="Pincode *" className="border p-3 rounded-xl text-sm" />
          </div>
          <div className="flex gap-2 mt-2 text-sm">
            <label className="border p-2 rounded-xl flex-1 cursor-pointer"><input type="radio" checked={form.payment==="COD"} onChange={()=>setForm({...form, payment:"COD"})} /> COD</label>
            <label className="border p-2 rounded-xl flex-1 cursor-pointer"><input type="radio" checked={form.payment==="Online"} onChange={()=>setForm({...form, payment:"Online"})} /> Online</label>
          </div>
          <button type="submit" className="bg-[#0f3d2e] text-white py-3 rounded-full font-bold mt-3">Place Order ₹{total} ⚡</button>
        </form>
      </div>

      <div className="bg-[#f9faf6] border p-6 rounded-2xl h-fit">
        <h3 className="font-black mb-3">Order Summary ({cart.length})</h3>
        {cart.map(i=>(
          <div key={i.id} className="flex justify-between text-sm py-2 border-b">
            <span>{i.name} x {getQty(i)}</span><b>₹{getPrice(i) * getQty(i)}</b>
          </div>
        ))}
        <div className="flex justify-between font-black text-lg mt-4"><span>Total</span><span>₹{total}</span></div>
        <Link to="/cart" className="block text-center mt-4 text-sm underline">Back to Cart</Link>
      </div>
    </div>
  );
}