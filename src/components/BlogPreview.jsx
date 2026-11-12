import { Link } from "react-router-dom";
import { BLOGS } from "../data/blogs";

export default function BlogPreview() {
  return (
    <section aria-labelledby="journal-heading" className="w-full border-t border-[#eee9df] bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1300px] px-4 md:px-6">
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:mb-10 sm:gap-5 md:flex-row md:items-end md:justify-between md:text-left">
          <div className="w-full max-w-2xl">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#7a815d] sm:text-xs">
              The Ayuveera Journal
            </p>
            <h2 id="journal-heading" className="font-serif text-2xl leading-tight text-[#1e3a2e] sm:text-4xl">
              A little knowledge goes a long way
            </h2>
            <p className="mx-auto mt-2 max-w-xl px-1 text-xs leading-5 text-[#62665e] sm:mt-3 sm:px-0 sm:text-base sm:leading-6 md:mx-0">
              Thoughtful reads on Ayurveda, everyday care and mindful routines.
            </p>
          </div>
          <Link
            to="/blogs"
            className="mx-auto inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#1e3a2e]/25 px-4 text-xs font-semibold text-[#1e3a2e] transition hover:border-[#1e3a2e] hover:bg-[#1e3a2e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e] sm:min-h-11 sm:px-5 sm:text-sm md:mx-0"
          >
            Explore all articles <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {BLOGS.slice(0, 3).map((blog) => (
            <Link
              key={blog.id}
              to={`/blogs/${blog.slug}`}
              aria-label={`Explore the journal: ${blog.title}`}
              className="group overflow-hidden rounded-2xl border border-[#e9e4d9] bg-[#fffdf8] transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eee8dc]">
                <img
                  src={blog.image}
                  alt={blog.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#1e3a2e] backdrop-blur">
                  {blog.category}
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs text-[#77796f]">
                  {blog.date} <span aria-hidden="true">·</span> {blog.readingTime}
                </p>
                <h3 className="mt-3 font-serif text-xl leading-snug text-[#1e3a2e] sm:text-2xl">
                  {blog.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#62665e]">
                  {blog.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1e3a2e]">
                  Read the story
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
