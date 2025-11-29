'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Leaf, Menu, X, User, LogOut } from 'lucide-react' // Added User, LogOut
import { usePathname, useRouter } from 'next/navigation' // Added useRouter
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseUser } from "@/hooks/useSupabaseUser" // Import auth hook
import { supabase } from "@/lib/supabaseClient" // Import supabase client

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useSupabaseUser() // Get auth state

  // Helper to determine if a link is active
  const isActive = (path: string) => pathname === path

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    // Force reload to update UI state if router.push doesn't trigger re-render of user
    // window.location.reload() 
  }

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-100 group-hover:bg-green-800 transition-colors">
            <Leaf size={20} fill="white" />
          </div>
          <span className="text-2xl font-serif font-bold text-green-900 tracking-tight">FarmSeva</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-600">
          <Link 
            href="/" 
            className={`transition-colors ${isActive('/') ? 'text-green-700 font-bold' : 'hover:text-green-700'}`}
          >
            Home
          </Link>
          
          {/* Only show Dashboard if user is logged in
          {user && (
            <Link 
              href="/dashboard" 
              className={`transition-colors ${isActive('/dashboard') ? 'text-green-700 font-bold' : 'hover:text-green-700'}`}
            >
              Dashboard
            </Link>
          )} */}

          <Link 
            href="/community" 
            className={`transition-colors ${isActive('/community') ? 'text-green-700 font-bold' : 'hover:text-green-700'}`}
          >
            Community
          </Link>
          <Link 
            href="/about" 
            className={`transition-colors ${isActive('/about') ? 'text-green-700 font-bold' : 'hover:text-green-700'}`}
          >
            About Us
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-sm font-medium text-green-800 bg-green-50 px-3 py-1.5 rounded-full">
                  <User size={16} />
                  <span>{user.user_metadata?.full_name || user.email?.split('@')[0] || "Farmer"}</span>
               </div>
               <button 
                 onClick={handleSignOut}
                 className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
               >
                 <LogOut size={16} />
                 Logout
               </button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <button className="text-sm font-semibold text-gray-700 hover:text-green-700 transition-colors px-4 py-2">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-green-200">
                  Join Now
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4 font-medium text-gray-600">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className={isActive('/') ? 'text-green-700 font-bold' : ''}>Home</Link>
              
          
              
              <Link href="/dashboard/farmer/community" onClick={() => setIsMenuOpen(false)}>Community</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className={isActive('/about') ? 'text-green-700 font-bold' : ''}>About Us</Link>
              <hr className="border-gray-100" />
              
              {user ? (
                <>
                  <div className="text-sm text-green-700 font-semibold px-2">
                    Signed in as {user.email}
                  </div>
                  <button 
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }} 
                    className="text-left text-red-600 font-semibold flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-green-700 font-semibold">Login</Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-green-700 font-semibold">Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}