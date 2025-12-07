"use client";

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { 
  Search as SearchIcon, 
  Filter as FilterIcon, 
  Globe, 
  PiggyBank, 
  Bird, 
  Bookmark, 
  BookmarkCheck, 
  Building, 
  ChevronRight, 
  ArrowLeft, 
  ExternalLink, 
  IndianRupee, 
  Users, 
  FileCheck, 
  CheckCircle 
} from "lucide-react";

// --- Types ---
type SchemeData = {
  "Govt Scheme Name": string;
  "Scheme Category": string;
  "Scheme Description": string;
  "Website Link": string;
  "Ministry / Department Name"?: string;
  "Benefits Provided"?: string;
  "Eligibility Requirements"?: string;
  "How To Apply"?: string;
  "Required Documents"?: string;
  [key: string]: any;
};

type AppliedScheme = {
  schemeName: string;
  status: 'applied' | 'not-applied' | 'pending';
  appliedAt: string;
  updatedAt: string;
};

const SHEET_URL = "https://docs.google.com/spreadsheets/d/11oh6nVyIGXoy9oTfA_UWgAD3JxCvVeO0K4n9ncqVeyw/export?format=csv";

export default function GovtSchemesDashboard() {
  const [schemes, setSchemes] = useState<SchemeData[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<SchemeData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "saved" | "applied">("all");

  // View State
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedScheme, setSelectedScheme] = useState<SchemeData | null>(null);

  // User Data
  const [savedSchemes, setSavedSchemes] = useState<string[]>([]);
  const [appliedSchemes, setAppliedSchemes] = useState<AppliedScheme[]>([]);

  // 1. Fetch Data
  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (result) => {
        const data = result.data.slice(2) as SchemeData[]; 
        setSchemes(data);
        setFilteredSchemes(data);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error fetching schemes:", err);
        setLoading(false);
      }
    });

    const savedApplied = localStorage.getItem('appliedSchemes');
    if (savedApplied) setAppliedSchemes(JSON.parse(savedApplied));
    
    const localSaved = localStorage.getItem('savedSchemes');
    if (localSaved) setSavedSchemes(JSON.parse(localSaved));
  }, []);

  // 2. Persist Data
  useEffect(() => {
    localStorage.setItem('appliedSchemes', JSON.stringify(appliedSchemes));
  }, [appliedSchemes]);

  useEffect(() => {
    localStorage.setItem('savedSchemes', JSON.stringify(savedSchemes));
  }, [savedSchemes]);

  // 3. Filtering Logic
  useEffect(() => {
    let result = schemes;

    // Animal Filter
    if (selectedFilter !== "All") {
      result = result.filter(s => {
        const text = (s["Govt Scheme Name"] + s["Scheme Description"]).toLowerCase();
        if (selectedFilter === "Pig") return text.includes("pig") || text.includes("swine");
        if (selectedFilter === "Poultry") return text.includes("poultry") || text.includes("chicken") || text.includes("hen");
        return true;
      });
    }

    // Search Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(s => 
        s["Govt Scheme Name"]?.toLowerCase().includes(lowerSearch) ||
        s["Ministry / Department Name"]?.toLowerCase().includes(lowerSearch)
      );
    }

    // Tab Filter
    if (activeTab === "saved") {
      result = result.filter(s => savedSchemes.includes(s["Govt Scheme Name"]));
    } else if (activeTab === "applied") {
      const appliedNames = appliedSchemes.map(a => a.schemeName);
      result = result.filter(s => appliedNames.includes(s["Govt Scheme Name"]));
    }

    setFilteredSchemes(result);
  }, [schemes, searchTerm, selectedFilter, activeTab, savedSchemes, appliedSchemes]);

  // Actions
  const handleSave = (name: string) => {
    setSavedSchemes(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleApply = (name: string, status: 'applied' | 'not-applied' | 'pending') => {
    setAppliedSchemes(prev => {
      const existing = prev.find(a => a.schemeName === name);
      if (existing) {
        return prev.map(a => a.schemeName === name ? { ...a, status, updatedAt: new Date().toISOString() } : a);
      }
      return [...prev, { schemeName: name, status, appliedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
  };

  const getStatus = (name: string) => appliedSchemes.find(a => a.schemeName === name)?.status;

  // --- RENDERING ---

  if (loading) {
    return <div className="p-10 text-center text-neutral-500">Loading government schemes...</div>;
  }

  // View: Detail
  if (view === "detail" && selectedScheme) {
    return (
      <SchemeDetailPage 
        scheme={selectedScheme}
        onBack={() => setView("list")}
        isSaved={savedSchemes.includes(selectedScheme["Govt Scheme Name"])}
        onSaveToggle={() => handleSave(selectedScheme["Govt Scheme Name"])}
        appliedStatus={getStatus(selectedScheme["Govt Scheme Name"])}
        onApplyStatusChange={(status: any) => handleApply(selectedScheme["Govt Scheme Name"], status)}
      />
    );
  }

  // View: List (Default)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
      {/* Stats & Tools */}
      <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm p-2">
        <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex-1 relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search schemes..." 
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none" 
                />
            </div>
            <div className="lg:w-64 relative border-l border-neutral-200">
                <FilterIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <select 
                    value={selectedFilter} 
                    onChange={(e) => setSelectedFilter(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 appearance-none cursor-pointer outline-none"
                >
                    <option value="All">All Schemes</option>
                    <option value="Pig">Pig Farming</option>
                    <option value="Poultry">Poultry Farming</option>
                </select>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-neutral-200 pb-1">
        {[{id:'all', label:'All'}, {id:'saved', label:`Saved (${savedSchemes.length})`}, {id:'applied', label:'Applied'}].map((t) => (
             <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id as any)} 
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 ${activeTab === t.id ? "border-black text-black" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
             >
                {t.label}
             </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme, i) => (
            <SchemeCard 
                key={i} 
                scheme={scheme} 
                isSaved={savedSchemes.includes(scheme["Govt Scheme Name"])}
                onToggleSave={() => handleSave(scheme["Govt Scheme Name"])}
                status={getStatus(scheme["Govt Scheme Name"])}
                onClick={() => { setSelectedScheme(scheme); setView("detail"); }}
            />
        ))}
        {filteredSchemes.length === 0 && (
            <div className="col-span-full text-center py-20 text-neutral-400">No schemes found matching your criteria.</div>
        )}
      </div>
    </motion.div>
  );
}

// --- SUB COMPONENTS (Defined outside to keep main clean) ---

function SchemeCard({ scheme, isSaved, onToggleSave, status, onClick }: any) {
    const isPig = scheme["Govt Scheme Name"].toLowerCase().includes('pig');
    const isPoultry = scheme["Govt Scheme Name"].toLowerCase().includes('poultry');
    
    return (
        <div className="bg-white rounded-2xl border border-neutral-200 hover:shadow-lg transition-all flex flex-col p-6 cursor-pointer group" onClick={onClick}>
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 ${isPig ? 'bg-pink-100 text-pink-700' : isPoultry ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {isPig ? <PiggyBank size={16}/> : isPoultry ? <Bird size={16}/> : <Globe size={16}/>}
                    {isPig ? 'Pig' : isPoultry ? 'Poultry' : 'General'}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onToggleSave(); }}>
                    {isSaved ? <BookmarkCheck size={20} className="text-black"/> : <Bookmark size={20} className="text-neutral-400 hover:text-black"/>}
                </button>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 line-clamp-2">{scheme["Govt Scheme Name"]}</h3>
            <p className="text-sm text-neutral-600 line-clamp-3 mb-4 flex-grow">{scheme["Scheme Description"]}</p>
            
            <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-neutral-900">View Details</span>
                {status === 'applied' && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Applied</span>}
                <ChevronRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition-transform"/>
            </div>
        </div>
    );
}

function SchemeDetailPage({ scheme, onBack, isSaved, onSaveToggle, appliedStatus, onApplyStatusChange }: any) {
  const getAnimalType = () => {
    const name = scheme["Govt Scheme Name"]?.toLowerCase() || "";
    if (name.includes("pig")) return { icon: <PiggyBank size={32} />, label: "Pig Farming Scheme" };
    if (name.includes("poultry")) return { icon: <Bird size={32} />, label: "Poultry Farming Scheme" };
    return { icon: <Globe size={32} />, label: "General Scheme" };
  };

  const parseBenefits = (benefitsText: string) => {
    if (!benefitsText) return [];
    const items = benefitsText.split(/(?:\d+\.\s)/).filter(item => item.trim());
    return items.length <= 1 ? benefitsText.split(/\.\s+/).filter(item => item.trim()) : items;
  };

  const animal = getAnimalType();
  const ministry = scheme["Ministry / Department Name"] || "Government of India";
  const benefitsList = parseBenefits(scheme["Benefits Provided"]);

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden animate-fadeIn">
      {/* Detail Header */}
      <div className="border-b border-neutral-200 p-6 flex justify-between items-center bg-white sticky top-0 z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-600 hover:text-black font-medium transition-colors">
          <ArrowLeft size={20} /> Back to List
        </button>
        <div className="flex gap-3">
             <button onClick={onSaveToggle} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${isSaved ? "bg-black text-white border-black" : "bg-white border-neutral-200 hover:bg-neutral-50"}`}>
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />} {isSaved ? "Saved" : "Save"}
             </button>
             <a href={scheme["Website Link"]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                Apply Now <ExternalLink size={18} />
             </a>
        </div>
      </div>

      <div className="p-8 lg:p-12">
         <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{scheme["Govt Scheme Name"]}</h1>
            <div className="flex items-center gap-2 text-neutral-500 mb-8">
                <Building size={16} /> {ministry}
            </div>

            <p className="text-lg text-neutral-700 leading-relaxed mb-10 border-l-4 border-green-500 pl-4 bg-green-50/50 p-4 rounded-r-lg">
                {scheme["Scheme Description"]}
            </p>

            <div className="grid md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-10">
                    <section>
                        <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2"><IndianRupee className="text-green-600"/> Benefits</h2>
                        <ul className="space-y-3">
                            {benefitsList.map((b: string, i: number) => (
                                <li key={i} className="flex gap-3 text-neutral-700 leading-relaxed">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2.5"></span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2"><Users className="text-blue-600"/> Eligibility</h2>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-neutral-700 leading-relaxed whitespace-pre-line">
                            {scheme["Eligibility Requirements"]}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                        <h3 className="font-bold text-neutral-900 mb-4">Application Status</h3>
                        <div className="space-y-2">
                             {['applied', 'pending', 'not-applied'].map((status) => (
                                <button 
                                    key={status}
                                    onClick={() => onApplyStatusChange(status as any)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${appliedStatus === status ? 'bg-white border-black shadow-sm' : 'border-transparent hover:bg-neutral-100'}`}
                                >
                                    <span className="capitalize text-sm font-medium text-neutral-700">{status.replace('-', ' ')}</span>
                                    {appliedStatus === status && <CheckCircle size={16} className="text-green-600"/>}
                                </button>
                             ))}
                        </div>
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                        <h3 className="font-bold text-neutral-900 mb-4">Required Documents</h3>
                        <div className="text-sm text-neutral-600 space-y-2">
                            {scheme["Required Documents"]?.split(',').map((doc:string, i:number) => (
                                <div key={i} className="flex items-start gap-2">
                                    <FileCheck size={16} className="text-neutral-400 mt-0.5 flex-shrink-0"/>
                                    <span>{doc.trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}