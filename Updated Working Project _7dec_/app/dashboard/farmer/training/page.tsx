"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

// --- Mock Data Types ---
type TrainingModule = {
  id: string;
  title: string;
  description: string;
  type: "video" | "pdf" | "quiz";
  category: "pig" | "poultry" | "general";
  duration: string;
  status: "locked" | "start" | "in-progress" | "completed";
  progress: number; // 0 to 100
};

type Recommendation = {
  id: string;
  category: "pig" | "poultry" | "biosecurity" | "general";
  title: string;
  content: string;
  icon: string;
};

export default function FarmerTrainingPage() {
  const { user, loading } = useSupabaseUser();
  const [activeFilter, setActiveFilter] = useState<"all" | "pig" | "poultry">("all");

  // --- Mock Data: Training Modules ---
  const modules: TrainingModule[] = [
    {
      id: "M101",
      title: "Biosecurity Basics: The 3-Zone Model",
      description: "Learn how to set up Red, Yellow, and Green zones to stop disease entry.",
      type: "video",
      category: "general",
      duration: "15 min",
      status: "completed",
      progress: 100,
    },
    {
      id: "M102",
      title: "Recognizing ASF Symptoms Early",
      description: "Critical visual guide to spotting African Swine Fever before it spreads.",
      type: "video",
      category: "pig",
      duration: "10 min",
      status: "in-progress",
      progress: 45,
    },
    {
      id: "M103",
      title: "Poultry Heat Stress Management",
      description: "PDF guide on ventilation and water supplements during summer.",
      type: "pdf",
      category: "poultry",
      duration: "5 pages",
      status: "start",
      progress: 0,
    },
    {
      id: "M104",
      title: "Piglet Nutrition & Weaning",
      description: "Best practices for feeding piglets to maximize growth rates.",
      type: "video",
      category: "pig",
      duration: "20 min",
      status: "locked",
      progress: 0,
    },
    {
      id: "M105",
      title: "Safe Disposal of Dead Birds",
      description: "Protocols for deep burial and incineration to prevent contamination.",
      type: "quiz",
      category: "poultry",
      duration: "5 min",
      status: "start",
      progress: 0,
    },
  ];

  // --- Mock Data: General Recommendations ---
  const recommendations: Recommendation[] = [
    {
      id: "R1",
      category: "biosecurity",
      title: "Footbaths are Mandatory",
      content: "Ensure footbaths with fresh disinfectant (changed daily) are placed at the entrance of every shed.",
      icon: "mdi:shoe-print",
    },
    {
      id: "R2",
      category: "pig",
      title: "Isolate New Stock",
      content: "Quarantine any new pigs for at least 30 days in a separate shed before mixing them with your main herd.",
      icon: "mdi:pig-variant-outline",
    },
    {
      id: "R3",
      category: "poultry",
      title: "Check Water Lines",
      content: "Flush water lines weekly to remove biofilm where bacteria like E. coli and Salmonella hide.",
      icon: "mdi:water-pump",
    },
    {
      id: "R4",
      category: "general",
      title: "Visitor Logbook",
      content: "Maintain a strict log of every person entering the farm. Limit outside vehicles to the perimeter only.",
      icon: "mdi:notebook-edit-outline",
    },
  ];

  // --- Filter Logic ---
  const filteredModules = modules.filter((m) => 
    activeFilter === "all" ? true : m.category === activeFilter || m.category === "general"
  );

  const filteredRecs = recommendations.filter((r) => 
    activeFilter === "all" ? true : r.category === activeFilter || r.category === "biosecurity" || r.category === "general"
  );

  // --- Helper to get status color ---
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'locked': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-32">
        
        {/* === LEFT SIDEBAR === */}
        <aside className="w-full md:w-80 bg-white md:bg-transparent z-40 border-b md:border-b-0 md:border-r border-neutral-200 sticky top-16 md:h-[calc(100vh-64px)] overflow-y-auto no-scrollbar p-6 flex-shrink-0">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                        <Icon icon="mdi:school-outline" className="w-6 h-6"/>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-800">Knowledge Hub</h1>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed">Master modern farming techniques with our expert-curated modules.</p>
            </div>

            <div className="space-y-8">
                {/* Filters */}
                <div>
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">Categories</label>
                    <div className="space-y-2">
                        {[
                            { id: 'all', label: 'All Courses', icon: 'mdi:apps' },
                            { id: 'pig', label: 'Pig Farming', icon: 'mdi:pig' },
                            { id: 'poultry', label: 'Poultry Farming', icon: 'mdi:bird' }
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveFilter(cat.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    activeFilter === cat.id 
                                    ? 'bg-white border-2 border-indigo-500 text-indigo-700 shadow-md' 
                                    : 'bg-white border border-transparent text-neutral-600 hover:bg-neutral-100'
                                }`}
                            >
                                <Icon icon={cat.icon} className={`w-5 h-5 ${activeFilter === cat.id ? 'text-indigo-600' : 'text-neutral-400'}`}/>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Offline Pack */}
                <div className="p-5 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-start gap-3 mb-3">
                        <Icon icon="mdi:wifi-off" className="w-6 h-6 opacity-80"/>
                        <div>
                            <h4 className="font-bold text-sm">Poor Internet?</h4>
                            <p className="text-xs opacity-80 mt-1">Download the complete manual for offline reading.</p>
                        </div>
                    </div>
                    <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <Icon icon="mdi:download" className="w-4 h-4"/> Download PDF (12MB)
                    </button>
                </div>
            </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <Icon icon="mdi:check-circle-outline" className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Completed</p>
                        <p className="text-2xl font-black text-neutral-800">1/5</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Icon icon="mdi:clock-time-eight-outline" className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Learning Time</p>
                        <p className="text-2xl font-black text-neutral-800">2.5h</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Icon icon="mdi:certificate-outline" className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Certificates</p>
                        <p className="text-2xl font-black text-neutral-800">1</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- MODULES LIST --- */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-neutral-800">Training Modules</h2>
                        <span className="text-sm font-medium text-neutral-500">{filteredModules.length} Available</span>
                    </div>

                    <div className="space-y-4">
                        {filteredModules.map((module, idx) => (
                            <motion.div 
                                key={module.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`group relative bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${module.status === 'locked' ? 'border-neutral-100 bg-neutral-50/50' : 'border-neutral-200'}`}
                            >
                                <div className="flex flex-col sm:flex-row gap-5">
                                    {/* Thumbnail Icon */}
                                    <div className={`w-full sm:w-20 h-20 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                                        module.status === 'locked' ? 'bg-neutral-200 text-neutral-400' : 
                                        module.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        'bg-indigo-50 text-indigo-600'
                                    }`}>
                                        <Icon 
                                            icon={module.type === 'video' ? 'mdi:play-circle' : module.type === 'pdf' ? 'mdi:file-pdf-box' : 'mdi:format-list-checks'} 
                                            className="w-8 h-8"
                                        />
                                        <span className="text-[10px] font-bold uppercase mt-1 tracking-wide">{module.type}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h3 className={`text-lg font-bold ${module.status === 'locked' ? 'text-neutral-500' : 'text-neutral-800'} group-hover:text-indigo-600 transition-colors`}>
                                                    {module.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                                        module.category === 'pig' ? 'bg-pink-100 text-pink-700' :
                                                        module.category === 'poultry' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {module.category}
                                                    </span>
                                                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                        <Icon icon="mdi:clock-outline" className="w-3 h-3"/> {module.duration}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(module.status)}`}>
                                                {module.status === 'in-progress' ? 'In Progress' : module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                                            </div>
                                        </div>

                                        <p className="text-sm text-neutral-600 line-clamp-2 mb-4">{module.description}</p>

                                        {/* Progress Bar & Action */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${module.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                                    style={{ width: `${module.progress}%` }}
                                                ></div>
                                            </div>
                                            <button 
                                                disabled={module.status === 'locked'}
                                                className={`text-sm font-bold flex items-center gap-1 ${
                                                    module.status === 'locked' ? 'text-neutral-400 cursor-not-allowed' : 
                                                    module.status === 'completed' ? 'text-green-600' :
                                                    'text-indigo-600 hover:underline'
                                                }`}
                                            >
                                                {module.status === 'locked' ? <Icon icon="mdi:lock"/> : module.status === 'completed' ? 'Review' : 'Continue'} 
                                                {module.status !== 'locked' && <Icon icon="mdi:arrow-right" className="w-4 h-4"/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT COLUMN: TIPS --- */}
                <div className="xl:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                        <Icon icon="mdi:lightbulb-on" className="text-yellow-500"/> Smart Tips
                    </h2>

                    <div className="space-y-4">
                        {filteredRecs.map((rec, idx) => (
                            <motion.div 
                                key={rec.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm hover:border-yellow-200 hover:bg-yellow-50/30 transition-colors"
                            >
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 shrink-0">
                                        <Icon icon={rec.icon} className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-800 text-sm mb-1">{rec.title}</h4>
                                        <p className="text-xs text-neutral-600 leading-relaxed">{rec.content}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl p-6 text-white relative overflow-hidden">
                            <Icon icon="mdi:format-quote-close" className="absolute top-4 right-4 text-white/10 w-12 h-12"/>
                            <p className="text-sm font-medium italic relative z-10">"Biosecurity is not a cost, it's an investment in your farm's future."</p>
                            <p className="text-xs text-neutral-400 mt-2 font-bold uppercase tracking-wider">- Dr. A. Sharma, Vet Expert</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}