'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function FeaturesSection() {
  const features = [
    {
      title: <span data-editor-id="app/components/FeaturesSection.tsx:10:15">Pig & Poultry Schemes</span>,
      description: <span data-editor-id="app/components/FeaturesSection.tsx:11:21">Access targeted government schemes for pig and poultry farming. Filter by state and animal type.</span>,
      icon: "mingcute:government-fill",
      href: "/government-schemes",
      color: "green"
    },
    {
      title: <span data-editor-id="app/components/FeaturesSection.tsx:17:15">Marketplace</span>,
      description: <span data-editor-id="app/components/FeaturesSection.tsx:18:21">Buy and sell piglets, broilers, eggs, feed, and equipment directly with trusted farmers.</span>,
      icon: "mdi:storefront",
      href: "/marketplace",
      color: "emerald"
    },
    {
      title: <span data-editor-id="app/components/FeaturesSection.tsx:24:15">Community Forum</span>,
      description: <span data-editor-id="app/components/FeaturesSection.tsx:25:21">Ask and share best practices on biosecurity, disease control, housing, and feed optimization.</span>,
      icon: "mdi:people",
      href: "/forum",
      color: "teal"
    },
    {
      title: <span data-editor-id="app/components/FeaturesSection.tsx:31:15">Smart Dashboard</span>,
      description: <span data-editor-id="app/components/FeaturesSection.tsx:32:21">Pig & poultry risk assessment, disease prediction, security alerts, and analytics (prices, rainfall, productivity).</span>,
      icon: "mdi:chart-line",
      href: "/dashboard",
      color: "lime"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div data-editor-id="app/components/FeaturesSection.tsx:41:7" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 data-editor-id="app/components/FeaturesSection.tsx:50:11" className="text-3xl md:text-4xl font-light text-neutral-800 mb-4">
            Everything You Need to <span data-editor-id="app/components/FeaturesSection.tsx:51:44" className="text-green-600 font-medium">Grow</span>
          </h2>
          <p data-editor-id="app/components/FeaturesSection.tsx:53:11" className="text-lg text-neutral-600 max-w-2xl mx-auto font-light">
            From government support to market access, we provide comprehensive tools for modern farming success
          </p>
        </motion.div>

        <div data-editor-id="app/components/FeaturesSection.tsx:58:9" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href={feature.href} className="block h-full">
                <div data-editor-id="app/components/FeaturesSection.tsx:70:17" className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 hover:shadow-lg transition-all duration-300 h-full group-hover:border-green-200">
                  <div data-editor-id="app/components/FeaturesSection.tsx:71:19" className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-${feature.color}-200 transition-colors duration-300`}>
                    <Icon 
                      icon={feature.icon} 
                      className={`w-7 h-7 text-${feature.color}-600 group-hover:text-${feature.color}-700`} 
                    />
                  </div>
                  
                  <h3 data-editor-id="app/components/FeaturesSection.tsx:78:19" className="text-xl font-medium text-neutral-800 mb-3 group-hover:text-green-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p data-editor-id="app/components/FeaturesSection.tsx:82:19" className="text-neutral-600 text-sm leading-relaxed group-hover:text-neutral-700 transition-colors duration-300">
                    {feature.description}
                  </p>

                  <div data-editor-id="app/components/FeaturesSection.tsx:86:19" className="mt-6 flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                    <span data-editor-id="app/components/FeaturesSection.tsx:87:21">Learn more</span>
                    <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}