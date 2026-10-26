import { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value }));
    setSuccessMessage('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log('Contact form data:', formData);
    setSuccessMessage('Thank you! Your message has been submitted successfully.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  }

  return (
    <main className="bg-[#fffdf8] min-h-screen">

      {/* Hero */}
      <section className="py-[60px] px-[7%] text-center bg-gradient-to-br from-[#f5f3e8] to-[#e7edda]">
        <p className="text-[#70844c] text-[11px] font-bold tracking-[2px]">WE ARE HERE TO HELP</p>
        <h1 className="text-[34px] md:text-[46px] font-black text-[#254c35] mt-4">Contact Us</h1>
        <p className="max-w-[650px] mx-auto mt-4 text-[#626c60] leading-7">Have a question about our products or need assistance? Send us a message and we will be happy to help.</p>
      </section>

      {/* Main */}
      <section className="max-w-[1300px] mx-auto px-[7%] py-12 grid md:grid-cols-[0.9fr_1.1fr] gap-10">

        {/* Info */}
        <div>
          <p className="text-[#70844c] text-[11px] font-bold tracking-[2px]">GET IN TOUCH</p>
          <h2 className="text-[26px] md:text-[30px] font-bold text-[#254c35] mt-2">We'd Love to Hear From You</h2>
          <p className="text-[#687266] leading-7 mt-3 text-[14px]">Have questions, suggestions or feedback? Fill out the form and tell us how we can help.</p>

          <div className="mt-6 space-y-4">
            <div className="flex gap-4 p-4 border border-[#e5e8dc] rounded-xl bg-[#f5f3e8]">
              <span className="text-2xl">📧</span>
              <div><h3 className="font-bold text-[#254c35]">Email</h3><p className="text-sm text-[#687266] mt-1">support@example.com</p></div>
            </div>
            <div className="flex gap-4 p-4 border border-[#e5e8dc] rounded-xl bg-[#f5f3e8]">
              <span className="text-2xl">🕒</span>
              <div><h3 className="font-bold text-[#254c35]">Working Hours</h3><p className="text-sm text-[#687266] mt-1">Monday – Saturday<br/>10:00 AM – 6:00 PM</p></div>
            </div>
            <div className="flex gap-4 p-4 border border-[#e5e8dc] rounded-xl bg-[#f5f3e8]">
              <span className="text-2xl">🌿</span>
              <div><h3 className="font-bold text-[#254c35]">Customer Support</h3><p className="text-sm text-[#687266] mt-1">We're here to answer your questions.</p></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 border border-[#e5e8dc] rounded-xl bg-white shadow-[0_5px_20px_#243b2b08] h-fit">
          <h2 className="text-[26px] font-bold text-[#254c35] mb-6">Send Us a Message</h2>

          {[
            { label: 'Full Name', id: 'name', type: 'text', placeholder: 'Enter your name' },
            { label: 'Email Address', id: 'email', type: 'email', placeholder: 'Enter your email' },
            { label: 'Subject', id: 'subject', type: 'text', placeholder: 'Enter subject' },
          ].map(f => (
            <div key={f.id} className="flex flex-col gap-2 mb-5">
              <label htmlFor={f.id} className="text-[#354439] text-sm font-semibold">{f.label}</label>
              <input id={f.id} type={f.type} name={f.id} placeholder={f.placeholder} value={formData[f.id]} onChange={handleChange} required
                className="w-full p-3 border border-[#dce3d5] rounded-md bg-[#fffdf8] text-sm focus:outline-none focus:ring-2 focus:ring-[#78934d]" />
            </div>
          ))}

          <div className="flex flex-col gap-2 mb-5">
            <label htmlFor="message" className="text-[#354439] text-sm font-semibold">Message</label>
            <textarea id="message" name="message" rows="5" placeholder="Write your message here..." value={formData.message} onChange={handleChange} required
              className="w-full p-3 border border-[#dce3d5] rounded-md bg-[#fffdf8] text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#78934d]" />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-md bg-[#254c35] text-white text-sm font-bold hover:bg-[#426b48] transition">Send Message →</button>

          {successMessage && (
            <p className="mt-4 p-3 rounded-md bg-[#e7edda] text-[#254c35] text-sm leading-6">{successMessage}</p>
          )}
        </form>

      </section>
    </main>
  );
}

export default Contact;