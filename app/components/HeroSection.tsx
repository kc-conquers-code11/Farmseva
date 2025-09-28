'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section
      // Add pt-24 here to push the content down below the navbar
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-white pt-24"
    >
      <div data-editor-id="app/components/HeroSection.tsx:18:7" className="absolute inset-0"></div>

      <div data-editor-id="app/components/HeroSection.tsx:20:7" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-green-200"
          >
            <Icon icon="mingcute:chicken-line" className="w-5 h-5 text-green-600" />
            <span data-editor-id="app/components/HeroSection.tsx:35:13" className="text-sm font-medium text-green-800">Pig & Poultry Farming • Government Support</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl font-light text-neutral-800 leading-tight"
          >
            <span data-editor-id="app/components/HeroSection.tsx:45:13">FarmSeva –</span>
            <br />
            <span data-editor-id="app/components/HeroSection.tsx:47:13" className="text-green-700 font-medium">For Pig & Poultry</span>
            <br />
            <span data-editor-id="app/components/HeroSection.tsx:49:13" className="text-green-600">Farmers Across India</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto font-light"
          >
            <span data-editor-id="app/components/HeroSection.tsx:59:13">Discover pig & poultry schemes, sell livestock and produce in our marketplace, and get real-time disease, risk, and weather alerts tailored to your farm.</span>
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/government-schemes"
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
            >
              <Icon icon="mingcute:chicken-line" className="w-5 h-5" />
              <span data-editor-id="app/components/HeroSection.tsx:72:15">Explore Schemes</span>
            </Link>
            
            <Link
              href="/marketplace"
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-green-700 px-8 py-4 rounded-full hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-lg border border-green-200 font-medium"
            >
              <Icon icon="mdi:pig" className="w-5 h-5" />
              <span data-editor-id="app/components/HeroSection.tsx:80:15">Visit Marketplace</span>
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12"
          >
            <div data-editor-id="app/components/HeroSection.tsx:91:13" className="text-center">
              <div data-editor-id="app/components/HeroSection.tsx:92:15" className="text-3xl font-light text-green-700">150+</div>
              <div data-editor-id="app/components/HeroSection.tsx:93:15" className="text-sm text-neutral-600 font-medium">Pig & Poultry Schemes</div>
            </div>
            <div data-editor-id="app/components/HeroSection.tsx:95:13" className="text-center">
              <div data-editor-id="app/components/HeroSection.tsx:96:15" className="text-3xl font-light text-green-700">8K+</div>
              <div data-editor-id="app/components/HeroSection.tsx:97:15" className="text-sm text-neutral-600 font-medium">Active Pig & Poultry Farmers</div>
            </div>
            <div data-editor-id="app/components/HeroSection.tsx:99:13" className="text-center">
              <div data-editor-id="app/components/HeroSection.tsx:100:15" className="text-3xl font-light text-green-700">24/7</div>
              <div data-editor-id="app/components/HeroSection.tsx:101:15" className="text-sm text-neutral-600 font-medium">Alerts & Insights</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Icons */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 hidden lg:block"
        >
          <Icon icon="mdi:pig" className="w-12 h-12 text-green-500/60" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-32 right-16 hidden lg:block"
        >
          <Icon icon="mingcute:chicken-line" className="w-10 h-10 text-green-400/60" />
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-20 left-20 hidden lg:block"
        >
          <Icon icon="mdi:pig" className="w-8 h-8 text-green-600/60" />
        </motion.div>
      </div>
    </section>
  );
}
