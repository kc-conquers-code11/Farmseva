'use client'

import React from 'react'
import { Mail, MapPin, Phone, ChevronRight } from 'lucide-react'

const FOOTER_LINKS = [
    {
        title: 'Quick Links',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Schemes & Programs', href: '/schemes' },
            { label: 'Citizen Services', href: '/services' },
            { label: 'Farmer Dashboard', href: '/dashboard' },
            { label: 'Marketplace (e-NAM)', href: '/marketplace' },
        ],
    },
    {
        title: 'Resources & Help',
        links: [
            { label: 'Guidelines & Advisories', href: '/guidelines' },
            { label: 'Report Outbreak', href: '/report' },
            { label: 'Locate Vet Clinic', href: '/locate' },
            { label: 'FAQ / Helpdesk', href: '/help' },
            { label: 'Feedback', href: '/feedback' },
        ],
    },
    {
        title: 'External Links',
        links: [
            { label: 'National Portal of India', href: 'https://india.gov.in' },
            { label: 'Ministry of Agriculture', href: '#' },
            { label: 'DAHD Website', href: '#' },
            { label: 'Digital India', href: '#' },
        ],
    },
]

export default function Footer() {
    return (
        <footer className="bg-[#002a50] text-white pt-16 pb-8 border-t-[6px] border-orange-500">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Address */}
                    <div className="md:col-span-1 space-y-5">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/180px-Emblem_of_India.svg.png"
                                alt="Emblem of India"
                                className="h-12 w-auto brightness-0 invert"
                            />
                            <div>
                                <h3 className="text-sm font-bold leading-tight">कृषि और किसान कल्याण मंत्रालय</h3>
                                <p className="text-xs leading-tight opacity-80">
                                    Ministry of Fisheries, Animal Husbandry &amp; Dairying
                                </p>
                            </div>
                        </div>
                        <p className="text-white/70 text-xs leading-relaxed">
                            Dedicated to ensuring the health and productivity of India&apos;s livestock through digital
                            innovation and robust biosecurity measures.
                        </p>
                        <div className="space-y-3 text-white/70 text-sm pt-2">
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                <span>Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} />
                                <span>+91-11-23382012</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail size={16} />
                                <span>helpdesk-dahd@gov.in</span>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Link Sections */}
                    {FOOTER_LINKS.map((section, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold text-base mb-5 text-orange-400 relative inline-block">
                                {section.title}
                                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-white/30"></span>
                            </h4>
                            <ul className="space-y-3 text-white/80 text-sm">
                                {section.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <a
                                            href={link.href}
                                            className="hover:text-white hover:underline flex items-center gap-2 group transition-all"
                                        >
                                            <ChevronRight
                                                size={14}
                                                className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-orange-400"
                                            />
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
                        <a href="#" className="hover:text-white">
                            Website Policies
                        </a>
                        <a href="#" className="hover:text-white">
                            Help
                        </a>
                        <a href="#" className="hover:text-white">
                            Feedback
                        </a>
                        <a href="#" className="hover:text-white">
                            Terms &amp; Conditions
                        </a>
                    </div>
                    <div className="text-center md:text-right">
                        <p>Content Owned by Ministry of Fisheries, Animal Husbandry &amp; Dairying, GoI.</p>
                        <p>Developed &amp; Hosted by National Informatics Centre (NIC)</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
