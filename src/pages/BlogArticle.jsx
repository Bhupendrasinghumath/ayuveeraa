import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BLOGS } from '../data/blogs';

function BlogArticle() {
  const { slug } = useParams();
  const blog = BLOGS.find((article) => article.slug === slug);

  useEffect(() => {
    if (!blog) return undefined;

    const previousTitle = document.title;
    const previousMeta = [];
    const articleUrl = `${window.location.origin}/blogs/${blog.slug}`;
    const setMeta = (attribute, name, content) => {
      let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
      const created = !element;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      previousMeta.push({
        element,
        content: element.getAttribute('content'),
        created,
      });
      element.setAttribute('content', content);
    };

    setMeta('name', 'description', blog.metaDescription);
    setMeta('property', 'og:title', blog.seoTitle);
    setMeta('property', 'og:description', blog.metaDescription);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:image', new URL(blog.image, window.location.origin).href);
    setMeta('property', 'og:image:alt', blog.imageAlt);
    setMeta('property', 'og:url', articleUrl);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', blog.seoTitle);
    setMeta('name', 'twitter:description', blog.metaDescription);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    const createdCanonical = !canonical;
    const previousCanonical = canonical?.getAttribute('href');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', articleUrl);
    document.title = blog.seoTitle;

    return () => {
      document.title = previousTitle;
      previousMeta.forEach(({ element, content, created }) => {
        if (created) {
          element.remove();
        } else if (content === null) {
          element.removeAttribute('content');
        } else {
          element.setAttribute('content', content);
        }
      });
      if (createdCanonical) {
        canonical.remove();
      } else if (previousCanonical === null) {
        canonical.removeAttribute('href');
      } else {
        canonical.setAttribute('href', previousCanonical);
      }
    };
  }, [blog]);

  if (!blog) return <Navigate to="/blogs" replace />;

  const canonicalUrl = `${window.location.origin}/blogs/${blog.slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.metaDescription,
    image: new URL(blog.image, window.location.origin).href,
    datePublished: blog.datePublished,
    dateModified: blog.datePublished,
    articleSection: blog.category,
    author: { '@type': 'Organization', name: 'Ayuveera' },
    publisher: { '@type': 'Organization', name: 'Ayuveera' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    articleBody: blog.content.map(({ heading, body }) => `${heading}\n${body}`).join('\n\n'),
  };
  const relatedBlogs = BLOGS
    .filter((article) => article.slug !== blog.slug && article.category === blog.category)
    .concat(BLOGS.filter((article) => article.slug !== blog.slug && article.category !== blog.category))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <header className="bg-[#f7f5ef]">
        <div className="mx-auto max-w-[900px] px-4 pb-8 pt-6 sm:pb-10 md:px-6 md:pt-8">
          <nav aria-label="Breadcrumb" className="mb-7 text-sm text-[#696b61]">
            <Link to="/" className="hover:text-[#1e3a2e]">Home</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <Link to="/blogs" className="hover:text-[#1e3a2e]">Journal</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <span aria-current="page" className="text-[#1e3a2e]">{blog.category}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#71805b]">{blog.category}</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight text-[#1e3a2e] sm:text-4xl md:text-5xl">
            {blog.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#62665e] sm:text-base sm:leading-7">
            {blog.description}
          </p>
          <p className="mt-5 text-xs text-[#77796f]">
            <time dateTime={blog.datePublished}>{blog.date}</time>
            <span aria-hidden="true" className="mx-2">·</span>
            {blog.readingTime}
          </p>
          <img
            src={blog.image}
            alt={blog.imageAlt}
            fetchPriority="high"
            className="mt-7 aspect-[16/9] max-h-[480px] w-full rounded-2xl object-cover shadow-sm"
          />
        </div>
      </header>

      <article className="mx-auto max-w-[760px] px-4 py-9 sm:py-12 md:px-6">
        <div className="space-y-8 text-[15px] leading-7 text-[#454b43] sm:text-base sm:leading-8">
          {blog.content.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 font-serif text-2xl leading-snug text-[#1e3a2e] sm:text-3xl">
                {section.heading}
              </h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        {blog.sources?.length > 0 && (
          <aside aria-labelledby="sources-heading" className="mt-10 border-t border-[#e9e4d9] pt-6">
            <h2 id="sources-heading" className="text-sm font-semibold text-[#1e3a2e]">
              Sources and further reading
            </h2>
            <ul className="mt-3 space-y-2">
              {blog.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#426b48] underline decoration-[#426b48]/40 underline-offset-4 hover:text-[#1e3a2e]"
                  >
                    {source.name} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <Link
          to="/blogs"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#1e3a2e]/25 px-5 text-sm font-semibold text-[#1e3a2e] transition hover:bg-[#1e3a2e] hover:text-white"
        >
          <span aria-hidden="true">←</span> Back to the journal
        </Link>
      </article>

      <section aria-labelledby="related-articles-heading" className="border-t border-[#eee9df] bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-[1300px] px-4 md:px-6">
          <h2 id="related-articles-heading" className="font-serif text-2xl text-[#1e3a2e] sm:text-3xl">
            More from the journal
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((article) => (
              <Link
                key={article.slug}
                to={`/blogs/${article.slug}`}
                className="group rounded-xl border border-[#e9e4d9] bg-[#fffdf8] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#71805b]">
                  {article.category}
                </p>
                <h3 className="mt-2 font-serif text-lg leading-snug text-[#1e3a2e] group-hover:underline">
                  {article.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#426b48]">
                  Read article <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default BlogArticle;
