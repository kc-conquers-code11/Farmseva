'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const stats = [
    { value: '10,000+', label: <span data-editor-id="app/about/page.tsx:38:29">Farmers Served</span>, icon: 'mdi:account-group' },
    { value: '500+', label: <span data-editor-id="app/about/page.tsx:39:27">Government Schemes</span>, icon: 'mingcute:government-fill' },
    { value: '25+', label: <span data-editor-id="app/about/page.tsx:40:25">States Covered</span>, icon: 'mdi:map' },
    { value: '95%', label: <span data-editor-id="app/about/page.tsx:41:25">Success Rate</span>, icon: 'mdi:trophy' },
  ];


  const values = [
    {
      title: <span data-editor-id="app/about/page.tsx:67:15">Farmer-First Approach</span>,
      description: <span data-editor-id="app/about/page.tsx:68:19">Every decision we make puts farmer welfare and success at the center.</span>,
      icon: 'mdi:account-heart'
    },
    {
      title: <span data-editor-id="app/about/page.tsx:72:15">Technology for Good</span>,
      description: <span data-editor-id="app/about/page.tsx:73:19">Leveraging modern technology to solve age-old agricultural challenges.</span>,
      icon: 'mdi:lightbulb'
    },
    {
      title: <span data-editor-id="app/about/page.tsx:77:15">Community Driven</span>,
      description: <span data-editor-id="app/about/page.tsx:78:19">Building a strong community where farmers support and learn from each other.</span>,
      icon: 'mdi:people'
    },
    {
      title: <span data-editor-id="app/about/page.tsx:82:15">Transparency</span>,
      description: <span data-editor-id="app/about/page.tsx:83:19">Providing clear, honest information about schemes, markets, and opportunities.</span>,
      icon: 'mdi:shield-check'
    },
  ];
    const teamMembers = [
    {
      name: <span>Ashish Dixhit</span>,
  role: <span>Team Lead & Creativity</span>,
  image: "/team/ashish.png", // Local image path
  bio: <span>Guides the team and distributes workload evenly</span>
    },
{
  name: <span>Rizvi Ahmed Abbas</span>,
  role: <span>Lead Developer</span>,
  image: "/team/rizvi.png", // Local image path
  bio: <span>Proposes new & Creative Solutions to technical problems</span>
},
{
  name: <span>Vijay Gaud</span>,
  role: <span>Backend & AI Dev.</span>,
  image: "/team/vijay.png", // Local image path
  bio: <span>Takes care of the Backend Development</span>
},
{
  name: <span>Krishna Choudhary</span>,
  role: <span> Development Team </span>,
  image: "/team/krishna.jpg", // Local image path
  bio: <span>Crafting the user-friendly interface</span>
},
{
  name: <span>Revathi Lyju</span>,
  role: <span>Documentation & Publicity</span>,
  image: "/team/revathi.png", // Local image path
  bio: <span>Analyses the data and gives helpful insights</span>
},
{
  name: <span>Aqeef Khan</span>,
  role: <span>Development Team</span>,
  image: "/team/akif.png", // Local image path
  bio: <span>Ensuring our platform is fast</span>
}
  ];

  return (
    <div data-editor-id="app/about/page.tsx:89:5" className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/about/page.tsx:94:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 data-editor-id="app/about/page.tsx:102:13" className="text-4xl md:text-5xl font-light text-neutral-800 mb-4">
              About <span data-editor-id="app/about/page.tsx:103:23" className="text-green-600 font-medium">FarmSeva</span>
            </h1>
            <p data-editor-id="app/about/page.tsx:105:13" className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Born from the vision of empowering every farmer in India with access to government support, modern technology, and a thriving community of agricultural experts.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div data-editor-id="app/about/page.tsx:118:15" key={index} className="text-center">
                <div data-editor-id="app/about/page.tsx:119:17" className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon icon={stat.icon} className="w-8 h-8 text-green-600" />
                </div>
                <div data-editor-id="app/about/page.tsx:122:17" className="text-3xl font-light text-neutral-800 mb-2">{stat.value}</div>
                <div data-editor-id="app/about/page.tsx:123:17" className="text-sm text-neutral-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div data-editor-id="app/about/page.tsx:131:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-editor-id="app/about/page.tsx:132:11" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100"
            >
              <div data-editor-id="app/about/page.tsx:142:15" className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Icon icon="mdi:target" className="w-8 h-8 text-green-600" />
              </div>
              <h2 data-editor-id="app/about/page.tsx:145:15" className="text-2xl font-medium text-neutral-800 mb-4">Our Mission</h2>
              <p data-editor-id="app/about/page.tsx:146:15" className="text-neutral-600 leading-relaxed mb-6">
                To bridge the gap between Indian farmers and government support systems, providing easy access to schemes, modern agricultural practices, and a thriving marketplace that ensures fair prices for their produce.
              </p>
              <div data-editor-id="app/about/page.tsx:150:15" className="space-y-3">
                {[
                  <span key="1" data-editor-id="app/about/page.tsx:152:19">Simplify government scheme applications</span>,
                  <span key="2" data-editor-id="app/about/page.tsx:153:19">Connect farmers directly with buyers</span>,
                  <span key="3" data-editor-id="app/about/page.tsx:154:19">Foster knowledge sharing in rural communities</span>
                ].map((point, index) => (
                  <div data-editor-id="app/about/page.tsx:156:19" key={index} className="flex items-center space-x-3">
                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-500" />
                    <span data-editor-id="app/about/page.tsx:158:21" className="text-sm text-neutral-700">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100"
            >
              <div data-editor-id="app/about/page.tsx:171:15" className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Icon icon="mdi:eye" className="w-8 h-8 text-blue-600" />
              </div>
              <h2 data-editor-id="app/about/page.tsx:174:15" className="text-2xl font-medium text-neutral-800 mb-4">Our Vision</h2>
              <p data-editor-id="app/about/page.tsx:175:15" className="text-neutral-600 leading-relaxed mb-6">
                To create a digitally empowered agricultural ecosystem where every farmer in India has equal access to opportunities, resources, and markets, leading to sustainable livelihoods and food security for the nation.
              </p>
              <div data-editor-id="app/about/page.tsx:179:15" className="space-y-3">
                {[
                  <span key="v1" data-editor-id="app/about/page.tsx:181:19">Nationwide digital agricultural platform</span>,
                  <span key="v2" data-editor-id="app/about/page.tsx:182:19">Zero scheme application rejections</span>,
                  <span key="v3" data-editor-id="app/about/page.tsx:183:19">Fair market prices for all farmers</span>
                ].map((point, index) => (
                  <div data-editor-id="app/about/page.tsx:185:19" key={index} className="flex items-center space-x-3">
                    <Icon icon="mdi:star" className="w-5 h-5 text-blue-500" />
                    <span data-editor-id="app/about/page.tsx:187:21" className="text-sm text-neutral-700">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div data-editor-id="app/about/page.tsx:197:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 data-editor-id="app/about/page.tsx:206:13" className="text-3xl font-light text-neutral-800 mb-4">Our Core Values</h2>
            <p data-editor-id="app/about/page.tsx:207:13" className="text-lg text-neutral-600 max-w-2xl mx-auto">
              The principles that guide everything we do at FarmSeva
            </p>
          </motion.div>

          <div data-editor-id="app/about/page.tsx:212:11" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 text-center"
              >
                <div data-editor-id="app/about/page.tsx:224:17" className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon icon={value.icon} className="w-8 h-8 text-green-600" />
                </div>
                <h3 data-editor-id="app/about/page.tsx:227:17" className="text-lg font-medium text-neutral-800 mb-3">{value.title}</h3>
                <p data-editor-id="app/about/page.tsx:228:17" className="text-sm text-neutral-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div data-editor-id="app/about/page.tsx:236:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 data-editor-id="app/about/page.tsx:245:13" className="text-3xl font-light text-neutral-800 mb-4">Meet Our Team</h2>
            <p data-editor-id="app/about/page.tsx:246:13" className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Passionate individuals working tirelessly to empower Indian farmers
            </p>
          </motion.div>

          <div data-editor-id="app/about/page.tsx:251:11" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 text-center"
              >
                <img 
                  src={member.image} 
                  alt={member.name.toString()}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 data-editor-id="app/about/page.tsx:266:17" className="text-xl font-medium text-neutral-800 mb-2">{member.name}</h3>
                <p data-editor-id="app/about/page.tsx:267:17" className="text-green-600 font-medium mb-3">{member.role}</p>
                <p data-editor-id="app/about/page.tsx:268:17" className="text-sm text-neutral-600 leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div data-editor-id="app/about/page.tsx:276:9" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 data-editor-id="app/about/page.tsx:285:13" className="text-3xl font-light text-neutral-800 mb-4">Get in Touch</h2>
            <p data-editor-id="app/about/page.tsx:286:13" className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Have questions, suggestions, or need support? We&apos;d love to hear from you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div data-editor-id="app/about/page.tsx:300:15" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-editor-id="app/about/page.tsx:301:17">
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                    <span data-editor-id="app/about/page.tsx:303:21">Full Name *</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div data-editor-id="app/about/page.tsx:315:17">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    <span data-editor-id="app/about/page.tsx:317:21">Email Address *</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div data-editor-id="app/about/page.tsx:331:15" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-editor-id="app/about/page.tsx:332:17">
                  <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-2">
                    <span data-editor-id="app/about/page.tsx:334:21">Inquiry Type</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                <div data-editor-id="app/about/page.tsx:348:17">
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                    <span data-editor-id="app/about/page.tsx:350:21">Subject *</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Brief subject line"
                  />
                </div>
              </div>

              <div data-editor-id="app/about/page.tsx:364:15">
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  <span data-editor-id="app/about/page.tsx:366:19">Message *</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>

              <div data-editor-id="app/about/page.tsx:379:15" className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Icon icon="mdi:loading" className="w-4 h-4 animate-spin inline mr-2" />
                      <span data-editor-id="app/about/page.tsx:392:23">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:send" className="w-4 h-4 inline mr-2" />
                      <span data-editor-id="app/about/page.tsx:397:23">Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <div data-editor-id="app/about/page.tsx:413:13" className="text-center">
              <div data-editor-id="app/about/page.tsx:414:15" className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:phone" className="w-6 h-6 text-green-600" />
              </div>
              <h3 data-editor-id="app/about/page.tsx:417:15" className="font-medium text-neutral-800 mb-2">Phone Support</h3>
              <p data-editor-id="app/about/page.tsx:418:15" className="text-sm text-neutral-600">1800-FARM-SEVA</p>
              <p data-editor-id="app/about/page.tsx:419:15" className="text-xs text-neutral-500">Mon-Sat, 9AM-6PM IST</p>
            </div>
            
            <div data-editor-id="app/about/page.tsx:422:13" className="text-center">
              <div data-editor-id="app/about/page.tsx:423:15" className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:email" className="w-6 h-6 text-green-600" />
              </div>
              <h3 data-editor-id="app/about/page.tsx:426:15" className="font-medium text-neutral-800 mb-2">Email</h3>
              <p data-editor-id="app/about/page.tsx:427:15" className="text-sm text-neutral-600">support@farmseva.in</p>
              <p data-editor-id="app/about/page.tsx:428:15" className="text-xs text-neutral-500">Response within 24 hours</p>
            </div>
            
            <div data-editor-id="app/about/page.tsx:431:13" className="text-center">
              <div data-editor-id="app/about/page.tsx:432:15" className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:map-marker" className="w-6 h-6 text-green-600" />
              </div>
              <h3 data-editor-id="app/about/page.tsx:435:15" className="font-medium text-neutral-800 mb-2">Office</h3>
              <p data-editor-id="app/about/page.tsx:436:15" className="text-sm text-neutral-600">New Delhi, India</p>
              <p data-editor-id="app/about/page.tsx:437:15" className="text-xs text-neutral-500">Serving all of India</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
