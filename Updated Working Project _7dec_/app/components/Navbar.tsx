'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { 
  Leaf, Menu, X, LogOut, ChevronDown, 
  LayoutDashboard, UserCircle, LifeBuoy, Sprout, Store
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseUser } from "@/hooks/useSupabaseUser"
import { supabase } from "@/lib/supabaseClient"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useSupabaseUser()
  const profileRef = useRef<HTMLDivElement>(null)

  // Handle Scroll Effect for Glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => pathname === path

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Community', href: '/dashboard/farmer/community' },
    { name: 'Marketplace', href: '/marketplace' }, 
    { name: 'About', href: '/about' },
  ]

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-lg border-neutral-200/60 shadow-sm py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* === LOGO === */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
             <div className="absolute inset-0 bg-green-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform opacity-20"></div>
             <div className="relative w-full h-full bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-600/20">
                <Leaf size={22} fill="currentColor" className="text-white" />
             </div>
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-neutral-900 tracking-tight leading-none block">FarmSeva</span>
            <span className="text-[10px] uppercase font-bold text-green-600 tracking-widest leading-none block ml-0.5">India</span>
          </div>
        </Link>
        
        {/* === DESKTOP NAVIGATION === */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-100/50 p-1.5 rounded-full border border-neutral-200/50 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive(link.href) 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* === AUTH & ACTIONS === */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-1 pr-3 py-1 bg-white border border-neutral-200 rounded-full hover:border-green-300 hover:ring-2 hover:ring-green-50 transition-all shadow-sm group"
              >
                <div className="w-9 h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-neutral-800 leading-tight">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'Farmer'}
                  </p>
                  <p className="text-[10px] text-neutral-500 leading-tight font-medium">My Account</p>
                </div>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden py-2"
                  >
                    <div className="px-4 py-3 border-b border-neutral-50 bg-neutral-50/50">
                      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-neutral-800 truncate">{user.email}</p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                        <Link href="/dashboard/farmer" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors">
                            <UserCircle size={18} /> Profile Settings
                        </Link>
                        <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors">
                            <LifeBuoy size={18} /> Help & Support
                        </Link>
                    </div>

                    <div className="border-t border-neutral-50 p-2 mt-1">
                        <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="text-sm font-bold text-neutral-600 hover:text-neutral-900 px-4 py-2 transition-colors">
                  Log in
                </button>
              </Link>
              <Link href="/register">
                <button className="group relative bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">Get Started <Leaf size={14} className="text-green-400 group-hover:rotate-45 transition-transform"/></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* === MOBILE TOGGLE === */}
        <button 
            className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* === MOBILE MENU OVERLAY === */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-neutral-100 overflow-hidden absolute w-full shadow-2xl"
          >
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    {navLinks.map(link => (
                        <Link 
                            key={link.name}
                            href={link.href} 
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                                isActive(link.href) ? 'bg-green-50 text-green-700' : 'text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="border-t border-neutral-100 pt-6">
                    {user ? (
                        <>
                            <div className="flex items-center gap-3 mb-6 px-2 bg-neutral-50 p-4 rounded-xl">
                                <div className="w-10 h-10 bg-white text-green-700 rounded-full flex items-center justify-center font-bold border border-neutral-200 shadow-sm">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-neutral-900 truncate">{user.email}</p>
                                    <p className="text-xs text-green-600 font-medium">Active Session</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Link 
                                    href="/dashboard/farmer" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-black shadow-lg shadow-neutral-200"
                                >
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <button 
                                    onClick={() => { handleSignOut(); }}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <button className="w-full py-3 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-sm hover:bg-neutral-50">
                                    Log In
                                </button>
                            </Link>
                            <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                <button className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-md shadow-green-200">
                                    Sign Up
                                </button>
                            </Link>
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