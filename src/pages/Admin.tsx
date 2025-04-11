import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Pencil, Trash2, Save, X, Search, Filter, ChevronDown, ChevronUp, ImageIcon, LinkIcon, Bot, Grid, Settings, LogOut, DollarSign, ListPlus, Layers, Clock, Users, Zap, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Feature {
  title: string;
  description: string;
}

interface UseCase {
  title: string;
  description: string;
}

interface PricingPlan {
  plan: string;
  price: string;
  features: string[];
}

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  image_url: string;
  favicon_url?: string;
  features: Feature[];
  useCases: UseCase[];
  pricing: PricingPlan[];
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

type Section = 'tools' | 'categories' | 'agents' | 'settings';

function Admin() {
  const { session } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('tools');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'features' | 'pricing' | 'stats'>('basic');

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  async function fetchData() {
    try {
      const [
        { data: categoriesData },
        { data: toolsData },
        { data: agentsData }
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('tools').select('*'),
        supabase.from('agents').select('*')
      ]);

      if (categoriesData) setCategories(categoriesData);
      if (toolsData) setTools(toolsData);
      if (agentsData) setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    }
  }

  async function handleSave() {
    try {
      let table = '';
      let itemToSave = { ...editingItem };

      switch (activeSection) {
        case 'tools':
          table = 'tools';
          itemToSave.features = itemToSave.features || [];
          itemToSave.useCases = itemToSave.useCases || [];
          itemToSave.pricing = itemToSave.pricing || [];
          break;
        case 'categories':
          table = 'categories';
          break;
        case 'agents':
          table = 'agents';
          const { features, useCases, pricing, ...agentData } = itemToSave;
          itemToSave = {
            ...agentData,
            capabilities: agentData.capabilities || [],
            status: agentData.status || 'active',
            pricing_type: agentData.pricing_type || 'free',
            image_url: agentData.image_url || 'https://i.imgur.com/NXyUxX7.png',
            is_available_24_7: agentData.is_available_24_7 || false,
            user_count: agentData.user_count || 0,
            has_fast_response: agentData.has_fast_response || false,
            is_secure: agentData.is_secure || false
          };
          break;
        default:
          return;
      }

      if (itemToSave.id) {
        await supabase
          .from(table)
          .update(itemToSave)
          .eq('id', itemToSave.id);
        toast.success('Item updated successfully');
      } else {
        await supabase
          .from(table)
          .insert([itemToSave]);
        toast.success('Item created successfully');
      }

      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Error saving item');
    }
  }

  async function handleDelete(id: string) {
    try {
      let table = '';
      switch (activeSection) {
        case 'tools':
          table = 'tools';
          break;
        case 'categories':
          table = 'categories';
          break;
        case 'agents':
          table = 'agents';
          break;
        default:
          return;
      }

      await supabase
        .from(table)
        .delete()
        .eq('id', id);

      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Error deleting item');
    }
  }

  function getFilteredItems() {
    let items: any[] = [];
    switch (activeSection) {
      case 'tools':
        items = tools;
        break;
      case 'categories':
        items = categories;
        break;
      case 'agents':
        items = agents;
        break;
      default:
        return [];
    }

    return items
      .filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortField]?.toString().toLowerCase() ?? '';
        const bValue = b[sortField]?.toString().toLowerCase() ?? '';
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }

  function handleFeatureChange(index: number, field: keyof Feature, value: string) {
    const features = [...(editingItem.features || [])];
    features[index] = { ...features[index], [field]: value };
    setEditingItem({ ...editingItem, features });
  }

  function handleUseCaseChange(index: number, field: keyof UseCase, value: string) {
    const useCases = [...(editingItem.useCases || [])];
    useCases[index] = { ...useCases[index], [field]: value };
    setEditingItem({ ...editingItem, useCases });
  }

  function handlePricingChange(index: number, field: keyof PricingPlan | 'feature', value: string, featureIndex?: number) {
    const pricing = [...(editingItem.pricing || [])];
    if (field === 'feature' && typeof featureIndex === 'number') {
      const features = [...pricing[index].features];
      features[featureIndex] = value;
      pricing[index] = { ...pricing[index], features };
    } else {
      pricing[index] = { ...pricing[index], [field]: value };
    }
    setEditingItem({ ...editingItem, pricing });
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-royal-dark py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-royal-dark-card rounded-2xl p-8 border border-royal-dark-lighter">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Admin Login</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password
              });

              if (error) {
                toast.error(error.message);
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 rounded-lg bg-royal-dark border border-royal-dark-lighter focus:outline-none focus:border-royal-gold text-white"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-2 rounded-lg bg-royal-dark border border-royal-dark-lighter focus:outline-none focus:border-royal-gold text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-royal-gold text-royal-dark px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AI Tools Hub</title>
      </Helmet>

      <div className="min-h-screen bg-royal-dark">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-royal-dark-card border-r border-royal-dark-lighter min-h-screen fixed">
            <div className="p-6">
              <h1 className="text-xl font-bold gradient-text mb-8">Admin Dashboard</h1>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('tools')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'tools' ? 'bg-royal-dark text-royal-gold' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                  <span>Tools</span>
                </button>
                <button
                  onClick={() => setActiveSection('categories')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'categories' ? 'bg-royal-dark text-royal-gold' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Categories</span>
                </button>
                <button
                  onClick={() => setActiveSection('agents')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'agents' ? 'bg-royal-dark text-royal-gold' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Bot className="w-5 h-5" />
                  <span>AI Agents</span>
                </button>
                <button
                  onClick={() => setActiveSection('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'settings' ? 'bg-royal-dark text-royal-gold' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </nav>
            </div>
            <div className="absolute bottom-0 w-full p-6 border-t border-royal-dark-lighter">
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full flex items-center justify-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="ml-64 flex-1 p-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold gradient-text">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h2>
              <button
                onClick={() => {
                  const newItem = activeSection === 'agents' ? {
                    capabilities: [],
                    status: 'active',
                    pricing_type: 'free',
                    is_available_24_7: false,
                    user_count: 0,
                    has_fast_response: false,
                    is_secure: false
                  } : {
                    features: [],
                    useCases: [],
                    pricing: []
                  };
                  setEditingItem(newItem);
                  setIsModalOpen(true);
                  setActiveTab('basic');
                }}
                className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add New</span>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center space-x-2 px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white hover:border-royal-gold transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>Sort</span>
                  {sortDirection === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems().map((item) => (
                <div
                  key={item.id}
                  className="bg-royal-dark-card border border-royal-dark-lighter rounded-xl overflow-hidden group"
                >
                  {activeSection !== 'categories' && item.image_url && (
                    <div className="aspect-[16/9] relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                            setActiveTab('basic');
                          }}
                          className="bg-royal-gold text-royal-dark px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      {item.favicon_url ? (
                        <img 
                          src={item.favicon_url} 
                          alt={`${item.name} logo`}
                          className="w-8 h-8 rounded bg-white p-1 object-contain"
                        />
                      ) : (
                        <Bot className="w-8 h-8 text-royal-gold" />
                      )}
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                    {activeSection === 'agents' && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {item.is_available_24_7 && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Clock className="w-4 h-4 text-royal-gold mr-2" />
                            <span>24/7 Available</span>
                          </div>
                        )}
                        {item.user_count > 0 && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Users className="w-4 h-4 text-royal-gold mr-2" />
                            <span>{item.user_count.toLocaleString()}+ users</span>
                          </div>
                        )}
                        {item.has_fast_response && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Zap className="w-4 h-4 text-royal-gold mr-2" />
                            <span>Fast Response</span>
                          </div>
                        )}
                        {item.is_secure && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Shield className="w-4 h-4 text-royal-gold mr-2" />
                            <span>Secure & Private</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                          setActiveTab('basic');
                        }}
                        className="text-royal-gold hover:text-royal-gold/80 transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-royal-dark-card rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">
                {editingItem.id ? 'Edit' : 'Add New'} {activeSection.slice(0, -1)}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {activeSection === 'tools' && (
              <div className="mb-6 flex space-x-4">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'basic' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                  <span>Basic Info</span>
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'features' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span>Features & Use Cases</span>
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'pricing' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Pricing</span>
                </button>
              </div>
            )}

            {activeSection === 'agents' && (
              <div className="mb-6 flex space-x-4">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'basic' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                  <span>Basic Info</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'stats' ? 'bg-royal-gold text-royal-dark' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span>Stats</span>
                </button>
              </div>
            )}

            <div className="space-y-6">
              {activeTab === 'basic' && (
                <>
                  {/* Common Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                    />
                  </div>

                  {/* Section-specific Fields */}
                  {activeSection === 'tools' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          URL
                        </label>
                        <input
                          type="url"
                          value={editingItem.url || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={editingItem.category_id || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {activeSection === 'agents' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Endpoint
                        </label>
                        <input
                          type="url"
                          value={editingItem.api_endpoint || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, api_endpoint: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Capabilities (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={editingItem.capabilities?.join(', ') || ''}
                          onChange={(e) => setEditingItem({
                            ...editingItem,
                            capabilities: e.target.value.split(',').map(s => s.trim())
                          })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Pricing Type
                        </label>
                        <select
                          value={editingItem.pricing_type || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, pricing_type: e.target.value })}
                          className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                        >
                          <option value="free">Free</option>
                          <option value="freemium">Freemium</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Image Upload */}
                  {activeSection !== 'categories' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Image URL
                        </label>
                        <div className="flex space-x-4">
                          <input
                            type="url"
                            value={editingItem.image_url || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                            className="flex-1 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="Enter image URL"
                          />
                          <button
                            onClick={() => {
                              if (editingItem.image_url) {
                                window.open(editingItem.image_url, '_blank');
                              }
                            }}
                            disabled={!editingItem.image_url}
                            className="flex items-center space-x-2 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white hover:border-royal-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ImageIcon className="w-5 h-5" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Favicon URL
                        </label>
                        <div className="flex space-x-4">
                          <input
                            type="url"
                            value={editingItem.favicon_url || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, favicon_url: e.target.value })}
                            className="flex-1 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            placeholder="Enter favicon URL"
                          />
                          <button
                            onClick={() => {
                              if (editingItem.favicon_url) {
                                window.open(editingItem.favicon_url, '_blank');
                              }
                            }}
                            disabled={!editingItem.favicon_url}
                            className="flex items-center space-x-2 px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white hover:border-royal-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ImageIcon className="w-5 h-5" />
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'features' && activeSection === 'tools' && (
                <>
                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Features</h3>
                      <button
                        onClick={() => setEditingItem({
                          ...editingItem,
                          features: [...(editingItem.features || []), { title: '', description: '' }]
                        })}
                        className="flex items-center space-x-2 text-royal-gold hover:text-royal-gold/80"
                      >
                        <ListPlus className="w-5 h-5" />
                        <span>Add Feature</span>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {editingItem.features?.map((feature: Feature, index: number) => (
                        <div key={index} className="bg-royal-dark rounded-lg p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Title
                            </label>
                            <input
                              type="text"
                              value={feature.title}
                              onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                              className="w-full px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Description
                            </label>
                            <textarea
                              value={feature.description}
                              onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const features = [...editingItem.features];
                              features.splice(index, 1);
                              setEditingItem({ ...editingItem, features });
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Use Cases</h3>
                      <button
                        onClick={() => setEditingItem({
                          ...editingItem,
                          useCases: [...(editingItem.useCases || []), { title: '', description: '' }]
                        })}
                        className="flex items-center space-x-2 text-royal-gold hover:text-royal-gold/80"
                      >
                        <ListPlus className="w-5 h-5" />
                        <span>Add Use Case</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {editingItem.useCases?.map((useCase: UseCase, index: number) => (
                        <div key={index} className="bg-royal-dark rounded-lg p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Title
                            </label>
                            <input
                              type="text"
                              value={useCase.title}
                              onChange={(e) => handleUseCaseChange(index, 'title', e.target.value)}
                              className="w-full px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Description
                            </label>
                            <textarea
                              value={useCase.description}
                              onChange={(e) => handleUseCaseChange(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const useCases = [...editingItem.useCases];
                              useCases.splice(index, 1);
                              setEditingItem({ ...editingItem, useCases });
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'pricing' && activeSection === 'tools' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Pricing Plans</h3>
                    <button
                      onClick={() => setEditingItem({
                        ...editingItem,
                        pricing: [...(editingItem.pricing || []), { plan: '', price: '', features: [] }]
                      })}
                      className="flex items-center space-x-2 text-royal-gold hover:text-royal-gold/80"
                    >
                      <ListPlus className="w-5 h-5" />
                      <span>Add Plan</span>
                    </button>
                  </div>
                  <div className="space-y-6">
                    {editingItem.pricing?.map((plan: PricingPlan, index: number) => (
                      <div
                        key={index}
                        className="bg-royal-dark rounded-lg p-6 space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Plan Name
                            </label>
                            <input
                              type="text"
                              value={plan.plan}
                              onChange={(e) => handlePricingChange(index, 'plan', e.target.value)}
                              className="w-full px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Price
                            </label>
                            <input
                              type="text"
                              value={plan.price}
                              onChange={(e) => handlePricingChange(index, 'price', e.target.value)}
                              className="w-full px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                              Features
                            </label>
                            <button
                              onClick={() => {
                                const pricing = [...editingItem.pricing];
                                pricing[index] = {
                                  ...pricing[index],
                                  features: [...pricing[index].features, '']
                                };
                                setEditingItem({ ...editingItem, pricing });
                              }}
                              className="text-royal-gold hover:text-royal-gold/80 text-sm"
                            >
                              Add Feature
                            </button>
                          </div>
                          <div className="space-y-2">
                            {plan.features.map((feature: string, featureIndex: number) => (
                              <div key={featureIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={feature}
                                  onChange={(e) => handlePricingChange(index, 'feature', e.target.value, featureIndex)}
                                  className="flex-1 px-4 py-2 bg-royal-dark-card border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                                />
                                <button
                                  onClick={() => {
                                    const pricing = [...editingItem.pricing];
                                    pricing[index].features.splice(featureIndex, 1);
                                    setEditingItem({ ...editingItem, pricing });
                                  }}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const pricing = [...editingItem.pricing];
                            pricing.splice(index, 1);
                            setEditingItem({ ...editingItem, pricing });
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove Plan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && activeSection === 'agents' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingItem.is_available_24_7 || false}
                          onChange={(e) => setEditingItem({ ...editingItem, is_available_24_7: e.target.checked })}
                          className="form-checkbox h-5 w-5 text-royal-gold rounded border-royal-dark-lighter focus:ring-royal-gold"
                        />
                        <span className="text-gray-300">24/7 Available</span>
                      </label>
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingItem.has_fast_response || false}
                          onChange={(e) => setEditingItem({ ...editingItem, has_fast_response: e.target.checked })}
                          className="form-checkbox h-5 w-5 text-royal-gold rounded border-royal-dark-lighter focus:ring-royal-gold"
                        />
                        <span className="text-gray-300">Fast Response</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingItem.is_secure || false}
                          onChange={(e) => setEditingItem({ ...editingItem, is_secure: e.target.checked })}
                          className="form-checkbox h-5 w-5 text-royal-gold rounded border-royal-dark-lighter focus:ring-royal-gold"
                        />
                        <span className="text-gray-300">Secure & Private</span>
                      </label>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        User Count
                      </label>
                      <input
                        type="number"
                        value={editingItem.user_count || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, user_count: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-6 py-2 border border-royal-dark-lighter rounded-lg text-gray-300 hover:text-white hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-royal-gold text-royal-dark px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </>
  );
}

export default Admin;