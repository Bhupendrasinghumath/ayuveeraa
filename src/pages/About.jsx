import { Link } from 'react-router-dom';
import {
  FiArrowDown,
  FiArrowUpRight,
  FiBookOpen,
  FiHeart,
  FiSun,
  FiWind,
} from 'react-icons/fi';
import ayurvedaArtwork from '../assets/ayu.png';
import morningRoutine from '../assets/blogs/ayurvedic-morning-routine.jpg';

const timeline = [
  {
    period: 'Before the written compendia',
    era: 'Oral traditions',
    title: 'Knowledge carried by generations',
    description: 'Healing plants, food, seasons and daily life were observed and taught long before one exact “beginning” could be recorded.',
  },
  {
    period: 'c. 1500–500 BCE',
    era: 'Vedic literature',
    title: 'Early references to healing',
    description: 'Vedic texts include references to medicinal plants and wellbeing. Ayurveda’s roots are often associated with this broad period, while its ideas continued to grow over time.',
  },
  {
    period: 'c. 1st millennium BCE onward',
    era: 'Classical compendia',
    title: 'Ideas gathered into enduring texts',
    description: 'Works associated with Charaka and Sushruta preserve extensive knowledge on care, anatomy, surgery, food and health. These texts were transmitted and revised across generations.',
  },
  {
    period: 'Across the centuries',
    era: 'A living practice',
    title: 'Tradition meets each new age',
    description: 'Teachers, practitioners and communities have carried Ayurveda forward, shaping how its principles are understood and practised in different places and times.',
  },
];

const principles = [
  {
    icon: FiSun,
    title: 'Daily rhythm',
    sanskrit: 'Dinacharya',
    description: 'A traditional emphasis on regular routines, seasonal awareness, and the balance between rest, activity, and recovery.',
  },
  {
    icon: FiHeart,
    title: 'Food & nourishment',
    sanskrit: 'Ahara',
    description: 'Food is considered in context—what we eat, how we eat, when we eat, and how our habits shape our wellbeing.',
  },
  {
    icon: FiWind,
    title: 'The whole person',
    sanskrit: 'Dosha framework',
    description: 'A traditional lens for understanding individual constitution and balance—without replacing medical assessment or diagnosis.',
  },
];

const pressFeatures = [
  {
    publication: 'Health',
    type: 'Magazine feature',
    date: '17 September 2025',
    title: 'Ayurveda: Meaning, Principles, Benefits',
    summary: 'A reader-friendly introduction to Ayurveda’s history and its traditional emphasis on balance, daily habits and individual needs.',
    url: 'https://www.health.com/ayurveda-7567795',
  },
  {
    publication: 'Cleveland Clinic · Health Essentials',
    type: 'Expert perspective',
    date: '10 June 2022',
    title: 'What Is Ayurveda and Does It Work?',
    summary: 'An expert-led overview of Ayurveda’s roots and practices, framed as a starting point for understanding this broad tradition.',
    url: 'https://health.clevelandclinic.org/what-is-ayurveda',
  },
];

function About() {
  return (
    <main className="overflow-hidden bg-[#f8f3e7] text-[#24392d]">
      <section className="border-b border-[#ded3bd] bg-[#f5efe3]">
        <div className="mx-auto grid max-w-[1320px] items-center gap-9 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-12 lg:py-16">
          <div className="max-w-[590px]">
            <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#846b42] sm:text-xs">
              <span className="h-px w-7 bg-[#a88958]" />
              Ayurveda · a living tradition from India
            </p>
            <h1 className="mt-5 text-[clamp(2.3rem,5vw,4.6rem)] font-bold leading-[0.96] tracking-[-0.04em] text-[#1d382b]">
              Care rooted in
              <span className="block font-semibold text-[#9a6f35]">daily wisdom.</span>
            </h1>
            <p className="mt-6 max-w-[530px] text-sm leading-7 text-[#596354] sm:text-base sm:leading-8">
              Ayurveda developed through generations of observing plant life, food, seasonal rhythms, and the daily patterns that shape health. Its principles were codified in classical texts and carried forward through teaching and practice.
            </p>
            <p className="mt-3 max-w-[530px] text-sm leading-7 text-[#596354] sm:text-base">
              It offers a thoughtful framework for wellbeing—one that values context, consistency, and balance rather than quick fixes or substitutes for medical care.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                to="/products"
                className="inline-flex min-h-12 items-center gap-3 bg-[#1f3a2c] px-6 text-sm font-semibold text-[#fffaf0] transition hover:bg-[#31523c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f3a2c]"
              >
                Explore the collection <FiArrowUpRight aria-hidden="true" />
              </Link>
              <a
                href="#timeline"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#455442] underline decoration-[#b79c6b] underline-offset-4 transition hover:text-[#9a6f35]"
              >
                Explore its history <FiArrowDown aria-hidden="true" />
              </a>
            </div>

            <p className="mt-7 border-t border-[#d9ccb4] pt-4 text-xs leading-5 text-[#6b705f]">
              <span className="font-semibold text-[#344b37]">Āyurveda</span>
              <span> is rooted in Sanskrit: </span>
              <span className="font-semibold text-[#2d4538]">āyus</span>
              <span> (life) and </span>
              <span className="font-semibold text-[#2d4538]">veda</span>
              <span> (knowledge).</span>
            </p>
          </div>

          <figure className="mx-auto w-full max-w-[620px] lg:justify-self-end">
            <img
              src={ayurvedaArtwork}
              alt="Illustration of an Ayurvedic practitioner preparing herbs in a traditional setting"
              className="aspect-[1.08] w-full border border-[#d9ccb4] bg-[#dfc79c] object-cover"
            />
            <figcaption className="mt-3 flex items-center justify-between gap-4 text-[10px] leading-5 text-[#737665]">
              <span>An artistic interpretation of traditional herbal practice</span>
              <span className="shrink-0 uppercase tracking-[0.16em]">Ayuveera · India</span>
            </figcaption>
          </figure>
        </div>
      </section>

      
      <section className="relative bg-[#e9dfc9] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(ellipse_at_center,rgba(168,137,88,0.12),transparent_68%)] lg:block" />
        <div className="relative mx-auto max-w-[1240px]">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#967342]">The everyday lens</p>
              <h2 className="mt-4 max-w-xl text-[clamp(2rem,4vw,3.3rem)] font-bold leading-[1.05] text-[#233b2d]">
                Small rituals.
                <span className="block font-semibold text-[#9a6f35]">A broader approach to wellbeing.</span>
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[#5e6557] sm:text-base">
              Ayurveda looks beyond isolated symptoms and considers the whole person—body, mind, habits, and environment. For many, its value lies in encouraging attention to the everyday choices that shape health over time.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, sanskrit, description }, index) => (
              <article key={title} className="group border border-[#d7c6a3] bg-[#fbf8f0] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(54,44,26,0.08)] sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-[#c9b58e] text-[#8f6b3b]">
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <span className="text-sm font-semibold text-[#a88b5a]">0{index + 1}</span>
                </div>
                <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#9a6f35]">{sanskrit}</p>
                <h3 className="mt-2 text-2xl font-semibold text-[#263d2e]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#626858]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1f392c] px-5 py-16 text-[#fbf6e9] sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <figure className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute -inset-3 border border-[#c5aa78]/50" />
            <img
              src={morningRoutine}
              alt="A person practising a mindful movement routine at sunrise"
              className="relative aspect-[1.2] w-full object-cover"
              loading="lazy"
            />
            <figcaption className="absolute bottom-4 left-4 bg-[#1f392c]/90 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#f2dfb6]">
              Care, in the cadence of a day
            </figcaption>
          </figure>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d0b47e]">What people may value</p>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.08] text-[#fff8e9]">
              A considered approach
              <span className="block font-semibold text-[#d8bd8a]">to everyday wellbeing.</span>
            </h2>
            <div className="mt-7 space-y-5">
              {[
                ['A broader perspective', 'Notice how food, sleep, movement, and seasonal changes work together within a daily rhythm.'],
                ['More mindful habits', 'Build consistency and self-awareness rather than relying on short-term fixes.'],
                ['Guidance shaped around you', 'Traditional practice values individual context; a qualified practitioner can help determine what is appropriate for your needs.'],
              ].map(([title, description], index) => (
                <div key={title} className="flex gap-4 border-t border-white/15 pt-4">
                  <span className="mt-0.5 text-sm font-semibold text-[#d0b47e]">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-[#fff8e9]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/70">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#efe6d3] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-8 h-64 w-64 rounded-full border border-[#a88958]/20 sm:h-96 sm:w-96" />
        <div className="relative mx-auto max-w-[1120px]">
          <div className="flex flex-col gap-5 border-b border-[#cdbb98] pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#967342]">From the reading room</p>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.08] text-[#233b2d]">
                Ayurveda in context.
                <span className="block font-semibold text-[#9a6f35]">A few perspectives worth exploring.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#626858]">
              Independent writing can add useful context. These are original summaries linking to source publications, not reproduced article excerpts.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {pressFeatures.map((feature, index) => (
              <article
                key={feature.publication}
                className="relative flex min-h-full flex-col border border-[#d6c6a5] bg-[#fbf8f0] p-6 shadow-[0_12px_30px_rgba(54,44,26,0.07)] sm:p-8"
              >
                <div aria-hidden="true" className="absolute left-1/2 top-0 h-3 w-16 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] bg-[#c4ae7f]/60" />
                <div className="flex items-start justify-between gap-4 border-b border-dashed border-[#d8c8a7] pb-4">
                  <div>
                    <p className="text-xl font-semibold text-[#263d2e]">{feature.publication}</p>
                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9a6f35]">{feature.type}</p>
                  </div>
                  <span className="text-3xl font-semibold text-[#d3c4a6]">0{index + 1}</span>
                </div>
                <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#78806b]">{feature.date}</p>
                <h3 className="mt-2 text-2xl font-semibold leading-snug text-[#263d2e] sm:text-3xl">{feature.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#626858]">{feature.summary}</p>
                <a
                  href={feature.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border-b border-[#b79c6b] text-sm font-semibold text-[#31513b] transition hover:text-[#9a6f35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#31513b]"
                >
                  Read at {feature.publication.split(' · ')[0]} <FiArrowUpRight aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-[#737665]">
            These publications are independent sources; their inclusion does not imply endorsement of Ayuveera or its products.
          </p>
        </div>
      </section>

      <section className="bg-[#fbf8f0] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1120px] gap-8 border-y border-[#d8c8a7] py-8 sm:grid-cols-[1fr_auto] sm:items-center sm:py-10">
          <div className="flex gap-4">
            <span className="mt-1 text-[#9a6f35]"><FiBookOpen aria-hidden="true" size={21} /></span>
            <div>
              <h2 className="text-2xl font-semibold text-[#263d2e]">Traditional wisdom deserves thoughtful care.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#626858]">
                Ayurveda encompasses many practices, and the evidence and safety profile can vary by treatment. It should not replace medical care. If you have a health condition, are pregnant or nursing, or take medication, please consult a qualified healthcare professional before using a product or changing treatment.
              </p>
            </div>
          </div>
          <a
            href="https://www.nccih.nih.gov/health/ayurvedic-medicine-in-depth"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#31513b] underline decoration-[#b79c6b] underline-offset-4 hover:text-[#9a6f35]"
          >
            Read more about Ayurveda <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#e8ddc4] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-[#a88958]/30" />
        <div className="relative mx-auto max-w-[900px] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#967342]">Ayuveera · Ayurveda for modern living</p>
          <h2 className="mt-4 text-[clamp(2.1rem,4vw,4rem)] font-bold leading-[1.06] text-[#233b2d]">
            Rooted in tradition.
            <span className="mt-2 block font-semibold text-[#9a6f35]">Designed for everyday life.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#5e6557] sm:text-base">
            Explore with curiosity, review each product carefully, and choose what aligns with your individual wellness journey.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#1f3a2c] px-7 text-sm font-semibold text-[#fffaf0] transition hover:bg-[#31523c]"
          >
            Discover Ayuveera <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export default About;
