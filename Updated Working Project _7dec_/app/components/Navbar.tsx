'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import {
  Search, LayoutDashboard, UserCircle, LogOut, ChevronDown,
  Menu, X, Activity, ClipboardCheck, AlertTriangle, ShieldCheck
} from 'lucide-react'

import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { supabase } from '@/lib/supabaseClient'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user } = useSupabaseUser()
  const pathname = usePathname()
  const profileRef = useRef<HTMLDivElement>(null)

  // ❗ Login / Register sirf in pages par dikhana:
  const showAuthButtons =
    !user &&
    (pathname === '/' ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register'))

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
    { name: 'About Us', href: '/about' },
  ]

  return (
    <nav className="fixed top-0 w-full z-[80] bg-white shadow-sm font-sans ">
      {/* Top Header - Logos */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* FarmSeva Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform opacity-20" />
                <div className="relative w-full h-full bg-white rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20 overflow-hidden">
                  <img
                    src="https://farmseva.vercel.app/_next/image?url=%2Fteam%2Flogo.png&w=48&q=75"
                    alt="FarmSeva Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </div>
              <div>
                <span className="text-2xl font-serif font-bold text-neutral-900 tracking-tight leading-none block">
                  FarmSeva
                </span>
              </div>
            </a>

            {/* Ministry Logo */}
            <div className="flex items-center gap-4 pl-6 border-l border-neutral-200 hidden md:flex">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/180px-Emblem_of_India.svg.png"
                alt="Emblem of India"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-base md:text-lg font-bold text-neutral-900 leading-tight">
                  मत्स्यपालन, पशुपालन और डेयरी मंत्रालय
                </h1>
                <h2 className="text-sm md:text-base font-medium text-neutral-700 leading-tight">
                  Ministry of Fisheries, Animal Husbandry and Dairying
                </h2>
                <p className="text-xs text-neutral-500">Government of India</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <img
              src="https://negd.gov.in/wp-content/themes/negd-update/assets/images/icon/logo-header.png"
              alt="Gmeg"
              className="h-10 w-auto hidden md:block"
            />
            <img
              src="https://mohfw.gov.in/sites/all/themes/cmf/images/swach-bharat.png"
              alt="Swachh bharat"
              className="h-10 w-auto hidden md:block"
            />
          </div>
        </div>
      </div>

      {/* Bottom Header - Navigation */}
      <div className="bg-[#003c71] text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
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
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none text-sm text-white placeholder-white/70 focus:outline-none"
              />
            </div>

            {user ? (
              // ✅ user logged in → hamesha naam + sign out
              <div className="relative z-50" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors"
                >
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded shadow-lg border border-neutral-200 overflow-hidden z-50 text-neutral-800"
                    >
                      {/* <a
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-100"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </a> */}
                      {/* <a
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-100"
                      >
                        <UserCircle size={16} /> Profile
                      </a> */}
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
              // ❗ sirf Home, /login, /register pe hi buttons dikhane
              showAuthButtons && (
                <div className="hidden md:flex items-center gap-2">
                  <a href="/login" className="text-sm font-medium hover:underline px-2">
                    Log in
                  </a>
                  <span className="text-white/50">|</span>
                  <a href="/register" className="text-sm font-medium hover:underline px-2">
                    Register
                  </a>
                </div>
              )
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
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-neutral-100 border border-neutral-200 rounded pl-10 pr-4 py-2 text-sm focus:outline-none"
                />
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
                  // ✅ user logged in → hamesha sign out
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded w-full"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                ) : (
                  // ❗ auth buttons sirf selected pages pe
                  showAuthButtons && (
                    <div className="grid grid-cols-2 gap-2 px-4">
                      <a
                        href="/login"
                        className="text-center py-2 border border-neutral-300 rounded text-neutral-700 font-medium text-sm"
                      >
                        Log In
                      </a>
                      <a
                        href="/register"
                        className="text-center py-2 bg-[#003c71] text-white rounded font-medium text-sm"
                      >
                        Register
                      </a>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
