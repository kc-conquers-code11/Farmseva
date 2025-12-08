'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HERO_IMAGES = [
    '/hero1.jpeg',
    '/hero2.jpeg',
    '/hero3.jpeg',
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
        <div className="relative w-full h-[420px] md:h-[520px] lg:h-[560px] overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentSlide}
                    src={HERO_IMAGES[currentSlide]}
                    alt={`Hero Slide ${currentSlide}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    // FULL SCREEN EDGE-TO-EDGE, thoda crop allowed
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>

            {/* dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {HERO_IMAGES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
