import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { generateCategorySchema } from '../utils/schema';
import { LazyImage } from '../components/LazyImage';
import { Pagination } from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  image_url: string;
}

function CategoryView() {
  const { name } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const toolsPerPage = 15;

  useEffect(() => {
    async function fetchData() {
      if (name === 'all') {
        const { data: toolsData, error } = await supabase
          .from('tools')
          .select('*')
          .range((page - 1) * toolsPerPage, page * toolsPerPage - 1);
        
        if (toolsData) {
          if (page === 1) {
            setTools(toolsData);
          } else {
            setTools(prev => [...prev, ...toolsData]);
          }
          setHasMore(toolsData.length === toolsPerPage);
        }
      } else {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .ilike('name', name?.replace(/-/g, ' ') || '')
          .single();
        
        if (categoryData) {
          setCategory(categoryData);
          const { data: toolsData } = await supabase
            .from('tools')
            .select('*')
            .eq('category_id', categoryData.id)
            .range((page - 1) * toolsPerPage, page * toolsPerPage - 1);
          
          if (toolsData) {
            if (page === 1) {
              setTools(toolsData);
            } else {
              setTools(prev => [...prev, ...toolsData]);
            }
            setHasMore(toolsData.length === toolsPerPage);
          }
        }
      }
    }
    
    fetchData();
  }, [name, page]);

  return (
    <>
      {category && (
        <SEO
          title={`${category.name} AI Tools | AItoonic`}
          description={category.description}
          type="website"
          schema={generateCategorySchema(category, tools)}
        />
      )}
      <div className="min-h-screen bg-royal-dark py-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-sm mb-8">
            <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <Link to="/categories" className="text-gray-400 hover:text-white">Categories</Link>
            {name !== 'all' && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <span className="text-gray-300">{category?.name}</span>
              </>
            )}
          </div>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              {name === 'all' ? 'All Tools' : category?.name}
            </h1>
            {category && (
              <p className="text-xl text-gray-300 max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={`/ai/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-royal-dark-card rounded-2xl overflow-hidden card-hover border border-royal-dark-lighter group"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={tool.image_url || 'https://images.unsplash.com/photo-1676277791608-ac54783d753b'}
                    alt={tool.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-royal-gold transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 mb-6">{tool.description}</p>
                  <span className="inline-flex items-center text-royal-gold group-hover:text-royal-gold/80 font-medium">
                    Explore Tool
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="inline-flex items-center justify-center bg-royal-dark-card text-royal-gold px-8 py-3 rounded-lg font-bold hover:bg-royal-dark-lighter transition-colors"
              >
                Load More Tools
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CategoryView;