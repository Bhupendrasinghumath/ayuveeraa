import { Link } from "react-router-dom";

export default function OrderSuccess() {
  return (
    <div className="min-h-[70vh] grid place-items-center text-center px-4">
      <div className="bg-white border p-10 rounded-[2rem] max-w-[400px]">
        <div className="text-[50px]">🎉</div>
        <h1 className="text-[24px] font-black text-[#0f3d2e] mt-3">Order Placed Successfully!</h1>
        <p className="text-[13px] text-gray-500 mt-2">Thank you! Your order will be delivered soon. COD Payment.</p>
        <Link to="/" className="mt-6 inline-block bg-[#0f3d2e] text-white px-8 py-3 rounded-full font-bold text-[13px]">Continue Shopping →</Link>
      </div>
    </div>
  );
}