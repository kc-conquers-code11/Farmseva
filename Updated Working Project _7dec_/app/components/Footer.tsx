'use client'

import { MapPin, Phone, Mail } from 'lucide-react'
import React from 'react'

export function Footer() {
  return (
    <footer className="bg-[#002a50] text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/180px-Emblem_of_India.svg.png"
                alt="Emblem of India"
                className="h-10 w-auto brightness-0 invert"
              />
              <div>
                <h3 className="text-base font-bold leading-tight"> FarmSeva Under </h3>
                <p className="text-sm leading-tight">
                  Ministry of Agriculture & Farmers Welfare{' '}
                </p>
                <p className="text-sm leading-tight1">कृषि और किसान कल्याण मंत्रालय </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Farmseva Committed to the welfare of farmers and the development of agriculture.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-base mb-4">Important Links</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>
                <a href="/" className="hover:text-white hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="/schemes" className="hover:text-white hover:underline">
                  Schemes & Programs
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-white hover:underline">
                  Citizen Services
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-white hover:underline">
                  Farmer Dashboard
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white hover:underline">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-4">Contact Information</h4>
            <div className="space-y-3 text-white/70 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <span>Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>+91-11-23382012</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>helpdesk-agri@gov.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
            <a href="/website-policies" className="hover:text-white">
              Website Policies
            </a>
            <a href="/help" className="hover:text-white">
              Help
            </a>
            <a href="/feedback" className="hover:text-white">
              Feedback
            </a>
            <a href="/terms" className="hover:text-white">
              Terms & Conditions
            </a>
          </div>
          <p>
            Content Owned by Ministry of Agriculture & Farmers Welfare, GoI.{' '}
            <br className="md:hidden" />
            Developed & Hosted by NIC.
          </p>
        </div>
      </div>
    </footer>
  )
}
