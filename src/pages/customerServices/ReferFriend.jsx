import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function ReferFriend(){
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [referData, setReferData] = useState({
    code: "AYUVEERA100",
    earnings: 0,
    referrals: 0
  });

  // 1. Check login on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    // Agar login nahi hai to direct login pe bhejo 
    if(!token || token === "null"){
      navigate("/login?redirect=/refer-a-friend");
      return;
    }

    if(storedUser){
      setUser(JSON.parse(storedUser));
    }

    // API INTEGRATION - then uncomment 
    // fetchReferData();
  }, []);

  // 2. Future API function - 
  const fetchReferData = async () => {
    try {


    } catch (error) {
      console.log("Refer API Error", error);
    }
  };

  const handleShare = () => {
    const message = `Check out Ayuveeraa Ayurveda! Use my code ${referData.code} to get extra discount. Shop now: https://ayuveeraa.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");

    // TODO: API - Share count update
    // await fetch('/api/refer/share', { method: 'POST' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referData.code);
    alert("Code Copied!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center py-10 bg-white min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-2">Refer & Earn</h1>
      <p className="text-gray-600 mb-6 text-sm">Invite your friends and earn 10% on every order they place.</p>
      
      {/* Referral Code Box */}
      <div className="bg-[#f0fdf4] border-2 border-dashed border-green-300 p-4 rounded-xl">
        <p className="text-xs text-gray-500">YOUR REFERRAL CODE</p>
        <div className="flex justify-center items-center gap-3 mt-1">
          <span className="text-xl font-bold tracking-widest">{referData.code}</span>
          <button onClick={handleCopy} className="text-xs bg-black text-white px-3 py-1 rounded-full">Copy</button>
        </div>
      </div>

      {/* Stats - for  API  ready */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-[#fdf6ef] p-4 rounded-xl">
          <p className="text-2xl font-bold">{referData.referrals}</p>
          <p className="text-xs text-gray-500">Friends Referred</p>
        </div>
        <div className="bg-[#fdf6ef] p-4 rounded-xl">
          <p className="text-2xl font-bold">₹{referData.earnings}</p>
          <p className="text-xs text-gray-500">Total Earnings</p>
        </div>
      </div>

      <button onClick={handleShare} className="mt-6 w-full bg-[#1a3c34] text-white px-6 py-3 rounded-full font-semibold">
        Share on WhatsApp
      </button>

      <p className="text-[11px] text-gray-400 mt-4">*Earnings will be credited after your friend's first order delivery</p>
    </div>
  )
}