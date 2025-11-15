'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from 'cosmic-authentication';
import Navbar from '../components/Navbar';
import Card from '@/app/components/Card';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'risk' | 'weather' | 'alerts' | 'schemes'>('overview');

  // Demo analytics strictly for Pig & Poultry
  const priceTrend = [
    { month: 'Jan', pig: 165, poultry: 120 },
    { month: 'Feb', pig: 170, poultry: 118 },
    { month: 'Mar', pig: 162, poultry: 125 },
    { month: 'Apr', pig: 175, poultry: 130 },
    { month: 'May', pig: 180, poultry: 135 },
    { month: 'Jun', pig: 178, poultry: 132 },
  ];

  const rainfallTrend = [
    { month: 'Jan', mm: 12 },
    { month: 'Feb', mm: 8 },
    { month: 'Mar', mm: 5 },
    { month: 'Apr', mm: 22 },
    { month: 'May', mm: 48 },
    { month: 'Jun', mm: 95 },
  ];

  const productivityData = [
    { animal: 'Pig', current: 82, target: 100 },
    { animal: 'Poultry', current: 90, target: 100 },
  ];

  const revenueDistribution = [
    { name: 'Pig', value: 56, color: '#10b981' },
    { name: 'Poultry', value: 44, color: '#f59e0b' },
  ];

  const recentSchemes = [
    {
      id: 'ps-1',
      name: 'Pig Development Programme',
      category: 'Pig',
      deadline: '2025-12-31',
      status: 'eligible',
      amount: 'Up to ₹50,000'
    },
    {
      id: 'ps-2',
      name: 'Poultry Venture Capital Fund',
      category: 'Poultry',
      deadline: '2025-11-15',
      status: 'applied',
      amount: 'Up to ₹25 lakh'
    },
    {
      id: 'ps-3',
      name: 'Biosecurity Infrastructure Support',
      category: 'Pig & Poultry',
      deadline: '2025-10-20',
      status: 'eligible',
      amount: 'Variable'
    }
  ];

  const weatherAlerts = [
    { type: 'warning', title: 'Heat Stress Risk (Poultry)', description: 'Increase ventilation and provide cool water to reduce mortality risk in the next 48 hours', icon: 'mdi:weather-sunny-alert' },
    { type: 'info', title: 'Rainfall Expected', description: 'Secure pig housing and improve drainage to avoid flooding in pens', icon: 'mdi:weather-pouring' }
  ];

  const securityAlerts = [
    { level: 'high', title: 'Fake Vaccine Offers', detail: 'Beware of unverified ASF or AI vaccines. Buy only from licensed suppliers.', icon: 'mdi:shield-alert' },
    { level: 'medium', title: 'Scam Hatchery Listings', detail: 'Cross-verify hatchery registrations and batch certificates before payments.', icon: 'mdi:alert-decagram' },
    { level: 'low', title: 'Counterfeit Feed Additives', detail: 'Check FSSAI/FDA labels and batch numbers. Avoid bulk prepayments.', icon: 'mdi:alert' },
  ];

  const tips = [
    { title: 'Biosecurity First', description: 'Footbaths, visitor logs, and pen-specific gear reduce disease risk significantly.', icon: 'mdi:shield-check' },
    { title: 'Heat Mitigation', description: 'Shade nets and foggers reduce poultry heat stress during summer.', icon: 'mdi:weather-sunny' },
    { title: 'Feed Efficiency', description: 'Track FCR (feed conversion ratio) weekly for pigs and broilers.', icon: 'mdi:food-drumstick' }
  ];

  const [riskForm, setRiskForm] = useState({ animal: 'Pig', state: 'Punjab', season: 'Summer' });
  const riskScores = { climate: 0.58, pest: 0.33, price: 0.52 };

  if (loading) {
    return (
      <div data-editor-id="app/dashboard/page.tsx:84:7" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div data-editor-id="app/dashboard/page.tsx:85:9" className="text-center">
          <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p data-editor-id="app/dashboard/page.tsx:87:11" className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-editor-id="app/dashboard/page.tsx:93:5" className="min-h-screen bg-gray-50">
      <Navbar />

      <div data-editor-id="app/dashboard/page.tsx:96:7" className="pt-16">
        <div data-editor-id="app/dashboard/page.tsx:97:9" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div data-editor-id="app/dashboard/page.tsx:99:11" className="mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 data-editor-id="app/dashboard/page.tsx:106:15" className="text-3xl font-light text-neutral-800 mb-2">
                Welcome back, <span data-editor-id="app/dashboard/page.tsx:107:32" className="font-medium text-green-600">{user?.displayName || 'Farmer'}</span>
              </h1>
              <p data-editor-id="app/dashboard/page.tsx:109:15" className="text-neutral-600">Your pig & poultry dashboard with live insights</p>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div data-editor-id="app/dashboard/page.tsx:114:11" className="mb-8">
            <div data-editor-id="app/dashboard/page.tsx:115:13" className="flex flex-wrap gap-2">
              {[
                { key: 'overview', label: <span>Overview</span>, icon: 'mdi:view-dashboard' },
                { key: 'analytics', label: <span>Analytics</span>, icon: 'mdi:chart-line' },
                { key: 'risk', label: <span>Risk</span>, icon: 'mdi:alert-decagram' },
                { key: 'weather', label: <span>Weather</span>, icon: 'mdi:weather-cloudy' },
                { key: 'alerts', label: <span>Security</span>, icon: 'mdi:shield-lock' },
                { key: 'schemes', label: <span>Schemes</span>, icon: 'mingcute:government-line' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-neutral-600 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  <Icon icon={tab.icon} className="w-4 h-4" />
                  <span data-editor-id="app/dashboard/page.tsx:134:19">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Icon icon="mingcute:government-fill" className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">3</div>
                  <div className="text-sm text-neutral-600">Eligible Schemes</div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:pig" className="w-6 h-6 text-yellow-600" />
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">This Month</span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">₹62,400</div>
                  <div className="text-sm text-neutral-600">Pig & Poultry Sales</div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:thermometer" className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-blue-600 font-medium">Alerts</span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">2</div>
                  <div className="text-sm text-neutral-600">Weather & Security</div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:chart-line" className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">+10%</span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">86%</div>
                  <div className="text-sm text-neutral-600">Productivity Score</div>
                </Card>
              </div>

              {/* Weather Alerts */}
              <Card>
                <div className="flex items-center mb-6">
                  <Icon icon="mdi:weather-cloudy" className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-medium text-neutral-800">Weather Alerts</h2>
                </div>
                <div className="space-y-4">
                  {weatherAlerts.map((alert, i) => (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'}`}>
                      <div className="flex items-start space-x-3">
                        <Icon icon={alert.icon} className={`w-5 h-5 mt-0.5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                        <div>
                          <h3 className="font-medium text-neutral-800 mb-1">{alert.title}</h3>
                          <p className="text-sm text-neutral-600">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Tips */}
              <Card>
                <div className="flex items-center mb-6">
                  <Icon icon="mdi:lightbulb" className="w-6 h-6 text-yellow-500 mr-2" />
                  <h2 className="text-xl font-medium text-neutral-800">Productivity Tips</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tips.map((t, i) => (
                    <div key={i} className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Icon icon={t.icon} className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-800 mb-1">{t.title}</h3>
                          <p className="text-sm text-neutral-600">{t.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <Card>
                <h2 className="text-xl font-medium text-neutral-800 mb-6">Price Trends (Pig & Poultry)</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pig" name="Pig (₹/kg live)" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="poultry" name="Broiler (₹/kg)" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-medium text-neutral-800 mb-6">Rainfall Overview</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfallTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="mm" name="Rain (mm)" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-medium text-neutral-800 mb-6">Productivity</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="animal" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="current" name="Current" fill="#10b981" />
                      <Bar dataKey="target" name="Target" fill="#d1fae5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-medium text-neutral-800 mb-6">Revenue Mix</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                        {revenueDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Weather */}
          {activeTab === 'weather' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Icon icon="mdi:weather-partly-rainy" className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-medium text-neutral-800">Real-time Weather Alerts</h2>
                  </div>
                  <span className="text-xs text-neutral-500">Provider: Other (configure /api/weather)</span>
                </div>
                <div className="space-y-4">
                  {weatherAlerts.map((a, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${a.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start gap-3">
                        <Icon icon={a.icon} className={`w-5 h-5 ${a.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                        <div>
                          <h3 className="font-medium text-neutral-800">{a.title}</h3>
                          <p className="text-sm text-neutral-600">{a.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Risk */}
          {activeTab === 'risk' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <Card>
                <div className="flex items-center mb-6">
                  <Icon icon="mdi:alert-decagram" className="w-6 h-6 text-orange-600 mr-2" />
                  <h2 className="text-xl font-medium text-neutral-800">Risk Assessment (Pig & Poultry)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <select value={riskForm.animal} onChange={(e) => setRiskForm({ ...riskForm, animal: e.target.value })} className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option>Pig</option>
                    <option>Poultry</option>
                  </select>
                  <select value={riskForm.state} onChange={(e) => setRiskForm({ ...riskForm, state: e.target.value })} className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option>Punjab</option>
                    <option>Kerala</option>
                    <option>Gujarat</option>
                    <option>Maharashtra</option>
                    <option>Haryana</option>
                  </select>
                  <select value={riskForm.season} onChange={(e) => setRiskForm({ ...riskForm, season: e.target.value })} className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option>Summer</option>
                    <option>Monsoon</option>
                    <option>Winter</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'Climate Risk', val: riskScores.climate, color: 'bg-emerald-500' },
                    { key: 'Pest/Disease Risk', val: riskScores.pest, color: 'bg-orange-500' },
                    { key: 'Price Risk', val: riskScores.price, color: 'bg-blue-500' },
                  ].map((r) => (
                    <div key={r.key} className="p-4 rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-neutral-800">{r.key}</h3>
                        <span className="text-sm text-neutral-500">{Math.round(r.val * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded">
                        <div className={`${r.color} h-2 rounded`} style={{ width: `${Math.round(r.val * 100)}%` }} />
                      </div>
                      <p className="text-xs text-neutral-600 mt-2">Connect your providers in /api/weather and /api/prices to power these scores.</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center mb-6">
                  <Icon icon="mdi:virus" className="w-6 h-6 text-red-500 mr-2" />
                  <h2 className="text-xl font-medium text-neutral-800">Disease Predictions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'African Swine Fever (Pig)', risk: 'medium', advice: 'Strict biosecurity, isolate new stock, control vectors.' },
                    { name: 'Avian Influenza (Poultry)', risk: 'low', advice: 'Limit wild bird contact, disinfect equipment regularly.' },
                    { name: 'Coccidiosis (Poultry)', risk: 'high', advice: 'Maintain litter dryness, consider prophylaxis as per vet.' },
                  ].map((d) => (
                    <div key={d.name} className="p-4 rounded-lg border border-neutral-200">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-neutral-800">{d.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          d.risk === 'high' ? 'bg-red-100 text-red-700' : d.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{d.risk}</span>
                      </div>
                      <p className="text-sm text-neutral-600">{d.advice}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Security Alerts */}
          {activeTab === 'alerts' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <Card>
                <div className="flex items-center mb-6">
                  <Icon icon="mdi:shield-lock" className="w-6 h-6 text-green-700 mr-2" />
                  <h2 className="text-xl font-medium text-neutral-800">Security Alerts</h2>
                </div>
                <div className="space-y-3">
                  {securityAlerts.map((a, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white border border-neutral-200">
                      <div className="flex items-start gap-3">
                        <Icon icon={a.icon} className={`${a.level === 'high' ? 'text-red-600' : a.level === 'medium' ? 'text-yellow-600' : 'text-green-600'} w-5 h-5 mt-0.5`} />
                        <div>
                          <h3 className="font-medium text-neutral-800">{a.title}</h3>
                          <p className="text-sm text-neutral-600">{a.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs text-neutral-500">Report suspicious activity from any product page or contact support.</div>
              </Card>
            </motion.div>
          )}

          {/* Schemes */}
          {activeTab === 'schemes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card>
                <h2 className="text-xl font-medium text-neutral-800 mb-6">Pig & Poultry Schemes</h2>
                <div className="space-y-4">
                  {recentSchemes.map((s) => (
                    <div key={s.id} className="p-4 border border-neutral-200 rounded-lg hover:border-green-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-neutral-800 mb-1">{s.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600">
                            <span>{s.category}</span>
                            <span>Deadline: {s.deadline}</span>
                            <span className="font-semibold text-green-600">{s.amount}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            s.status === 'eligible' ? 'bg-green-100 text-green-700' : s.status === 'applied' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {s.status}
                          </span>
                          <a href="/government-schemes" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                            <span>Apply Now</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
