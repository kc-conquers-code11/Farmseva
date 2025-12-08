'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Leaf, Users, Target, Eye, Heart, ShieldCheck, 
  Cpu, Sprout, Mail, Phone, MapPin, Send, 
  Instagram, Facebook, Twitter, Linkedin,
  Loader2, CheckCircle
} from 'lucide-react'
import { useState } from 'react'
// IMPORT NAVBAR
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export default function AboutPage() {
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: '', type: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' })
      setTimeout(() => setIsSuccess(false), 3000)
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // --- DATA: TEAM MEMBERS ---
  const teamMembers = [
    {
      name: "Ashish Dixhit",
      role: "Team Lead & Creativity",
      img: "/team/ashish.png",
      bio: "Guides the team and distributes workload evenly."
    },
    {
      name: "Rizvi Ahmed Abbas",
      role: "Lead Developer",
      img: "/team/rizvi.png",
      bio: "Proposes new & creative solutions to technical problems."
    },
    {
      name: "Vijay Gaud",
      role: "Backend & AI Dev.",
      img: "/team/vijay.png",
      bio: "Takes care of the backend architecture and AI integration."
    },
    {
      name: "Krishna Choudhary",
      role: "Development Team",
      img: "/team/krishna.jpg",
      bio: "Crafting the user-friendly interface and experience."
    },
    {
      name: "Revathi Lyju",
      role: "Documentation & Publicity",
      img: "/team/revathi.png",
      bio: "Analyses the data and gives helpful insights for growth."
    },
    {
      name: "Aqeef Khan",
      role: "Development Team",
      img: "/team/akif.png", 
      bio: "Ensuring our platform is fast, responsive, and reliable."
    }
  ]

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 selection:bg-green-100 selection:text-green-900">
      
      {/* --- NAVBAR --- */}
      <Navbar />

      {/* --- HERO HEADER --- */}
      <section className="pt-32 pb-16 bg-[#f8fafc] text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-green-900 mb-6">
            About <span className="text-green-600">FarmSeva</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Born from the vision of empowering every farmer in India with access to government support, modern technology, and a thriving community of agricultural experts.
          </p>
        </motion.div>
      </section>

      {/* ... (The rest of the content: Stats, Mission, Team, Contact remains exactly the same as previous) ... */}
      
      {/* COPY THE REST OF THE SECTION CONTENT FROM THE PREVIOUS ABOUT PAGE HERE */}
      {/* To save space, I will include the critical Stats & Team sections below, you can keep the rest from the file I gave you before. */}

      <section className="py-12 bg-green-50 border-y border-green-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem icon={<Users />} count="10,000+" label="Farmers Served" />
          <StatItem icon={<Leaf />} count="500+" label="Government Schemes" />
          <StatItem icon={<MapPin />} count="25+" label="States Covered" />
          <StatItem icon={<Heart />} count="95%" label="Success Rate" />
        </div>
      </section>

      {/* For brevity, assume Mission/Values/Team sections are here as in the previous code block */}
      {/* ... */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Meet Our Team</h2>
          <p className="text-gray-500 mb-16">The passionate minds behind FarmSeva.</p>

          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12 max-w-5xl mx-auto">
            {teamMembers.map((member, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-green-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-300" />
                  <img 
                    src={member.img} 
                    alt={member.name} 
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
                    onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=16a34a&color=fff&size=200`
                    }}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-green-600 font-medium text-sm mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ... Contact Form ... */}
      
      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
        {/* Footer content... */}
        <div className="max-w-7xl mx-auto px-6">
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                <p>© 2025 FarmSeva. All rights reserved.</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Serving all states of India
                </div>
            </div>
        </div>
      </footer>

      <Footer />
    </div>
  )
}

function StatItem({ icon, count, label }: any) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm mb-3 border border-green-100">
        {icon}
      </div>
      <div className="text-3xl font-serif font-bold text-gray-900 mb-1">{count}</div>
      <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</div>
    </div>
  )
}

function SocialIcon({ icon }: any) {
    return (
        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-green-600 hover:text-white transition-all duration-300">
            {icon}
        </button>
    )
}