import { Link } from 'react-router-dom';

function About() {
  return (
    <main className="bg-[#fffdf8] min-h-screen text-[#1a3a28] font-sans antialiased">
      {/* HERO - 2 Images Fixed - Hero wala final */}
<section className="max-w-[1300px] mx-auto px-[7%] py-[60px] md:py-[90px] grid md:grid-cols-2 items-center gap-12">
  <div>
    <p className="text-[#7a9a4d] text-[11px] font-extrabold tracking-[3px] uppercase">About Ayurveda • Est. 2026</p>
    <h1 className="mt-5 text-[42px] md:text-[58px] font-black leading-[0.95] tracking-tight">
      Ancient Wisdom <br />For <span className="text-[#7a9a4d] font-serif italic font-normal tracking-normal">Modern Life.</span>
    </h1>
    <p className="mt-6 text-[#4a5a4f] leading-[1.8] text-[15.5px] max-w-[480px] font-medium">
      We started with a simple question - Why are we putting chemicals on our body in the name of wellness? 
      Ayurveda was the answer, and we made it simple, effective & accessible for you.
    </p>
    <div className="flex flex-wrap items-center gap-5 mt-8">
      <Link to="/products" className="px-8 py-3.5 bg-[#254c35] text-white rounded-full text-[13px] font-bold tracking-wide hover:bg-[#1a3826] transition-all shadow-lg shadow-[#254c35]/20">
        Shop Collection
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2.5">
          <img src="https://i.pravatar.cc/40?img=32" className="w-9 h-9 rounded-full border-[2.5px] border-white object-cover" alt="" />
          <img src="https://i.pravatar.cc/40?img=26" className="w-9 h-9 rounded-full border-[2.5px] border-white object-cover" alt="" />
          <img src="https://i.pravatar.cc/40?img=33" className="w-9 h-9 rounded-full border-[2.5px] border-white object-cover" alt="" />
        </div>
        <p className="text-[11px] font-extrabold leading-tight tracking-wide">Trusted by<br/><span className="font-normal text-[#4a5a4f]">10k+ Customers</span></p>
      </div>
    </div>
  </div>
   
  {/* FIXED IMAGES - Ab dono ayengi */}
  <div className="relative">
  <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=700&auto=format&fit=crop" alt="ayurvedic oil" />
  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-5 py-2 rounded-full shadow-lg border text-[11px] font-bold tracking-widest text-[#254c35] whitespace-nowrap">100% AYURVEDIC</div>
</div>
</section>
        
        

      {/* STATS BAR */}
      <section className="bg-[#1e3d2a] text-white">
        <div className="max-w-[1300px] mx-auto px-[7%] py-9 grid grid-cols-3 divide-x divide-white/10 text-center">
          <div><h3 className="text-[32px] font-black tracking-tight">100%</h3><p className="text-[10px] tracking-[2.5px] text-white/60 mt-1 font-bold">NATURAL ORIGIN</p></div>
          <div><h3 className="text-[32px] font-black tracking-tight">0%</h3><p className="text-[10px] tracking-[2.5px] text-white/60 mt-1 font-bold">HARMFUL CHEMICALS</p></div>
          <div><h3 className="text-[32px] font-black tracking-tight">Lab</h3><p className="text-[10px] tracking-[2.5px] text-white/60 mt-1 font-bold">TESTED FORMULAS</p></div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-[1300px] mx-auto px-[7%] py-[90px] grid md:grid-cols-2 gap-16 md:gap-20 items-center">
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80" alt="story" className="w-full h-[520px] object-cover rounded-[2.2rem]" />
          <div className="absolute -bottom-6 -right-2 md:-right-6 bg-[#f5f3e8] p-6 rounded-[1.2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] max-w-[230px] border border-black/[0.04]">
            <p className="text-3xl">🌿</p>
            <p className="text-[13px] font-bold mt-3 leading-snug text-[#254c35]">Directly sourced from organic farms in Kerala & Himalayas</p>
          </div>
        </div>
        <div>
          <p className="text-[#78934d] text-[11px] font-extrabold tracking-[3px]">OUR JOURNEY</p>
          <h2 className="text-[32px] md:text-[38px] font-extrabold leading-[1.1] mt-4 tracking-tight">We Didn't Just Create Products,<br/>We Revived a Ritual.</h2>
          <p className="text-[#5c6b5f] leading-[1.9] mt-5 text-[15px]">In a market full of chemical-laden products with ayurvedic labels, we found a gap. Real Ayurveda was lost. We collaborated with 3rd generation Vaidyas from Kerala to bring back authentic formulations.</p>
          <ul className="mt-7 space-y-3.5 text-[14px] font-medium">
            <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-[#e8f0d9] text-[#5a7a30] flex items-center justify-center text-[12px]">✓</span> No Parabens, Sulphates, Mineral Oil</li>
            <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-[#e8f0d9] text-[#5a7a30] flex items-center justify-center text-[12px]">✓</span> Ethically Sourced & Cruelty Free</li>
            <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-[#e8f0d9] text-[#5a7a30] flex items-center justify-center text-[12px]">✓</span> Clinically Tested on Real People, Not Animals</li>
          </ul>
          <Link to="/products" className="inline-block mt-9 px-7 py-3.5 border border-[#254c35]/20 rounded-full text-[13px] font-bold hover:bg-[#254c35] hover:text-white transition-all">
            Explore Our Process
          </Link>
        </div>
      </section>


    {/* FOUNDER  */}
<section className="bg-white py-[80px] px-[7%]">
  <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-10 items-center bg-[#fcfaf3] rounded-[2.5rem] p-8 md:p-12 border">
    <div>
      <p className="text-[#7a9a4d] text-[11px] font-extrabold tracking-[3px] uppercase">A Note From Our Founder</p>
      <h2 className="mt-4 font-serif italic text-[32px] md:text-[38px] leading-[1.1] text-[#254c35]">"Ye brand nahi, meri dadi maa ka nuskha hai jo ab aap tak pahunch raha hai."</h2>
      <div className="mt-6 text-[#4a5a4f] text-[15px] leading-[1.9] space-y-4 font-medium">
        <p>Bachpan me jab bhi khansi hoti thi, maa tulsi aur adrak ka kadha deti thi.</p>
        <p>Isiliye har product me 100% sach hai, koi milawat nahi.</p>
      </div>
    </div>
    <div className="relative">
      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" className="w-full h-[460px] object-cover rounded-[2rem]" alt="founder" />
      <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-2xl shadow-xl border">
        <p className="text-[11px] font-bold tracking-widest text-[#7a9a4d]">FOUNDER</p>
        <p className="font-bold text-[16px]">Priya Sharma</p>
      </div>
    </div>
  </div>
</section>





      {/* VALUES - Photo + Hover Up Effect */}
            <section className="bg-[#f5f3e8] py-[85px] px-[7%]">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center max-w-[600px] mx-auto">
            <h2 className="text-[32px] font-extrabold tracking-tight leading-tight">Rooted In Values, Backed By Science</h2>
            <p className="text-[#6b7568] text-[14px] mt-3 leading-6">We blend ancient granthas with modern lab testing to give you results you can feel.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            
            <div className="group bg-white p-8 rounded-[1.6rem] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-pointer">
            <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=200&auto=format&fit=crop" className="w-14 h-14 rounded-full object-cover mb-5 group-hover:scale-110 transition-transform duration-300" alt="nature" />
              <h3 className="font-bold text-[17px]">Nature Inspired</h3>
              <p className="text-[#737b70] text-[14px] leading-[1.7] mt-2">Every herb is hand-picked, sun-dried and cold-processed to keep its potency intact.</p>
            </div>

            <div className="group bg-white p-8 rounded-[1.6rem] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-pointer">
              <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200&auto=format&fit=crop" className="w-14 h-14 rounded-full object-cover mb-5 group-hover:scale-110 transition-transform duration-300" alt="wellness" />
              <h3 className="font-bold text-[17px]">Mindful Wellness</h3>
              <p className="text-[#737b70] text-[14px] leading-[1.7] mt-2">We don't sell products, we promote a daily ritual for balance and peace.</p>
            </div>

            <div className="group bg-white p-8 rounded-[1.6rem] border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out cursor-pointer">
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=200&auto=format&fit=crop" className="w-14 h-14 rounded-full object-cover mb-5 group-hover:scale-110 transition-transform duration-300" alt="transparent" />
              <h3 className="font-bold text-[17px]">Honest & Transparent</h3>
              <p className="text-[#737b70] text-[14px] leading-[1.7] mt-2">Full ingredient list on the front, not hidden. What you see is what you apply.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1300px] mx-auto px-[7%] py-[70px]">
        <div className="bg-[#254c35] rounded-[2.2rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
          <h2 className="text-[30px] md:text-[42px] font-black leading-[1.05] relative z-10 tracking-tight">Ready to Start Your<br/>Ayurvedic Journey?</h2>
          <Link to="/products" className="inline-block mt-7 px-8 py-4 bg-[#ffcc00] text-black rounded-full font-bold text-[14px] relative z-10 hover:bg-[#ffd633] transition">
            Shop Now →
          </Link>
          <div className="absolute right-0 top-0 h-full w-[45%] bg-[url('https://images.unsplash.com/photo-1608571423902-eed4a94d8d42?q=80&w=600')] bg-cover opacity-[0.15]"></div>
        </div>
      </section>
    </main>
  );
}
export default About;