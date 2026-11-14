import { useState } from 'react';
import { FiArrowRight, FiClock, FiMail, FiMessageSquare, FiPhone } from 'react-icons/fi';
import { apiRequest } from '../lib/api';

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccessMessage('');
    setErrorMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      await apiRequest('contact.php', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccessMessage('Thank you! Your message has been submitted successfully.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const contactDetails = [
    {
      icon: FiMail,
      label: 'Email',
      value: 'care@ayuveeraa.com',
      href: 'mailto:care@ayuveeraa.com',
    },
    {
      icon: FiPhone,
      label: 'Phone',
      value: '+91 8047492971',
      href: 'tel:+918047492971',
    },
    {
      icon: FiClock,
      label: 'Working Hours',
      value: 'Mon – Sat • 10:00 AM – 6:00 PM',
      href: null,
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#24392d]">
      <section className="border-b border-[#e6e8df] bg-[#fffdf8]">
        <div className="mx-auto max-w-[1240px] px-5 py-12 text-center sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#846b42] sm:text-xs">
            <span className="inline-block h-px w-7 align-middle bg-[#a88958]" />
            <span className="ml-3">We are here to help</span>
          </p>
          <h1 className="mt-5 text-[clamp(1.9rem,4vw,3.8rem)] font-bold leading-[1.02] tracking-[-0.035em] text-[#1d382b]">
            Contact us
          </h1>
          <p className="mx-auto mt-4 max-w-[700px] text-sm leading-7 text-[#596354] sm:text-base">
            Have a question about our products, ingredients, or order support? Send us a message and our team will get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] gap-9 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-12 lg:py-20">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9a6f35]">Get in touch</p>
          <h2 className="mt-4 text-[clamp(1.6rem,3.2vw,2.5rem)] font-bold leading-[1.12] text-[#233b2d]">
            We’d love to hear from you.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[#5e6557] sm:text-base">
            Whether you’re looking for product guidance, wellness advice, or support with an order, we’re here to help with thoughtful answers.
          </p>

          <div className="mt-8 space-y-4">
            {contactDetails.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4 rounded-2xl border border-[#e1e6dc] bg-white p-4 shadow-[0_8px_24px_rgba(31,58,44,0.04)] sm:p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#c9b58e] bg-[#f3ead3] text-[#8f6b3b]">
                  <Icon aria-hidden="true" size={18} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#254c35]">{label}</h3>
                  {href ? (
                    <a href={href} className="mt-1 block text-sm text-[#5e6557] transition hover:text-[#9a6f35]">
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-[#5e6557]">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-start gap-4 rounded-2xl border border-[#e1e6dc] bg-[#f5f8f2] p-4 sm:p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#c9b58e] bg-[#e9dcc0] text-[#8f6b3b]">
                <FiMessageSquare aria-hidden="true" size={18} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#254c35]">Customer support</h3>
                <p className="mt-1 text-sm text-[#5e6557]">We’re here to answer questions about products, shipping, and wellness guidance.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="h-fit rounded-[24px] border border-[#ddd0b2] bg-white p-5 shadow-[0_20px_45px_rgba(43,54,46,0.08)] sm:p-7 lg:p-8">
          <h2 className="text-[clamp(1.45rem,2.4vw,1.9rem)] font-bold text-[#254c35]">Send us a message</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {[
              { label: 'Full Name', id: 'name', type: 'text', placeholder: 'Enter your name' },
              { label: 'Email Address', id: 'email', type: 'email', placeholder: 'Enter your email' },
            ].map(field => (
              <div key={field.id} className="flex flex-col gap-2 sm:col-span-1">
                <label htmlFor={field.id} className="text-sm font-semibold text-[#354439]">{field.label}</label>
                <input
                  id={field.id}
                  type={field.type}
                  name={field.id}
                  placeholder={field.placeholder}
                  value={formData[field.id]}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#dce3d5] bg-[#fffdf8] p-3 text-sm text-[#24392d] placeholder:text-[#8b907f] transition focus:border-[#a88958] focus:outline-none focus:ring-2 focus:ring-[#d9ccb4]"
                />
              </div>
            ))}

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="phone" className="text-sm font-semibold text-[#354439]">Mobile Number <span className="font-normal text-[#7b8175]">(optional)</span></label>
              <input
                id="phone"
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                placeholder="Enter your mobile number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#dce3d5] bg-[#fffdf8] p-3 text-sm text-[#24392d] placeholder:text-[#8b907f] transition focus:border-[#a88958] focus:outline-none focus:ring-2 focus:ring-[#d9ccb4]"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="subject" className="text-sm font-semibold text-[#354439]">Subject</label>
              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#dce3d5] bg-[#fffdf8] p-3 text-sm text-[#24392d] placeholder:text-[#8b907f] transition focus:border-[#a88958] focus:outline-none focus:ring-2 focus:ring-[#d9ccb4]"
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="message" className="text-sm font-semibold text-[#354439]">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full resize-y rounded-xl border border-[#dce3d5] bg-[#fffdf8] p-3 text-sm text-[#24392d] placeholder:text-[#8b907f] transition focus:border-[#a88958] focus:outline-none focus:ring-2 focus:ring-[#d9ccb4]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f3a2c] px-5 py-3.5 text-sm font-semibold text-[#fffaf0] transition hover:bg-[#31523c] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Sending...' : 'Send Message'}
            <FiArrowRight aria-hidden="true" />
          </button>

          {successMessage && (
            <p className="mt-4 rounded-xl bg-[#e7edda] p-3 text-sm leading-6 text-[#254c35]">{successMessage}</p>
          )}
          {errorMessage && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">{errorMessage}</p>
          )}
        </form>
      </section>
    </main>
  );
}

export default Contact;