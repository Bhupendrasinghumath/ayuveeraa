import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaLeaf } from "react-icons/fa";
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
import ayuImage from "../assets/ayu.png";
import BlogPreview from "../components/BlogPreview";
import CustomersSay from "../components/CustomersSay";
import WellnessJourney from "../components/WellnessJourney"
import BrandWordmark from "../components/BrandWordmark";

const AYURVEDA_HERITAGE = [
  {
    title: "Rishi–Muni Parampara",
    description: "A story of seekers and teachers who observed nature, daily life and the rhythms of well-being.",
  },
  {
    title: "Charaka Samhita",
    description: "A foundational Ayurvedic text, traditionally associated with Charaka and teachings on health and care.",
  },
  {
    title: "Sushruta Samhita",
    description: "A celebrated classical text associated with Sushruta and an important tradition of Ayurvedic learning.",
  },
  {
    title: "Panchamahabhuta",
    description: "The traditional five-element framework: akasha, vayu, agni, jala and prithvi.",
  },
  {
    title: "Dinacharya",
    description: "Daily rhythms and mindful routines are part of Ayurveda’s view of living in balance with nature.",
  },
  {
    title: "Vata, Pitta & Kapha",
    description: "The three doshas form a traditional framework for understanding constitution and balance.",
  },
];

const INSTAGRAM_MOMENTS = [
  {
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=700&q=80",
    alt: "Fresh berries and natural ingredients",
  },
  {
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80",
    alt: "A refreshing herbal drink",
  },
  {
    image: "https://images.unsplash.com/photo-1504006833117-8886a355efbf?auto=format&fit=crop&w=700&q=80",
    alt: "A peaceful moment in nature",
  },
  {
    image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?auto=format&fit=crop&w=700&q=80",
    alt: "A colorful drink made with natural ingredients",
  },
  {
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=700&q=80",
    alt: "Golden honey",
  },
  {
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80",
    alt: "A wholesome meal",
  },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const { products, loading: catalogLoading, catalogError } = useProducts();
  const collectionProducts = products.slice(0, 8);
  const featuredProducts = collectionProducts.slice(0, 4);

  const desktopImgs = [desktopPachan, desktopStress, desktopCream, desktopOil, desktopPachan];
  const laptopImgs = [laptopPachan, laptopStress, laptopCream, laptopOil, laptopPachan];
  const mobileImgs = [mobilePachan, mobileStress, mobileCream, mobileOil, mobilePachan];

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
              className="w-full h-full object-contain object-center"
            />
          </picture>
        </Link>

        {/* Ayuvya style arrows */}
        {/* <button
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
        ><FaArrowRight size={14}/></button> */}
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



<section className="relative isolate mt-8 overflow-hidden bg-[#eee5d2] px-4 py-12 sm:mt-10 sm:px-6 sm:py-14 md:px-8 md:py-20 lg:py-24">

  {/* Antique paper texture */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 opacity-[0.16]"
    style={{
      backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
    }}
  />

  {/* Decorative antique rings */}
  <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-20 h-[320px] w-[320px] rounded-full border border-[#9c7844]/20 sm:-right-40 sm:-top-40 sm:h-[550px] sm:w-[550px]" />
  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-12 h-60 w-60 rounded-full border border-[#9c7844]/20 sm:-right-28 sm:-top-28 sm:h-[400px] sm:w-[400px]" />

  <div className="relative mx-auto max-w-[1240px]">

    {/* Heritage heading */}
    <div className="mb-8 text-center sm:mb-10 lg:mb-16">
      <p className="font-serif text-[10px] tracking-[0.25em] text-[#8b7145] sm:text-[11px] sm:tracking-[0.45em]">
        ✦ &nbsp; THE ART OF AYURVEDA &nbsp; ✦
      </p>
      <div className="mx-auto mt-4 h-px w-24 bg-[#a88a56]" />
    </div>

    <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-0">

      {/* Image side */}
      <div className="group relative order-1 min-h-[320px] overflow-hidden border-[8px] border-[#e0d1b4] outline outline-1 outline-[#a98a55] outline-offset-[-1px] sm:min-h-[420px] md:min-h-[500px] lg:min-h-[540px]">

        <img
          src={ayuImage}
          alt="Traditional Ayurvedic preparation surrounded by herbs and ingredients"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />

        {/* Image label */}
        <div className="absolute bottom-3 left-3 right-3 border border-[#f2e5c9]/70 bg-[#eee5d2]/85 p-3 text-center backdrop-blur-sm sm:bottom-5 sm:left-5 sm:right-5 sm:p-4">
          <p className="font-serif text-[9px] tracking-[0.12em] text-[#58452c] sm:text-[11px] sm:tracking-[0.3em]">
            THE HERITAGE OF NATURAL WELLNESS
          </p>
        </div>
      </div>

      {/* Story content */}
      <div className="relative order-2 z-10 border border-[#b59b70] bg-[#f5eedf] px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14 lg:-ml-10 lg:px-10 lg:py-12 xl:px-12 xl:py-16">

        {/* Inner frame */}
        <div className="pointer-events-none absolute inset-[7px] border border-[#cbb995]/60" />

        <div className="relative">

          <div className="mb-5 flex items-center gap-2 sm:mb-7 sm:gap-3">
            <span className="h-px w-6 bg-[#a68a57] sm:w-10" />
            <p className="text-[10px] font-semibold tracking-[0.32em] text-[#917345]">
              OUR PHILOSOPHY
            </p>
            <span className="h-px w-6 bg-[#a68a57] sm:w-10" />
          </div>



          <p className="max-w-[480px] font-serif text-[15px] leading-[1.8] text-[#514c3e] sm:text-[16px] sm:leading-[1.9] md:text-[17px]">
            In a world that moves too fast, <BrandWordmark className="inline-block h-4 w-[84px] align-middle" /> brings you back to what truly matters — balance, wellness, and the timeless power of nature.
          </p>

          <p className="mt-4 max-w-[480px] font-serif text-[14px] leading-[1.8] text-[#68604f] sm:mt-5 sm:text-[15px] sm:leading-[1.95] md:text-[16px]">
            Rooted in the ancient heritage of Indian Ayurveda, we draw inspiration from centuries of botanical knowledge and traditional wellness practices. Blending this wisdom with modern scientific thinking, we create thoughtful formulations for everyday life.
          </p>

          <p className="mt-4 max-w-[480px] font-serif text-[14px] leading-[1.8] text-[#68604f] sm:mt-5 sm:text-[15px] sm:leading-[1.95] md:text-[16px]">
            We believe true wellness is not a trend, but a way of life. Every <BrandWordmark className="inline-block h-4 w-[84px] align-middle" /> formulation reflects our respect for nature, commitment to quality, and belief in a healthier tomorrow.
          </p>

          <Link
            to="/products"
            className="mx-auto mt-7 flex min-h-12 w-fit items-center gap-4 border border-[#314532] bg-[#314532] px-4 text-[10px] font-semibold tracking-[0.16em] text-[#f4ead5] transition-all duration-300 hover:border-[#8c7045] hover:bg-[#8c7045] sm:mx-0 sm:mt-9 sm:gap-8 sm:px-7 sm:tracking-[0.22em]"
          >
            EXPLORE OUR COLLECTION
            <span className="text-base">↗</span>
          </Link>

        </div>
      </div>
    </div>

    {/* Bottom ornament */}
    <div className="mt-8 flex items-center justify-center gap-4 sm:mt-12">
      <span className="h-px w-20 bg-[#a68a57]/50" />
      <span className="font-serif text-lg text-[#a68a57]">❧</span>
      <span className="h-px w-20 bg-[#a68a57]/50" />
    </div>

  </div>
</section>


      <section className="relative isolate overflow-hidden border-y border-[#eee4d1] bg-white py-14 sm:py-16 lg:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b89558]/70 to-transparent" />

        <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <header className="mx-auto max-w-3xl text-center">
            <p className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[#9a7440] sm:text-[14px] sm:tracking-[0.4em]">

              PARAMPARA · PRAKRITI · BALANCE

            </p>

            <div aria-hidden="true" className="mx-auto mt-6 flex w-32 items-center justify-center gap-2 text-[#b89558]">
              <span className="h-px flex-1 bg-[#b89558]/50" />
              <span className="text-xs">✦</span>
              <span className="h-px flex-1 bg-[#b89558]/50" />
            </div>
          </header>

          <div className="relative mx-auto mt-10 max-w-5xl md:mt-14">
            <div aria-hidden="true" className="pointer-events-none absolute bottom-6 left-[23px] top-6 w-px bg-gradient-to-b from-transparent via-[#b89558]/60 to-transparent md:left-1/2 md:-translate-x-1/2" />
            <div className="grid gap-y-8 sm:gap-y-10">
              {AYURVEDA_HERITAGE.map((item, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <article key={item.title} className="relative grid grid-cols-[48px_minmax(0,1fr)] items-start gap-x-4 md:min-h-[120px] md:grid-cols-[1fr_64px_1fr] md:gap-x-0">
                    <div className={`col-start-2 row-start-1 pt-1 ${isLeft ? "md:col-start-1 md:justify-self-end md:pr-8 md:text-right" : "md:col-start-3 md:justify-self-start md:pl-8"}`}>
                      <h3 className={`font-serif text-xl text-[#263d2c] sm:text-2xl ${isLeft ? "md:text-right" : "md:text-left"}`}>
                        {item.title}
                      </h3>
                      <p className={`mt-2 max-w-md text-sm leading-6 text-[#625844] ${isLeft ? "md:ml-auto md:text-right" : "md:text-left"}`}>
                        {item.description}
                      </p>
                    </div>
                    <div className="relative z-10 col-start-1 row-start-1 flex justify-center md:col-start-2">
                      <span aria-hidden="true" className="absolute left-[-24px] right-[-24px] top-6 hidden h-px bg-[#b89558]/55 md:block" />
                      <span className="relative grid h-12 w-12 place-items-center rounded-full border border-[#b89558] bg-white shadow-[0_0_0_5px_white]">
                        <span className="absolute inset-1 rounded-full border border-dashed border-[#b89558]/60" />
                        <span className="relative font-serif text-xs tracking-[0.1em] text-[#80643a]">
                          0{index + 1}
                        </span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* <div className="max-w-[1100px] mx-auto px-5 py-10">
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
      </div> */}

      <section className="bg-[#faf8f3] py-12 sm:py-14 md:py-16">
        <div className="mx-auto max-w-[1300px] px-4 md:px-6">
          <div className="mb-7 flex flex-col items-center gap-4 text-center sm:mb-9 sm:gap-5 md:flex-row md:items-end md:justify-between md:text-left">
            <div className="w-full md:w-auto">
              <p className="text-[9px] font-semibold tracking-[0.24em] text-[#917345] sm:text-[11px] sm:tracking-[0.3em]">
                THE AYUVEERA EDIT
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-[#1e3a2e] sm:text-4xl">
                Shop What You See<span className="text-[#b89558]">.</span>
              </h2>
              <p className="mx-auto mt-2 max-w-xl px-1 text-xs leading-5 text-[#66645b] sm:text-base sm:leading-6 md:mx-0 md:px-0">
                Take a closer look at the favourites in our collection.
              </p>
            </div>
            <Link
              to="/products"
              className="mx-auto inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#1e3a2e]/20 px-4 text-xs font-semibold text-[#1e3a2e] transition hover:border-[#1e3a2e] hover:bg-[#1e3a2e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e] sm:min-h-11 sm:gap-3 sm:px-5 sm:text-sm md:mx-0"
            >
              Explore all products <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[190px] lg:grid-cols-4">
              {featuredProducts.map((product, index) => {
                const isFeatured = index === 0;
                const isWide = index === featuredProducts.length - 1 && index > 0;
                const cardSize = isFeatured
                  ? "col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto"
                  : isWide
                    ? "col-span-2 aspect-[4/3] lg:aspect-auto"
                    : "col-span-1 aspect-[4/5] lg:aspect-auto";

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    aria-label={`View ${product.name}`}
                    className={`group relative isolate overflow-hidden rounded-2xl bg-[#eee7da] shadow-sm transition duration-300 hover:shadow-xl sm:rounded-3xl ${cardSize}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply transition duration-700 group-hover:scale-105 ${isFeatured ? "p-5 sm:p-8" : "p-1 sm:p-2"}`}
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#10261d]/90 via-[#10261d]/10 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/50 bg-black/20 px-3 py-1 text-[9px] font-semibold tracking-[0.18em] text-white backdrop-blur-sm sm:left-4 sm:top-4 sm:text-[10px]">
                      AYUVEERA · 0{index + 1}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5 md:p-6">
                      <div className="min-w-0">
                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/75 sm:text-[10px]">
                          Ayuveera pick
                        </p>
                        <h3 className={`mt-1 line-clamp-2 font-serif leading-tight ${isFeatured ? "text-xl sm:text-3xl" : "text-base sm:text-xl"}`}>
                          {product.name}
                        </h3>
                      </div>
                      <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/60 text-lg transition group-hover:bg-white group-hover:text-[#1e3a2e]">
                        ↗
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p role={catalogError ? "alert" : "status"} className="rounded-2xl border border-[#e8e0c8] bg-white p-6 text-center text-sm text-[#555]">
              {catalogLoading ? "Loading featured products..." : `Featured products are unavailable right now.${catalogError ? ` ${catalogError}` : ""}`}
            </p>
          )}
        </div>
      </section>

      {/* <CustomersSay /> */}

      <section aria-labelledby="instagram-heading" className="w-full bg-[#f7f5ef] py-12 md:py-16">
        <div className="mx-auto max-w-[1300px] px-4 md:px-6">
          <div className="mb-7 flex flex-col items-center justify-between gap-5 text-center sm:mb-9 md:flex-row md:text-left">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#52715d]">
                <FaInstagram aria-hidden="true" className="text-base" />
                Follow our journey
              </p>
              <h2 id="instagram-heading" className="font-serif text-3xl text-[#1e3a2e] sm:text-4xl">
                A little more Ayurveda, every day
              </h2>
              <p className="mt-2 text-sm text-[#62665e]">
                Wellness inspiration, rituals and stories from Ayuveera.
              </p>
            </div>
            <a
              href="https://www.instagram.com/ayuveeraofficial.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1e3a2e] px-5 text-sm font-semibold text-white transition hover:bg-[#315541] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e]"
            >
              <FaInstagram aria-hidden="true" />
              @AYUVEERAOFFICIAL.IN
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-6">
            {INSTAGRAM_MOMENTS.map((moment) => (
              <a
                key={moment.image}
                href="https://www.instagram.com/ayuveeraofficial.in/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Ayuveera on Instagram — ${moment.alt}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-[#e9e5db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e] sm:rounded-2xl"
              >
                <img
                  src={moment.image}
                  alt={moment.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-[#10261d]/0 text-2xl text-white opacity-0 transition duration-300 group-hover:bg-[#10261d]/35 group-hover:opacity-100">
                  <FaInstagram />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <BlogPreview/>
    </div>
  );
}