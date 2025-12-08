'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, ArrowRight, Store, Users, LineChart, Wallet,
  ChevronLeft, ChevronRight, Quote, CheckCircle2,
  TrendingUp, ShieldCheck, Zap, Menu, X, LogOut,
  ChevronDown, LayoutDashboard, UserCircle, LifeBuoy,
  Mail, Phone, MapPin, Globe, Search, FileText, Sprout, Tractor,
  Activity, AlertTriangle, BookOpen, ClipboardCheck, Eye
} from 'lucide-react'
import { Footer } from '@/app/components/Footer'


// --- MOCKS FOR DEMO PURPOSES (To fix build errors) ---
const useSupabaseUser = () => {
  const [user, setUser] = useState<any>(null);
  return { user, loading: false };
}

const supabase = {
  auth: {
    signOut: async () => { console.log("Signed out"); }
  }
}

// --- CONSTANTS ---
const HERO_IMAGES = [
  "/hero1.jpeg",
  "/hero2.jpeg",
  "/hero3.jpeg",
 
]





// --- COMPONENTS ---

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const { user } = useSupabaseUser()
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    window.location.href = '/'
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    // { name: 'Schemes', href: '/schemes' },
    // { name: 'Services', href: '/services' },
    // { name: 'Dashboard', href: '/dashboard' },
    { name: 'About Us', href: '/about' },
    // { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm font-sans">
      {/* Top Header - Logos */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* FarmSeva Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform opacity-20"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-600/20">
                  <Leaf size={22} fill="currentColor" className="text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-neutral-900 tracking-tight leading-none block">FarmSeva</span>
              </div>
            </a>

            {/* Ministry Logo */}
            <div className="flex items-center gap-4 pl-6 border-l border-neutral-200 hidden md:flex">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/180px-Emblem_of_India.svg.png" alt="Emblem of India" className="h-12 w-auto" />
              <div>
                <h1 className="text-base md:text-lg font-bold text-neutral-900 leading-tight">मत्स्यपालन, पशुपालन और डेयरी मंत्रालय</h1>
                <h2 className="text-sm md:text-base font-medium text-neutral-700 leading-tight">Ministry of Fisheries, Animal Husbandry and Dairying</h2>
                <p className="text-xs text-neutral-500">Government of India</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Gmec */}
            <img src="https://negd.gov.in/wp-content/themes/negd-update/assets/images/icon/logo-header.png" alt="Gmeg" className="h-10 w-auto hidden md:block" />
            {/* swachh bharat */}
            <img src="https://mohfw.gov.in/sites/all/themes/cmf/images/swach-bharat.png" alt="Swachh bharat" className="h-10 w-auto hidden md:block" />
          </div>
        </div>
      </div>

      {/* Bottom Header - Navigation */}
      <div className="bg-[#003c71] text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-3 text-sm font-medium transition-colors hover:bg-[#002a50]"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/10 rounded px-2 py-1">
              <Search size={16} className="text-white/70 mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none text-sm text-white placeholder-white/70 focus:outline-none" />
            </div>

            {user ? (
              <div className="relative z-50" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"
                >
                  <span className="text-sm font-medium truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded shadow-lg border border-neutral-200 overflow-hidden z-50 text-neutral-800"
                    >
                      <a href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-100">
                        <LayoutDashboard size={16} /> Dashboard
                      </a>
                      <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-100">
                        <UserCircle size={16} /> Profile
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <a href="/login" className="text-sm font-medium hover:underline px-2">Log in</a>
                <span className="text-white/50">|</span>
                <a href="/register" className="text-sm font-medium hover:underline px-2">Register</a>
              </div>
            )}

            <button
              className="md:hidden p-2 text-white hover:bg-white/10 rounded transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-neutral-200 overflow-hidden absolute w-full shadow-xl"
          >
            <div className="p-4 space-y-2">
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="text" placeholder="Search..." className="w-full bg-neutral-100 border border-neutral-200 rounded pl-10 pr-4 py-2 text-sm focus:outline-none" />
              </div>
              {navLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded text-base font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {link.name}
                </a>
              ))}
              <div className="border-t border-neutral-200 pt-4 mt-4">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded w-full"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 px-4">
                    <a href="/login" className="text-center py-2 border border-neutral-300 rounded text-neutral-700 font-medium text-sm">Log In</a>
                    <a href="/register" className="text-center py-2 bg-[#003c71] text-white rounded font-medium text-sm">Register</a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden">


      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={HERO_IMAGES[currentSlide]}
            alt={`Hero Slide ${currentSlide}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

   <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 md:px-8 max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-white"
        >
         
        </motion.div>

        {/* Floating quick-links overlay removed as requested */}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}


function StatCard({ number, label, icon }: any) {
  return (
    <div className="bg-white/60 backdrop-blur-md border border-neutral-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <div className="text-left">
        <div className="text-2xl font-bold text-neutral-900 leading-none">{number}</div>
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mt-1">{label}</div>
      </div>
    </div>
  )
}

function ImageMarquee({ images, direction = 'left', speed = 25 }: { images: string[], direction?: 'left' | 'right', speed?: number }) {
  return (
    <div className="flex overflow-hidden bg-white py-6 border-b border-neutral-200">
      <motion.div
        initial={{ x: direction === 'left' ? 0 : '-50%' }}
        animate={{ x: direction === 'left' ? '-50%' : 0 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex flex-shrink-0 gap-6 px-6"
      >
        {[...images, ...images].map((src, idx) => (
          <div key={idx} className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-sm border border-neutral-100">
            <img
              src={src}
              alt={`Gallery ${idx}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// --- MAIN PAGE ---

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-800 overflow-x-hidden">

      <Navbar />

      {/* --- 1. HERO SECTION WITH CAROUSEL & QUICK LINKS --- */}
      <section className="pt-32 md:pt-36">
  <HeroCarousel />
</section>


      {/* --- 2. MARQUEE (Reused) --- */}
     

      {/* --- 3. FEATURES (Re-styled) --- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#003c71] mb-4">
              End-to-End Biosecurity Management
            </h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto mb-6"></div>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              A unified platform empowering farmers with tools to implement, monitor, and sustain robust biosecurity practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-700 group-hover:text-white transition-colors">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#003c71] mb-2">Customizable Risk Assessment</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">Self-assessment tools based on local epidemiological conditions to identify vulnerability to diseases like ASF & AI.</p>
              <a href="/dashboard/farmer?tab=risk" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                Assess Risk <ArrowRight size={16} />
              </a>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#003c71] mb-2">Interactive Training Modules</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">Access best practice guidelines and video training specifically tailored for pig and poultry production systems.</p>
              <a href="/dashboard/farmer?tab=training" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                Start Learning <ArrowRight size={16} />
              </a>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-700 group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#003c71] mb-2">Compliance & Tracking</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">Digital record-keeping aligned with regulatory frameworks to help you achieve disease-free compartment recognition.</p>
              <a href="/dashboard/farmer?tab=outbreak" className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                Track Compliance <ArrowRight size={16} />
              </a>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-700 group-hover:text-white transition-colors">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#003c71] mb-2">Real-time Outbreak Alerts</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">Get instant notifications on disease outbreaks and biosecurity breaches in your vicinity to take preventive action.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#003c71] mb-2">Collaborative Network</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">Connect with veterinarians, extension workers, and other stakeholders to foster long-term resilience.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <LineChart size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#003c71] mb-2">Policy Support Analytics</h3>
              <p className="text-neutral-600 text-sm leading-relaxed mb-4">Data collection and analysis to support authorities in data-driven surveillance and policy making.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. STATS SECTION (Revised) --- */}
      <section className="py-16 bg-[#f0f8ff]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard number="50k+" label="Risk Assessments" icon={<Activity size={24} className="text-blue-600" />} />
            <StatCard number="1200+" label="Biosecurity Audits" icon={<ClipboardCheck size={24} className="text-green-600" />} />
            <StatCard number="24/7" label="Disease Surveillance" icon={<Eye size={24} className="text-orange-600" />} />
            <StatCard number="15+" label="Disease-Free Zones" icon={<ShieldCheck size={24} className="text-purple-600" />} />
          </div>
        </div>
      </section>

      {/* --- 5. TESTIMONIALS (Revised Context) --- */}
      <section id="stories" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 mb-16 text-center">
            Farmers <span className="text-green-600">Trust FarmSeva</span>
          </h2>

          <div className="relative bg-neutral-50 rounded-[2.5rem] p-8 md:p-16 border border-neutral-100">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/3">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative bg-gray-200">
                  <img src="data:image/jpeg;base64,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" className="w-full h-full object-cover" alt="Farmer" />
                </div>
              </div>
              <div className="w-full md:w-2/3 space-y-6">
                <blockquote className="text-2xl md:text-3xl font-serif text-neutral-800 leading-tight">
                  "The early alert system saved my poultry farm from a severe outbreak last season. The biosecurity checklist is now my daily bible."
                </blockquote>
                <div>
                  <h4 className="text-xl font-bold text-neutral-900">Rajesh Kumar</h4>
                  <p className="text-green-600 font-medium">Poultry Farmer, Punjab</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. CTA SECTION (Re-styled) --- */}
      <section className="py-16 px-6 bg-neutral-100">
        <div className="max-w-7xl mx-auto bg-[#003c71] rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Secure Your Farm Against Disease Outbreaks
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed">
              Join the national mission for healthier livestock and increased productivity. Register now to access risk tools and alerts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/register">
                <button className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3 rounded font-bold text-base hover:bg-orange-600 transition-colors shadow-md">
                  Farmer Registration
                </button>
              </a>
              <a href="/login">
                <button className="w-full sm:w-auto bg-white text-[#003c71] px-8 py-3 rounded font-bold text-base hover:bg-neutral-100 transition-colors shadow-md">
                  Login
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
