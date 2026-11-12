import { useState } from 'react';
import { Link } from 'react-router-dom';
import ayuImage from '../assets/ayu.png';
import { BLOG_CATEGORIES, BLOGS } from '../data/blogs';

function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredBlogs = selectedCategory === 'All'
    ? BLOGS
    : BLOGS.filter((blog) => blog.category === selectedCategory);

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <section className="relative isolate flex min-h-[300px] items-end overflow-hidden bg-[#1e3a2e] sm:min-h-[360px]">
        <img
          src={ayuImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10261d]/85 via-[#10261d]/55 to-[#10261d]/15" />
        <div className="mx-auto w-full max-w-[1300px] px-4 pb-10 pt-8 md:px-6 md:pb-14">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/75">
            <Link to="/" className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page" className="text-white">Journal</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6c88e]">
            The Ayuveera Journal
          </p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            Wellness, thoughtfully rooted
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
            Explore thoughtful reads on Ayurveda, everyday care and mindful living.
          </p>
        </div>
      </section>

      <section aria-label="Browse articles" className="mx-auto max-w-[1300px] px-4 py-9 md:px-6 md:py-12">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-[#1e3a2e] sm:text-4xl">Stories for your wellbeing</h2>
            <p className="mt-2 text-sm text-[#62665e]">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'} to explore
            </p>
          </div>
          <div className="flex max-w-full flex-wrap gap-2" aria-label="Filter articles by category">
          {BLOG_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              type="button"
              aria-pressed={selectedCategory === category}
              className={`min-h-10 rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e] ${
                selectedCategory === category
                  ? 'border-[#1e3a2e] bg-[#1e3a2e] text-white'
                  : 'border-[#dce3d5] bg-white text-[#1e3a2e] hover:border-[#1e3a2e]'
              }`}
            >
              {category}
            </button>
          ))}
          </div>
        </div>

        {filteredBlogs.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article key={blog.id} className="overflow-hidden rounded-2xl border border-[#e9e4d9] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <Link
                  to={`/blogs/${blog.slug}`}
                  aria-label={`Read ${blog.title}`}
                  className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a2e]"
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
                    <h3 className="mt-3 font-serif text-2xl leading-snug text-[#1e3a2e]">{blog.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#62665e]">{blog.description}</p>
                    <span className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#1e3a2e]">
                      Read article <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p role="status" className="rounded-2xl border border-[#e9e4d9] bg-white p-8 text-center text-sm text-[#62665e]">
            No articles are available in this category yet.
          </p>
        )}
      </section>

    </main>
  );
}

export default Blog;