'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Post {
  id: string;
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  author: string | React.ReactNode;
  authorAvatar: string;
  category: 'question' | 'tip' | 'discussion' | 'success';
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  timeAgo: string;
  isResolved?: boolean;
}

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'question' | 'tip' | 'discussion' | 'success'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const posts: Post[] = [
    {
      id: '1',
      title: <span data-editor-id="app/community/page.tsx:26:15">ASF prevention checklist for small pig farms?</span>,
      content: <span data-editor-id="app/community/page.tsx:27:17">What basic biosecurity steps should I follow to reduce African Swine Fever risk in my 20-pig unit?</span>,
      author: <span data-editor-id="app/community/page.tsx:28:15">Rajesh Kumar</span>,
      authorAvatar: 'https://i.pravatar.cc/400?u=rajesh1',
      category: 'question',
      tags: ['pig', 'ASF', 'biosecurity', 'checklist'],
      likes: 12,
      replies: 8,
      views: 156,
      timeAgo: '2 hours ago',
      isResolved: false
    },
    {
      id: '2',
      title: <span data-editor-id="app/community/page.tsx:40:15">Broiler heat-stress tips that worked for me</span>,
      content: <span data-editor-id="app/community/page.tsx:41:17">Sharing low-cost fogging and ventilation ideas that kept my FCR stable during peak heat.</span>,
      author: <span data-editor-id="app/community/page.tsx:42:15">Priya Sharma</span>,
      authorAvatar: 'https://i.pravatar.cc/400?u=priya2',
      category: 'success',
      tags: ['poultry', 'heat-stress', 'FCR', 'ventilation'],
      likes: 45,
      replies: 23,
      views: 892,
      timeAgo: '1 day ago'
    },
    {
      id: '3',
      title: <span data-editor-id="app/community/page.tsx:52:15">Layer feed formulation discussion (18% CP)</span>,
      content: <span data-editor-id="app/community/page.tsx:53:17">What rations are you using for 18% crude protein with locally available ingredients?</span>,
      author: <span data-editor-id="app/community/page.tsx:54:15">Mohan Singh</span>,
      authorAvatar: 'https://i.pravatar.cc/400?u=mohan3',
      category: 'discussion',
      tags: ['poultry', 'feed', 'formulation', 'layers'],
      likes: 23,
      replies: 15,
      views: 456,
      timeAgo: '5 days ago'
    },
    {
      id: '4',
      title: <span data-editor-id="app/community/page.tsx:64:15">Pig housing drainage layout suggestions</span>,
      content: <span data-editor-id="app/community/page.tsx:65:17">Looking for sample layouts to prevent waterlogging in pens during monsoon.</span>,
      author: <span data-editor-id="app/community/page.tsx:66:15">Anil Patel</span>,
      authorAvatar: 'https://i.pravatar.cc/400?u=anil4',
      category: 'tip',
      tags: ['pig', 'housing', 'drainage', 'monsoon'],
      likes: 18,
      replies: 9,
      views: 334,
      timeAgo: '1 week ago'
    }
  ];

  const categories = [
    { key: 'all', label: <span data-editor-id="app/community/page.tsx:102:31">All Posts</span>, icon: 'mdi:apps', color: 'gray' },
    { key: 'question', label: <span data-editor-id="app/community/page.tsx:103:33">Questions</span>, icon: 'mdi:help-circle', color: 'blue' },
    { key: 'tip', label: <span data-editor-id="app/community/page.tsx:104:27">Tips</span>, icon: 'mdi:lightbulb', color: 'yellow' },
    { key: 'discussion', label: <span data-editor-id="app/community/page.tsx:105:35">Discussions</span>, icon: 'mdi:chat', color: 'green' },
    { key: 'success', label: <span data-editor-id="app/community/page.tsx:106:31">Success Stories</span>, icon: 'mdi:trophy', color: 'orange' }
  ];

  const filteredPosts = posts.filter(post => {
    const categoryMatch = activeCategory === 'all' || post.category === activeCategory;
    const searchMatch = searchTerm === '' || 
      post.title.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  return (
    <div data-editor-id="app/community/page.tsx:126:5" className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/community/page.tsx:131:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 data-editor-id="app/community/page.tsx:139:13" className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              Pig & Poultry <span data-editor-id="app/community/page.tsx:140:27" className="text-green-600 font-medium">Forum</span>
            </h1>
            <p data-editor-id="app/community/page.tsx:142:13" className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
              Ask questions, share experiences, and learn from fellow pig & poultry farmers
            </p>
            
            <button className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 font-medium">
              <Icon icon="mdi:plus" className="w-5 h-5 inline mr-2" />
              <span data-editor-id="app/community/page.tsx:148:15">Start New Discussion</span>
            </button>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100"
          >
            {/* Category Tabs */}
            <div data-editor-id="app/community/page.tsx:160:13" className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key as typeof activeCategory)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category.key
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <Icon icon={category.icon} className="w-4 h-4" />
                  <span data-editor-id="app/community/page.tsx:173:19">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div data-editor-id="app/community/page.tsx:179:13" className="relative">
              <Icon icon="mdi:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search discussions, questions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-12">
        <div data-editor-id="app/community/page.tsx:217:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-editor-id="app/community/page.tsx:218:11" className="flex justify-between items-center mb-8">
            <h2 data-editor-id="app/community/page.tsx:219:13" className="text-2xl font-medium text-neutral-800">
              {filteredPosts.length} {activeCategory !== 'all' ? activeCategory : 'posts'} found
            </h2>
            <div data-editor-id="app/community/page.tsx:222:13" className="flex items-center space-x-2 text-sm text-neutral-500">
              <Icon icon="mdi:sort" className="w-4 h-4" />
              <span data-editor-id="app/community/page.tsx:224:15">Sorted by latest activity</span>
            </div>
          </div>

          <div data-editor-id="app/community/page.tsx:228:11" className="space-y-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-300 hover:border-green-200"
              >
                <div data-editor-id="app/community/page.tsx:238:17" className="flex items-start space-x-4">
                  {/* Author Avatar */}
                  <img 
                    src={post.authorAvatar} 
                    alt={post.author.toString()}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div data-editor-id="app/community/page.tsx:246:19" className="flex-1">
                    <div data-editor-id="app/community/page.tsx:247:21" className="flex items-center justify-between mb-2">
                      <div data-editor-id="app/community/page.tsx:248:23" className="flex items-center space-x-3">
                        <h3 data-editor-id="app/community/page.tsx:249:25" className="font-medium text-neutral-800">{post.author}</h3>
                        <span data-editor-id="app/community/page.tsx:250:25" className="text-sm text-neutral-500">{post.timeAgo}</span>
                        <div data-editor-id="app/community/page.tsx:251:25" className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.category === 'question' ? 'bg-blue-100 text-blue-700' :
                          post.category === 'tip' ? 'bg-yellow-100 text-yellow-700' :
                          post.category === 'discussion' ? 'bg-green-100 text-green-700' :
                          post.category === 'success' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          <Icon icon={categories.find(c => c.key === post.category)?.icon || 'mdi:circle'} className="w-3 h-3 inline mr-1" />
                          {post.category}
                        </div>
                        {post.isResolved && (
                          <div data-editor-id="app/community/page.tsx:260:25" className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <Icon icon="mdi:check-circle" className="w-3 h-3 inline mr-1" />
                            <span data-editor-id="app/community/page.tsx:262:29">Resolved</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Title & Content */}
                    <h2 data-editor-id="app/community/page.tsx:268:21" className="text-lg font-medium text-neutral-800 mb-2 hover:text-green-600 transition-colors cursor-pointer">
                      {post.title}
                    </h2>
                    <p data-editor-id="app/community/page.tsx:271:21" className="text-neutral-600 text-sm mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Tags */}
                    <div data-editor-id="app/community/page.tsx:276:21" className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md text-xs hover:bg-green-100 hover:text-green-700 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Stats */}
                    <div data-editor-id="app/community/page.tsx:288:21" className="flex items-center justify-between">
                      <div data-editor-id="app/community/page.tsx:289:23" className="flex items-center space-x-6">
                        <button className="flex items-center space-x-1 text-neutral-500 hover:text-green-600 transition-colors">
                          <Icon icon="mdi:thumb-up-outline" className="w-4 h-4" />
                          <span data-editor-id="app/community/page.tsx:292:27" className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-neutral-500 hover:text-green-600 transition-colors">
                          <Icon icon="mdi:comment-outline" className="w-4 h-4" />
                          <span data-editor-id="app/community/page.tsx:296:27" className="text-sm">{post.replies}</span>
                        </button>
                        <div data-editor-id="app/community/page.tsx:298:25" className="flex items-center space-x-1 text-neutral-500">
                          <Icon icon="mdi:eye-outline" className="w-4 h-4" />
                          <span data-editor-id="app/community/page.tsx:300:27" className="text-sm">{post.views}</span>
                        </div>
                      </div>
                      
                      <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors text-sm font-medium">
                        <span data-editor-id="app/community/page.tsx:305:25">Reply</span>
                        <Icon icon="mdi:reply" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Icon icon="mdi:forum-outline" className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 data-editor-id="app/community/page.tsx:321:15" className="text-xl font-medium text-neutral-600 mb-2">No posts found</h3>
              <p data-editor-id="app/community/page.tsx:322:15" className="text-neutral-500">Try adjusting your search or category filters</p>
              <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
                <span data-editor-id="app/community/page.tsx:324:17">Start the first discussion</span>
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
