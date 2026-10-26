import React from 'react'
import { Link } from 'react-router-dom'

const blogs = [
  {
    id: 1, category: 'Ayurveda',
    title: 'Understanding the Basics of Ayurveda',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
    date: 'October 10, 2026',
  },
  {
    id: 2, category: 'Skin Care',
    title: 'Building a Simple Daily Skincare Routine',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',
    date: 'October 8, 2026',
  },
  {
    id: 3, category: 'Hair Care',
    title: 'A Guide to Everyday Hair Care',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=700&q=80',
    date: 'October 5, 2026',
  },
]

const BlogPreview = () => {
  return (
    <div className="w-full bg-[#faf8f3] py-10 md:py-14">
      <div className="max-w-[1300px] mx-auto px-4 md:px-[7%]">
        
        <div className="flex justify-between items-end mb-8">
          <div>

              
              {/* HEADING - CENTER */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-[3px] text-[#70844c] uppercase">
             The Wellness Journal
          </p>
            <h2 className="text-[26px] md:text-[36px] font-black text-[#254c35] mt-2">
              Explore Our Blogs
            </h2>
         <div className="w-[60px] h-[3px] bg-[#254c35] mx-auto mt-3 rounded-full"></div>
        </div>
           

          </div>
          <Link to="/blogs" className="hidden md:block text-[13px] font-bold text-[#254c35] border-b border-[#254c35] pb-1">VIEW ALL →</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogs.slice(0,3).map((blog) => (
            <Link key={blog.id} to="/blogs" className="overflow-hidden border border-[#e5e8dc] rounded-xl bg-white hover:-translate-y-1 hover:shadow-lg transition block">
              <img src={blog.image} alt={blog.title} className="w-full h-[210px] object-cover" />
              <div className="p-5">
                <span className="text-[#78934d] text-[11px] font-bold tracking-wide">{blog.category}</span>
                <p className="text-[#92978f] text-[11px] mt-1">{blog.date}</p>
                <h2 className="text-[#254c35] text-[18px] font-bold leading-6 mt-2">{blog.title}</h2>
                <p className="text-[#254c35] font-bold text-[13px] mt-4">Read Article →</p>
              </div>
            </Link>
          ))}
        </div>

      </div>

          

    </div>
  )
}

export default BlogPreview