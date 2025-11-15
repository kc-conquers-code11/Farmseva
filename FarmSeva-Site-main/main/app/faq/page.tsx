'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface FAQItem {
  id: string;
  question: string | React.ReactNode;
  answer: string | React.ReactNode;
  category: 'schemes' | 'marketplace' | 'community' | 'technical' | 'general';
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'schemes' | 'marketplace' | 'community' | 'technical' | 'general'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: <span data-editor-id="app/faq/page.tsx:19:17">How do I find pig & poultry schemes?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:20:15">Go to Government Schemes, select Pig or Poultry, choose your state, and apply. We provide eligibility, benefits, and the application process.</span>,
      category: 'schemes'
    },
    {
      id: '2',
      question: <span data-editor-id="app/faq/page.tsx:25:17">Which documents are needed for scheme applications?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:26:15">Common documents include Aadhar, PAN, bank details, farm registration (if any), and basic KYC. Some schemes may ask for veterinary certificates or farm photos.</span>,
      category: 'schemes'
    },
    {
      id: '3',
      question: <span data-editor-id="app/faq/page.tsx:31:17">How do I list piglets, broilers, or eggs on the marketplace?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:32:15">Sign in, open Marketplace, click &quot;List Your Items&quot;, and add details: category (Pig/Poultry), quantity, price, location, and clear photos. Verification is quick.</span>,
      category: 'marketplace'
    },
    {
      id: '4',
      question: <span data-editor-id="app/faq/page.tsx:37:17">How does FarmSeva keep buyers and sellers safe?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:38:15">We flag suspicious listings, promote verified sellers, and show security alerts about scams. Always verify certificates and avoid advance payments to unknown parties.</span>,
      category: 'marketplace'
    },
    {
      id: '5',
      question: <span data-editor-id="app/faq/page.tsx:43:17">What kind of discussions happen in the forum?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:44:15">Biosecurity, disease control (ASF/AI), housing designs, feed formulation, pricing trends, and success stories from pig & poultry farmers.</span>,
      category: 'community'
    },
    {
      id: '6',
      question: <span data-editor-id="app/faq/page.tsx:49:17">Do you support regional languages?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:50:15">Currently English and Hindi. We are adding more languages soon. Tell us your preference in Feedback.</span>,
      category: 'technical'
    },
    {
      id: '7',
      question: <span data-editor-id="app/faq/page.tsx:55:17">What does the Smart Dashboard include?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:56:15">Pig & poultry risk assessment (climate, pests/diseases, prices), disease prediction, security alerts, weather alerts, and analytics with bar/line/donut charts.</span>,
      category: 'general'
    },
    {
      id: '8',
      question: <span data-editor-id="app/faq/page.tsx:61:17">How are prices and weather powered?</span>,
      answer: <span data-editor-id="app/faq/page.tsx:62:15">We use provider stubs labeled &quot;Other&quot; for prices and weather. Integrations can be configured later via /api/prices and /api/weather.</span>,
      category: 'technical'
    }
  ];

  const categories = [
    { key: 'all', label: <span data-editor-id="app/faq/page.tsx:93:31">All FAQs</span>, icon: 'mdi:help-circle', count: faqItems.length },
    { key: 'schemes', label: <span data-editor-id="app/faq/page.tsx:94:33">Government Schemes</span>, icon: 'mingcute:government-fill', count: faqItems.filter(item => item.category === 'schemes').length },
    { key: 'marketplace', label: <span data-editor-id="app/faq/page.tsx:95:37">Marketplace</span>, icon: 'mdi:storefront', count: faqItems.filter(item => item.category === 'marketplace').length },
    { key: 'community', label: <span data-editor-id="app/faq/page.tsx:96:35">Community</span>, icon: 'mdi:people', count: faqItems.filter(item => item.category === 'community').length },
    { key: 'technical', label: <span data-editor-id="app/faq/page.tsx:97:35">Technical</span>, icon: 'mdi:cog', count: faqItems.filter(item => item.category === 'technical').length },
    { key: 'general', label: <span data-editor-id="app/faq/page.tsx:98:33">General</span>, icon: 'mdi:information', count: faqItems.filter(item => item.category === 'general').length }
  ];

  const filteredItems = faqItems.filter(item => {
    const categoryMatch = activeCategory === 'all' || item.category === activeCategory;
    const searchMatch = searchTerm === '' || 
      item.question.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  return (
    <div data-editor-id="app/faq/page.tsx:115:5" className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/faq/page.tsx:120:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
            <h1 data-editor-id="app/faq/page.tsx:128:13" className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              Frequently Asked <span data-editor-id="app/faq/page.tsx:129:39" className="text-green-600 font-medium">Questions</span>
            </h1>
            <p data-editor-id="app/faq/page.tsx:131:13" className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
              Answers tailored for pig & poultry farming on FarmSeva
            </p>

            {/* Search */}
            <div data-editor-id="app/faq/page.tsx:136:13" className="max-w-md mx-auto relative">
              <Icon icon="mdi:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key as typeof activeCategory)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.key
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-neutral-600 hover:bg-green-50 hover:text-green-600 shadow-sm'
                }`}
              >
                <Icon icon={category.icon} className="w-4 h-4" />
                <span data-editor-id="app/faq/page.tsx:163:17">{category.label}</span>
                <span data-editor-id="app/faq/page.tsx:164:17" className={`${activeCategory === category.key ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'} px-2 py-0.5 rounded-full text-xs`}>
                  {category.count}
                </span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-12">
        <div data-editor-id="app/faq/page.tsx:177:9" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-editor-id="app/faq/page.tsx:178:11" className="mb-8">
            <p data-editor-id="app/faq/page.tsx:179:13" className="text-lg text-neutral-600">
              {filteredItems.length} question{filteredItems.length !== 1 ? 's' : ''} found
              {activeCategory !== 'all' && ` in ${activeCategory}`}
            </p>
          </div>

          <div data-editor-id="app/faq/page.tsx:186:11" className="space-y-4">
            {filteredItems.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <button onClick={() => toggleExpanded(item.id)} className="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50">
                  <div data-editor-id="app/faq/page.tsx:199:19" className="flex items-center justify-between">
                    <div data-editor-id="app/faq/page.tsx:200:21" className="flex items-center space-x-4 flex-1">
                      <div data-editor-id="app/faq/page.tsx:201:23" className="w-2 h-2 rounded-full bg-green-500" />
                      <h3 data-editor-id="app/faq/page.tsx:208:23" className="text-lg font-medium text-neutral-800 pr-4">
                        {item.question}
                      </h3>
                    </div>
                    <Icon icon={expandedItems.includes(item.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-5 h-5 text-neutral-400 transition-transform duration-200" />
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedItems.includes(item.id) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                      <div data-editor-id="app/faq/page.tsx:226:23" className="px-6 pb-6 pt-0">
                        <div data-editor-id="app/faq/page.tsx:227:25" className="ml-6 pl-4 border-l-2 border-green-100">
                          <p data-editor-id="app/faq/page.tsx:228:27" className="text-neutral-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Icon icon="mdi:help-circle-outline" className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 data-editor-id="app/faq/page.tsx:246:15" className="text-xl font-medium text-neutral-600 mb-2">No FAQs found</h3>
              <p data-editor-id="app/faq/page.tsx:247:15" className="text-neutral-500 mb-4">Try adjusting your search or category filter</p>
              <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
                <span data-editor-id="app/faq/page.tsx:254:17">Clear Filters</span>
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/faq/page.tsx:263:9" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 data-editor-id="app/faq/page.tsx:271:13" className="text-2xl font-light text-neutral-800 mb-4">
              Didn&apos;t find what you were looking for?
            </h2>
            <p data-editor-id="app/faq/page.tsx:274:13" className="text-neutral-600 mb-8 max-w-2xl mx-auto">
              Our support team is here to help. Reach out to us and we&apos;ll get back to you as soon as possible.
            </p>
            <div data-editor-id="app/faq/page.tsx:277:13" className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/about-us#contact" className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 font-medium">
                <Icon icon="mdi:email" className="w-4 h-4" />
                <span data-editor-id="app/faq/page.tsx:284:17">Contact Support</span>
              </a>
              <a href="tel:1800-FARM-SEVA" className="inline-flex items-center space-x-2 px-6 py-3 border border-green-600 text-green-600 rounded-full hover:bg-green-50 transition-colors duration-200 font-medium">
                <Icon icon="mdi:phone" className="w-4 h-4" />
                <span data-editor-id="app/faq/page.tsx:291:17">Call Us</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
