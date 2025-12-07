"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "@/app/components/Navbar";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

type FormState = {
  // --- Section 1: Demographics ---
  farmName: string;
  species: "pig" | "poultry" | "mixed";
  herdSize: string;
  state: string;
  district: string;

  // --- Section 2: Housing & Biosecurity ---
  housing: "open" | "semi" | "closed";
  visitors: "none" | "log" | "log_footbath_ppe";
  deadDisposal: "open_pit" | "covered_pit" | "incineration";
  wildBirdContact: "high" | "medium" | "low";
  
  // NEW FROM UPLOADED FILES:
  equipmentHygiene: "none" | "occasional" | "strict";
  fencing: "none" | "partial" | "secure";

  // --- Section 3: Operations & Environment ---
  cleaningFreq: "weekly" | "twice_week" | "daily";
  
  // NEW FROM UPLOADED FILES:
  ventilation: "poor" | "moderate" | "good";
  tempControl: "no" | "yes";
  feedStorage: "open" | "sealed_dry";
  waterSource: "open_pond" | "borewell" | "municipal";
  recordKeeping: "none" | "basic" | "detailed";

  // --- Section 4: Health ---
  vaccination: "none" | "occasional" | "regular";
  recentMortality: "no" | "yes";
  mortalityNotes: string;
};

const initialForm: FormState = {
  farmName: "",
  species: "poultry",
  herdSize: "",
  state: "",
  district: "",

  housing: "semi",
  visitors: "log",
  deadDisposal: "covered_pit",
  wildBirdContact: "medium",
  equipmentHygiene: "occasional",
  fencing: "partial",

  cleaningFreq: "twice_week",
  ventilation: "moderate",
  tempControl: "no",
  feedStorage: "open",
  waterSource: "borewell",
  recordKeeping: "basic",

  vaccination: "occasional",
  recentMortality: "no",
  mortalityNotes: "",
};

export default function FarmerRiskFormPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();

  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("demographics");

  const updateField =
    <K extends keyof FormState>(key: K) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  // Scroll to section handler
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-green-600 mb-4" />
          <p className="text-neutral-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (!user) {
        setErrorMsg("Session expired. Please login again.");
        setSubmitting(false);
        return;
      }

      // 1) Upsert farm_profiles basic info
      const { data: profile, error: profileError } = await supabase
        .from("farm_profiles")
        .upsert(
          {
            farmer_id: user.id,
            farm_name: form.farmName || null,
            species: form.species,
            herd_size: form.herdSize ? Number(form.herdSize) : null,
            state: form.state || null,
            district: form.district || null,
          },
          { onConflict: "farmer_id" }
        )
        .select()
        .single();

      if (profileError) {
        console.error(profileError);
        setErrorMsg("Farm profile save failed. Please try again.");
        setSubmitting(false);
        return;
      }

      // 2) Call risk assessment API
      const res = await fetch("/api/risk/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerId: user.id,
          farmProfileId: profile?.id,
          answers: form,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErrorMsg(j.error || "Risk assessment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg("Assessment complete! Redirecting...");
      
      setTimeout(() => {
        router.push("/dashboard/farmer?tab=risk");
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const sections = [
    { id: "demographics", label: "Farm Basics", icon: "mdi:farm" },
    { id: "biosecurity", label: "Biosecurity", icon: "mdi:shield-home" },
    { id: "operations", label: "Operations", icon: "mdi:cogs" },
    { id: "health", label: "Health Status", icon: "mdi:heart-pulse" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <div className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Risk Assessment</h1>
            <p className="text-neutral-500 mt-1">Fill in the details to get an AI-powered risk score for your farm.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/farmer?tab=risk")}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-neutral-200 shadow-sm"
          >
            <Icon icon="mdi:arrow-left" /> Cancel & Exit
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* === LEFT SIDEBAR (Navigation) === */}
          <aside className="hidden lg:block w-64 sticky top-24">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeSection === section.id
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                      : "text-neutral-600 hover:bg-white hover:text-neutral-900"
                  }`}
                >
                  <Icon icon={section.icon} className="w-5 h-5" />
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                    <Icon icon="mdi:information-outline" className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>Why take this?</strong><br/>
                        Regular assessments help detect disease risks early and can improve your farm's productivity by up to 20%.
                    </p>
                </div>
            </div>
          </aside>

          {/* === MAIN FORM === */}
          <main className="flex-1 w-full">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* --- SECTION 1: DEMOGRAPHICS --- */}
              <div id="demographics" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Icon icon="mdi:farm" className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800">1. Farm Basics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">Farm Name</label>
                      <input
                        type="text"
                        value={form.farmName}
                        onChange={updateField("farmName")}
                        placeholder="e.g. Green Valley Farm"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">Species</label>
                      <div className="relative">
                        <select
                            value={form.species}
                            onChange={updateField("species")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="pig">Pig / Swine</option>
                            <option value="poultry">Poultry / Chicken</option>
                            <option value="mixed">Mixed (Pig + Poultry)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-2">Herd/Flock Size</label>
                      <input
                        type="number"
                        min={0}
                        value={form.herdSize}
                        onChange={updateField("herdSize")}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">State</label>
                        <input
                            type="text"
                            value={form.state}
                            onChange={updateField("state")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">District</label>
                        <input
                            type="text"
                            value={form.district}
                            onChange={updateField("district")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        />
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: BIOSECURITY --- */}
              <div id="biosecurity" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Icon icon="mdi:shield-home" className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800">2. Biosecurity Infrastructure</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Housing Type</label>
                      <div className="relative">
                        <select
                            value={form.housing}
                            onChange={updateField("housing")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="open">Open / Backyard (High Risk)</option>
                            <option value="semi">Semi-covered sheds</option>
                            <option value="closed">Closed / Controlled (Best)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Perimeter Fencing</label>
                      <div className="relative">
                        <select
                            value={form.fencing}
                            onChange={updateField("fencing")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="none">No fencing (Open access)</option>
                            <option value="partial">Partial / Damaged fencing</option>
                            <option value="secure">Secure perimeter (Safe)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Visitor Control</label>
                      <div className="relative">
                        <select
                            value={form.visitors}
                            onChange={updateField("visitors")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="none">Anyone can enter</option>
                            <option value="log">Logbook only</option>
                            <option value="log_footbath_ppe">Logbook + Footbath + PPE (Best)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Vehicle & Equipment</label>
                      <div className="relative">
                        <select
                            value={form.equipmentHygiene}
                            onChange={updateField("equipmentHygiene")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="none">Shared equipment, no cleaning</option>
                            <option value="occasional">Cleaned occasionally</option>
                            <option value="strict">Disinfected every entry</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Dead Animal Disposal</label>
                      <div className="relative">
                        <select
                            value={form.deadDisposal}
                            onChange={updateField("deadDisposal")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="open_pit">Throw in open (High Risk)</option>
                            <option value="covered_pit">Deep burial / Covered pit</option>
                            <option value="incineration">Incineration / Burning</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Wild Bird Contact</label>
                      <div className="relative">
                        <select
                            value={form.wildBirdContact}
                            onChange={updateField("wildBirdContact")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="high">High (Birds enter sheds)</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low (Nets installed)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECTION 3: OPERATIONS --- */}
              <div id="operations" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Icon icon="mdi:cogs" className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800">3. Operations & Environment</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Ventilation</label>
                      <div className="relative">
                        <select
                            value={form.ventilation}
                            onChange={updateField("ventilation")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="poor">Poor (Ammonia smell)</option>
                            <option value="moderate">Average</option>
                            <option value="good">Good (Fans/Cross-ventilation)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Temperature Control</label>
                      <div className="relative">
                        <select
                            value={form.tempControl}
                            onChange={updateField("tempControl")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="no">No (Natural)</option>
                            <option value="yes">Yes (Heaters/Coolers)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Feed Storage</label>
                      <div className="relative">
                        <select
                            value={form.feedStorage}
                            onChange={updateField("feedStorage")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="open">Open bags (Risk of rats)</option>
                            <option value="sealed_dry">Sealed containers / Silos</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Water Source</label>
                      <div className="relative">
                        <select
                            value={form.waterSource}
                            onChange={updateField("waterSource")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="open_pond">Open pond / Canal (Risky)</option>
                            <option value="municipal">Municipal / Tanker</option>
                            <option value="borewell">Deep Borewell (Best)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Cleaning Frequency</label>
                      <div className="relative">
                        <select
                            value={form.cleaningFreq}
                            onChange={updateField("cleaningFreq")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="weekly">Once a week or less</option>
                            <option value="twice_week">2-3 times a week</option>
                            <option value="daily">Daily cleaning</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Record Keeping</label>
                      <div className="relative">
                        <select
                            value={form.recordKeeping}
                            onChange={updateField("recordKeeping")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="none">No written records</option>
                            <option value="basic">Basic notes (Sales/Mortality)</option>
                            <option value="detailed">Detailed (Feed, Meds, Visitors)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECTION 4: HEALTH --- */}
              <div id="health" className="scroll-mt-24">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6 border-b border-neutral-100 pb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <Icon icon="mdi:heart-pulse" className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-800">4. Health Status</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Vaccination Schedule</label>
                      <div className="relative">
                        <select
                            value={form.vaccination}
                            onChange={updateField("vaccination")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="none">No regular vaccination</option>
                            <option value="occasional">Only during outbreaks</option>
                            <option value="regular">Regular (As per Vet schedule)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Sudden Deaths (Last 30 Days)</label>
                      <div className="relative">
                        <select
                            value={form.recentMortality}
                            onChange={updateField("recentMortality")}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none appearance-none cursor-pointer"
                        >
                            <option value="no">No</option>
                            <option value="yes">Yes (Immediate Alert)</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                        Observations (Symptoms, Behavior)
                      </label>
                      <textarea
                        rows={4}
                        value={form.mortalityNotes}
                        onChange={updateField("mortalityNotes")}
                        placeholder="E.g., 5 birds stopped eating, 2 pigs have skin redness, coughing..."
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              <AnimatePresence>
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
                        <Icon icon="mdi:alert-circle" className="w-5 h-5"/> {errorMsg}
                    </motion.div>
                )}
                {successMsg && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3">
                        <Icon icon="mdi:check-circle" className="w-5 h-5"/> {successMsg}
                    </motion.div>
                )}
              </AnimatePresence>

              {/* Sticky Submit Bar */}
              <div className="sticky bottom-4 z-30">
                <div className="bg-neutral-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex justify-between items-center">
                    <div className="hidden sm:block pl-2">
                        <p className="text-sm font-medium opacity-90">All fields are important for accuracy.</p>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Icon icon="mdi:loading" className="animate-spin"/> : <Icon icon="mdi:calculator"/>}
                        {submitting ? "Analyzing..." : "Calculate Risk Score"}
                    </button>
                </div>
              </div>

            </form>
          </main>
        </div>
      </div>
    </div>
  );
}