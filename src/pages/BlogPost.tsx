import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ChevronRight, Share2, Bookmark, ThumbsUp, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  cover_image: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
}

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  slug: string;
}

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch post
      const { data: postData } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (postData) {
        setPost({
          ...postData,
          author: {
            name: "John Doe",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
          },
          category: "AI Technology",
          tags: ["AI", "Machine Learning", "Technology"]
        });

        // Fetch related posts
        const { data: relatedPostsData } = await supabase
          .from('blog_posts')
          .select('id, title, excerpt, cover_image, slug')
          .neq('slug', slug)
          .limit(3);
        
        if (relatedPostsData) setRelatedPosts(relatedPostsData);
      }
    }
    
    fetchData();
  }, [slug]);

  if (!post) return null;

  return (
    <div className="min-h-screen bg-royal-dark py-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm mb-8">
          <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-gray-300">{post.title}</span>
        </div>

        <article className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-white">{post.author.name}</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(post.published_at).toLocaleDateString()}
                    <Clock className="w-4 h-4 ml-4 mr-2" />
                    5 min read
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              {post.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8">
              <Link
                to={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 bg-royal-dark-lighter rounded-full text-sm text-royal-gold hover:bg-royal-dark transition-colors"
              >
                {post.category}
              </Link>
              {post.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog/tag/${tag.toLowerCase()}`}
                  className="px-3 py-1 bg-royal-dark-lighter rounded-full text-sm text-gray-300 hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Engagement */}
          <div className="flex items-center justify-between py-8 border-t border-b border-royal-dark-lighter mb-12">
            <div className="flex items-center space-x-8">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <ThumbsUp className="w-5 h-5" />
                <span>123 Likes</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>24 Comments</span>
              </button>
            </div>
            <button className="flex items-center space-x-2 text-royal-gold hover:text-royal-gold/80 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Related Posts */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img
                      src={relatedPost.cover_image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-royal-gold transition-colors mb-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-royal-dark-card rounded-2xl p-8 border border-royal-dark-lighter text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-400 mb-6">
              Get the latest AI insights and updates delivered to your inbox
            </p>
            <form className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full bg-royal-dark border border-royal-dark-lighter focus:outline-none focus:border-royal-gold"
              />
              <button
                type="submit"
                className="bg-royal-gold text-royal-dark px-8 py-3 rounded-full font-bold hover:bg-opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </article>
      </div>
    </div>
  );
}

export default BlogPost;