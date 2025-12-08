'use client'

import React, { useState } from 'react'

// NOTE: in dono files ka code mat chhedna,
// sirf yahan unko as components use kar rahe hain
import PigAnalyticsPage from '../pig-analytics/page'
import PoultryAnalyticsPage from '../poultry-analytics/page'

export default function CombinedAnalyticsPage() {
  const [active, setActive] = useState<'pig' | 'poultry'>('pig')

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top switch buttons */}
      <div className="max-w-7xl mx-auto px-4 pt-[118px] md:pt-[126px]">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActive('pig')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              active === 'pig'
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            🐷 Pig Analytics
          </button>
          <button
            onClick={() => setActive('poultry')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              active === 'poultry'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            🐔 Poultry Analytics
          </button>
        </div>
      </div>

      {/* Actual pages – logic untouched */}
      <div className="combined-analytics-wrapper">
        {active === 'pig' ? (
          <PigAnalyticsPage />
        ) : (
          <PoultryAnalyticsPage />
        )}
      </div>
      
      <style jsx global>{`
        /* Hide Navbar from child components */
        .combined-analytics-wrapper nav {
          display: none !important;
        }
        /* Remove top padding from child components */
        .combined-analytics-wrapper > div[class*="pt-"],
        .combined-analytics-wrapper > div > div[class*="pt-"] {
          padding-top: 0 !important;
        }
        /* Remove border-bottom from header to eliminate horizontal separator line */
        .combined-analytics-wrapper .bg-white.border-b,
        .combined-analytics-wrapper div[class*="border-b"][class*="border-gray"] {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  )
}

