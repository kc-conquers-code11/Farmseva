'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HERO_IMAGES = [
    '/image1.jpeg',
    '/image2.jpg',
    '/image3.jpg',
]

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        if (HERO_IMAGES.length === 0) return

        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length)
        }, 6000)

        return () => clearInterval(timer)
    }, [])

    if (HERO_IMAGES.length === 0) return null

    return (
         <div className="relative h-[650px] md:h-[750px] overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentSlide}
                    src={HERO_IMAGES[currentSlide]}
                    alt={`Hero Slide ${currentSlide}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover block"
                />
            </AnimatePresence>

            {/* dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {HERO_IMAGES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-green-600' : 'w-2 bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
