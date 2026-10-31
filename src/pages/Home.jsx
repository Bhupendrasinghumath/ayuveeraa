import { useState, useEffect, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaLeaf } from "react-icons/fa";
import { useProducts } from "../context/useProducts.js";
import ProductCard from "../components/ProductCard.jsx";

import desktopPachan from "../assets/deskbanner/pachan.png";
import desktopStress from "../assets/deskbanner/stress.png";
import desktopCream from "../assets/deskbanner/cream.png";
import desktopOil from "../assets/deskbanner/oil.png";
import laptopPachan from "../assets/lapbanner/pachanlap.png";
import laptopStress from "../assets/lapbanner/stresslap.png";
import laptopCream from "../assets/lapbanner/creamlap.png";
import laptopOil from "../assets/lapbanner/oillap.png";
import mobilePachan from "../assets/mobbanner/pachanmob.png";
import mobileStress from "../assets/mobbanner/stressmob.png";
import mobileCream from "../assets/mobbanner/creammob.png";
import mobileOil from "../assets/mobbanner/oilmob.png";

import sugarQuiz from "../assets/sugarQuiz.jpg"
import weightQuiz from "../assets/weightQuiz.jpg"
import BlogPreview from "../components/BlogPreview";
import CustomersSay from "../components/CustomersSay";
import WellnessJourney from "../components/WellnessJourney"

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { products, loading: catalogLoading, catalogError } = useProducts();
  const collectionProducts = products.slice(0, 8);

  const desktopImgs = [desktopPachan, desktopStress, desktopCream, desktopOil, desktopPachan];
  const laptopImgs = [laptopPachan, laptopStress, laptopCream, laptopOil, laptopPachan];
  const mobileImgs = [mobilePachan, mobileStress, mobileCream, mobileOil, mobilePachan];

  useLayoutEffect(() => {
    const headerParts = document.querySelectorAll(
      "[data-site-header], .app > [role='status']"
    );
    if (!headerParts.length) return undefined;

    const updateHeaderHeight = () => {
      const height = Array.from(headerParts).reduce(
        (total, part) => total + part.getBoundingClientRect().height,
        0
      );
      setHeaderHeight(height);
    };

    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    headerParts.forEach((part) => observer.observe(part));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 5), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#fffdf8]">

      {/* 1. HERO SLIDER - Photo same rakhi hai */}
      <div
        className="home-hero relative w-full overflow-hidden bg-black"
        role="region"
        aria-label="Featured products"
        aria-roledescription="carousel"
        style={{ "--site-header-height": `${headerHeight}px` }}
      >
        <Link to="/products" className="absolute inset-0 block">
          <picture className="block h-full w-full">
            <source
              media="(max-width: 767px)"
              srcSet={mobileImgs[slide]}
            />
            <source
              media="(min-width: 768px) and (max-width: 1279px)"
              srcSet={laptopImgs[slide]}
            />
            <img
              src={desktopImgs[slide]}
              alt="Featured Ayurvedic products"
              className="w-full h-full object-cover object-center"
            />
          </picture>
        </Link>

        {/* Ayuvya style arrows */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={()=>setSlide(s=> (s-1+5)%5)}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white w-12 h-12 rounded-full grid place-items-center shadow-lg hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition"
        ><FaArrowLeft size={14}/></button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={()=>setSlide(s=> (s+1)%5)}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white w-12 h-12 rounded-full grid place-items-center shadow-lg hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition"
        ><FaArrowRight size={14}/></button>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex">
          {[0,1,2,3,4].map(n=>(
            <button
              key={n}
              type="button"
              aria-label={`Go to slide ${n + 1}`}
              aria-pressed={n === slide}
              onClick={()=>setSlide(n)}
              className="w-11 h-11 grid place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span aria-hidden="true" className={`h-[6px] rounded-full transition-all duration-300 ${n===slide? "w-6 bg-white":"w-[6px] bg-white/70"}`}></span>
            </button>
          ))}
        </div>
      </div>

      
      <WellnessJourney />
      

      {/* 4. HIGH QUALITY - EXACT AYUVYA CARD */}
      <div className="bg-[#fcfcf8] py-12 px-4 md:px-5 text-center">
        <h2 className="font-bold text-[20px] md:text-[24px] text-[#0f3d2e] flex items-center justify-center gap-2">
          <FaLeaf className="text-[#78934d]"/> High-Quality Ingredients. Honest Formulations.
        </h2>
        <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 mt-8 text-left xl:max-w-[1390px] xl:mx-auto">
          {collectionProducts.map(p => <ProductCard key={p.id} p={p} />)}
          {catalogLoading && <p className="col-span-full text-center text-sm text-gray-600">Loading products…</p>}
          {!catalogLoading && catalogError && <p role="alert" className="col-span-full text-center text-sm text-red-700">Products could not be loaded right now. {catalogError}</p>}
          {!catalogLoading && !catalogError && collectionProducts.length === 0 && <p className="col-span-full text-center text-sm text-gray-600">No products are available right now.</p>}
        </div>
        <Link to="/products" className="inline-block mt-10 bg-[#0F3D2E] text-white px-8 py-3 rounded-full text-[12px] font-bold tracking-wider hover:bg-black transition">Shop All Products</Link>
      </div>

      
      <div className="w-full bg-[#f8f0e0] grid md:grid-cols-2 items-center overflow-hidden mt-10">
        <div className="p-8 md:p-12 lg:px-16">
          <h2 className="text-[22px] md:text-[28px] font-black text-[#1a1a1a] leading-tight">Ancient Wisdom. Modern Wellness.</h2>
          <p className="text-[13px] md:text-[14px] text-[#4a4a4a] mt-4 leading-[1.6] max-w-[450px]">Ayuvya is a return to balance in a world that's forgotten how to pause. Born from the roots of Indian ayurvedic & herbal wisdom and refined by modern science, Ayuvya creates potent, honest, and effective formulations that fit seamlessly into your life.</p>
          <Link to="/products" className="inline-block mt-6 bg-[#1e3a2e] text-white text-[12px] font-black tracking-wider px-6 py-2.5 rounded-full">SHOP ALL</Link>
        </div>
        <div className="relative h-[260px] md:h-[380px] w-full bg-[#1e3a2e]">
          <img src="https://rehab-centre.org.uk/tenancy/assets/images/v2-13nwwl-mhu2d.jpg" alt="Ayuvya Ayurveda" className="w-full h-full object-cover opacity-90"/>
          <div className="absolute inset-0 flex items-center justify-center"><h1 className="text-white text-[40px] md:text-[60px] font-light tracking-[8px] opacity-80">ΛYUVEERΛ™</h1></div>
        </div>
      </div>

      <div className="w-full bg-[#faf8f3] py-8 md:py-12">
        <div className="max-w-[1300px] mx-auto px-3 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-[16px] p-5 md:p-6 flex gap-4 items-start border border-[#f2e8cc] shadow-sm">
            <div className="min-w-[44px] h-[44px] bg-[#fdf3df] rounded-full flex items-center justify-center text-[18px]">❤️</div>
            <div><h3 className="text-[16px] font-black leading-tight">Support of 30,00,000+</h3><h4 className="text-[13px] font-bold text-black mt-1">Happy Customers</h4><p className="text-[12.5px] text-[#555] mt-1.5">Loved across India by people who've experienced real, visible change.</p></div>
          </div>
          <div className="bg-white rounded-[16px] p-5 md:p-6 flex gap-4 items-start border border-[#e3efe0] shadow-sm">
            <div className="min-w-[44px] h-[44px] bg-[#e8efe6] rounded-full flex items-center justify-center text-[18px]">🌿</div>
            <div><h3 className="text-[16px] font-black leading-tight">Unique</h3><h4 className="text-[13px] font-bold text-black mt-1">Blend of Ayurvedic & Herbal Ingredients</h4><p className="text-[12.5px] text-[#555] mt-1.5">Each batch undergoes strict quality checks.</p></div>
          </div>
          <div className="bg-white rounded-[16px] p-5 md:p-6 flex gap-4 items-start border border-[#e3efe0] shadow-sm">
            <div className="min-w-[44px] h-[44px] bg-[#e8efe6] rounded-full flex items-center justify-center text-[18px]">🔬</div>
            <div><h3 className="text-[16px] font-black leading-tight">Science + Ayurveda</h3><h4 className="text-[13px] font-bold text-black mt-1">Clinically Studied Ingredients</h4><p className="text-[12.5px] text-[#555] mt-1.5">Formulated using herbs backed by scientific studies.</p></div>
          </div>
          <div className="bg-white rounded-[16px] p-5 md:p-6 flex gap-4 items-start border border-[#f2e8cc] shadow-sm">
            <div className="min-w-[44px] h-[44px] bg-[#fdf3df] rounded-full flex items-center justify-center text-[18px]">🍃</div>
            <div><h3 className="text-[16px] font-black italic leading-tight">Pure & Natural</h3><h4 className="text-[13px] font-bold text-black mt-1">Trusted by Experts</h4><p className="text-[12.5px] text-[#555] mt-1.5">Created by qualified modern vaidyas.</p></div>
          </div>
          <div className="bg-[#1e3a2e] rounded-[16px] p-5 md:p-6 flex gap-4 items-start shadow-sm">
            <div className="min-w-[44px] h-[44px] bg-white/15 rounded-full flex items-center justify-center text-[18px]">⭐</div>
            <div><h3 className="text-[16px] font-black italic leading-tight text-[#e6c88e]">1,00,000+ Reviews</h3><h4 className="text-[13px] font-bold text-white mt-1">Clean, Conscious, Cruelty-Free</h4><p className="text-[12.5px] text-white/70 mt-1.5">No toxins, no shortcuts.</p></div>
          </div>
          <div className="bg-[#fdf3df] rounded-[16px] p-5 md:p-6 flex gap-4 items-start border-2 border-dashed border-[#e6c88e]">
            <div className="min-w-[44px] h-[44px] bg-black rounded-full flex items-center justify-center text-[18px]">🦈</div>
          <div><h3 className="text-[16px] font-black leading-tight">Shark Tank Approved</h3><h4 className="text-[13px] font-bold text-black mt-1">5000+ years of <span className="text-[#0f3d2e]">Ayurvedic Wellness</span></h4><p className="text-[12.5px] text-[#555] mt-1.5">Loved and trusted by millions.</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 py-10">
        <div className="text-center mb-8"><h2 className="text-[28px] md:text-[36px] font-black mt-3 text-[#1e3a2e]">Find Your Perfect <span style={{color: "#7a9a3a"}} className="font-medium"> Ayurvedic Match</span></h2></div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="group relative bg-[#1e3a2e] rounded-[20px] p-7 overflow-hidden flex justify-between items-center">
            <div><span className="bg-[#c8f135] text-black text-[10px] font-black px-2.5 py-1 rounded-full">WEIGHT GAIN QUIZ</span><h3 className="font-bold text-[20px] leading-[1.2] mt-3 text-white max-w-[200px]">Can't gain weight no matter what you eat?</h3><p className="text-[12px] text-white/60 mt-2">Get personalized Ayurvedic solution in 60 sec</p><button className="mt-5 bg-white text-black px-5 py-2 rounded-full text-[11px] font-black">TAKE QUIZ →</button></div>
            <img src={weightQuiz} alt="weight" className="w-[110px] h-[110px] object-contain bg-white/10 rounded-full p-2" />
          </div>
          <div className="group relative bg-[#f5f1e6] rounded-[20px] p-7 overflow-hidden flex justify-between items-center border border-[#e8e0c8]">
            <div><span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full">DIABETES QUIZ</span><h3 className="font-bold text-[20px] leading-[1.2] mt-3 text-[#1e3a2e] max-w-[200px]">Take charge of your sugar levels naturally</h3><p className="text-[12px] text-black/50 mt-2">Ayurveda backed plan for you</p><button className="mt-5 bg-[#1e3a2e] text-white px-5 py-2 rounded-full text-[11px] font-black">TAKE QUIZ →</button></div>
            <img src={sugarQuiz} alt="sugar" className="w-[110px] h-[110px] object-contain bg-white rounded-full p-2" />
          </div>
        </div>
      </div>

      <div className="w-full bg-white py-10 md:py-14">
        <div className="max-w-[1300px] mx-auto px-4 md:px-6">
          <div className="text-center mb-8"><h2 className="text-[24px] md:text-[32px] font-bold text-black">Shop What You See</h2><p className="text-[13px] md:text-[14px] text-[#555] mt-2">Watch. Understand. Choose better. Each product tells its own story.</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[1,2,3,4].map(i=>(
              <div key={i} className="relative rounded-[12px] overflow-hidden bg-black aspect-[9/14]">
                <div className="absolute top-0 left-0 right-0 bg-black text-white text-[9px] font-bold tracking-wider py-1.5 px-2 flex z-20">5000+ years of <span className="text-[#8fcf8f]">Ayurvedic Wellness</span></div>
                <video src={i%2===0 ? "https://www.w3schools.com/html/movie.mp4" : "https://www.w3schools.com/html/mov_bbb.mp4"} autoPlay muted loop playsInline preload="auto" className="w-full h-full object-cover"/>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CustomersSay />

      <div className="w-full bg-white py-10 md:py-14">
        <div className="max-w-[1300px] mx-auto px-4 md:px-6">
          <div className="text-center mb-8"><p className="text-[13px] md:text-[14px] font-semibold tracking-widest text-black/70 uppercase">@AYUVYAYURVEDA</p><h2 className="text-[22px] md:text-[28px] font-normal text-black mt-1">see you at the 'gram</h2></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=600" alt="Berries" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></a>
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600" alt="Drinks" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /><div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center">4 Drinks To End Your Day Right</div></a>
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=600" alt="Fatty liver" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /><div className="absolute top-2 left-2 bg-[#c93a2a] text-white text-[11px] font-bold px-2 py-1 rounded">Fatty liver foods</div></a>
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600" alt="Juice" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></a>
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1504006833117-8886a355efbf?q=80&w=600" alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></a>
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?q=80&w=600" alt="Ayuvya Glass" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /><div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-[10px] font-bold rounded">AYUVYA</div></a>
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=600" alt="Honey Ghee" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /><div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#ffeb3b] text-black text-[11px] font-bold px-3 py-1 rounded">Honey + Ghee</div></a>
            <a href="https://www.instagram.com/ayuvyaayurveda/" target="_blank" className="relative aspect-square overflow-hidden bg-gray-100 group"><img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600" alt="Food" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" /></a>
          </div>
        </div>
      </div>
            
      <BlogPreview/>
    </div>
  );
}