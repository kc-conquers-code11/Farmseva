'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface BlogPost {
  id: string;
  title: string | React.ReactNode;
  excerpt: string | React.ReactNode;
  content: string | React.ReactNode;
  author: string | React.ReactNode;
  authorImage: string;
  publishDate: string;
  readTime: number;
  category: 'news' | 'tips' | 'technology' | 'policy' | 'success-story';
  tags: string[];
  image: string;
  featured: boolean;
}

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: <span data-editor-id="app/blog/page.tsx:26:15">Avian Influenza Advisory: Updated Biosecurity Protocols</span>,
      excerpt: <span data-editor-id="app/blog/page.tsx:27:17">Authorities issued a seasonal advisory for AI. Here are practical steps small and mid-size farms can implement today.</span>,
      content: <span data-editor-id="app/blog/page.tsx:28:17">Full article content would go here...</span>,
      author: <span data-editor-id="app/blog/page.tsx:29:15">Dr. Meera Nair</span>,
      authorImage: 'https://i.pravatar.cc/400?u=author1',
      publishDate: '2025-01-10',
      readTime: 7,
      category: 'policy',
      tags: ['avian-influenza', 'biosecurity', 'advisory', 'poultry'],
      image: 'https://images.unsplash.com/photo-1518366636391-7e1f15e6b778',
      featured: true
    },
    {
      id: '2',
      title: <span data-editor-id="app/blog/page.tsx:39:15">Pig Housing: Drainage, Ventilation, and Hygiene</span>,
      excerpt: <span data-editor-id="app/blog/page.tsx:40:17">Thoughtful pig housing design reduces disease risk and improves growth. These layouts and routines can help.</span>,
      content: <span data-editor-id="app/blog/page.tsx:41:17">Full article content would go here...</span>,
      author: <span data-editor-id="app/blog/page.tsx:42:15">Arun Verma</span>,
      authorImage: 'https://i.pravatar.cc/400?u=author2',
      publishDate: '2025-01-08',
      readTime: 6,
      category: 'tips',
      tags: ['pig', 'housing', 'ventilation', 'hygiene'],
      image: 'https://images.unsplash.com/photo-1545605281-3e3bbd6e0144',
      featured: true
    },
    {
      id: '3',
      title: <span data-editor-id="app/blog/page.tsx:52:15">Broiler Price Outlook: Q1 Seasonality</span>,
      excerpt: <span data-editor-id="app/blog/page.tsx:53:17">We analyze typical Q1 broiler price movement and factors that may influence retail demand this year.</span>,
      content: <span data-editor-id="app/blog/page.tsx:54:17">Full article content would go here...</span>,
      author: <span data-editor-id="app/blog/page.tsx:55:15">Market Desk</span>,
      authorImage: 'https://i.pravatar.cc/400?u=author3',
      publishDate: '2025-01-05',
      readTime: 5,
      category: 'news',
      tags: ['poultry', 'prices', 'market', 'seasonality'],
      image: 'https://images.unsplash.com/photo-1552871632-09bf5311186d',
      featured: false
    },
    {
      id: '4',
      title: <span data-editor-id="app/blog/page.tsx:65:15">Low-cost IoT Sensors for Poultry Houses</span>,
      excerpt: <span data-editor-id="app/blog/page.tsx:66:17">Monitor temperature and humidity with affordable sensors. Reduce heat-stress and improve FCR.</span>,
      content: <span data-editor-id="app/blog/page.tsx:67:17">Full article content would go here...</span>,
      author: <span data-editor-id="app/blog/page.tsx:68:15">Tech Team</span>,
      authorImage: 'https://i.pravatar.cc/400?u=author4',
      publishDate: '2025-01-03',
      readTime: 6,
      category: 'technology',
      tags: ['iot', 'poultry', 'sensors', 'heat-stress'],
      image: 'https://images.unsplash.com/photo-1580711600699-5db1a1101e57',
      featured: false
    },
    {
      id: '5',
      title: <span data-editor-id="app/blog/page.tsx:78:15">Piglet Care: First 8 Weeks</span>,
      excerpt: <span data-editor-id="app/blog/page.tsx:79:17">Colostrum, warmth, and clean pens—the foundations for healthy piglets and lower mortality.</span>,
      content: <span data-editor-id="app/blog/page.tsx:80:17">Full article content would go here...</span>,
      author: <span data-editor-id="app/blog/page.tsx:81:15">Dr. Kavita Rao</span>,
      authorImage: 'https://i.pravatar.cc/400?u=author5',
      publishDate: '2025-01-01',
      readTime: 5,
      category: 'tips',
      tags: ['piglet', 'health', 'management'],
      image: 'https://images.unsplash.com/photo-1541689221361-ad95003448dc',
      featured: false
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const searchMatch = searchTerm === '' || 
      post.title.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return searchMatch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div data-editor-id="app/blog/page.tsx:129:5" className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/blog/page.tsx:134:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
            <h1 data-editor-id="app/blog/page.tsx:142:13" className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              Pig & Poultry <span data-editor-id="app/blog/page.tsx:143:23" className="text-green-600 font-medium">Blog & News</span>
            </h1>
            <p data-editor-id="app/blog/page.tsx:145:13" className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
              Latest insights, tips, and updates for pig & poultry farming
            </p>

            {/* Search */}
            <div data-editor-id="app/blog/page.tsx:158:13" className="max-w-md mx-auto relative">
              <Icon icon="mdi:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search articles, tips, news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 bg-white">
          <div data-editor-id="app/blog/page.tsx:193:11" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 data-editor-id="app/blog/page.tsx:201:15" className="text-2xl font-medium text-neutral-800 mb-8">Featured Articles</h2>
              <div data-editor-id="app/blog/page.tsx:202:15" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post, index) => (
                  <motion.article key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
                    <div data-editor-id="app/blog/page.tsx:213:21" className="relative h-64 overflow-hidden">
                      <img src={post.image} alt={post.title.toString()} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div data-editor-id="app/blog/page.tsx:219:23" className="absolute top-4 left-4">
                        <span data-editor-id="app/blog/page.tsx:220:25" className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.category === 'news' ? 'bg-blue-100 text-blue-700' :
                          post.category === 'tips' ? 'bg-green-100 text-green-700' :
                          post.category === 'technology' ? 'bg-purple-100 text-purple-700' :
                          post.category === 'policy' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {post.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div data-editor-id="app/blog/page.tsx:230:21" className="p-6">
                      <div data-editor-id="app/blog/page.tsx:231:23" className="flex items-center space-x-4 mb-3">
                        <img src={post.authorImage} alt={post.author.toString()} className="w-8 h-8 rounded-full object-cover" />
                        <div data-editor-id="app/blog/page.tsx:237:25">
                          <p data-editor-id="app/blog/page.tsx:238:27" className="text-sm text-neutral-600">{post.author}</p>
                          <div data-editor-id="app/blog/page.tsx:239:27" className="flex items-center space-x-2 text-xs text-neutral-500">
                            <span data-editor-id="app/blog/page.tsx:240:29">{formatDate(post.publishDate)}</span>
                            <span data-editor-id="app/blog/page.tsx:241:29">•</span>
                            <span data-editor-id="app/blog/page.tsx:242:29">{post.readTime} min read</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 data-editor-id="app/blog/page.tsx:247:23" className="text-xl font-medium text-neutral-800 mb-3 group-hover:text-green-700 transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p data-editor-id="app/blog/page.tsx:251:23" className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div data-editor-id="app/blog/page.tsx:255:23" className="flex items-center justify-between">
                        <div data-editor-id="app/blog/page.tsx:256:25" className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs hover:bg-green-100 hover:text-green-700 transition-colors cursor-pointer">#{tag}</span>
                          ))}
                        </div>
                        <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors text-sm font-medium">
                          <span data-editor-id="app/blog/page.tsx:268:27">Read More</span>
                          <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-12 bg-gray-50">
        <div data-editor-id="app/blog/page.tsx:281:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-editor-id="app/blog/page.tsx:282:11" className="flex justify-between items-center mb-8">
            <h2 data-editor-id="app/blog/page.tsx:283:13" className="text-2xl font-medium text-neutral-800">
              Latest Articles
            </h2>
            <p data-editor-id="app/blog/page.tsx:286:13" className="text-sm text-neutral-500">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div data-editor-id="app/blog/page.tsx:291:11" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post, index) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-lg transition-all duration-300 hover:border-green-200 group">
                <div data-editor-id="app/blog/page.tsx:301:17" className="relative h-48 overflow-hidden">
                  <img src={post.image} alt={post.title.toString()} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div data-editor-id="app/blog/page.tsx:307:19" className="absolute top-3 left-3">
                    <span data-editor-id="app/blog/page.tsx:308:21" className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.category === 'news' ? 'bg-blue-100 text-blue-700' :
                      post.category === 'tips' ? 'bg-green-100 text-green-700' :
                      post.category === 'technology' ? 'bg-purple-100 text-purple-700' :
                      post.category === 'policy' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div data-editor-id="app/blog/page.tsx:318:17" className="p-6">
                  <div data-editor-id="app/blog/page.tsx:319:19" className="flex items-center space-x-3 mb-3">
                    <img src={post.authorImage} alt={post.author.toString()} className="w-6 h-6 rounded-full object-cover" />
                    <div data-editor-id="app/blog/page.tsx:325:21" className="text-xs text-neutral-500">
                      <span data-editor-id="app/blog/page.tsx:326:23">{post.author}</span>
                      <span data-editor-id="app/blog/page.tsx:327:23"> • </span>
                      <span data-editor-id="app/blog/page.tsx:328:23">{formatDate(post.publishDate)}</span>
                    </div>
                  </div>
                  
                  <h3 data-editor-id="app/blog/page.tsx:332:19" className="text-lg font-medium text-neutral-800 mb-2 group-hover:text-green-700 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p data-editor-id="app/blog/page.tsx:336:19" className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div data-editor-id="app/blog/page.tsx:340:19" className="flex items-center justify-between">
                    <div data-editor-id="app/blog/page.tsx:341:21" className="flex items-center space-x-3 text-xs text-neutral-500">
                      <span data-editor-id="app/blog/page.tsx:342:23">{post.readTime} min read</span>
                    </div>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors text-sm font-medium">
                      <span data-editor-id="app/blog/page.tsx:345:23">Read</span>
                      <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Icon icon="mdi:newspaper-variant-outline" className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 data-editor-id="app/blog/page.tsx:360:15" className="text-xl font-medium text-neutral-600 mb-2">No articles found</h3>
              <p data-editor-id="app/blog/page.tsx:361:15" className="text-neutral-500">Try adjusting your search or category filters</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
