'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  const testimonials = [
    {
      quote: <span data-editor-id="app/components/TestimonialsSection.tsx:12:15">FarmSeva helped me discover a subsidy to expand my piggery. The step-by-step guide made the process simple.</span>,
      name: <span data-editor-id="app/components/TestimonialsSection.tsx:13:13">Rajesh Kumar</span>,
      designation: <span data-editor-id="app/components/TestimonialsSection.tsx:14:20">Pig Farmer, Punjab</span>,
      src: "https://i.pravatar.cc/400?u=rajesh1",
    },
    {
      quote: <span data-editor-id="app/components/TestimonialsSection.tsx:18:15">The marketplace connected me with steady buyers for my broilers and eggs. Income is more predictable now.</span>,
      name: <span data-editor-id="app/components/TestimonialsSection.tsx:19:13">Priya Sharma</span>,
      designation: <span data-editor-id="app/components/TestimonialsSection.tsx:20:20">Poultry Farmer, Himachal Pradesh</span>,
      src: "https://i.pravatar.cc/400?u=priya2",
    },
    {
      quote: <span data-editor-id="app/components/TestimonialsSection.tsx:24:15">During an avian influenza alert, the dashboard&apos;s guidance helped me tighten biosecurity and avoid losses.</span>,
      name: <span data-editor-id="app/components/TestimonialsSection.tsx:25:13">Mohan Singh</span>,
      designation: <span data-editor-id="app/components/TestimonialsSection.tsx:26:20">Layer Poultry, Haryana</span>,
      src: "https://i.pravatar.cc/400?u=mohan3",
    },
    {
      quote: <span data-editor-id="app/components/TestimonialsSection.tsx:30:15">Risk and price analytics for pork and broilers helped me time sales better and improve margins.</span>,
      name: <span data-editor-id="app/components/TestimonialsSection.tsx:31:13">Anil Patel</span>,
      designation: <span data-editor-id="app/components/TestimonialsSection.tsx:32:20">Pig & Poultry, Gujarat</span>,
      src: "https://i.pravatar.cc/400?u=anil4",
    },
    {
      quote: <span data-editor-id="app/components/TestimonialsSection.tsx:36:15">The forum community was invaluable when my piglets showed fever—got quick tips on isolation and care.</span>,
      name: <span data-editor-id="app/components/TestimonialsSection.tsx:37:13">Sunita Devi</span>,
      designation: <span data-editor-id="app/components/TestimonialsSection.tsx:38:20">Pig Breeder, Uttar Pradesh</span>,
      src: "https://i.pravatar.cc/400?u=sunita5",
    },
  ];

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, []);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div data-editor-id="app/components/TestimonialsSection.tsx:61:7" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 data-editor-id="app/components/TestimonialsSection.tsx:70:11" className="text-3xl md:text-4xl font-light text-neutral-800 mb-4">
            Success Stories from <span data-editor-id="app/components/TestimonialsSection.tsx:71:38" className="text-green-600 font-medium">Our Community</span>
          </h2>
          <p data-editor-id="app/components/TestimonialsSection.tsx:73:11" className="text-lg text-neutral-600 max-w-2xl mx-auto font-light">
            Real farmers, real results. See how FarmSeva supports pig & poultry livelihoods across India
          </p>
        </motion.div>

        <div data-editor-id="app/components/TestimonialsSection.tsx:78:9" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Images */}
          <div data-editor-id="app/components/TestimonialsSection.tsx:80:11" className="relative h-96">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -20, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={`${testimonial.name}`}
                    className="h-full w-full rounded-3xl object-cover object-center shadow-xl border-4 border-white"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div data-editor-id="app/components/TestimonialsSection.tsx:116:11" className="flex flex-col justify-center py-8">
            <motion.div
              key={active}
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -20,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            >
              <div data-editor-id="app/components/TestimonialsSection.tsx:136:15" className="mb-6">
                <Icon icon="mdi:format-quote-open" className="w-10 h-10 text-green-500" />
              </div>

              <h3 data-editor-id="app/components/TestimonialsSection.tsx:140:15" className="text-xl font-medium text-neutral-800 mb-2">
                {testimonials[active].name}
              </h3>
              <p data-editor-id="app/components/TestimonialsSection.tsx:143:15" className="text-sm text-green-600 font-medium mb-6">
                {testimonials[active].designation}
              </p>
              
              <motion.p className="text-lg text-neutral-700 leading-relaxed font-light italic">
                {typeof testimonials[active].quote === 'string' 
                  ? (testimonials[active].quote as string).split(" ").map((word: string, index: number) => (
                    <motion.span
                      key={index}
                      initial={{
                        filter: "blur(10px)",
                        opacity: 0,
                        y: 5,
                      }}
                      animate={{
                        filter: "blur(0px)",
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut",
                        delay: 0.02 * index,
                      }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))
                  : testimonials[active].quote
                }
              </motion.p>
            </motion.div>
            
            {/* Navigation */}
            <div data-editor-id="app/components/TestimonialsSection.tsx:175:13" className="flex items-center justify-between pt-8">
              <div data-editor-id="app/components/TestimonialsSection.tsx:176:15" className="flex gap-4">
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
              
              {/* Dots */}
              <div data-editor-id="app/components/TestimonialsSection.tsx:192:15" className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      isActive(index) ? 'bg-green-600 w-6' : 'bg-green-300'
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