'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Product {
  id: string;
  name: string | React.ReactNode;
  description: string | React.ReactNode;
  price: number;
  unit: string;
  category: 'pig' | 'poultry';
  farmerName: string | React.ReactNode;
  location: string | React.ReactNode;
  image: string;
  quantity: string;
  organic?: boolean;
  rating: number;
  reviews: number;
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'pig' | 'poultry'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const products: Product[] = [
    {
      id: 'p1',
      name: <span data-editor-id="app/marketplace/page.tsx:30:13">Healthy Piglets (8–10 weeks)</span>,
      description: <span data-editor-id="app/marketplace/page.tsx:31:19">Vaccinated crossbreed piglets with good growth potential. Ideal for smallholders and commercial units.</span>,
      price: 4200,
      unit: 'per piglet',
      category: 'pig',
      farmerName: <span data-editor-id="app/marketplace/page.tsx:35:19">Rajesh Kumar</span>,
      location: <span data-editor-id="app/marketplace/page.tsx:36:17">Ludhiana, Punjab</span>,
      image: 'https://images.unsplash.com/photo-1545605281-3e3bbd6e0144',
      quantity: '25 available',
      organic: true,
      rating: 4.8,
      reviews: 24
    },
    {
      id: 'p2',
      name: <span data-editor-id="app/marketplace/page.tsx:46:13">Broiler Chickens (2.0–2.2 kg)</span>,
      description: <span data-editor-id="app/marketplace/page.tsx:47:19">Healthy broilers ready for sale. Batch certificates and vaccination records available.</span>,
      price: 120,
      unit: 'per kg',
      category: 'poultry',
      farmerName: <span data-editor-id="app/marketplace/page.tsx:51:19">Anil Patel</span>,
      location: <span data-editor-id="app/marketplace/page.tsx:52:17">Anand, Gujarat</span>,
      image: 'https://images.unsplash.com/photo-1518366636391-7e1f15e6b778',
      quantity: '600 birds',
      organic: false,
      rating: 4.7,
      reviews: 31
    },
    {
      id: 'p3',
      name: <span data-editor-id="app/marketplace/page.tsx:61:13">Free-range Eggs</span>,
      description: <span data-editor-id="app/marketplace/page.tsx:62:19">Fresh eggs from free-range hens. Cleaned and graded. Weekly delivery available.</span>,
      price: 6,
      unit: 'per egg',
      category: 'poultry',
      farmerName: <span data-editor-id="app/marketplace/page.tsx:66:19">Priya Sharma</span>,
      location: <span data-editor-id="app/marketplace/page.tsx:67:17">Shimla, Himachal Pradesh</span>,
      image: 'https://images.unsplash.com/photo-1552871632-09bf5311186d',
      quantity: '3,000 eggs/week',
      organic: true,
      rating: 4.6,
      reviews: 18
    },
    {
      id: 'p4',
      name: <span data-editor-id="app/marketplace/page.tsx:76:13">Breeding Boar</span>,
      description: <span data-editor-id="app/marketplace/page.tsx:77:19">Proven genetics, disease-free certified. Documentation available on request.</span>,
      price: 21000,
      unit: 'per boar',
      category: 'pig',
      farmerName: <span data-editor-id="app/marketplace/page.tsx:81:19">Mohan Singh</span>,
      location: <span data-editor-id="app/marketplace/page.tsx:82:17">Karnal, Haryana</span>,
      image: 'https://images.unsplash.com/photo-1541689221361-ad95003448dc',
      quantity: '2 available',
      organic: false,
      rating: 4.9,
      reviews: 12
    }
  ];

  const categories = [
    { key: 'all', label: <span data-editor-id="app/marketplace/page.tsx:122:31">All</span>, icon: 'mdi:apps' },
    { key: 'pig', label: <span data-editor-id="app/marketplace/page.tsx:123:31">Pig</span>, icon: 'mdi:pig' },
    { key: 'poultry', label: <span data-editor-id="app/marketplace/page.tsx:126:33">Poultry</span>, icon: 'mingcute:chicken-line' }
  ];

  const filteredProducts = products.filter(product => {
    const categoryMatch = activeCategory === 'all' || product.category === activeCategory;
    const searchMatch = searchTerm === '' || 
      product.name.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmerName.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
      default:
        return 0;
    }
  });

  return (
    <div data-editor-id="app/marketplace/page.tsx:150:5" className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/marketplace/page.tsx:155:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 data-editor-id="app/marketplace/page.tsx:163:13" className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              Pig & Poultry <span data-editor-id="app/marketplace/page.tsx:164:23" className="text-green-600 font-medium">Marketplace</span>
            </h1>
            <p data-editor-id="app/marketplace/page.tsx:166:13" className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
              Buy and sell piglets, broilers, eggs, and more—directly with trusted farmers
            </p>
            
            <div data-editor-id="app/marketplace/page.tsx:170:13" className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 font-medium">
                <span data-editor-id="app/marketplace/page.tsx:172:17">List Your Items</span>
              </button>
              <button className="px-8 py-3 border border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all duration-200 font-medium">
                <span data-editor-id="app/marketplace/page.tsx:175:17">Join as Buyer</span>
              </button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100"
          >
            {/* Category Tabs */}
            <div data-editor-id="app/marketplace/page.tsx:188:13" className="flex flex-wrap gap-2 mb-6">
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
                  <span data-editor-id="app/marketplace/page.tsx:201:19">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Search and Sort */}
            <div data-editor-id="app/marketplace/page.tsx:207:13" className="flex flex-col md:flex-row gap-4">
              <div data-editor-id="app/marketplace/page.tsx:208:15" className="flex-1 relative">
                <Icon icon="mdi:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search products, farmers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
              
              <div data-editor-id="app/marketplace/page.tsx:220:15" className="relative">
                <Icon icon="mdi:sort" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm appearance-none bg-white min-w-48"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div data-editor-id="app/marketplace/page.tsx:241:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-editor-id="app/marketplace/page.tsx:242:11" className="flex justify-between items-center mb-8">
            <h2 data-editor-id="app/marketplace/page.tsx:243:13" className="text-2xl font-medium text-neutral-800">
              {sortedProducts.length} Products Available
            </h2>
            <div data-editor-id="app/marketplace/page.tsx:246:13" className="text-sm text-neutral-500">
              Showing {activeCategory !== 'all' ? activeCategory : 'all'} products
            </div>
          </div>

          <div data-editor-id="app/marketplace/page.tsx:251:11" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-lg transition-all duration-300 hover:border-green-200 group"
              >
                {/* Product Image */}
                <div data-editor-id="app/marketplace/page.tsx:261:17" className="relative h-48 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name.toString()}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div data-editor-id="app/marketplace/page.tsx:267:19" className="absolute top-4 left-4 flex gap-2">
                    {product.organic && (
                      <span data-editor-id="app/marketplace/page.tsx:269:23" className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Organic
                      </span>
                    )}
                    <span data-editor-id="app/marketplace/page.tsx:274:21" className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.category === 'pig' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.category}
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                    <Icon icon="mdi:heart-outline" className="w-4 h-4 text-neutral-600" />
                  </button>
                </div>

                {/* Product Info */}
                <div data-editor-id="app/marketplace/page.tsx:286:17" className="p-6">
                  <div data-editor-id="app/marketplace/page.tsx:287:19" className="flex justify-between items-start mb-2">
                    <h3 data-editor-id="app/marketplace/page.tsx:288:21" className="text-lg font-medium text-neutral-800 group-hover:text-green-700 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div data-editor-id="app/marketplace/page.tsx:291:21" className="text-right">
                      <div data-editor-id="app/marketplace/page.tsx:292:23" className="text-xl font-semibold text-green-600">₹{product.price}</div>
                      <div data-editor-id="app/marketplace/page.tsx:293:23" className="text-xs text-neutral-500">{product.unit}</div>
                    </div>
                  </div>

                  <p data-editor-id="app/marketplace/page.tsx:297:19" className="text-neutral-600 text-sm mb-4 leading-relaxed">
                    {product.description}
                  </p>

                  <div data-editor-id="app/marketplace/page.tsx:301:19" className="space-y-2 mb-4">
                    <div data-editor-id="app/marketplace/page.tsx:302:21" className="flex items-center justify-between text-sm">
                      <div data-editor-id="app/marketplace/page.tsx:303:23" className="flex items-center space-x-2">
                        <Icon icon="mdi:account-circle" className="w-4 h-4 text-green-500" />
                        <span data-editor-id="app/marketplace/page.tsx:305:25" className="text-neutral-600">{product.farmerName}</span>
                      </div>
                      <div data-editor-id="app/marketplace/page.tsx:307:23" className="flex items-center space-x-1">
                        <Icon icon="mdi:star" className="w-4 h-4 text-yellow-500" />
                        <span data-editor-id="app/marketplace/page.tsx:309:25" className="text-neutral-600">{product.rating}</span>
                        <span data-editor-id="app/marketplace/page.tsx:310:25" className="text-neutral-400">({product.reviews})</span>
                      </div>
                    </div>
                    
                    <div data-editor-id="app/marketplace/page.tsx:314:21" className="flex items-center space-x-2 text-sm">
                      <Icon icon="mdi:map-marker" className="w-4 h-4 text-green-500" />
                      <span data-editor-id="app/marketplace/page.tsx:316:23" className="text-neutral-600">{product.location}</span>
                    </div>
                    
                    <div data-editor-id="app/marketplace/page.tsx:319:21" className="flex items-center space-x-2 text-sm">
                      <Icon icon="mdi:package-variant" className="w-4 h-4 text-green-500" />
                      <span data-editor-id="app/marketplace/page.tsx:321:23" className="text-neutral-600">{product.quantity}</span>
                    </div>
                  </div>

                  <div data-editor-id="app/marketplace/page.tsx:333:19" className="flex gap-2">
                    <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
                      <span data-editor-id="app/marketplace/page.tsx:335:21">Contact Farmer</span>
                    </button>
                    <button className="px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200">
                      <Icon icon="mdi:cart-plus" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Icon icon="mdi:store-search" className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 data-editor-id="app/marketplace/page.tsx:352:15" className="text-xl font-medium text-neutral-600 mb-2">No products found</h3>
              <p data-editor-id="app/marketplace/page.tsx:353:15" className="text-neutral-500">Try adjusting your search or category filters</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
