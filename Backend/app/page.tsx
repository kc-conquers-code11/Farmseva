'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Leaf, ArrowRight, Store, Users, LineChart, Wallet, 
  ChevronLeft, ChevronRight, Quote
} from 'lucide-react'
// IMPORT THE NEW NAVBAR
import Navbar from './components/Navbar' // Adjust path if needed (e.g. '@/app/components/Navbar')

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // --- TESTIMONIAL DATA ---
  const testimonials = [
    {
      id: 1,
      quote: "FarmSeva helped me discover a subsidy to expand my piggery. The step-by-step guide made the process simple.",
      name: "Rajesh Kumar",
      role: "Pig Farmer, Punjab",
      image: "https://images.unsplash.com/photo-1595267590899-73602d38562d?q=80&w=2070&auto=format&fit=crop"
    },
    {
      id: 2,
      quote: "I used the marketplace to sell my broiler batch at a 15% higher rate than the local mandi. Truly empowering!",
      name: "Sunita Devi",
      role: "Poultry Farmer, West Bengal",
      image: "https://images.unsplash.com/photo-1623853112294-5b4d793c72b2?q=80&w=2000&auto=format&fit=crop" 
    },
    {
      id: 3,
      quote: "The disease alerts saved my flock during the last bird flu outbreak. The vet consultation was quick and life-saving.",
      name: "Vikram Singh",
      role: "Layer Farm Owner, Rajasthan",
      image: "https://images.unsplash.com/photo-1516467508483-a721206088f5?q=80&w=2000&auto=format&fit=crop"
    }
  ]

  // --- AUTO SLIDE LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length)
    }, 4000) 
    return () => clearInterval(timer)
  }, [testimonials.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % testimonials.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 selection:bg-green-100 selection:text-green-900">
      
      {/* USE THE NAVBAR COMPONENT */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 overflow-hidden bg-[#fdfdfd]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-green-50/60 rounded-full blur-3xl opacity-70" />
            <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-yellow-50/60 rounded-full blur-3xl opacity-70" />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-green-100 shadow-sm text-green-800 text-xs font-bold uppercase tracking-wider mb-8">
              <Leaf size={14} className="text-green-600" />
              Pig & Poultry Farming • Government Support
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-[1.1] mb-8">
              FarmSeva — <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-500">
                For Pig & Poultry Farmers
              </span> <br className="hidden md:block"/>
              Across India
            </h1>
            
            <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-3xl mx-auto font-light">
              Discover pig & poultry schemes, sell livestock and produce in our marketplace, 
              and get real-time disease, risk, and weather alerts tailored to your farm.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-green-200 hover:-translate-y-1 flex items-center justify-center gap-2">
                  <Wallet size={20} /> Explore Schemes
                </button>
              </Link>
              <Link href="/login">
                <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-green-700 bg-white border border-green-100 hover:bg-green-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                  <Store size={20} /> Visit Marketplace
                </button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-gray-100 pt-12">
                <div>
                    <div className="text-4xl font-serif font-bold text-green-800 mb-2">150+</div>
                    <div className="text-gray-500 font-medium text-sm">Pig & Poultry Schemes</div>
                </div>
                <div>
                    <div className="text-4xl font-serif font-bold text-green-800 mb-2">8K+</div>
                    <div className="text-gray-500 font-medium text-sm">Active Pig & Poultry Farmers</div>
                </div>
                <div>
                    <div className="text-4xl font-serif font-bold text-green-800 mb-2">24/7</div>
                    <div className="text-gray-500 font-medium text-sm">Alerts & Insights</div>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                    Everything You Need to <span className="text-green-600 italic">Grow</span>
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
                    From government support to market access, we provide comprehensive tools for modern farming success.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard 
                    icon={<Wallet className="text-green-600" size={28} />}
                    title="Pig & Poultry Schemes"
                    desc="Access targeted government schemes for pig and poultry farming. Filter by state and animal type."
                    link="/register"
                />
                <FeatureCard 
                    icon={<Store className="text-green-600" size={28} />}
                    title="Marketplace"
                    desc="Buy and sell piglets, broilers, eggs, feed, and equipment directly with trusted farmers."
                    link="/register"
                />
                <FeatureCard 
                    icon={<Users className="text-green-600" size={28} />}
                    title="Community Forum"
                    desc="Ask and share best practices on biosecurity, disease control, housing, and feed optimization."
                    link="/register"
                />
                <FeatureCard 
                    icon={<LineChart className="text-green-600" size={28} />}
                    title="Smart Dashboard"
                    desc="Pig & poultry risk assessment, disease prediction, security alerts, and analytics."
                    link="/register"
                />
            </div>
        </div>
      </section>

      {/* --- DYNAMIC TESTIMONIALS --- */}
      <section id="stories" className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-16 text-center">
                Success Stories from <span className="text-green-600">Our Community</span>
            </h2>

            <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-100 overflow-hidden min-h-[500px] flex items-center">
                
                {/* Content Wrapper */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col lg:flex-row items-center gap-12 w-full"
                    >
                        {/* Image Side */}
                        <div className="w-full lg:w-1/2 relative group">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative bg-green-50">
                                <img 
                                    src={testimonials[currentSlide].image} 
                                    alt={testimonials[currentSlide].name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentSlide].name)}&background=16a34a&color=fff&size=400`
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <div className="absolute -top-6 -left-6 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Quote size={24} fill="white" />
                            </div>
                        </div>

                        {/* Text Side */}
                        <div className="w-full lg:w-1/2 space-y-8">
                            <blockquote className="text-2xl md:text-3xl font-serif text-gray-800 leading-relaxed">
                                "{testimonials[currentSlide].quote}"
                            </blockquote>
                            
                            <div>
                                <div className="text-xl font-bold text-gray-900">{testimonials[currentSlide].name}</div>
                                <div className="text-green-600 font-medium">{testimonials[currentSlide].role}</div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="absolute bottom-8 right-8 flex gap-3 z-10">
                    <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-8 left-8 flex gap-2">
                    {testimonials.map((_, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx ? 'w-8 bg-green-600' : 'w-2 bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* ... (Features, CTA, Footer remain the same, just removing Navbar code from here) ... */}
      
      {/* Footer can also be componentized, but leaving it for now if you prefer */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
        {/* Footer content... */}
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
               <div className="lg:col-span-2">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white">
                            <Leaf size={18} fill="white" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-gray-900">FarmSeva</span>
                    </div>
                    <p className="text-gray-500 leading-relaxed mb-8 max-w-sm">
                        Empowering farmers and livestock owners across India with access to government schemes, marketplace, and community support.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
                    <ul className="space-y-4 text-gray-500 text-sm">
                        <li><Link href="/register" className="hover:text-green-600">Government Schemes</Link></li>
                        <li><Link href="/register" className="hover:text-green-600">Marketplace</Link></li>
                        <li><Link href="/register" className="hover:text-green-600">Community Forum</Link></li>
                        <li><Link href="/login" className="hover:text-green-600">Dashboard</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Resources</h4>
                    <ul className="space-y-4 text-gray-500 text-sm">
                        <li><Link href="#" className="hover:text-green-600">Blog & News</Link></li>
                        <li><Link href="#" className="hover:text-green-600">FAQ</Link></li>
                        <li><Link href="#" className="hover:text-green-600">Events</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
                    <ul className="space-y-4 text-gray-500 text-sm">
                        <li><Link href="#" className="hover:text-green-600">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-green-600">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                <p>© 2025 FarmSeva. All rights reserved.</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Serving all states of India
                </div>
            </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, link }: any) {
  return (
    <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-green-100 hover:shadow-xl hover:shadow-green-50/50 transition-all duration-300">
        <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">{title}</h3>
        <p className="text-gray-500 leading-relaxed mb-6 text-sm">
            {desc}
        </p>
        <Link href={link} className="inline-flex items-center text-green-600 font-semibold text-sm hover:gap-2 transition-all">
            Learn more <ArrowRight size={16} className="ml-1" />
        </Link>
    </div>
  )
}