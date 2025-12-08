"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";

// Components
import {Navbar}  from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import Card from "@/app/components/Card";
import DiseaseAlertsDashboard from "./outbreaks/DiseaseAlertsDashboard";
import VetList from "./components/VetList";
import VisitorManagement from "@/app/components/VisitorManagement";
import FarmerRequestHistory from "./components/FarmerRequestHistory";
import GovtSchemesDashboard from "@/app/components/GovtSchemesDashboard"; // Importing the new component

// Hooks & Libs
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

// Lucide icons
import { 
  TrendingUp, 
  Calendar, 
  Search as SearchIcon, 
  Filter as FilterIcon 
} from "lucide-react"; 

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Types ---
type RiskAssessment = {
  id: string;
  farmer_id: string;
  farm_profile_id: string | null;
  biosecurity_score: number;
  disease_risk_score: number;
  infrastructure_score: number;
  climate_risk_score: number;
  summary: string;
  recommendations: string;
  created_at: string;
};

type FarmProfile = {
  farm_name: string;
  species: "pig" | "poultry" | "mixed";
  state: string;
  herd_size: number;
};

export default function FarmerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSupabaseUser();

  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "risk" | "weather" | "outbreak" | "schemes" |"Visitors"| "community" | "vets"
  >("overview");


  // --- State: Risk & Profile ---
  const [riskHistory, setRiskHistory] = useState<RiskAssessment[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);

  // --- State: Vet Request ---
  const [vetForm, setVetForm] = useState({
    farm_name: "",
    species: "Pig",
    district: "",
    symptoms: "",
    urgency: "medium",
  });
  const [vetSubmitting, setVetSubmitting] = useState(false);
  const [vetMsg, setVetMsg] = useState<string | null>(null);

  // --- State: Weather ---
  const [weather, setWeather] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<string>("Delhi");
  const [weatherTips, setWeatherTips] = useState<{pig: string, poultry: string} | null>(null);

  // --- Data Constants ---
  const weatherAlerts = [
    { type: "warning", title: "Heat Stress Risk (Poultry)", description: "Increase ventilation and provide cool water", icon: "mdi:weather-sunny-alert" },
    { type: "info", title: "Rainfall Expected", description: "Secure pig housing and improve drainage", icon: "mdi:weather-pouring" },
  ];

  const tips = [
    { title: "Biosecurity First", description: "Footbaths reduce disease risk significantly.", icon: "mdi:shield-check" },
    { title: "Heat Mitigation", description: "Shade nets reduce poultry heat stress.", icon: "mdi:weather-sunny" },
    { title: "Feed Efficiency", description: "Track FCR weekly for better profits.", icon: "mdi:food-drumstick" },
  ];

  const tabList = [
    { key: "overview", label: "Overview", icon: "mdi:view-dashboard" },
    { key: "analytics", label: "Analytics", icon: "mdi:chart-line" },
    { key: "risk", label: "Risk Assessment", icon: "mdi:alert-decagram" },
    { key: "weather", label: "Weather Forecast", icon: "mdi:weather-cloudy" },
    { key: "outbreak", label: "Disease Security", icon: "mdi:shield-lock" },  
    { key: "schemes", label: "Govt Schemes", icon: "mingcute:government-line" },
     { key: "visitors", label: "Visitors", icon: "mdi:account-arrow-right" },
    { key: "community", label: "Community", icon: "mdi:account-group" },
    { key: "vets", label: "FarmSeva Vets", icon: "mdi:stethoscope" },
  ];

  // --- Effects: Schemes Filtering (REMOVED) ---

  // --- Effects: Dashboard General ---
  useEffect(() => {
    // Global styles
    const styles = `
      @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
      
      /* Hide scrollbar for Chrome, Safari and Opera */
      .no-scrollbar::-webkit-scrollbar {
          display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabList.some(t => t.key === tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      setLoadingRisk(true);
      const { data: riskData } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("farmer_id", user!.id)
        .order("created_at", { ascending: false });

      if (riskData && riskData.length > 0) {
        setRiskHistory(riskData as RiskAssessment[]);
        setSelectedRisk(riskData[0] as RiskAssessment);
      } else {
        setRiskHistory([]);
        setSelectedRisk(null);
      }

      const { data: profileData } = await supabase
        .from("farm_profiles")
        .select("farm_name, species, state, herd_size")
        .eq("farmer_id", user!.id)
        .single();

      if (profileData) {
        setFarmProfile(profileData as FarmProfile);
      }

      const { data: userData } = await supabase
        .from("profiles")
        .select("location")
        .eq("id", user!.id)
        .single();

      if (userData?.location) {
        setUserLocation(userData.location);
        fetchWeather(userData.location);
      } else {
        fetchWeather("Delhi");
      }

      setLoadingRisk(false);
    }
    loadData();
  }, [user]);

  const fetchWeather = async (city: string) => {
    try {
      const res = await fetch(`/api/weather?city=${city}`);
      const data = await res.json();
      if (data.list) {
        setWeather(data);
        generateTips(data.list[0].main.temp, data.list[0].weather[0].main);
      }
    } catch (err) {
      console.error("Weather fetch failed", err);
    }
  };

  const slimForecastData = weather
    ? weather.list.slice(0, 5).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
        }),
        day: new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit" }),
        temp: Math.round(item.main.temp),
      }))
    : [];

  const generateTips = (temp: number, condition: string) => {
    let pigTip = "Conditions optimal. Maintain regular feeding.";
    let poultryTip = "Conditions optimal. Ensure clean water.";

    if (temp > 30) {
        pigTip = "⚠️ Heat Stress Risk: Pigs cannot sweat. Increase ventilation.";
        poultryTip = "⚠️ High Mortality Risk: Birds may pant. Add electrolytes.";
    } else if (temp < 15) {
        pigTip = "❄️ Cold Warning: Ensure piglets have heat lamps.";
        poultryTip = "❄️ Hypothermia Risk: Use brooders for chicks.";
    }
    
    if (condition.toLowerCase().includes('rain')) {
        pigTip += " 🌧️ Ensure drainage is clear.";
        poultryTip += " 🌧️ Check roof for leaks.";
    }

    setWeatherTips({ pig: pigTip, poultry: poultryTip });
  };

  const calculateOverallRisk = (risk: RiskAssessment) => {
    const score = Math.round(
      (risk.disease_risk_score + risk.climate_risk_score + (100 - risk.biosecurity_score)) / 3
    );
    return Math.min(100, Math.max(0, score));
  };

  const getRiskColor = (score: number) => {
    if (score > 60) return "#ef4444";
    if (score > 30) return "#f59e0b";
    return "#10b981";
  };

  const generateDynamicSummary = (overallScore: number, profile: FarmProfile) => {
    const isCritical = overallScore > 60;
    const isModerate = overallScore > 30 && overallScore <= 60;
    let text = "";
    let bgColor = "bg-green-50 border-green-100";
    let titleColor = "text-green-800";

    if (isCritical) {
      bgColor = "bg-red-50 border-red-100";
      titleColor = "text-red-800";
      text = `Critical Alert: Your ${profile.species} farm in ${profile.state} is in a HIGH RISK category (${overallScore}%).`;
    } else if (isModerate) {
      bgColor = "bg-yellow-50 border-yellow-100";
      titleColor = "text-yellow-800";
      text = `Caution: Your ${profile.species} farm shows MODERATE RISK (${overallScore}%).`;
    } else {
      text = `Excellent: Your ${profile.species} farm is currently in the SAFE ZONE (${overallScore}% risk).`;
    }
    return { text, bgColor, titleColor };
  };

  const historyChartData = useMemo(() => {
    return riskHistory.map((entry) => {
      const score = calculateOverallRisk(entry);
      return {
        date: new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        fullDate: new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        score: score,
        time: new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        id: entry.id
      };
    }).reverse();
  }, [riskHistory]);

  async function handleVetRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setVetSubmitting(true);
    setVetMsg(null);
    const { error } = await supabase.from("vet_requests").insert({
      farmer_id: user!.id,
      farm_name: vetForm.farm_name,
      species: vetForm.species,
      district: vetForm.district,
      symptoms: vetForm.symptoms,
      urgency: vetForm.urgency,
    });
    if (error) {
      setVetMsg("Request failed. Please try again.");
    } else {
      setVetMsg("Vet request submitted. District vet officer will contact you soon.");
      setVetForm({ farm_name: "", species: "Pig", district: "", symptoms: "", urgency: "medium" });
    }
    setVetSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-green-600 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Layout Container - Split Screen for Desktop */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-32">
        
        {/* === LEFT SIDEBAR VERTICAL TABS === */}
        <aside className="w-full md:w-72 bg-white md:bg-transparent z-40 border-b md:border-b-0 md:border-r border-neutral-200 sticky top-16 md:h-[calc(100vh-64px)] overflow-x-auto md:overflow-y-auto no-scrollbar md:pr-4 py-4 md:py-8 flex-shrink-0">
          <div className="flex md:flex-col gap-2 px-4 md:px-0 min-w-max md:min-w-0">
            {/* Sidebar Title (Desktop Only) */}
            <div className="hidden md:block mb-6 px-4">
               <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Menu</h2>
            </div>

            {tabList.map((tab) => {
               const isActive = activeTab === tab.key;
               return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`
                    group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/20 translate-x-1" 
                      : "bg-white text-neutral-600 hover:bg-white hover:text-green-700 hover:shadow-md hover:shadow-neutral-200/50"
                    }
                  `}
                >
                  <Icon 
                    icon={tab.icon} 
                    className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-neutral-400 group-hover:text-green-600'}`} 
                  />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  
                  {/* Active Indicator for Desktop */}
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden md:block"></div>
                  )}
                </button>
               )
            })}
          </div>
          
          {/* Bottom Profile Mini-Card (Desktop) */}
          <div className="hidden md:block mt-auto px-4 pt-8">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold">
                  {user?.displayName?.[0] || "F"}
               </div>
               <div className="overflow-hidden">
                  <p className="text-sm font-bold text-green-900 truncate">{user?.displayName || "Farmer"}</p>
                  <p className="text-xs text-green-600 truncate">Pro Member</p>
               </div>
            </div>
          </div>
        </aside>

        {/* === RIGHT MAIN CONTENT AREA === */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 overflow-y-auto">
          
          {/* Dynamic Header based on Active Tab */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              key={activeTab} // Animate on tab change
            >
              <h1 className="text-3xl font-light text-neutral-800">
                {activeTab === 'overview' ? (
                  <>Welcome back, <span className="font-semibold text-green-600">{user?.displayName || "Farmer"}</span></>
                ) : (
                   tabList.find(t => t.key === activeTab)?.label
                )}
              </h1>
              <p className="text-neutral-500 mt-1 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Status: <span className="text-green-600 font-medium">Operational</span>
              </p>
            </motion.div>
          </div>

          {/* ========== TAB: OVERVIEW ========== */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Changed grid to 3 since schemes card removed */}
                
                <Card className="hover:shadow-lg transition-shadow duration-300 border-none shadow-sm ring-1 ring-neutral-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                            <Icon icon="mdi:weather-partly-cloudy" className="w-6 h-6 text-blue-600"/>
                        </div>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Live</span>
                    </div>
                    <div className="text-3xl font-bold text-neutral-800">
                        {weather ? `${Math.round(weather.list[0].main.temp)}°C` : "--"}
                    </div>
                    <div className="text-sm text-neutral-500 font-medium capitalize">
                        {weather ? weather.list[0].weather[0].main : "Fetching..."}
                    </div>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 border-none shadow-sm ring-1 ring-neutral-100 group cursor-pointer" onClick={() => setActiveTab("community")}>
                    <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 group-hover:bg-purple-100 transition">
                        <Icon icon="mdi:forum" className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                        New <Icon icon="mdi:arrow-right" className="w-3 h-3" />
                    </span>
                    </div>
                    <div className="text-3xl font-bold text-neutral-800 mb-1">Community</div>
                    <div className="text-sm text-neutral-500 font-medium">Ask Vets & Locals</div>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300 border-none shadow-sm ring-1 ring-neutral-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                      <Icon icon="mdi:chart-line" className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">+10%</span>
                  </div>
                  <div className="text-3xl font-bold text-neutral-800 mb-1">86%</div>
                  <div className="text-sm text-neutral-500 font-medium">Productivity Score</div>
                </Card>
              </div>

              {/* Weather Alerts Summary */}
              <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Icon icon="mdi:weather-cloudy" className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-800">Weather Alerts</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {weatherAlerts.map((alert, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${alert.type === "warning" ? "bg-amber-50 border-amber-200/60" : "bg-blue-50 border-blue-200/60"} hover:scale-[1.01] transition-transform`}>
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-xl ${alert.type === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                             <Icon icon={alert.icon} className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-800 mb-1">{alert.title}</h3>
                          <p className="text-sm text-neutral-600 leading-relaxed">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Productivity Tips */}
              <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                <div className="flex items-center mb-6">
                   <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                      <Icon icon="mdi:lightbulb" className="w-5 h-5 text-yellow-600" />
                   </div>
                  <h2 className="text-lg font-bold text-neutral-800">Productivity Tips</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tips.map((t, i) => (
                    <div key={i} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex flex-col h-full">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                          <Icon icon={t.icon} className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-neutral-800 mb-2">{t.title}</h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ========== TAB: RISK ========== */}
          {activeTab === "risk" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
              <Card className="border-none shadow-sm ring-1 ring-neutral-100 bg-gradient-to-r from-white to-green-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mr-4">
                        <Icon icon="mdi:alert-decagram" className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-neutral-800">Risk Assessment</h2>
                        <p className="text-sm text-neutral-500">Analyze threats to your farm productivity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/farmer/risk-form")}
                    className="px-6 py-3 text-sm font-semibold bg-neutral-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-neutral-200"
                  >
                    <Icon icon="mdi:plus-circle-outline" className="w-5 h-5" />
                    Re-run Assessment
                  </button>
                </div>
              </Card>

              {loadingRisk ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                    <Icon icon="mdi:loading" className="w-10 h-10 animate-spin text-green-600 mb-3" />
                    <p>Analyzing farm data...</p>
                </div>
              ) : riskHistory.length === 0 ? (
                 <Card className="border-dashed border-2 border-neutral-200 bg-neutral-50">
                    <div className="text-center py-12">
                       <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                          <Icon icon="mdi:clipboard-text-off" className="w-8 h-8" />
                       </div>
                       <h3 className="text-lg font-bold text-neutral-700 mb-2">No Assessments Yet</h3>
                       <p className="text-neutral-500 mb-6 max-w-md mx-auto">Start your first risk assessment to get tailored insights on biosecurity and disease prevention.</p>
                       <button
                        onClick={() => router.push("/dashboard/farmer/risk-form")}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 shadow-md"
                      >
                        Start First Assessment
                      </button>
                    </div>
                 </Card>
              ) : (
                <>
                  <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Risk Trends
                      </h3>
                    </div>
                    
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                          <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Overall Risk (%)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Assessment List Sidebar */}
                    <div className="lg:col-span-4 flex flex-col h-[600px]">
                      <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 px-1">
                          History Log
                      </h3>
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {riskHistory.map((item) => {
                          const score = calculateOverallRisk(item);
                          const isSelected = selectedRisk?.id === item.id;
                          return (
                            <div 
                              key={item.id}
                              onClick={() => setSelectedRisk(item)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group relative overflow-hidden ${isSelected ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg' : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-md'}`}
                            >
                              <div className="flex justify-between items-center mb-2 relative z-10">
                                <div className={`flex items-center gap-2 text-xs font-medium ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </div>
                              </div>
                              <div className="flex justify-between items-end relative z-10">
                                <div>
                                  <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>Risk Score</p>
                                  <p className={`text-2xl font-black ${isSelected ? (score > 60 ? 'text-red-400' : score > 30 ? 'text-yellow-400' : 'text-green-400') : (score > 60 ? 'text-red-600' : score > 30 ? 'text-yellow-600' : 'text-green-600')}`}>{score}%</p>
                                </div>
                                <div className={`p-1.5 rounded-full ${isSelected ? 'bg-white/10' : 'bg-neutral-100'}`}>
                                    <Icon icon="mdi:chevron-right" className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Detailed View */}
                    <div className="lg:col-span-8">
                        {selectedRisk && (
                          <Card className="h-full border-none shadow-lg ring-1 ring-neutral-100 p-0 overflow-hidden">
                              <div className="bg-neutral-50 border-b border-neutral-100 p-6 flex justify-between items-center">
                                <div>
                                  <h3 className="text-xl font-bold text-neutral-800">Detailed Report</h3>
                                  <p className="text-sm text-neutral-500 mt-1">
                                    Generated on {new Date(selectedRisk.created_at).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                </div>
                                <div className="text-right">
                                     <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${calculateOverallRisk(selectedRisk) > 60 ? 'bg-red-100 text-red-700' : calculateOverallRisk(selectedRisk) > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {calculateOverallRisk(selectedRisk) > 60 ? 'High Risk' : calculateOverallRisk(selectedRisk) > 30 ? 'Moderate' : 'Safe'}
                                     </div>
                                </div>
                              </div>

                              <div className="p-6">
                                  <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                                    {/* Pie Chart Area */}
                                    <div className="relative w-48 h-48 flex-shrink-0">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                          <Pie
                                            data={[
                                              { value: calculateOverallRisk(selectedRisk), color: getRiskColor(calculateOverallRisk(selectedRisk)) },
                                              { value: 100 - calculateOverallRisk(selectedRisk), color: "#f3f4f6" },
                                            ]}
                                            innerRadius={65}
                                            outerRadius={80}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            stroke="none"
                                          >
                                            <Cell key="risk" fill={getRiskColor(calculateOverallRisk(selectedRisk))} />
                                            <Cell key="rest" fill="#f3f4f6" />
                                          </Pie>
                                        </PieChart>
                                      </ResponsiveContainer>
                                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                         <span className="text-3xl font-black text-neutral-800">{calculateOverallRisk(selectedRisk)}%</span>
                                      </div>
                                    </div>

                                    {/* Bars */}
                                    <div className="flex-1 w-full space-y-4">
                                        {[
                                          { label: "Biosecurity Gaps", val: 100 - selectedRisk.biosecurity_score, color: "bg-blue-500" },
                                          { label: "Disease Pressure", val: selectedRisk.disease_risk_score, color: "bg-red-500" },
                                          { label: "Infrastructure Gaps", val: 100 - selectedRisk.infrastructure_score, color: "bg-purple-500" },
                                          { label: "Climate Risk", val: selectedRisk.climate_risk_score, color: "bg-orange-500" }
                                        ].map((factor, idx) => (
                                          <div key={idx} className="group">
                                             <div className="flex justify-between text-xs font-semibold text-neutral-500 mb-1">
                                                <span>{factor.label}</span>
                                                <span>{factor.val}%</span>
                                             </div>
                                             <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${factor.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${factor.val}%` }}></div>
                                             </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>

                                  {farmProfile && (
                                    <div className={`p-5 rounded-xl border mb-8 ${generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).bgColor}`}>
                                             <div className="flex gap-3">
                                                <Icon icon="mdi:information-slab-circle" className={`w-6 h-6 flex-shrink-0 ${generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).titleColor}`} />
                                                <div>
                                                    <p className={`font-bold mb-1 ${generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).titleColor}`}>Analysis Summary</p>
                                                    <p className="text-sm text-neutral-700 leading-relaxed">{generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).text}</p>
                                                </div>
                                             </div>
                                    </div>
                                  )}

                                  <div>
                                    <h4 className="font-bold text-neutral-800 mb-4 flex items-center gap-2 text-lg">
                                       <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                          <Icon icon="mdi:clipboard-list" /> 
                                       </div>
                                       Actionable Recommendations
                                    </h4>
                                    <ul className="grid gap-3">
                                      {selectedRisk.recommendations?.split("\n").filter((line) => line.trim().length > 0).map((line, i) => (
                                        <li key={i} className="flex items-start gap-4 p-4 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 hover:border-green-300 hover:shadow-sm transition-all">
                                           <span className="flex-shrink-0 w-6 h-6 bg-neutral-900 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                                           <span className="leading-relaxed">{line.replace(/^- /, "")}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                              </div>
                          </Card>
                        )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ========== TAB: WEATHER ========== */}
          {activeTab === "weather" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 flex flex-col justify-between relative overflow-hidden h-80">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div>
                        <h2 className="text-lg font-medium opacity-90 flex items-center gap-2"><Icon icon="mdi:map-marker"/> {userLocation}</h2>
                        <div className="text-6xl font-bold mt-6 mb-2 tracking-tighter">
                            {weather ? Math.round(weather.list[0].main.temp) : "--"}°
                        </div>
                        <p className="text-xl capitalize opacity-90 font-medium">
                            {weather ? weather.list[0].weather[0].description : "Loading..."}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm opacity-80 border-t border-white/20 pt-6">
                        <div className="flex flex-col">
                            <span className="text-blue-200">Humidity</span>
                            <span className="font-bold text-lg">{weather ? weather.list[0].main.humidity : "--"}%</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-blue-200">Wind</span>
                            <span className="font-bold text-lg">{weather ? weather.list[0].wind.speed : "--"} m/s</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-pink-200 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 shadow-sm">
                                <Icon icon="mdi:pig" className="w-7 h-7"/>
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">Pig Advisory</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {weatherTips ? weatherTips.pig : "Loading specific advice..."}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                                <Icon icon="mdi:duck" className="w-7 h-7"/>
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">Poultry Advisory</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {weatherTips ? weatherTips.poultry : "Loading specific advice..."}
                        </p>
                      </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                    <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
                        <Icon icon="mdi:calendar-clock" className="text-blue-500"/> Temperature Trend
                    </h3>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weather ? weather.list.slice(0, 8).map((i: any) => ({
                            time: new Date(i.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                            temp: i.main.temp
                        })) : []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} unit="°C" />
                        <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Line type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill:'#3b82f6', strokeWidth:0}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                    <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Icon icon="mdi:chart-bar" className="text-blue-500" /> Next 5 Days
                    </h3>
                    <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={slimForecastData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                        <YAxis hide={true} />
                        <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(value) => `${value}°C`} />
                        <Bar dataKey="temp" radius={[6, 6, 6, 6]} barSize={24}>
                            {slimForecastData.map((d: any, i: number) => (
                            <Cell key={i} fill="#3b82f6" />
                            ))}
                        </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ========== TAB: ANALYTICS ========== */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-neutral-800 mb-2">Farm Analytics</h2>
                <p className="text-neutral-600">Access detailed analytics and insights for your farm operations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pig Analytics Card */}
                <Card>
                  <div
                    className="cursor-pointer group h-full"
                    onClick={() => router.push('/dashboard/farmer/pig-analytics')}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center group-hover:bg-pink-200 transition-all duration-300 group-hover:scale-110">
                        <Icon icon="mdi:pig" className="w-8 h-8 text-pink-600" />
                      </div>
                      <Icon icon="mdi:arrow-right" className="w-6 h-6 text-neutral-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2 group-hover:text-pink-600 transition-colors">
                      Pig Farm Analytics
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Comprehensive analytics for pig farming including service records, farrowing, litter management, feed tracking, and more.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">Service Records</span>
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">Farrowing</span>
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">Feed & Weight</span>
                      <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">Treatment</span>
                    </div>
                  </div>
                </Card>

                {/* Poultry Analytics Card */}
                <Card>
                  <div
                    className="cursor-pointer group h-full"
                    onClick={() => router.push('/dashboard/farmer/poultry-analytics')}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-all duration-300 group-hover:scale-110">
                        <Icon icon="mdi:bird" className="w-8 h-8 text-orange-600" />
                      </div>
                      <Icon icon="mdi:arrow-right" className="w-6 h-6 text-neutral-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2 group-hover:text-orange-600 transition-colors">
                      Poultry Farm Analytics
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      Detailed analytics for poultry farming operations including flock management, egg production, feed consumption, and health monitoring.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">Flock Management</span>
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">Egg Production</span>
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">Health Monitoring</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <Card>
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                  <Icon icon="mdi:chart-box" className="w-5 h-5 text-green-600" />
                  Analytics Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-pink-800">Pig Records</span>
                      <Icon icon="mdi:pig" className="w-5 h-5 text-pink-600" />
                    </div>
                    <p className="text-2xl font-bold text-pink-900">Active</p>
                    <p className="text-xs text-pink-700 mt-1">Full tracking available</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-800">Poultry Records</span>
                      <Icon icon="mdi:bird" className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900">Active</p>
                    <p className="text-xs text-orange-700 mt-1">Full tracking available</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Data Insights</span>
                      <Icon icon="mdi:chart-line" className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">Real-time</p>
                    <p className="text-xs text-green-700 mt-1">Live data tracking</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ========== TAB: ALERTS ========== */}
          {activeTab === "outbreak" && (
            <div className="animate-fadeIn">
              <DiseaseAlertsDashboard />
            </div>
          )}

          {/* ========== TAB: SCHEMES (INTEGRATED) ========== */}
          {activeTab === "schemes" && (
            <GovtSchemesDashboard />
          )}
          {/* ========== TAB: VISITORS ========== */}
          {activeTab === "visitors" && user && (
            <VisitorManagement farmerId={user.id} />
          )}

          {/* ========== TAB: COMMUNITY ========== */}
          {activeTab === "community" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-neutral-200 shadow-sm text-center px-4">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-purple-50/50">
                <Icon icon="mdi:account-group" className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">Community Hub</h2>
              <p className="text-neutral-500 text-lg max-w-xl mb-10 leading-relaxed">
                Connect with local farmers, share insights, and get real-time advice from certified veterinarians in your district.
              </p>
              <button onClick={() => router.push('/dashboard/farmer/community')} className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-3 shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-200 transform hover:-translate-y-1">
                <Icon icon="mdi:open-in-new" className="w-5 h-5"/> Open Community Feed
              </button>
            </motion.div>
          )}

          {/* ========== TAB: VETS ========== */}
          {activeTab === "vets" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
              <VetList />
              <div className="border-t border-neutral-200 pt-10">
                <h3 className="text-lg font-bold text-neutral-800 mb-6">Your Consultation History</h3>
                <FarmerRequestHistory farmerId={user?.id || ""} />
              </div>
            </motion.div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}