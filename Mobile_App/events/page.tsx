'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function EventsPage() {
  const events = [
    { id: '1', title: 'Poultry Heat-Stress Webinar', date: '2025-06-15', location: 'Online', type: 'Webinar', icon: 'mdi:video' },
    { id: '2', title: 'Pig Housing & Drainage Workshop', date: '2025-07-05', location: 'Ludhiana, Punjab', type: 'Workshop', icon: 'mdi:pig' },
    { id: '3', title: 'Biosecurity for ASF & AI', date: '2025-08-20', location: 'New Delhi', type: 'Seminar', icon: 'mdi:shield-check' },
    { id: '4', title: 'Layer Nutrition Meetup', date: '2025-09-10', location: 'Kochi, Kerala', type: 'Meetup', icon: 'mdi:food-drumstick' },
  ];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-12 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              <span>Events & </span><span className="text-green-600 font-medium">Workshops</span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">Learn, network, and grow with FarmSeva events across India</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev, idx) => (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:border-green-200 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Icon icon={ev.icon} className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-800">{ev.title}</h3>
                </div>
                <div className="space-y-2 text-sm text-neutral-600">
                  <div className="flex items-center gap-2"><Icon icon="mdi:calendar" className="w-4 h-4 text-green-600" /><span>{formatDate(ev.date)}</span></div>
                  <div className="flex items-center gap-2"><Icon icon="mdi:map-marker" className="w-4 h-4 text-green-600" /><span>{ev.location}</span></div>
                  <div className="flex items-center gap-2"><Icon icon="mdi:tag" className="w-4 h-4 text-green-600" /><span>{ev.type}</span></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"><span>Register</span></button>
                  <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg text-sm hover:bg-green-50 transition-colors"><span>Details</span></button>
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
