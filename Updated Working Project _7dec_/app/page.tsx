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
  "/hero1.jpg",
  "/hero2.jpg",
  "/hero3.jpg",
 
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/90 text-white text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck size={14} className="text-white" /> National Biosecurity Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Fortifying Animal Health, <br /> Securing Livelihoods.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            India's comprehensive digital platform for farm-level biosecurity management in Pig & Poultry sectors. Prevent Avian Influenza & ASF with data-driven risk assessment.
          </p>
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
      <section className="pt-[20px] md:pt-[100px]">
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
                  <img src="https://images.unsplash.com/photo-1595267590899-73602d38562d?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Farmer" />
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


    </div>
  )
}
