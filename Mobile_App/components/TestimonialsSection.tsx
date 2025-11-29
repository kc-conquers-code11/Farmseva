'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import Image from 'next/image';

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  // You can replace these with your new, fixed URLs.
  const testimonials = [
    {
      quote: "FarmSeva helped me discover a subsidy to expand my piggery. The step-by-step guide made the process simple.",
      name: "Rajesh Kumar",
      designation: "Pig Farmer, Punjab",
      src: "https://images.pexels.com/photos/5933416/pexels-photo-5933416.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      quote: "The marketplace connected me with steady buyers for my broilers and eggs. Income is more predictable now.",
      name: "Priya Sharma",
      designation: "Poultry Farmer, Himachal Pradesh",
      src: "https://images.pexels.com/photos/7525622/pexels-photo-7525622.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      quote: "During an avian influenza alert, the dashboard's guidance helped me tighten biosecurity and avoid losses.",
      name: "Mohan Singh",
      designation: "Layer Poultry, Haryana",
      src: "https://images.pexels.com/photos/1300375/pexels-photo-1300375.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      quote: "Risk and price analytics for pork and broilers helped me time sales better and improve margins.",
      name: "Anil Patel",
      designation: "Pig & Poultry, Gujarat",
      src: "https://images.pexels.com/photos/6792156/pexels-photo-6792156.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      quote: "The forum community was invaluable when my piglets showed fever—got quick tips on isolation and care.",
      name: "Sunita Devi",
      designation: "Pig Breeder, Uttar Pradesh",
      src: "https://images.pexels.com/photos/12030725/pexels-photo-12030725.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-light text-neutral-800 mb-4">
            Success Stories from <span className="text-green-600 font-medium">Our Community</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto font-light">
            Real farmers, real results. See how FarmSeva supports pig & poultry livelihoods across India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Images */}
          <div className="relative h-96 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-full h-full"
              >
                <Image
                  src={testimonials[active].src}
                  alt={`${testimonials[active].name}`}
                  fill
                  className="rounded-3xl object-cover object-center shadow-xl border-4 border-white"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between h-96 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <div className="mb-6">
                  <Icon icon="mdi:format-quote-open" className="w-10 h-10 text-green-500" />
                </div>

                <p className="text-lg text-neutral-700 leading-relaxed font-light italic">
                  {testimonials[active].quote}
                </p>
                
                {/* Name and Designation container now follows the quote */}
                <div className="mt-6"> 
                    <h3 className="text-xl font-medium text-neutral-800 mb-1">
                      {testimonials[active].name}
                    </h3>
                    <p className="text-sm text-green-600 font-medium">
                      {testimonials[active].designation}
                    </p>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation is now cleanly at the bottom, separated by justify-between */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-4">
                <button
                  onClick={handlePrev}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-green-50"
                >
                  <Icon icon="mdi:chevron-left" className="h-5 w-5 text-green-600" />
                </button>
                <button
                  onClick={handleNext}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-green-50"
                >
                  <Icon icon="mdi:chevron-right" className="h-5 w-5 text-green-600" />
                </button>
              </div>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      active === index ? 'bg-green-600 w-6' : 'bg-green-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

