'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useAuth } from 'cosmic-authentication';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signIn, signOut, loading } = useAuth();
  const [lang, setLang] = useState<'EN' | 'हिं'>('EN');

  const menuItems = [
    { name: <span data-editor-id="app/components/Navbar.tsx:12:17">Home</span>, href: '/' },
    { name: <span data-editor-id="app/components/Navbar.tsx:13:17">Government Schemes</span>, href: '/government-schemes' },
    { name: <span data-editor-id="app/components/Navbar.tsx:14:17">Marketplace</span>, href: '/marketplace' },
    { name: <span data-editor-id="app/components/Navbar.tsx:15:17">Forum</span>, href: '/forum' },
    { name: <span data-editor-id="app/components/Navbar.tsx:16:17">Blog/News</span>, href: '/blog-news' },
    { name: <span data-editor-id="app/components/Navbar.tsx:16:27">About Us</span>, href: '/about-us' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-green-100"
    >
      <div data-editor-id="app/components/Navbar.tsx:25:7" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-editor-id="app/components/Navbar.tsx:26:9" className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div data-editor-id="app/components/Navbar.tsx:29:13" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Icon icon="mdi:pig" className="w-6 h-6 text-white" />
            </div>
            <span data-editor-id="app/components/Navbar.tsx:32:13" className="text-xl font-semibold text-green-800">FarmSeva</span>
          </Link>

          {/* Desktop Menu */}
          <div data-editor-id="app/components/Navbar.tsx:36:11" className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-neutral-600 hover:text-green-600 transition-colors duration-200 text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth & Mobile Menu */}
          <div data-editor-id="app/components/Navbar.tsx:48:11" className="flex items-center space-x-4">
            {/* Language picker */}
            <select
              aria-label="Language"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'EN' | 'हिं')}
              className="hidden sm:block text-xs px-2 py-1 border border-green-200 rounded-md text-neutral-600 hover:border-green-300 focus:outline-none"
            >
              <option value="EN">EN</option>
              <option value="हिं">हिं</option>
            </select>
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div data-editor-id="app/components/Navbar.tsx:52:17" className="hidden md:flex items-center space-x-4">
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <span data-editor-id="app/components/Navbar.tsx:57:23">Dashboard</span>
                    </Link>
                    <button
                      onClick={signOut}
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all duration-200 text-sm font-medium"
                    >
                      <span data-editor-id="app/components/Navbar.tsx:63:23">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div data-editor-id="app/components/Navbar.tsx:67:17" className="hidden md:flex items-center space-x-4">
                    <button
                      onClick={signIn}
                      className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <span data-editor-id="app/components/Navbar.tsx:71:23">Sign In</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-green-100 transition-colors"
            >
              <Icon icon={isMenuOpen ? "mdi:close" : "mdi:menu"} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-green-100"
          >
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block py-2 px-4 text-neutral-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {!loading && (
              <div data-editor-id="app/components/Navbar.tsx:104:15" className="mt-4 pt-4 border-t border-green-100">
                {isAuthenticated ? (
                  <div data-editor-id="app/components/Navbar.tsx:106:17" className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="block py-2 px-4 bg-green-100 text-green-700 rounded-lg text-center font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span data-editor-id="app/components/Navbar.tsx:112:23">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-200 font-medium"
                    >
                      <span data-editor-id="app/components/Navbar.tsx:121:23">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      signIn();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                  >
                    <span data-editor-id="app/components/Navbar.tsx:132:21">Sign In</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}