"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import VetRequestsList from "./VetRequestsList";
import VetHistoryList from "./VetHistoryList";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

// --- Mock Data ---
const openCases = [
  { id: "ASF-2025-001", farm: "Green Valley Pig Unit", species: "Pig", district: "Pune", status: "under-investigation", severity: "high", reported: "2025-11-20" },
  { id: "AI-2025-014", farm: "Sunrise Layer Farm", species: "Poultry", district: "Nashik", status: "sample-collected", severity: "medium", reported: "2025-11-18" },
  { id: "COCC-2025-031", farm: "Happy Broilers", species: "Poultry", district: "Satara", status: "treatment-started", severity: "low", reported: "2025-11-17" },
];

const visitScheduleToday = [
  { farm: "Green Valley Pig Unit", time: "10:30 AM", purpose: "ASF clinical exam & sample collection", priority: "high" },
  { farm: "Sunrise Layer Farm", time: "01:00 PM", purpose: "Avian influenza response drill", priority: "medium" },
  { farm: "Sai Poultry Farm", time: "04:15 PM", purpose: "Routine biosecurity audit", priority: "low" },
];

const outbreakTrendData = [
  { month: "Jul", pig: 2, poultry: 1 },
  { month: "Aug", pig: 1, poultry: 3 },
  { month: "Sep", pig: 3, poultry: 2 },
  { month: "Oct", pig: 4, poultry: 3 },
  { month: "Nov", pig: 2, poultry: 4 },
];

const checklistStats = [
  { label: "Biosecurity audits", value: 32, total: 40, color: "#10b981" },
  { label: "Vaccination records", value: 28, total: 35, color: "#3b82f6" },
  { label: "Digital logs usage", value: 21, total: 35, color: "#f59e0b" },
];

const trainingModules = [
  { id: "TRN-ASF", title: "Field management of ASF", duration: "35 min", status: "in-progress", tag: "Pig" },
  { id: "TRN-AI", title: "Rapid response to Avian Influenza", duration: "25 min", status: "pending", tag: "Poultry" },
  { id: "TRN-BIO", title: "Scoring farm-level biosecurity", duration: "18 min", status: "completed", tag: "General" },
];

export default function VetDashboardPage() {
  const { user, loading } = useSupabaseUser();
  const [activeTab, setActiveTab] = useState<"overview" | "outbreaks" | "visits" | "training" | "history">("overview");

  // Only vets allowed logic
  const isVet = !!user && (user.role === "vet" || user.email === "vet@farmseva.in");

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isVet) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <Icon icon="mdi:shield-lock" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Access Restricted</h2>
          <p className="text-neutral-500">This console is exclusively for registered Veterinary Officers.</p>
          <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-neutral-900 text-white rounded-xl font-medium text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "mdi:view-dashboard" },
    { id: "outbreaks", label: "Outbreaks", icon: "mdi:biohazard" },
    { id: "visits", label: "Visits", icon: "mdi:map-marker-path" },
    { id: "training", label: "Training", icon: "mdi:school-outline" },
    { id: "history", label: "History", icon: "mdi:history" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-16">
        
        {/* === LEFT SIDEBAR === */}
        <aside className="w-full md:w-72 bg-white md:bg-transparent z-40 border-b md:border-b-0 md:border-r border-neutral-200 sticky top-16 md:h-[calc(100vh-64px)] overflow-x-auto md:overflow-y-auto no-scrollbar md:pr-4 py-4 md:py-8 flex-shrink-0">
          <div className="px-4 mb-8">
             <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                    {user.displayName?.[0] || "V"}
                </div>
                <div>
                    <h2 className="text-sm font-bold text-neutral-900">Dr. {user.displayName || "Vet Officer"}</h2>
                    <p className="text-xs text-neutral-500">District Veterinary Officer</p>
                </div>
             </div>
          </div>

          <div className="flex md:flex-col gap-2 px-4 md:px-0 min-w-max md:min-w-0">
            {tabs.map((tab) => {
               const isActive = activeTab === tab.id;
               return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1" 
                      : "bg-white text-neutral-600 hover:bg-white hover:text-indigo-700 hover:shadow-md border border-transparent hover:border-indigo-50"
                    }
                  `}
                >
                  <Icon 
                    icon={tab.icon} 
                    className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-neutral-400 group-hover:text-indigo-600'}`} 
                  />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
               )
            })}
          </div>

          {/* Quick Status Box */}
          <div className="hidden md:block mt-auto px-4 pt-8">
             <div className="bg-gradient-to-br from-neutral-800 to-black rounded-2xl p-5 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">System Status</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <p className="text-sm font-medium">All systems operational. No critical alerts in your sector.</p>
             </div>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 overflow-y-auto">
          
          <div className="mb-8">
             <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                {tabs.find(t => t.id === activeTab)?.label}
                <span className="text-sm font-normal text-neutral-500 ml-2 border-l border-neutral-300 pl-3">Field Console</span>
             </h1>
          </div>

          {/* --------- TAB: OVERVIEW --------- */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <Icon icon="mdi:alert-octagram" className="w-6 h-6" />
                    </div>
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Critical</span>
                  </div>
                  <div className="text-3xl font-black text-neutral-800 mb-1">{openCases.length}</div>
                  <p className="text-xs font-medium text-neutral-500">Active Investigations</p>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <Icon icon="mdi:clipboard-list" className="w-6 h-6" />
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Today</span>
                  </div>
                  <div className="text-3xl font-black text-neutral-800 mb-1">{visitScheduleToday.length}</div>
                  <p className="text-xs font-medium text-neutral-500">Scheduled Visits</p>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Icon icon="mdi:shield-check" className="w-6 h-6" />
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Compliance</span>
                  </div>
                  <div className="text-3xl font-black text-neutral-800 mb-1">80%</div>
                  <p className="text-xs font-medium text-neutral-500">Farms Passed Audit</p>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                      <Icon icon="mdi:school" className="w-6 h-6" />
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Learning</span>
                  </div>
                  <div className="text-3xl font-black text-neutral-800 mb-1">1<span className="text-lg text-neutral-400 font-medium">/3</span></div>
                  <p className="text-xs font-medium text-neutral-500">Modules Completed</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Main Chart */}
                 <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm ring-1 ring-neutral-100 h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <Icon icon="mdi:chart-line-variant" className="text-neutral-400"/>
                            <h3 className="font-bold text-neutral-800">Monthly Outbreak Trends</h3>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={outbreakTrendData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}}/>
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}/>
                                    <Line type="monotone" dataKey="pig" name="Pig Cases" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 0, fill: '#f97316'}} activeDot={{r: 6}} />
                                    <Line type="monotone" dataKey="poultry" name="Poultry Cases" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 0, fill: '#3b82f6'}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                 </div>

                 {/* Side Stats */}
                 <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                        <h3 className="font-bold text-neutral-800 mb-6">Audit Progress</h3>
                        <div className="space-y-5">
                            {checklistStats.map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-semibold text-neutral-500 mb-1.5">
                                        <span>{stat.label}</span>
                                        <span>{stat.value}/{stat.total}</span>
                                    </div>
                                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(stat.value/stat.total)*100}%`, backgroundColor: stat.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                    <div className="bg-neutral-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <Icon icon="mdi:format-quote-close" className="absolute top-4 right-4 text-white/10 w-12 h-12"/>
                        <p className="text-sm font-medium leading-relaxed italic relative z-10">"Early detection is the key to preventing mass culling. Ensure all Red Zone protocols are strictly followed."</p>
                    </div>
                 </div>
              </div>

              {/* Requests List Component */}
              <div className="pt-4">
                 <h3 className="text-lg font-bold text-neutral-800 mb-4 px-1">Recent Farmer Requests</h3>
                 <VetRequestsList vetId={user.id} />
              </div>
            </motion.div>
          )}

          {/* --------- TAB: OUTBREAKS --------- */}
          {activeTab === "outbreaks" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
               <Card className="border-none shadow-sm ring-1 ring-neutral-100 overflow-hidden p-0">
                  <div className="p-6 border-b border-neutral-100 bg-red-50/30 flex items-center justify-between">
                     <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600"><Icon icon="mdi:biohazard" /></div>
                        Active Investigations
                     </h3>
                     <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 animate-pulse">Live Updates</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-white text-neutral-400 font-semibold border-b border-neutral-100">
                           <tr>
                              <th className="px-6 py-4">Case ID</th>
                              <th className="px-6 py-4">Farm Details</th>
                              <th className="px-6 py-4">Species</th>
                              <th className="px-6 py-4">District</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Reported</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                           {openCases.map((c) => (
                              <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                                 <td className="px-6 py-4 font-mono text-neutral-500 text-xs font-medium">{c.id}</td>
                                 <td className="px-6 py-4 font-bold text-neutral-800">{c.farm}</td>
                                 <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${c.species === 'Pig' ? 'bg-pink-50 text-pink-700 border-pink-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                       <Icon icon={c.species === 'Pig' ? 'mdi:pig' : 'mdi:bird'} className="w-3 h-3"/> {c.species}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-neutral-600">{c.district}</td>
                                 <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                       c.severity === 'high' ? 'bg-red-50 text-red-700 border-red-100' : 
                                       c.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                                       'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                       {c.status.replace('-', ' ')}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-neutral-500 text-xs">{c.reported}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </Card>
            </motion.div>
          )}

          {/* --------- TAB: VISITS --------- */}
          {activeTab === "visits" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
               <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                  <div className="flex items-center gap-2 mb-6">
                     <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Icon icon="mdi:calendar-check" className="w-5 h-5"/></div>
                     <h2 className="text-lg font-bold text-neutral-800">Today's Schedule</h2>
                  </div>
                  
                  <div className="space-y-4">
                     {visitScheduleToday.map((v, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:border-indigo-100 transition-all relative overflow-hidden group">
                           <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${v.priority === 'high' ? 'bg-red-500' : v.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                           <div className="flex flex-col justify-center min-w-[100px]">
                              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Time</span>
                              <span className="text-xl font-black text-neutral-800">{v.time}</span>
                           </div>
                           <div className="flex-1">
                              <h3 className="font-bold text-lg text-neutral-900 mb-1">{v.farm}</h3>
                              <p className="text-sm text-neutral-600 flex items-center gap-1.5">
                                 <Icon icon="mdi:clipboard-text-outline" className="text-neutral-400"/> {v.purpose}
                              </p>
                           </div>
                           <div className="flex items-center">
                              <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                 v.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                 v.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                 {v.priority} Priority
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
            </motion.div>
          )}

          {/* --------- TAB: TRAINING --------- */}
          {activeTab === "training" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainingModules.map((m) => (
                     <div key={m.id} className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all group flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${m.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                              <Icon icon={m.status === 'completed' ? "mdi:check-bold" : "mdi:play"} className="w-6 h-6"/>
                           </div>
                           <span className="text-[10px] font-bold uppercase bg-neutral-100 text-neutral-500 px-2 py-1 rounded">{m.tag}</span>
                        </div>
                        <h3 className="font-bold text-neutral-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors">{m.title}</h3>
                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-neutral-100">
                           <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1"><Icon icon="mdi:clock-outline"/> {m.duration}</span>
                           <span className={`text-xs font-bold ${m.status === 'completed' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                              {m.status === 'completed' ? 'Review' : 'Resume'}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
          )}

          {/* --------- TAB: HISTORY --------- */}
          {activeTab === "history" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
               <VetHistoryList vetId={user.id} />
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}