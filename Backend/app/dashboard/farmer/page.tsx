"use client";

import React, { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import DiseaseAlertsDashboard from "./outbreaks/DiseaseAlertsDashboard";
import VetList from "./components/VetList";
import FarmerRequestHistory from "./components/FarmerRequestHistory";

// Lucide icons (Merged from both files)
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  HelpCircle, 
  Search as SearchIcon, 
  Filter as FilterIcon,
  History,
  TrendingUp,
  Calendar,
  // New icons from Schemes page
  PiggyBank,
  Bird,
  Globe,
  Building,
  IndianRupee,
  Shield,
  FileCheck,
  ClipboardList,
  Users,
  Home,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Info,
  Clock,
  CheckSquare,
  X,
  Award,
  Target,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  ArrowLeft
} from "lucide-react"; 

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart, // Added for weather
  Bar,      // Added for weather
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

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
  "Application Start Date"?: string;
  "Last date"?: string;
  "AI Overview"?: string;
  "PDF Link"?: string;
  [key: string]: any;
};

type AppliedScheme = {
  schemeName: string;
  status: 'applied' | 'not-applied' | 'pending';
  appliedAt: string;
  updatedAt: string;
};

export default function FarmerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSupabaseUser();

  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "risk" | "weather" | "outbreak" | "schemes" | "community" | "vets"
  >("overview");

  // --- State: Risk & Profile ---
  const [riskHistory, setRiskHistory] = useState<RiskAssessment[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);

  // --- State: Schemes Integration (NEW) ---
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/11oh6nVyIGXoy9oTfA_UWgAD3JxCvVeO0K4n9ncqVeyw/export?format=csv";
  const [schemes, setSchemes] = useState<SchemeData[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<SchemeData[]>([]);
  const [schemeSearchTerm, setSchemeSearchTerm] = useState("");
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState("All");
  const [schemesLoading, setSchemesLoading] = useState(true);
  
  // New Scheme States
  const [schemeView, setSchemeView] = useState<"list" | "detail">("list");
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<SchemeData | null>(null);
  const [savedSchemes, setSavedSchemes] = useState<string[]>([]);
  const [appliedSchemes, setAppliedSchemes] = useState<AppliedScheme[]>([]);
  const [schemeTab, setSchemeTab] = useState<"all" | "saved" | "applied">("all");

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

  // --- Effects: Schemes Fetching & Logic ---
  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (result) => {
        // Use slice(2) to skip header rows if needed, as per your previous logic
        const data = result.data.slice(2) as SchemeData[];
        setSchemes(data);
        setFilteredSchemes(data);
        setSchemesLoading(false);
      },
      error: (err) => {
        console.error("Error fetching schemes:", err);
        setSchemesLoading(false);
      }
    });

    // Load applied schemes from localStorage
    const savedApplied = localStorage.getItem('appliedSchemes');
    if (savedApplied) {
      setAppliedSchemes(JSON.parse(savedApplied));
    }
    
    // Add global styles for animations
    const styles = `
      @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  useEffect(() => {
    localStorage.setItem('appliedSchemes', JSON.stringify(appliedSchemes));
  }, [appliedSchemes]);

  // --- Effects: Schemes Filtering ---
  useEffect(() => {
    let filtered = schemes;
    
    // Animal Filter
    if (selectedAnimalFilter !== "All") {
      filtered = filtered.filter(scheme => {
        const schemeName = scheme["Govt Scheme Name"]?.toLowerCase() || "";
        const schemeDescription = scheme["Scheme Description"]?.toLowerCase() || "";
        if (selectedAnimalFilter === "Pig") {
          return schemeName.includes("pig") || schemeName.includes("swine") || schemeDescription.includes("pig") || schemeDescription.includes("swine");
        }
        if (selectedAnimalFilter === "Poultry") {
          return schemeName.includes("poultry") || schemeName.includes("chicken") || schemeName.includes("hen") || schemeDescription.includes("poultry") || schemeDescription.includes("chicken") || schemeDescription.includes("hen");
        }
        return true;
      });
    }
    
    // Search Filter
    if (schemeSearchTerm) {
      filtered = filtered.filter(scheme => {
        const searchLower = schemeSearchTerm.toLowerCase();
        return (
          scheme["Govt Scheme Name"]?.toLowerCase().includes(searchLower) ||
          scheme["Scheme Description"]?.toLowerCase().includes(searchLower) ||
          scheme["Ministry / Department Name"]?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Tab Filter
    if (schemeTab === "saved") {
      filtered = filtered.filter(scheme => savedSchemes.includes(scheme["Govt Scheme Name"]));
    } else if (schemeTab === "applied") {
      const appliedNames = appliedSchemes.map(app => app.schemeName);
      filtered = filtered.filter(scheme => appliedNames.includes(scheme["Govt Scheme Name"]));
    }
    
    setFilteredSchemes(filtered);
  }, [schemeSearchTerm, selectedAnimalFilter, schemes, savedSchemes, appliedSchemes, schemeTab]);

  const animalFilters = [
    { id: "All", label: "All Schemes", icon: <Globe size={20} /> },
    { id: "Pig", label: "Pig Farming", icon: <PiggyBank size={20} /> },
    { id: "Poultry", label: "Poultry Farming", icon: <Bird size={20} /> }
  ];

  // --- Scheme Actions ---
  const handleViewDetails = (scheme: SchemeData) => {
    setSelectedSchemeDetail(scheme);
    setSchemeView("detail");
    window.scrollTo(0, 0);
  };

  const handleBackToList = () => {
    setSchemeView("list");
    setSelectedSchemeDetail(null);
    window.scrollTo(0, 0);
  };

  const handleSaveScheme = (schemeId: string) => {
    let updatedSaved;
    if (savedSchemes.includes(schemeId)) {
      updatedSaved = savedSchemes.filter(id => id !== schemeId);
    } else {
      updatedSaved = [...savedSchemes, schemeId];
    }
    setSavedSchemes(updatedSaved);
  };

  const handleApplyStatus = (schemeName: string, status: 'applied' | 'not-applied' | 'pending') => {
    const existingIndex = appliedSchemes.findIndex(app => app.schemeName === schemeName);
    let updatedApplied;
    if (existingIndex >= 0) {
      updatedApplied = [...appliedSchemes];
      updatedApplied[existingIndex] = {
        ...updatedApplied[existingIndex],
        status,
        updatedAt: new Date().toISOString()
      };
    } else {
      updatedApplied = [
        ...appliedSchemes,
        {
          schemeName,
          status,
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    setAppliedSchemes(updatedApplied);
  };

  const getAppliedStatus = (schemeName: string) => {
    const applied = appliedSchemes.find(app => app.schemeName === schemeName);
    return applied ? applied.status : null;
  };

  // --- Effects: Dashboard General ---
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "analytics", "risk", "weather", "alerts", "schemes", "community"].includes(tab)) {
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
        day: new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit" }), // reused for bar chart key
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
        time: new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), // for chart key
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-3xl font-light text-neutral-800 mb-2">
                Welcome back, <span className="font-medium text-green-600">{user?.displayName || "Farmer"}</span>
              </h1>
              <p className="text-neutral-600">Your pig &amp; poultry dashboard with live insights and vet support.</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "overview", label: "Overview", icon: "mdi:view-dashboard" },
                { key: "analytics", label: "Analytics", icon: "mdi:chart-line" },
                { key: "risk", label: "Risk", icon: "mdi:alert-decagram" },
                { key: "weather", label: "Weather", icon: "mdi:weather-cloudy" },
                { key: "outbreak", label: "Security", icon: "mdi:shield-lock" },
                { key: "schemes", label: "Schemes", icon: "mingcute:government-line" },
                { key: "community", label: "Community", icon: "mdi:account-group" },
                { key: "vets", label: "FarmSeva Vets", icon: "mdi:stethoscope" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white text-neutral-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  <Icon icon={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ========== TAB: OVERVIEW ========== */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Icon icon="mingcute:government-fill" className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    {schemes.length > 0 ? schemes.length : "..."}
                  </div>
                  <div className="text-sm text-neutral-600">Eligible Schemes</div>
                </Card>
                
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Icon icon="mdi:weather-partly-cloudy" className="w-6 h-6 text-blue-600"/>
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Now</span>
                    </div>
                    <div className="text-2xl font-semibold text-neutral-800">
                        {weather ? `${Math.round(weather.list[0].main.temp)}°C` : "Loading..."}
                    </div>
                    <div className="text-sm text-neutral-600">
                        {weather ? weather.list[0].weather[0].main : "Fetching..."}
                    </div>
                </Card>

                <Card>
                    <div 
                        className="cursor-pointer group h-full flex flex-col justify-center"
                        onClick={() => router.push('/dashboard/farmer/community')} 
                    >
                        <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition">
                            <Icon icon="mdi:forum" className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-sm text-purple-600 font-medium flex items-center gap-1">
                            New Posts <Icon icon="mdi:arrow-right" className="w-3 h-3" />
                        </span>
                        </div>
                        <div className="text-2xl font-semibold text-neutral-800 mb-1">Community</div>
                        <div className="text-sm text-neutral-600">Ask Vets & Locals</div>
                    </div>
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

              {/* Weather Alerts Summary */}
              <Card>
                <div className="flex items-center mb-6">
                  <Icon icon="mdi:weather-cloudy" className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-medium text-neutral-800">Weather Alerts</h2>
                </div>
                <div className="space-y-4">
                  {weatherAlerts.map((alert, i) => (
                    <div key={i} className={`p-4 rounded-lg border-l-4 ${alert.type === "warning" ? "bg-yellow-50 border-yellow-400" : "bg-blue-50 border-blue-400"}`}>
                      <div className="flex items-start space-x-3">
                        <Icon icon={alert.icon} className={`w-5 h-5 mt-0.5 ${alert.type === "warning" ? "text-yellow-600" : "text-blue-600"}`} />
                        <div>
                          <h3 className="font-medium text-neutral-800 mb-1">{alert.title}</h3>
                          <p className="text-sm text-neutral-600">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Productivity Tips */}
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

          {/* ========== TAB: RISK ========== */}
          {activeTab === "risk" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon icon="mdi:alert-decagram" className="w-6 h-6 text-orange-600 mr-2" />
                    <h2 className="text-xl font-medium text-neutral-800">Farm Risk Assessment & History</h2>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/farmer/risk-form")}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm"
                  >
                    <Icon icon="mdi:plus-circle-outline" className="w-4 h-4" />
                    Re-run assessment
                  </button>
                </div>
              </Card>

              {loadingRisk ? (
                <div className="text-center py-10 text-neutral-500">
                   <Icon icon="mdi:loading" className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
                   Loading your risk profile...
                </div>
              ) : riskHistory.length === 0 ? (
                 <Card>
                    <div className="text-center py-8">
                       <p className="text-neutral-600 mb-4">You haven&apos;t performed any risk assessments yet.</p>
                       <button
                        onClick={() => router.push("/dashboard/farmer/risk-form")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Start First Assessment
                      </button>
                    </div>
                 </Card>
              ) : (
                <>
                  <Card>
                    <div className="mb-6 flex justify-between items-end">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                          Risk Trends Over Time
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">Tracking your farm's Overall Risk Score evolution.</p>
                      </div>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }} />
                          <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Overall Risk (%)" activeDot={{ r: 6, strokeWidth: 0 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-4">
                      <h3 className="text-md font-semibold text-neutral-700 flex items-center gap-2 px-1">
                        <History className="w-4 h-4" /> Assessment Log
                      </h3>
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {riskHistory.map((item) => {
                          const score = calculateOverallRisk(item);
                          const isSelected = selectedRisk?.id === item.id;
                          return (
                            <div 
                              key={item.id}
                              onClick={() => setSelectedRisk(item)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'bg-green-50 border-green-200 ring-1 ring-green-300 shadow-sm' : 'bg-white border-neutral-100 hover:bg-gray-50'}`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </div>
                                {isSelected && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Viewing</span>}
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Risk Score</p>
                                  <p className={`text-2xl font-bold ${score > 60 ? 'text-red-600' : score > 30 ? 'text-yellow-600' : 'text-green-600'}`}>{score}%</p>
                                </div>
                                <Icon icon="mdi:chevron-right" className={`w-5 h-5 ${isSelected ? 'text-green-600' : 'text-gray-300'}`} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="lg:col-span-8">
                       {selectedRisk && (
                          <Card className="h-full border-l-4 border-l-green-500">
                              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-neutral-800">Assessment Details</h3>
                                  <p className="text-sm text-neutral-500">
                                    Data from {new Date(selectedRisk.created_at).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                </div>
                                <div className="text-right">
                                     <p className="text-xs text-neutral-500 uppercase font-semibold">Overall Risk</p>
                                     <p className="text-3xl font-black text-neutral-800">{calculateOverallRisk(selectedRisk)}%</p>
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                                <div className="relative w-48 h-48 flex-shrink-0">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={[
                                          { value: calculateOverallRisk(selectedRisk), color: getRiskColor(calculateOverallRisk(selectedRisk)) },
                                          { value: 100 - calculateOverallRisk(selectedRisk), color: "#f3f4f6" },
                                        ]}
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                      >
                                        <Cell key="risk" fill={getRiskColor(calculateOverallRisk(selectedRisk))} />
                                        <Cell key="rest" fill="#f3f4f6" />
                                      </Pie>
                                    </PieChart>
                                  </ResponsiveContainer>
                                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                     <Icon icon="mdi:shield-check" className={`w-8 h-8 ${calculateOverallRisk(selectedRisk) > 60 ? 'text-red-500' : calculateOverallRisk(selectedRisk) > 30 ? 'text-yellow-500' : 'text-green-500'}`} />
                                  </div>
                                </div>

                                <div className="flex-1 w-full">
                                    <h4 className="font-semibold text-neutral-800 mb-3">Risk Factor Breakdown</h4>
                                    <div className="space-y-3">
                                        {[
                                          { label: "Biosecurity Gaps", val: 100 - selectedRisk.biosecurity_score, color: "bg-blue-500" },
                                          { label: "Disease Pressure", val: selectedRisk.disease_risk_score, color: "bg-red-500" },
                                          { label: "Infrastructure Gaps", val: 100 - selectedRisk.infrastructure_score, color: "bg-purple-500" },
                                          { label: "Climate Risk", val: selectedRisk.climate_risk_score, color: "bg-orange-500" }
                                        ].map((factor, idx) => (
                                          <div key={idx} className="flex items-center gap-3 text-sm">
                                             <div className="w-32 text-neutral-600">{factor.label}</div>
                                             <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${factor.color}`} style={{ width: `${factor.val}%` }}></div>
                                             </div>
                                             <div className="w-8 text-right font-medium text-neutral-800">{factor.val}%</div>
                                          </div>
                                        ))}
                                    </div>
                                </div>
                              </div>

                              {farmProfile && (
                                <div className={`p-4 rounded-lg border mb-6 ${generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).bgColor}`}>
                                     <p className={`font-bold mb-1 ${generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).titleColor}`}>Analysis Summary</p>
                                     <p className="text-sm text-neutral-800">{generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).text}</p>
                                </div>
                              )}

                              <div>
                                <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
                                   <Icon icon="mdi:clipboard-list" className="text-green-600" /> Actionable Recommendations
                                </h4>
                                <ul className="space-y-2">
                                  {selectedRisk.recommendations?.split("\n").filter((line) => line.trim().length > 0).map((line, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm text-neutral-700">
                                       <span className="flex-shrink-0 w-5 h-5 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                                       {line.replace(/^- /, "")}
                                    </li>
                                  ))}
                                </ul>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div>
                        <h2 className="text-lg font-medium opacity-90 flex items-center gap-2"><Icon icon="mdi:map-marker"/> {userLocation}</h2>
                        <div className="text-5xl font-bold mt-4 mb-2">
                            {weather ? Math.round(weather.list[0].main.temp) : "--"}°C
                        </div>
                        <p className="text-lg capitalize opacity-90">
                            {weather ? weather.list[0].weather[0].description : "Loading..."}
                        </p>
                    </div>
                    <div className="flex justify-between mt-6 text-sm opacity-80 border-t border-white/20 pt-4">
                        <div className="flex flex-col">
                            <span>Humidity</span>
                            <span className="font-bold">{weather ? weather.list[0].main.humidity : "--"}%</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span>Wind</span>
                            <span className="font-bold">{weather ? weather.list[0].wind.speed : "--"} m/s</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-l-8 border-pink-400 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                            <Icon icon="mdi:pig" className="w-6 h-6"/>
                        </div>
                        <h3 className="font-bold text-gray-800">Pig Farming Advisory</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {weatherTips ? weatherTips.pig : "Loading specific advice..."}
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border-l-8 border-orange-400 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                            <Icon icon="mdi:duck" className="w-6 h-6"/>
                        </div>
                        <h3 className="font-bold text-gray-800">Poultry Advisory</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {weatherTips ? weatherTips.poultry : "Loading specific advice..."}
                    </p>
                </div>
              </div>

              <Card>
                <h3 className="font-semibold text-neutral-800 mb-6 flex items-center gap-2">
                    <Icon icon="mdi:calendar-clock" className="text-blue-500"/> 5-Day Temperature Trend
                </h3>
                <div className="h-72">
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

              <Card>
                <h3 className="font-semibold text-neutral-800 mb-6 flex items-center gap-2">
                  <Icon icon="mdi:chart-bar" className="text-blue-500" /> Next 5 Days (Slim Forecast)
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={slimForecastData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <YAxis hide={true} />
                      <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(value) => `${value}°C`} />
                      <Bar dataKey="temp" radius={[6, 6, 6, 6]} barSize={16}>
                        {slimForecastData.map((d: any, i: number) => (
                          <Cell key={i} fill="#3b82f6" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              {schemeView === "detail" && selectedSchemeDetail ? (
                <SchemeDetailPage 
                  scheme={selectedSchemeDetail} 
                  onBack={handleBackToList}
                  isSaved={savedSchemes.includes(selectedSchemeDetail["Govt Scheme Name"])}
                  onSaveToggle={() => handleSaveScheme(selectedSchemeDetail["Govt Scheme Name"])}
                  appliedStatus={getAppliedStatus(selectedSchemeDetail["Govt Scheme Name"])}
                  onApplyStatusChange={(status: any) => handleApplyStatus(selectedSchemeDetail["Govt Scheme Name"], status)}
                />
              ) : (
                <>
                  {/* Stats Bar */}
                  <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-6 md:p-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-neutral-900">{schemes.length}</div>
                        <div className="text-sm text-neutral-600 mt-1">Active Schemes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-neutral-900">{savedSchemes.length}</div>
                        <div className="text-sm text-neutral-600 mt-1">Saved Schemes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-neutral-900">{appliedSchemes.filter(app => app.status === 'applied').length}</div>
                        <div className="text-sm text-neutral-600 mt-1">Applied</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-neutral-900">₹10Cr+</div>
                        <div className="text-sm text-neutral-600 mt-1">Benefits</div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Section */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-emerald-100">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search schemes by name or description..."
                          value={schemeSearchTerm}
                          onChange={(e) => setSchemeSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-base"
                        />
                      </div>
                      
                      <div className="lg:w-64">
                        <div className="relative">
                          <FilterIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
                          <select
                            value={selectedAnimalFilter}
                            onChange={(e) => setSelectedAnimalFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-300 text-base"
                          >
                            {animalFilters.map(filter => (
                              <option key={filter.id} value={filter.id}>
                                {filter.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Tabs within Schemes */}
                    <div className="flex space-x-6 border-b-2 border-neutral-100 mt-8 mb-4">
                      <button onClick={() => setSchemeTab("all")} className={`pb-4 text-lg font-medium transition-all ${schemeTab === "all" ? "text-neutral-900 border-b-4 border-neutral-900" : "text-neutral-500 hover:text-neutral-700"}`}>
                        All Schemes
                      </button>
                      <button onClick={() => setSchemeTab("saved")} className={`pb-4 text-lg font-medium transition-all flex items-center gap-2 ${schemeTab === "saved" ? "text-neutral-900 border-b-4 border-neutral-900" : "text-neutral-500 hover:text-neutral-700"}`}>
                        <Bookmark size={20} /> Saved
                      </button>
                      <button onClick={() => setSchemeTab("applied")} className={`pb-4 text-lg font-medium transition-all flex items-center gap-2 ${schemeTab === "applied" ? "text-neutral-900 border-b-4 border-neutral-900" : "text-neutral-500 hover:text-neutral-700"}`}>
                        <History size={20} /> Applied
                      </button>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-lg text-emerald-700 font-semibold">
                        {schemesLoading ? (
                          <span className="flex items-center justify-center gap-2"><Icon icon="mdi:loading" className="animate-spin" /> Loading Schemes from Database...</span>
                        ) : (
                          <>Found {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {!schemesLoading && filteredSchemes.map((scheme, i) => (
                      <SchemeCard 
                        key={i} 
                        scheme={scheme} 
                        index={i}
                        onViewDetails={() => handleViewDetails(scheme)}
                        isSaved={savedSchemes.includes(scheme["Govt Scheme Name"])}
                        onSaveToggle={() => handleSaveScheme(scheme["Govt Scheme Name"])}
                        appliedStatus={getAppliedStatus(scheme["Govt Scheme Name"])}
                      />
                    ))}
                  </div>

                  {!schemesLoading && filteredSchemes.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SearchIcon className="w-12 h-12 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-700 mb-2">No schemes found</h3>
                      <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ========== TAB: COMMUNITY ========== */}
          {activeTab === "community" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Icon icon="mdi:account-group" className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-neutral-800 mb-2">Join the Farmer Community</h2>
              <p className="text-neutral-600 text-center max-w-md mb-8">
                Connect with farmers near you, get real-time disease alerts, and ask questions to verified veterinary experts.
              </p>
              <button onClick={() => router.push('/dashboard/farmer/community')} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md">
                <Icon icon="mdi:open-in-new" className="w-5 h-5"/> Open Community Feed
              </button>
            </motion.div>
          )}

          {/* ========== TAB: VETS ========== */}
          {activeTab === "vets" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
              <VetList />
              <div className="border-t border-gray-200 pt-8">
                <FarmerRequestHistory farmerId={user?.id || ""} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

// 1. Scheme Card
function SchemeCard({ scheme, index, onViewDetails, isSaved, onSaveToggle, appliedStatus }: any) {
  const getAnimalType = () => {
    const name = scheme["Govt Scheme Name"]?.toLowerCase() || "";
    const desc = scheme["Scheme Description"]?.toLowerCase() || "";
    if (name.includes("pig") || desc.includes("pig") || desc.includes("swine")) 
      return { icon: <PiggyBank size={32} />, label: "Pig Farming" };
    if (name.includes("poultry") || desc.includes("poultry") || desc.includes("chicken") || desc.includes("hen")) 
      return { icon: <Bird size={32} />, label: "Poultry Farming" };
    return { icon: <Globe size={32} />, label: "General Agriculture" };
  };

  const getStatusBadge = () => {
    switch(appliedStatus) {
      case 'applied':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
            <CheckCircle size={16} /> Applied
          </div>
        );
      case 'not-applied':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
            <XCircle size={16} /> Not Applied
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
            <ClockIcon size={16} /> In Progress
          </div>
        );
      default: return null;
    }
  };

  const animal = getAnimalType();
  const amount = scheme["Benefits Provided"]?.match(/₹[\d,]+|Up to [\d,]+|Rs\.[\d,]+/)?.[0] || "Variable Benefits";
  const ministry = scheme["Ministry / Department Name"] || "Government of India";

  return (
    <div 
      className="bg-white border-2 border-neutral-200 rounded-3xl hover:border-neutral-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              {animal.icon}
            </div>
            <div>
              <div className="text-lg font-semibold text-neutral-900">{animal.label}</div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
                <Building size={16} />
                <span className="line-clamp-1">{ministry}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSaveToggle();
              }}
              className="text-neutral-400 hover:text-neutral-900 transition-colors p-2"
            >
              {isSaved ? <BookmarkCheck size={28} className="text-neutral-900" /> : <Bookmark size={28} />}
            </button>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-neutral-900 mb-4 leading-tight line-clamp-2">
          {scheme["Govt Scheme Name"]}
        </h3>

        <p className="text-lg text-neutral-700 leading-relaxed mb-6 line-clamp-3 flex-grow">
          {scheme["Scheme Description"]}
        </p>

        <div className="bg-neutral-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <IndianRupee size={20} className="text-neutral-700" />
            <span className="text-lg font-semibold text-neutral-900">Benefits</span>
          </div>
          <p className="text-xl font-medium text-neutral-900">{amount}</p>
        </div>

        <button 
          onClick={onViewDetails}
          className="w-full flex items-center justify-center gap-3 py-4 bg-neutral-900 hover:bg-black text-white text-lg font-semibold rounded-2xl transition-all group/btn mt-auto"
        >
          View Full Details
          <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// 2. Scheme Detail Page
function SchemeDetailPage({ scheme, onBack, isSaved, onSaveToggle, appliedStatus, onApplyStatusChange }: any) {
  const getAnimalType = () => {
    const name = scheme["Govt Scheme Name"]?.toLowerCase() || "";
    const desc = scheme["Scheme Description"]?.toLowerCase() || "";
    if (name.includes("pig") || desc.includes("pig") || desc.includes("swine")) 
      return { icon: <PiggyBank size={40} />, label: "Pig Farming Scheme" };
    if (name.includes("poultry") || desc.includes("poultry") || desc.includes("chicken") || desc.includes("hen")) 
      return { icon: <Bird size={40} />, label: "Poultry Farming Scheme" };
    return { icon: <Globe size={40} />, label: "Agriculture Scheme" };
  };

  const parseBenefits = (benefitsText: string) => {
    if (!benefitsText) return [];
    const items = benefitsText.split(/(?:\d+\.\s)/).filter(item => item.trim());
    if (items.length <= 1) {
      return benefitsText.split(/\.\s+/).filter(item => item.trim()).map(item => item + '.');
    }
    return items;
  };

  const animal = getAnimalType();
  const ministry = scheme["Ministry / Department Name"] || "Government of India";
  const benefitsList = parseBenefits(scheme["Benefits Provided"]);
  const amount = scheme["Benefits Provided"]?.match(/₹[\d,]+|Up to [\d,]+|Rs\.[\d,]+/)?.[0] || "Variable Benefits";

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fadeIn">
      {/* Navigation Bar */}
      <div className="sticky top-0 bg-white border-b border-neutral-200 z-50 px-6 py-4 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 text-lg font-medium transition-colors group">
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <button onClick={onSaveToggle} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-lg font-medium transition-all ${isSaved ? "bg-neutral-900 text-white" : "border-2 border-neutral-200 text-black hover:border-neutral-300"}`}>
          {isSaved ? <BookmarkCheck size={24} /> : <Bookmark size={24} />} {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Hero */}
      <div className="bg-gray-50 px-8 py-12 border-b border-neutral-200">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            {animal.icon}
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-900">{animal.label}</div>
            <div className="flex items-center gap-2 text-lg text-neutral-600 mt-1">
              <Building size={20} /> <span>{ministry}</span>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900 mb-6 leading-tight">{scheme["Govt Scheme Name"]}</h1>
        <p className="text-xl text-neutral-700 leading-relaxed">{scheme["Scheme Description"]}</p>
      </div>

      {/* Content Grid */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {scheme["Benefits Provided"] && (
            <section className="bg-white border-2 border-neutral-100 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center"><IndianRupee size={24} /></div>
                <h2 className="text-2xl font-bold text-neutral-900">Benefits</h2>
              </div>
              {benefitsList.length > 1 ? (
                <ul className="space-y-4">
                  {benefitsList.map((benefit: string, index: number) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">{index + 1}</span>
                      <span className="text-lg text-neutral-700 leading-relaxed">{benefit.trim()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lg text-neutral-700 leading-relaxed">{scheme["Benefits Provided"]}</p>
              )}
            </section>
          )}

          {scheme["Eligibility Requirements"] && (
            <section className="bg-white border-2 border-neutral-100 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center"><Users size={24} /></div>
                <h2 className="text-2xl font-bold text-neutral-900">Eligibility</h2>
              </div>
              <p className="text-lg text-neutral-700 leading-relaxed whitespace-pre-line">{scheme["Eligibility Requirements"]}</p>
            </section>
          )}

          {scheme["Required Documents"] && (
             <section className="bg-white border-2 border-neutral-100 rounded-3xl p-8">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center"><ClipboardList size={24} /></div>
                 <h2 className="text-2xl font-bold text-neutral-900">Documents</h2>
               </div>
               <p className="text-lg text-neutral-700 leading-relaxed whitespace-pre-line">{scheme["Required Documents"]}</p>
             </section>
          )}
        </div>

        {/* Right Action Column */}
        <div className="space-y-8">
          <div className="sticky top-28 bg-white border-2 border-neutral-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Apply Now</h3>
            
            <a href={scheme["Website Link"]} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-neutral-900 hover:bg-black text-white text-lg font-semibold rounded-xl mb-4 transition-colors">
              Official Portal <ExternalLink size={20} />
            </a>
            
            {scheme["PDF Link"] && (
               <a href={scheme["PDF Link"]} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 border-2 border-neutral-200 hover:bg-gray-50 text-neutral-900 text-lg font-semibold rounded-xl mb-8 transition-colors">
                 Download Form <ExternalLink size={20} />
               </a>
            )}

            <div className="border-t border-neutral-200 pt-6">
              <h4 className="text-lg font-bold text-neutral-900 mb-4">Application Status</h4>
              <div className="space-y-3">
                <button onClick={() => onApplyStatusChange('applied')} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${appliedStatus === 'applied' ? 'bg-green-50 border-green-500' : 'border-neutral-100'}`}>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center ${appliedStatus === 'applied' ? 'bg-green-500 border-green-500' : 'border-neutral-300'}`}>{appliedStatus === 'applied' && <CheckSquare size={16} className="text-white" />}</div>
                  <span className="font-medium">Applied</span>
                </button>
                <button onClick={() => onApplyStatusChange('pending')} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${appliedStatus === 'pending' ? 'bg-amber-50 border-amber-500' : 'border-neutral-100'}`}>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center ${appliedStatus === 'pending' ? 'bg-amber-500 border-amber-500' : 'border-neutral-300'}`}>{appliedStatus === 'pending' && <ClockIcon size={16} className="text-white" />}</div>
                  <span className="font-medium">Pending</span>
                </button>
                <button onClick={() => onApplyStatusChange('not-applied')} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${appliedStatus === 'not-applied' ? 'bg-red-50 border-red-500' : 'border-neutral-100'}`}>
                  <div className={`w-6 h-6 rounded border flex items-center justify-center ${appliedStatus === 'not-applied' ? 'bg-red-500 border-red-500' : 'border-neutral-300'}`}>{appliedStatus === 'not-applied' && <X size={16} className="text-white" />}</div>
                  <span className="font-medium">Not Applied</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}