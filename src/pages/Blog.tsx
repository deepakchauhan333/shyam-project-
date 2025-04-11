import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  published_at: string;
  slug: string;
  cover_image: string;
}

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (data) setPosts(data);
    }
    
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-royal-dark">
      {/* Hero Section */}
      <section className="royal-gradient py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text text-center">
            AI Insights & Updates
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto text-center">
            Stay informed about the latest developments in AI technology, tools, and best practices
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="bg-royal-dark-card rounded-2xl overflow-hidden card-hover group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(post.published_at).toLocaleDateString()}
                  <Clock className="w-4 h-4 ml-4 mr-2" />
                  5 min read
                </div>
                <h2 className="text-2xl font-bold mb-4 text-white group-hover:text-royal-gold transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 mb-6">
                  {post.excerpt}
                </p>
                <span className="inline-flex items-center text-royal-gold group-hover:text-royal-gold/80 font-medium">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Blog;