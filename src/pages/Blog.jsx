import { useState } from 'react';
import { Link } from 'react-router-dom';

function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeBlog, setActiveBlog] = useState(null);

  const blogs = [
    {
      id: 1, category: 'Ayurveda',
      title: 'Understanding the Basics of Ayurveda',
      description: 'Explore the traditional principles of Ayurveda and its approach to balanced living.',
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
      date: 'October 10, 2026',
      content: 'Ayurveda is a traditional system of wellness that focuses on balance, daily routines and mindful living. Learning about its principles can help you understand this ancient tradition.',
    },
    {
      id: 2, category: 'Skin Care',
      title: 'Building a Simple Daily Skincare Routine',
      description: 'Learn how cleansing, moisturizing and sun protection can support everyday skin care.',
      image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',
      date: 'October 8, 2026',
      content: 'A simple skincare routine can include gentle cleansing, moisturizing and daytime sun protection. Choose products according to your skin type and needs.',
    },
    {
      id: 3, category: 'Hair Care',
      title: 'A Guide to Everyday Hair Care',
      description: 'Discover simple habits for maintaining a consistent hair care routine.',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80',
      date: 'October 5, 2026',
      content: 'A consistent hair care routine starts with gentle washing, suitable conditioning and avoiding excessive heat styling.',
    },
    {
      id: 4, category: 'Wellness',
      title: 'Small Habits for Mindful Living',
      description: 'Explore simple ways to make time for relaxation and everyday self-care.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80',
      date: 'October 2, 2026',
      content: 'Mindful living can include making time for rest, maintaining a regular routine and finding moments for relaxation.',
    },
  ];

  const categories = ['All', 'Ayurveda', 'Skin Care', 'Hair Care', 'Wellness'];
  const filteredBlogs = selectedCategory === 'All'? blogs : blogs.filter(b => b.category === selectedCategory);

  return (
    <main className="bg-[#fffdf8] min-h-screen">

      {/* --- HERO REPLACED -  */}
      <div className="w-full h-[420px] md:h-[460px] overflow-hidden bg-black">
        <img 
          src="https://starayurveda.com/blogs/wp-content/uploads/2025/10/Importance-of-Ayurveda-in-Modern-Lifestyle.jpg" 
          alt="Ayurveda Blog Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Breadcrumb  */}
      <div className="px-[7%] max-w-[1300px] mx-auto pt-5">
        <p className="text-[14px] text-gray-600">
          <Link to="/" className="underline">Home</Link> <span className="mx-2">&gt;</span> Blog
        </p>
      </div>

      {/* Content */}
      <section className="px-[7%] py-8 max-w-[1300px] mx-auto">
        <div className="flex justify-center flex-wrap gap-3 mb-9">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm border font-semibold transition ${selectedCategory === category? 'bg-[#254c35] text-white border-[#254c35]' : 'bg-white text-[#254c35] border-[#dce3d5] hover:bg-[#254c35] hover:text-white'}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <article key={blog.id} className="overflow-hidden border border-[#e5e8dc] rounded-xl bg-white hover:-translate-y-1 hover:shadow-lg transition group">
              <div className="relative">
                <img src={blog.image} alt={blog.title} className="w-full h-[210px] object-cover" />
                {/* Ayuvya tag */}
                <span className="absolute top-0 left-0 bg-black/70 text-white text-[12px] px-3 py-1 rounded-br-lg">
                  {blog.category}
                </span>
              </div>
              <div className="p-5">
                <p className="text-[#92978f] text-[11px]">{blog.date}</p>
                <h2 className="text-[#254c35] text-[18px] font-bold leading-6 mt-2 line-clamp-2">{blog.title}</h2>
                <p className="text-[#737b70] text-[13px] leading-6 mt-2 line-clamp-2">{blog.description}</p>
                <button onClick={() => setActiveBlog(blog)} className="mt-4 text-[#426b48] font-bold text-sm hover:text-[#78934d]">Read Article →</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Modal */}
      {activeBlog && (
        <div className="fixed inset-0 z-[1000] grid place-items-center p-5 bg-black/60" onClick={() => setActiveBlog(null)}>
          <article className="relative w-full max-w-[600px] max-h-[85vh] overflow-y-auto p-6 rounded-xl bg-[#fffdf8]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[#254c35] grid place-items-center text-xl" onClick={() => setActiveBlog(null)}>×</button>
            <img src={activeBlog.image} alt={activeBlog.title} className="w-full h-[280px] object-cover rounded-lg" />
            <p className="text-[#78934d] text-xs font-bold mt-4">{activeBlog.category}</p>
            <h2 className="text-[#254c35] text-2xl font-bold mt-2">{activeBlog.title}</h2>
            <p className="text-[#626c60] leading-7 mt-3 text-[14px]">{activeBlog.content}</p>
          </article>
        </div>
      )}
    </main>
  );
}

export default Blog;