'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function Footer() {
  const footerNavigation = {
    platform: [
      {name: <span data-editor-id="app/components/Footer.tsx:10:19">Government Schemes</span>, href: "/government-schemes"},
      {name: <span data-editor-id="app/components/Footer.tsx:11:19">Marketplace</span>, href: "/marketplace"},
      {name: <span data-editor-id="app/components/Footer.tsx:12:19">Community Forum</span>, href: "/forum"},
      {name: <span data-editor-id="app/components/Footer.tsx:13:19">Dashboard</span>, href: "/dashboard"},
    ],
    resources: [
      {name: <span data-editor-id="app/components/Footer.tsx:16:19">Blog & News</span>, href: "/blog-news"},
      {name: <span data-editor-id="app/components/Footer.tsx:17:19">FAQ</span>, href: "/faq"},
      {name: <span data-editor-id="app/components/Footer.tsx:18:19">Events</span>, href: "/events"},
      {name: <span data-editor-id="app/components/Footer.tsx:19:19">Gallery</span>, href: "/gallery"},
    ],
    company: [
      {name: <span data-editor-id="app/components/Footer.tsx:22:19">About Us</span>, href: "/about-us"},
      {name: <span data-editor-id="app/components/Footer.tsx:23:19">Contact</span>, href: "/about-us#contact"},
      {name: <span data-editor-id="app/components/Footer.tsx:24:19">Careers</span>, href: "#"},
      {name: <span data-editor-id="app/components/Footer.tsx:25:19">Press</span>, href: "#"},
    ],
    legal: [
      {name: <span data-editor-id="app/components/Footer.tsx:28:19">Privacy Policy</span>, href: "/privacy"},
      {name: <span data-editor-id="app/components/Footer.tsx:29:19">Terms of Service</span>, href: "/terms"},
      {name: <span data-editor-id="app/components/Footer.tsx:30:19">Cookie Policy</span>, href: "/cookies"},
      {name: <span data-editor-id="app/components/Footer.tsx:31:19">Disclaimer</span>, href: "/disclaimer"},
    ],
    social: [
      {
        name: <span data-editor-id="app/components/Footer.tsx:35:17">Facebook</span>,
        href: "#",
        icon: "mdi:facebook",
      },
      {
        name: <span data-editor-id="app/components/Footer.tsx:40:17">Twitter</span>,
        href: "#",
        icon: "mdi:twitter",
      },
      {
        name: <span data-editor-id="app/components/Footer.tsx:45:17">Instagram</span>,
        href: "#",
        icon: "mdi:instagram",
      },
      {
        name: <span data-editor-id="app/components/Footer.tsx:50:17">YouTube</span>,
        href: "#",
        icon: "mdi:youtube",
      },
      {
        name: <span data-editor-id="app/components/Footer.tsx:55:17">LinkedIn</span>,
        href: "#",
        icon: "mdi:linkedin",
      },
    ],
  };

  const renderList = ({ title, items }: { title: string; items: { name: React.ReactNode; href: string }[] }) => (
    <div data-editor-id="app/components/Footer.tsx:63:5">
      <h3 data-editor-id="app/components/Footer.tsx:64:7" className="text-sm font-semibold text-neutral-800 mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index}>
            <Link 
              href={item.href} 
              className="text-neutral-600 hover:text-green-600 transition-colors duration-200 text-sm"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-white border-t border-green-100">
      <div data-editor-id="app/components/Footer.tsx:80:7" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div data-editor-id="app/components/Footer.tsx:81:9" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div data-editor-id="app/components/Footer.tsx:83:11" className="lg:col-span-2 space-y-6">
            <div data-editor-id="app/components/Footer.tsx:84:13" className="flex items-center space-x-2">
              <div data-editor-id="app/components/Footer.tsx:85:15" className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Icon icon="mdi:pig" className="w-6 h-6 text-white" />
              </div>
              <span data-editor-id="app/components/Footer.tsx:88:15" className="text-xl font-semibold text-green-800">FarmSeva</span>
            </div>
            <p data-editor-id="app/components/Footer.tsx:90:13" className="text-neutral-600 text-sm leading-relaxed max-w-md">
              Empowering farmers and livestock owners across India with access to government schemes, modern practices, and community support.
            </p>
            <div data-editor-id="app/components/Footer.tsx:93:13" className="flex space-x-4">
              {footerNavigation.social.map((item, index) => (
                <Link key={index} href={item.href} className="text-neutral-400 hover:text-green-600 transition-colors duration-200">
                  <Icon icon={item.icon} className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          {renderList({title: "Platform", items: footerNavigation.platform})}
          {renderList({title: "Resources", items: footerNavigation.resources})}
          {renderList({title: "Company", items: footerNavigation.company})}
          {renderList({title: "Legal", items: footerNavigation.legal})}
        </div>

        {/* Newsletter */}
        <div data-editor-id="app/components/Footer.tsx:108:9" className="bg-green-50 rounded-2xl p-8 mb-12">
          <div data-editor-id="app/components/Footer.tsx:109:11" className="max-w-2xl mx-auto text-center">
            <h3 data-editor-id="app/components/Footer.tsx:110:13" className="text-xl font-medium text-neutral-800 mb-2">
              Stay Updated with FarmSeva
            </h3>
            <p data-editor-id="app/components/Footer.tsx:113:13" className="text-neutral-600 text-sm mb-6">
              Get the latest updates on new schemes, market trends, and farming best practices delivered to your inbox
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div data-editor-id="app/components/Footer.tsx:118:15" className="flex-1 relative">
                <Icon icon="mdi:email-outline" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
              >
                <span data-editor-id="app/components/Footer.tsx:129:17">Subscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div data-editor-id="app/components/Footer.tsx:136:9" className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-green-100">
          <p data-editor-id="app/components/Footer.tsx:137:11" className="text-neutral-500 text-sm">
            &copy; 2024 FarmSeva. All rights reserved. Made with ❤️ for Indian farmers.
          </p>
          
          <div data-editor-id="app/components/Footer.tsx:141:11" className="flex items-center space-x-6 mt-4 md:mt-0">
            <div data-editor-id="app/components/Footer.tsx:142:13" className="flex items-center space-x-2 text-sm text-neutral-500">
              <Icon icon="mdi:map-marker" className="w-4 h-4 text-green-500" />
              <span data-editor-id="app/components/Footer.tsx:144:15">Serving all states of India</span>
            </div>
            <div data-editor-id="app/components/Footer.tsx:146:13" className="flex items-center space-x-2 text-sm text-neutral-500">
              <Icon icon="mdi:phone" className="w-4 h-4 text-green-500" />
              <span data-editor-id="app/components/Footer.tsx:148:15">1800-FARM-SEVA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}