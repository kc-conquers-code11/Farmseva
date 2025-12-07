"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
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
  category: "pig" | "poultry" | "biosecurity";
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

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-light text-neutral-800">
                Farmer Training <span className="font-semibold text-green-600">Hub</span>
              </h1>
              <p className="text-neutral-600 text-sm mt-1">
                Enhance your farming skills with expert modules and best practices.
              </p>
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
              {(["all", "pig", "poultry"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeFilter === filter
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Modules Completed</p>
                  <h3 className="text-2xl font-bold text-gray-800">1/5</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <Icon icon="mdi:school-outline" className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Learning Hours</p>
                  <h3 className="text-2xl font-bold text-gray-800">2.5 Hrs</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                  <Icon icon="mdi:clock-outline" className="w-6 h-6" />
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Certificates</p>
                  <h3 className="text-2xl font-bold text-gray-800">1 Earned</h3>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                  <Icon icon="mdi:certificate-outline" className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Training Modules */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:youtube-tv" className="text-red-500" />
                Training Modules
              </h2>
              
              <div className="space-y-4">
                {filteredModules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4"
                  >
                    {/* Thumbnail / Icon */}
                    <div className={`w-full sm:w-32 h-24 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                      module.status === 'locked' ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-green-600'
                    }`}>
                      <Icon 
                        icon={module.type === 'video' ? 'mdi:play-circle' : module.type === 'pdf' ? 'mdi:file-pdf-box' : 'mdi:format-list-checks'} 
                        className="w-10 h-10"
                      />
                      <span className="text-[10px] font-bold mt-1 uppercase">{module.type}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                            {module.title}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border ${
                            module.category === 'pig' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                            module.category === 'poultry' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {module.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Icon icon="mdi:clock-time-four-outline"/> {module.duration}</span>
                          {module.status === 'completed' && <span className="flex items-center gap-1 text-green-600"><Icon icon="mdi:check-circle"/> Completed</span>}
                        </div>
                        
                        <button 
                          disabled={module.status === 'locked'}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            module.status === 'locked' 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : module.status === 'completed'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {module.status === 'locked' ? 'Locked' : module.status === 'completed' ? 'Review' : 'Start Now'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredModules.length === 0 && (
                   <div className="text-center py-10 text-gray-500">
                      No modules found for this category.
                   </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Recommendations */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:lightbulb-on" className="text-yellow-500" />
                Smart Recommendations
              </h2>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-100 shadow-sm">
                <div className="flex gap-3 mb-3">
                  <Icon icon="mdi:information-outline" className="w-6 h-6 text-orange-600 shrink-0"/>
                  <h3 className="font-bold text-orange-900 text-sm">Did you know?</h3>
                </div>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Pigs are highly susceptible to heat stress. Sprinklers should be turned on when the temperature crosses 28°C to maintain feed intake.
                </p>
              </div>

              <div className="space-y-4">
                {filteredRecs.map((rec) => (
                  <Card key={rec.id} className="hover:border-green-200 transition-colors cursor-default">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 text-green-600">
                        <Icon icon={rec.icon} className="w-5 h-5"/>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">{rec.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{rec.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Downloadable Resources Box */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm text-center">
                 <Icon icon="mdi:file-download-outline" className="w-10 h-10 text-blue-600 mx-auto mb-2"/>
                 <h3 className="font-bold text-gray-800 text-sm mb-1">Offline Guides</h3>
                 <p className="text-xs text-gray-600 mb-3">Download the complete manual for offline reading.</p>
                 <button className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition">
                   Download PDF Pack (12MB)
                 </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}