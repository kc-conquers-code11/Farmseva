'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Scheme {
  id: string;
  name: string | React.ReactNode;
  description: string | React.ReactNode;
  species: 'pig' | 'poultry';
  state: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string | React.ReactNode;
  deadline?: string;
  amount?: string;
}

export default function SchemesPage() {
  const [activeSpecies, setActiveSpecies] = useState<'all' | 'pig' | 'poultry'>('all');
  const [selectedState, setSelectedState] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const schemes: Scheme[] = [
    {
      id: '1',
      name: <span data-editor-id="app/schemes/page.tsx:29:13">Pig Development Programme</span>,
      description: <span data-editor-id="app/schemes/page.tsx:30:19">Support for setting up and expanding piggery units with focus on improved breeds, housing, and feed efficiency.</span>,
      species: 'pig',
      state: 'All India',
      eligibility: ['Individual farmers', 'SHGs', 'FPOs'],
      benefits: ['Subsidy on housing', 'Breed improvement', 'Training support'],
      applicationProcess: <span data-editor-id="app/schemes/page.tsx:35:25">Apply via State Animal Husbandry Department portal</span>,
      amount: 'Up to ₹50,000'
    },
    {
      id: '2', 
      name: <span data-editor-id="app/schemes/page.tsx:40:13">Poultry Venture Capital Fund</span>,
      description: <span data-editor-id="app/schemes/page.tsx:41:19">Financial assistance for broiler, layer, and backyard poultry with modern technology and biosecurity.</span>,
      species: 'poultry',
      state: 'All India',
      eligibility: ['Entrepreneurs', 'Existing farmers', 'Cooperatives'],
      benefits: ['60% subsidy for SC/ST', '40% for others'],
      applicationProcess: <span data-editor-id="app/schemes/page.tsx:46:25">Apply through State Poultry Development Corporation</span>,
      amount: 'Up to ₹25 lakh'
    },
    {
      id: '3',
      name: <span data-editor-id="app/schemes/page.tsx:51:13">Biosecurity Infrastructure Support</span>,
      description: <span data-editor-id="app/schemes/page.tsx:52:19">Assistance for biosecurity upgrades such as fencing, footbaths, disinfection units, and isolation pens.</span>,
      species: 'pig',
      state: 'Punjab',
      eligibility: ['Registered farms', 'SHGs'],
      benefits: ['50-75% subsidy on infrastructure'],
      applicationProcess: <span data-editor-id="app/schemes/page.tsx:58:25">Apply via State Animal Husbandry portal</span>,
      amount: 'Variable'
    },
    {
      id: '4',
      name: <span data-editor-id="app/schemes/page.tsx:63:13">Backyard Poultry Promotion</span>,
      description: <span data-editor-id="app/schemes/page.tsx:64:19">Encourages small-scale backyard poultry with input kits and basic housing support.</span>,
      species: 'poultry',
      state: 'Kerala',
      eligibility: ['Women SHGs', 'SC/ST'],
      benefits: ['Input kit support', 'Training'],
      applicationProcess: <span data-editor-id="app/schemes/page.tsx:70:25">Apply at local Veterinary office</span>,
      amount: '₹10,000–₹50,000'
    }
  ];

  const states = ['All India', 'Punjab', 'Kerala', 'Gujarat', 'Maharashtra', 'Haryana', 'Uttar Pradesh', 'Tamil Nadu', 'Karnataka'];

  const filteredSchemes = schemes.filter(scheme => {
    const speciesMatch = activeSpecies === 'all' || scheme.species === activeSpecies;
    const stateMatch = selectedState === 'all' || scheme.state === selectedState || scheme.state === 'All India';
    const searchMatch = searchTerm === '' || 
      scheme.name.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    return speciesMatch && stateMatch && searchMatch;
  });

  return (
    <div data-editor-id="app/schemes/page.tsx:110:5" className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/schemes/page.tsx:115:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 data-editor-id="app/schemes/page.tsx:123:13" className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              Pig & Poultry <span data-editor-id="app/schemes/page.tsx:124:31" className="text-green-600 font-medium">Schemes</span>
            </h1>
            <p data-editor-id="app/schemes/page.tsx:126:13" className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover and apply for government schemes designed for pig and poultry farmers
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100"
          >
            {/* Species Tabs */}
            <div data-editor-id="app/schemes/page.tsx:140:13" className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: <span data-editor-id="app/schemes/page.tsx:142:45">All</span>, icon: 'mdi:apps' },
                { key: 'pig', label: <span data-editor-id="app/schemes/page.tsx:143:53">Pig</span>, icon: 'mdi:pig' },
                { key: 'poultry', label: <span data-editor-id="app/schemes/page.tsx:144:49">Poultry</span>, icon: 'mingcute:chicken-line' }
              ].map((sp) => (
                <button
                  key={sp.key}
                  onClick={() => setActiveSpecies(sp.key as typeof activeSpecies)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeSpecies === sp.key
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <Icon icon={sp.icon} className="w-4 h-4" />
                  <span data-editor-id="app/schemes/page.tsx:155:19">{sp.label}</span>
                </button>
              ))}
            </div>

            {/* Search and State Filter */}
            <div data-editor-id="app/schemes/page.tsx:161:13" className="flex flex-col md:flex-row gap-4">
              <div data-editor-id="app/schemes/page.tsx:162:15" className="flex-1 relative">
                <Icon icon="mdi:search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
              
              <div data-editor-id="app/schemes/page.tsx:174:15" className="relative">
                <Icon icon="mdi:map-marker" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm appearance-none bg-white min-w-48"
                >
                  <option value="all">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div data-editor-id="app/schemes/page.tsx:193:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-editor-id="app/schemes/page.tsx:194:11" className="flex justify-between items-center mb-8">
            <h2 data-editor-id="app/schemes/page.tsx:195:13" className="text-2xl font-medium text-neutral-800">
              {filteredSchemes.length} Schemes Found
            </h2>
            <div data-editor-id="app/schemes/page.tsx:198:13" className="text-sm text-neutral-500">
              Showing {activeSpecies !== 'all' ? activeSpecies : 'all'}
              {selectedState !== 'all' && ` in ${selectedState}`}
            </div>
          </div>

          <div data-editor-id="app/schemes/page.tsx:204:11" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg transition-all duration-300 hover:border-green-200"
              >
                <div data-editor-id="app/schemes/page.tsx:214:17" className="flex items-start justify-between mb-4">
                  <div data-editor-id="app/schemes/page.tsx:215:19" className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    scheme.species === 'pig' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    <Icon 
                      icon={scheme.species === 'pig' ? 'mdi:pig' : 'mingcute:chicken-line'} 
                      className={`w-6 h-6 ${
                        scheme.species === 'pig' ? 'text-orange-600' : 'text-green-600'
                      }`} 
                    />
                  </div>
                  {scheme.amount && (
                    <div data-editor-id="app/schemes/page.tsx:226:21" className="text-right">
                      <div data-editor-id="app/schemes/page.tsx:227:23" className="text-lg font-semibold text-green-600">{scheme.amount}</div>
                      <div data-editor-id="app/schemes/page.tsx:228:23" className="text-xs text-neutral-500">Amount</div>
                    </div>
                  )}
                </div>

                <h3 data-editor-id="app/schemes/page.tsx:233:17" className="text-xl font-medium text-neutral-800 mb-2">
                  {scheme.name}
                </h3>
                
                <p data-editor-id="app/schemes/page.tsx:237:17" className="text-neutral-600 text-sm mb-4 leading-relaxed">
                  {scheme.description}
                </p>

                <div data-editor-id="app/schemes/page.tsx:241:17" className="space-y-3 mb-6">
                  <div data-editor-id="app/schemes/page.tsx:242:19" className="flex items-center space-x-2">
                    <Icon icon="mdi:map-marker" className="w-4 h-4 text-green-500" />
                    <span data-editor-id="app/schemes/page.tsx:244:21" className="text-sm text-neutral-600">{scheme.state}</span>
                  </div>
                  
                  <div data-editor-id="app/schemes/page.tsx:255:21" className="flex items-center space-x-2">
                    <Icon icon={scheme.species === 'pig' ? 'mdi:pig' : 'mingcute:chicken-line'} className={scheme.species === 'pig' ? 'w-4 h-4 text-orange-500' : 'w-4 h-4 text-green-500'} />
                    <span data-editor-id="app/schemes/page.tsx:257:23" className="text-sm text-neutral-600 capitalize">{scheme.species}</span>
                  </div>
                </div>

                <div data-editor-id="app/schemes/page.tsx:262:17" className="border-t border-neutral-100 pt-4">
                  <button className="w-full bg-green-50 text-green-700 py-3 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm font-medium">
                    <span data-editor-id="app/schemes/page.tsx:264:21">View Details & Apply</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredSchemes.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Icon icon="mdi:search-remove" className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 data-editor-id="app/schemes/page.tsx:277:15" className="text-xl font-medium text-neutral-600 mb-2">No schemes found</h3>
              <p data-editor-id="app/schemes/page.tsx:278:15" className="text-neutral-500">Try adjusting your search criteria or filters</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
