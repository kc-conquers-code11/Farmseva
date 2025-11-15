'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const images = [
  { id: 'pig-close', url: 'https://images.unsplash.com/photo-1545605281-3e3bbd6e0144', title: 'Pig – Closeup' },
  { id: 'piglet', url: 'https://images.unsplash.com/photo-1541689221361-ad95003448dc', title: 'Piglets' },
  { id: 'rooster', url: 'https://images.unsplash.com/photo-1518366636391-7e1f15e6b778', title: 'Rooster' },
  { id: 'poultry-birds', url: 'https://images.unsplash.com/photo-1552871632-09bf5311186d', title: 'Poultry Birds' },
  { id: 'poultry-house', url: 'https://images.unsplash.com/photo-1580711600699-5db1a1101e57', title: 'Poultry House' },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              <span>Pig & Poultry </span><span className="text-green-600 font-medium">Gallery</span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Scenes from pig farms, poultry houses, and rural life</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <motion.div key={img.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.05 }} className="relative group overflow-hidden rounded-2xl shadow-sm border border-neutral-100 hover:shadow-lg hover:border-green-200 transition-all">
                <img src={img.url} alt={img.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-sm font-medium">{img.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
