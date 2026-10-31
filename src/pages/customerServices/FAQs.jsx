import React, { useState } from 'react';

const faqs = [
  {
    q: "What is the delivery time?",
    a: "Shipment will be delivered in 3-10 working days. Delivery timelines are indicative and may vary depending on your location and courier partner. You will receive a tracking number on your registered Email/WhatsApp."
  },
  {
    q: "What is your Return / Replace policy?",
    a: "If you receive a wrong or damaged item, please contact us within 5-6 working days of delivery with your Order ID, a picture of the product and an unboxing video. Our team will arrange a replacement at no extra cost."
  },
  {
    q: "When will I get my refund?",
    a: "Once the return is approved, the refunded amount will be credited in 3-5 working days in your original mode of payment."
  },
  {
    q: "Is Cash on Delivery (COD) available?",
    a: "Yes, COD is available all over India on selected products. Availability will be shown at checkout."
  },
  {
    q: "How can I contact you?",
    a: "You can email us at care@ayuveeraa.com or call us at +91 8047492971. Our support team is available Mon-Sat, 10 AM to 6 PM."
  },
  {
    q: "Do you provide an invoice?",
    a: "Yes, to support sustainability we provide an e-invoice. It will be sent directly to your Email and WhatsApp after purchase."
  },
  {
    q: "Is AyuVeeraa safe for daily use?",
    a: "Yes, all our products are AYUSH certified, made from classical Ayurvedic ingredients in GMP & ISO certified facilities. No steroids, no artificial colours. If you have a medical condition or are pregnant/lactating, please consult your doctor first."
  },
];

export default function FAQs(){
  const [open,setOpen]=useState(0);
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 text-sm mb-6">Everything you need to know about AyuVeeraa orders & products.</p>
      
      {faqs.map((f,i)=>(
        <div key={i} className="border-b border-gray-200 py-4">
          <button 
            onClick={()=>setOpen(open===i ? -1 : i)} 
            className="font-semibold w-full text-left flex justify-between items-center text-[15px]"
          >
            {f.q}
            <span className="text-xl font-light">{open===i ? '-' : '+'}</span>
          </button>
          {open===i && <p className="mt-3 text-gray-600 text-[14px] leading-6">{f.a}</p>}
        </div>
      ))}
    </div>
  )
}