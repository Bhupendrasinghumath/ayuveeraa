import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleGenerateOTP = () => {
    if (phone.length !== 10) {
      alert("Please enter 10 digit number");
      return;
    }
    setStep(2);
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      alert("Enter 4 digit OTP");
      return;
    }
    localStorage.setItem("isLoggedIn", "true");
    alert("Login Success!");
    navigate("/");
  };

  return (
    <div className="w-full bg-white min-h-[70vh]">
      
      {/* CENTER CONTAINER -  */}
      <div className="flex justify-center items-start pt-12 md:pt-20 px-4">
        <div className="w-full max-w-[380px]">
          
          {step === 1 ? (
            // STEP 1 - LOGIN
            <div>
              <h2 className="text-[22px] font-bold">Log In</h2>
              <p className="text-[13px] text-black/60 mt-1">Enter your phone number to proceed</p>

              <div className="mt-8 flex items-center border-b border-black/20 pb-2">
                <span className="text-[14px] font-medium mr-2">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="7999876787"
                  className="flex-1 text-[14px] outline-none bg-transparent"
                />
              </div>

              <button
                onClick={handleGenerateOTP}
                className="mt-6 w-full bg-[#0e8a7f] hover:bg-[#0a6e66] text-white text-[13px] font-bold py-[12px] rounded-[4px]"
              >
                Generate OTP
              </button>

              <p className="text-[10px] text-black/50 mt-3 text-center leading-4">
                By entering phone number, I accept the <span className="underline font-semibold">Terms & Conditions</span> and <span className="underline font-semibold">Privacy Policy</span>
              </p>
            </div>
          ) : (
            // STEP 2 - VERIFY OTP
            <div>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setStep(1)} className="text-[18px]">←</button>
                <h2 className="text-[14px] font-bold uppercase tracking-wide">Verify Details</h2>
              </div>

              <div className="border rounded-[8px] p-3 w-[130px] bg-[#f9f9f9] mb-6">
                <p className="text-[10px] text-black/60">Phone</p>
                <p className="text-[12px] font-bold mt-1">+91 {phone}</p>
              </div>

              <p className="text-[12px] font-medium mb-2">ENTER OTP</p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="1234"
                className="w-full border border-black/20 rounded-[6px] py-3 px-4 text-[16px] font-bold tracking-[8px] outline-none focus:border-[#0e8a7f] text-center"
              />

              <p className="text-[11px] text-black/60 mt-3 text-center">
                Haven't received your code? <span className="underline font-semibold cursor-pointer">Resend</span>
              </p>

              <button
                onClick={handleVerifyOTP}
                className="mt-6 w-full bg-[#0e8a7f] hover:bg-[#0a6e66] text-white text-[13px] font-bold py-[12px] rounded-[4px]"
              >
                Submit OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}