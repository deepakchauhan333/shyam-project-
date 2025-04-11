import React, { useEffect, useState } from 'react';
import { Sparkles, Search, Bot, ArrowRight, Star, Clock, Users, Zap, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

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

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  api_endpoint: string;
  pricing_type: string;
  status: string;
  image_url: string;
  is_available_24_7: boolean;
  user_count: number;
  has_fast_response: boolean;
  is_secure: boolean;
}

interface SearchResult {
  type: 'tool' | 'agent' | 'category';
  item: Tool | Agent | Category;
}

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [searchBarRect, setSearchBarRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [
        { data: categoriesData },
        { data: toolsData },
        { data: agentsData }
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('tools').select('*'),
        supabase.from('agents').select('*').limit(3)
      ]);
      
      if (categoriesData) setCategories(categoriesData);
      if (toolsData) {
        setTools(toolsData);
        const randomTools = [...toolsData]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
        setFeaturedTools(randomTools);
      }
      if (agentsData) setAgents(agentsData);
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search in tools
    tools.forEach(tool => {
      const nameMatch = tool.name.toLowerCase().includes(term);
      const descMatch = tool.description.toLowerCase().includes(term);
      
      // Only add if the search term matches from the start of a word
      if (nameMatch && tool.name.toLowerCase().split(/\s+/).some(word => word.startsWith(term))) {
        results.push({ type: 'tool', item: tool });
      }
    });

    // Search in agents
    agents.forEach(agent => {
      const nameMatch = agent.name.toLowerCase().includes(term);
      const descMatch = agent.description.toLowerCase().includes(term);
      const capMatch = agent.capabilities.some(cap => 
        cap.toLowerCase().split(/\s+/).some(word => word.startsWith(term))
      );
      
      // Only add if the search term matches from the start of a word
      if (nameMatch && agent.name.toLowerCase().split(/\s+/).some(word => word.startsWith(term))) {
        results.push({ type: 'agent', item: agent });
      }
    });

    // Search in categories
    categories.forEach(category => {
      const nameMatch = category.name.toLowerCase().includes(term);
      const descMatch = category.description?.toLowerCase().includes(term);
      
      // Only add if the search term matches from the start of a word
      if (nameMatch && category.name.toLowerCase().split(/\s+/).some(word => word.startsWith(term))) {
        results.push({ type: 'category', item: category });
      }
    });

    // Sort results by exact match first, then by name length
    results.sort((a, b) => {
      const aName = a.item.name.toLowerCase();
      const bName = b.item.name.toLowerCase();
      
      // Exact matches first
      if (aName === term && bName !== term) return -1;
      if (bName === term && aName !== term) return 1;
      
      // Then matches at start of name
      if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
      if (bName.startsWith(term) && !aName.startsWith(term)) return 1;
      
      // Then by name length
      return aName.length - bName.length;
    });

    setSearchResults(results);
  }, [searchTerm, tools, agents, categories]);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchTerm('');

    switch (result.type) {
      case 'tool':
        navigate(`/ai/${result.item.name.toLowerCase().replace(/\s+/g, '-')}`);
        break;
      case 'agent':
        navigate(`/ai-agent/${result.item.name.toLowerCase().replace(/\s+/g, '-')}`);
        break;
      case 'category':
        navigate(`/category/${result.item.name.toLowerCase().replace(/\s+/g, '-')}`);
        break;
    }
  };

  // Update search bar position on scroll
  useEffect(() => {
    const searchBar = document.getElementById('search-input');
    if (searchBar) {
      const updateSearchBarRect = () => {
        setSearchBarRect(searchBar.getBoundingClientRect());
      };
      updateSearchBarRect();
      window.addEventListener('scroll', updateSearchBarRect);
      window.addEventListener('resize', updateSearchBarRect);
      return () => {
        window.removeEventListener('scroll', updateSearchBarRect);
        window.removeEventListener('resize', updateSearchBarRect);
      };
    }
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Hero Section with Search */}
      <section className="royal-gradient min-h-[80vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-8 gradient-text">
              Discover AI Tools
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Find and compare the best AI tools for your needs
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div id="search-container" className="relative" style={{ zIndex: 50 }}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search AI tools..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full pl-14 pr-4 py-4 bg-royal-dark-card border border-royal-dark-lighter rounded-full text-white focus:outline-none focus:border-royal-gold text-lg"
                />

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && searchBarRect && (
                  <div 
                    className="absolute left-0 right-0 mt-2 bg-royal-dark-card border border-royal-dark-lighter rounded-2xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto"
                  >
                    {(['tool', 'agent', 'category'] as const).map(type => {
                      const typeResults = searchResults.filter(r => r.type === type);
                      if (typeResults.length === 0) return null;

                      return (
                        <div key={type} className="border-b border-royal-dark-lighter last:border-0">
                          <div className="px-4 py-2 bg-royal-dark-lighter sticky top-0">
                            <h3 className="text-sm font-semibold text-gray-400">
                              {type.charAt(0).toUpperCase() + type.slice(1)}s
                            </h3>
                          </div>
                          {typeResults.map((result, index) => (
                            <button
                              key={`${result.type}-${index}`}
                              className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-royal-dark/50 transition-colors text-left"
                              onClick={() => handleResultClick(result)}
                            >
                              {result.type === 'tool' && <Search className="w-5 h-5 text-royal-gold" />}
                              {result.type === 'agent' && <Bot className="w-5 h-5 text-royal-gold" />}
                              {result.type === 'category' && <Sparkles className="w-5 h-5 text-royal-gold" />}
                              <div>
                                <h4 className="text-white font-medium">{result.item.name}</h4>
                                <p className="text-sm text-gray-400 line-clamp-1">
                                  {result.item.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/categories" 
                className="w-full sm:w-auto bg-royal-gold text-royal-dark px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all transform hover:scale-105 text-center"
              >
                Explore Tools
              </Link>
              <Link 
                to="/ai-agent" 
                className="w-full sm:w-auto border-2 border-royal-gold text-royal-gold px-8 py-4 rounded-full font-bold hover:bg-royal-gold hover:text-royal-dark transition-all text-center"
              >
                AI Agents
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-royal-dark">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold gradient-text mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-royal-dark-card p-8 rounded-xl border border-royal-dark-lighter hover:border-royal-gold group transition-colors"
              >
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-royal-gold transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-400 mb-6">{category.description}</p>
                <span className="text-royal-gold group-hover:text-royal-gold/80 font-medium flex items-center">
                  Browse Tools
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-20 bg-royal-dark-lighter mt-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold gradient-text mb-12">Featured Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredTools.map((tool) => (
              <Link
                key={tool.id}
                to={`/ai/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-royal-dark-card rounded-xl overflow-hidden group hover:border-royal-gold border border-royal-dark-lighter transition-colors"
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={tool.image_url || 'https://images.unsplash.com/photo-1676277791608-ac54783d753b'}
                    alt={tool.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-royal-gold transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Tools */}
      <section className="py-20 bg-royal-dark">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold gradient-text">New Tools</h2>
            <Link
              to="/categories"
              className="text-royal-gold hover:text-royal-gold/80 font-medium flex items-center"
            >
              View All Tools
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tools.slice(0, 3).map((tool) => (
              <Link
                key={tool.id}
                to={`/ai/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-royal-dark-card rounded-xl overflow-hidden group hover:border-royal-gold border border-royal-dark-lighter transition-colors"
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={tool.image_url || 'https://images.unsplash.com/photo-1676277791608-ac54783d753b'}
                    alt={tool.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-royal-gold transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{tool.description}</p>
                  <div className="flex items-center text-sm text-gray-400">
                    <Star className="w-4 h-4 text-royal-gold mr-2" />
                    <span>4.8/5</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="py-20 bg-royal-dark-lighter">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold gradient-text">AI Agents</h2>
            <Link
              to="/ai-agent"
              className="text-royal-gold hover:text-royal-gold/80 font-medium flex items-center"
            >
              View All Agents
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                to={`/ai-agent/${agent.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-royal-dark-card rounded-xl overflow-hidden group hover:border-royal-gold border border-royal-dark-lighter transition-colors"
              >
                <div className="aspect-[16/9] relative overflow-hidden">
                  <img
                    src={agent.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995'}
                    alt={agent.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-royal-gold transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{agent.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {agent.is_available_24_7 && (
                      <div className="flex items-center text-xs text-gray-300">
                        <Clock className="w-4 h-4 text-royal-gold mr-1" />
                        <span>24/7</span>
                      </div>
                    )}
                    {agent.user_count > 0 && (
                      <div className="flex items-center text-xs text-gray-300">
                        <Users className="w-4 h-4 text-royal-gold mr-1" />
                        <span>{agent.user_count.toLocaleString()}+</span>
                      </div>
                    )}
                    {agent.has_fast_response && (
                      <div className="flex items-center text-xs text-gray-300">
                        <Zap className="w-4 h-4 text-royal-gold mr-1" />
                        <span>Fast</span>
                      </div>
                    )}
                    {agent.is_secure && (
                      <div className="flex items-center text-xs text-gray-300">
                        <Shield className="w-4 h-4 text-royal-gold mr-1" />
                        <span>Secure</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-royal-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 gradient-text">Stay Updated</h2>
            <p className="text-gray-400 mb-8">
              Get the latest AI tools and insights delivered to your inbox
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full bg-royal-dark border border-royal-dark-lighter focus:outline-none focus:border-royal-gold"
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-royal-gold text-royal-dark px-8 py-3 rounded-full font-bold hover:bg-opacity-90 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;