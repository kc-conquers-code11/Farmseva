"use client";

import React, { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
// Lucide icons
import { 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  HelpCircle, 
  Search as SearchIcon, 
  Filter as FilterIcon,
  History,
  TrendingUp,
  Calendar
} from "lucide-react"; 

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
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
  [key: string]: any;
};

export default function FarmerDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSupabaseUser();

  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "risk" | "weather" | "alerts" | "schemes"
  >("overview");

  // --- State: Risk & Profile ---
  // We now store the full history and the currently selected assessment for viewing
  const [riskHistory, setRiskHistory] = useState<RiskAssessment[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);

  // --- State: Schemes Integration ---
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/11oh6nVyIGXoy9oTfA_UWgAD3JxCvVeO0K4n9ncqVeyw/export?format=csv";
  const [schemes, setSchemes] = useState<SchemeData[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<SchemeData[]>([]);
  const [schemeSearchTerm, setSchemeSearchTerm] = useState("");
  const [selectedSchemeCategory, setSelectedSchemeCategory] = useState("All");
  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState("All");
  const [schemesLoading, setSchemesLoading] = useState(true);

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

  // --- Data Constants ---
  const priceTrend = [
    { month: "Jan", pig: 165, poultry: 120 },
    { month: "Feb", pig: 170, poultry: 118 },
    { month: "Mar", pig: 162, poultry: 125 },
    { month: "Apr", pig: 175, poultry: 130 },
    { month: "May", pig: 180, poultry: 135 },
    { month: "Jun", pig: 178, poultry: 132 },
  ];

  const rainfallTrend = [
    { month: "Jan", mm: 12 },
    { month: "Feb", mm: 8 },
    { month: "Mar", mm: 5 },
    { month: "Apr", mm: 22 },
    { month: "May", mm: 48 },
    { month: "Jun", mm: 95 },
  ];

  const revenueDistribution = [
    { name: "Pig", value: 56, color: "#10b981" },
    { name: "Poultry", value: 44, color: "#f59e0b" },
  ];

  const weatherAlerts = [
    {
      type: "warning",
      title: "Heat Stress Risk (Poultry)",
      description: "Increase ventilation and provide cool water to reduce mortality risk in the next 48 hours",
      icon: "mdi:weather-sunny-alert",
    },
    {
      type: "info",
      title: "Rainfall Expected",
      description: "Secure pig housing and improve drainage to avoid flooding in pens",
      icon: "mdi:weather-pouring",
    },
  ];

  const securityAlerts = [
    {
      level: "high",
      title: "Fake Vaccine Offers",
      detail: "Beware of unverified ASF or AI vaccines. Buy only from licensed suppliers.",
      icon: "mdi:shield-alert",
    },
    {
      level: "medium",
      title: "Scam Hatchery Listings",
      detail: "Cross-verify hatchery registrations and batch certificates before payments.",
      icon: "mdi:alert-decagram",
    },
    {
      level: "low",
      title: "Counterfeit Feed Additives",
      detail: "Check FSSAI/FDA labels and batch numbers. Avoid bulk prepayments.",
      icon: "mdi:alert",
    },
  ];

  const tips = [
    {
      title: "Biosecurity First",
      description: "Footbaths, visitor logs, and pen-specific gear reduce disease risk significantly.",
      icon: "mdi:shield-check",
    },
    {
      title: "Heat Mitigation",
      description: "Shade nets and foggers reduce poultry heat stress during summer.",
      icon: "mdi:weather-sunny",
    },
    {
      title: "Feed Efficiency",
      description: "Track FCR (feed conversion ratio) weekly for pigs and broilers.",
      icon: "mdi:food-drumstick",
    },
  ];

  // --- Effects: Schemes Fetching ---
  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (result) => {
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

    const styles = `
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  // --- Effects: Schemes Filtering ---
  useEffect(() => {
    let filtered = schemes;
    if (schemeSearchTerm) {
      filtered = filtered.filter(scheme =>
        scheme["Govt Scheme Name"]?.toLowerCase().includes(schemeSearchTerm.toLowerCase()) ||
        scheme["Scheme Description"]?.toLowerCase().includes(schemeSearchTerm.toLowerCase())
      );
    }
    if (selectedSchemeCategory !== "All") {
      filtered = filtered.filter(scheme => 
        scheme["Scheme Category"] === selectedSchemeCategory
      );
    }
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
    setFilteredSchemes(filtered);
  }, [schemeSearchTerm, selectedSchemeCategory, selectedAnimalFilter, schemes]);

  const schemeCategories = ["All", ...Array.from(new Set(schemes.map(scheme => scheme["Scheme Category"]).filter(Boolean)))];
  const animalFilters = ["All", "Pig", "Poultry"];

  // --- Effects: Dashboard General ---
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "analytics", "risk", "weather", "alerts", "schemes"].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      setLoadingRisk(true);
      // FETCH ALL RISK HISTORY, not just limit(1)
      const { data: riskData } = await supabase
        .from("risk_assessments")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });

      if (riskData && riskData.length > 0) {
        setRiskHistory(riskData as RiskAssessment[]);
        setSelectedRisk(riskData[0] as RiskAssessment); // Default to viewing the latest
      } else {
        setRiskHistory([]);
        setSelectedRisk(null);
      }

      const { data: profileData } = await supabase
        .from("farm_profiles")
        .select("farm_name, species, state, herd_size")
        .eq("farmer_id", user.id)
        .single();

      if (profileData) {
        setFarmProfile(profileData as FarmProfile);
      }
      setLoadingRisk(false);
    }
    loadData();
  }, [user]);

  // --- Helpers ---
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
      text = `Critical Alert: Your ${profile.species} farm in ${profile.state} is in a HIGH RISK category (${overallScore}%). With a herd size of ${profile.herd_size}, an outbreak could be devastating.`;
    } else if (isModerate) {
      bgColor = "bg-yellow-50 border-yellow-100";
      titleColor = "text-yellow-800";
      text = `Caution: Your ${profile.species} farm shows MODERATE RISK (${overallScore}%). While some practices are good, gaps in biosecurity for your herd of ${profile.herd_size} need attention.`;
    } else {
      text = `Excellent: Your ${profile.species} farm is currently in the SAFE ZONE (${overallScore}% risk). Your biosecurity measures for ${profile.herd_size} animals are effective.`;
    }
    return { text, bgColor, titleColor };
  };

  // --- Prepare History Chart Data ---
  const historyChartData = useMemo(() => {
    return riskHistory.map((entry) => {
      const score = calculateOverallRisk(entry);
      return {
        date: new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        fullDate: new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        score: score,
        id: entry.id
      };
    }).reverse(); // Recharts needs Oldest -> Newest for left-to-right graph
  }, [riskHistory]);

  async function handleVetRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setVetSubmitting(true);
    setVetMsg(null);
    const { error } = await supabase.from("vet_requests").insert({
      farmer_id: user.id,
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
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
                { key: "alerts", label: "Security", icon: "mdi:shield-lock" },
                { key: "schemes", label: "Schemes", icon: "mingcute:government-line" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
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
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:pig" className="w-6 h-6 text-yellow-600" />
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">This Month</span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">₹62,400</div>
                  <div className="text-sm text-neutral-600">Pig &amp; Poultry Sales</div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:thermometer" className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-blue-600 font-medium">Alerts</span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">2</div>
                  <div className="text-sm text-neutral-600">Weather &amp; Security</div>
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
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.type === "warning" ? "bg-yellow-50 border-yellow-400" : "bg-blue-50 border-blue-400"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon
                          icon={alert.icon}
                          className={`w-5 h-5 mt-0.5 ${alert.type === "warning" ? "text-yellow-600" : "text-blue-600"}`}
                        />
                        <div>
                          <h3 className="font-medium text-neutral-800 mb-1">{alert.title}</h3>
                          <p className="text-sm text-neutral-600">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Vet Request Form */}
              <Card>
                <div className="flex items-center mb-4">
                  <Icon icon="mdi:stethoscope" className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-medium text-neutral-800">Request Vet Visit</h2>
                </div>
                {vetMsg && <p className="text-sm mb-3 text-green-700">{vetMsg}</p>}
                <form className="space-y-3" onSubmit={handleVetRequest}>
                  <input
                    required
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Farm name / unit ID"
                    value={vetForm.farm_name}
                    onChange={(e) => setVetForm({ ...vetForm, farm_name: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      className="border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      value={vetForm.species}
                      onChange={(e) => setVetForm({ ...vetForm, species: e.target.value })}
                    >
                      <option value="Pig">Pig</option>
                      <option value="Poultry">Poultry</option>
                    </select>
                    <input
                      className="border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="District"
                      value={vetForm.district}
                      onChange={(e) => setVetForm({ ...vetForm, district: e.target.value })}
                    />
                    <select
                      className="border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      value={vetForm.urgency}
                      onChange={(e) => setVetForm({ ...vetForm, urgency: e.target.value })}
                    >
                      <option value="low">Low urgency</option>
                      <option value="medium">Medium</option>
                      <option value="high">High / emergency</option>
                    </select>
                  </div>
                  <textarea
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Symptoms / suspected disease / biosecurity breach"
                    value={vetForm.symptoms}
                    onChange={(e) => setVetForm({ ...vetForm, symptoms: e.target.value })}
                  />
                  <button
                    type="submit"
                    disabled={vetSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60"
                  >
                    {vetSubmitting ? "Submitting…" : "Send request to vet"}
                  </button>
                </form>
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

          {/* ========== TAB: RISK (UPDATED WITH HISTORY) ========== */}
          {activeTab === "risk" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              
              {/* Header Card */}
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
                  {/* 1. RISK HISTORY TREND CHART */}
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
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12 }} 
                            dy={10}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#9ca3af', fontSize: 12 }} 
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#f59e0b" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorScore)" 
                            name="Overall Risk (%)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* 2. SPLIT VIEW: HISTORY LIST + DETAILED VIEW */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN: History List */}
                    <div className="lg:col-span-4 space-y-4">
                      <h3 className="text-md font-semibold text-neutral-700 flex items-center gap-2 px-1">
                        <History className="w-4 h-4" />
                        Assessment Log
                      </h3>
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {riskHistory.map((item) => {
                          const score = calculateOverallRisk(item);
                          const isSelected = selectedRisk?.id === item.id;
                          return (
                            <div 
                              key={item.id}
                              onClick={() => setSelectedRisk(item)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-green-50 border-green-200 ring-1 ring-green-300 shadow-sm' 
                                  : 'bg-white border-neutral-100 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.created_at).toLocaleDateString("en-IN", { 
                                    day: "numeric", month: "short", year: "numeric" 
                                  })}
                                </div>
                                {isSelected && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Viewing</span>}
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Risk Score</p>
                                  <p className={`text-2xl font-bold ${
                                    score > 60 ? 'text-red-600' : score > 30 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {score}%
                                  </p>
                                </div>
                                <Icon icon="mdi:chevron-right" className={`w-5 h-5 ${isSelected ? 'text-green-600' : 'text-gray-300'}`} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Detailed View of Selected Assessment */}
                    <div className="lg:col-span-8">
                       {selectedRisk && (
                          <Card className="h-full border-l-4 border-l-green-500">
                              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                <div>
                                  <h3 className="text-xl font-bold text-neutral-800">Assessment Details</h3>
                                  <p className="text-sm text-neutral-500">
                                    Data from {new Date(selectedRisk.created_at).toLocaleDateString("en-IN", { 
                                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                   <p className="text-xs text-neutral-500 uppercase font-semibold">Overall Risk</p>
                                   <p className="text-3xl font-black text-neutral-800">{calculateOverallRisk(selectedRisk)}%</p>
                                </div>
                              </div>

                              {/* Donut Chart & Legend */}
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
                                     <Icon icon="mdi:shield-check" className={`w-8 h-8 ${
                                        calculateOverallRisk(selectedRisk) > 60 ? 'text-red-500' : calculateOverallRisk(selectedRisk) > 30 ? 'text-yellow-500' : 'text-green-500'
                                     }`} />
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

                              {/* Summary Box */}
                              {farmProfile && (
                                <div className={`p-4 rounded-lg border mb-6 ${
                                  generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).bgColor
                                }`}>
                                   <p className={`font-bold mb-1 ${
                                      generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).titleColor
                                   }`}>Analysis Summary</p>
                                   <p className="text-sm text-neutral-800">
                                      {generateDynamicSummary(calculateOverallRisk(selectedRisk), farmProfile).text}
                                   </p>
                                </div>
                              )}

                              {/* Recommendations */}
                              <div>
                                <h4 className="font-bold text-neutral-800 mb-3 flex items-center gap-2">
                                   <Icon icon="mdi:clipboard-list" className="text-green-600" />
                                   Actionable Recommendations
                                </h4>
                                <ul className="space-y-2">
                                  {selectedRisk.recommendations?.split("\n").filter((line) => line.trim().length > 0).map((line, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm text-neutral-700">
                                       <span className="flex-shrink-0 w-5 h-5 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                          {i + 1}
                                       </span>
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

          {/* ========== TAB: ANALYTICS ========== */}
          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="font-semibold text-neutral-800 mb-4">Market Price Trend (₹/kg)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pig" stroke="#10b981" name="Pig Meat" />
                        <Line type="monotone" dataKey="poultry" stroke="#f59e0b" name="Poultry" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-semibold text-neutral-800 mb-4">Revenue Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueDistribution}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {revenueDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ========== TAB: WEATHER ========== */}
          {activeTab === "weather" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-800">Rainfall Forecast (mm)</h3>
                  <Icon icon="mdi:weather-pouring" className="text-blue-500 w-6 h-6" />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rainfallTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="mm" fill="#3b82f6" name="Rainfall (mm)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ========== TAB: ALERTS ========== */}
          {activeTab === "alerts" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4">
              {securityAlerts.map((alert, i) => (
                <Card key={i}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        alert.level === "high"
                          ? "bg-red-100 text-red-600"
                          : alert.level === "medium"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      <Icon icon={alert.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">{alert.title}</h3>
                      <p className="text-sm text-neutral-600 mt-1">{alert.detail}</p>
                      <span
                        className={`inline-block mt-2 text-xs px-2 py-1 rounded border ${
                          alert.level === "high"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : alert.level === "medium"
                            ? "border-orange-200 text-orange-700 bg-orange-50"
                            : "border-yellow-200 text-yellow-700 bg-yellow-50"
                        }`}
                      >
                        {alert.level.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* ========== TAB: SCHEMES (INTEGRATED) ========== */}
          {activeTab === "schemes" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
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
                      <FilterIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                      <select
                        value={selectedSchemeCategory}
                        onChange={(e) => setSelectedSchemeCategory(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none transition-all duration-300 text-base"
                      >
                        {schemeCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
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
                          <option key={filter} value={filter}>
                            {filter === "All" ? "All Animals" : filter}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Active filters display */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {(selectedSchemeCategory !== "All" || selectedAnimalFilter !== "All" || schemeSearchTerm) && (
                        <div className="flex gap-2">
                             <button onClick={() => { setSelectedSchemeCategory("All"); setSelectedAnimalFilter("All"); setSchemeSearchTerm(""); }} className="text-xs text-red-500 hover:text-red-700 underline">Clear all</button>
                        </div>
                    )}
                </div>
              </div>

              <div className="mb-8 text-center">
                <p className="text-lg text-emerald-700 font-semibold">
                  {schemesLoading ? (
                    <span className="flex items-center justify-center gap-2"><Icon icon="mdi:loading" className="animate-spin" /> Loading Schemes from Database...</span>
                  ) : (
                     <>Found {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''}</>
                  )}
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {!schemesLoading && filteredSchemes.map((scheme, i) => (
                  <SchemeCard key={i} scheme={scheme} index={i} />
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Scheme Card Component (Adapted from GovtScheme.jsx) ---
function SchemeCard({ scheme, index }: { scheme: SchemeData; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="group bg-white rounded-3xl shadow-lg border border-emerald-100/50 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: `slideInUp 0.6s ease-out ${index * 100}ms both`
      }}
    >
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full text-xs font-semibold mb-3">
            {scheme["Scheme Category"] || "Farmer Support"}
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
            {scheme["Govt Scheme Name"]}
          </h2>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300 shadow hover:shadow-md border border-emerald-200"
        >
          {expanded ? 
            <ChevronUp size={20} className="text-emerald-700" /> : 
            <ChevronDown size={20} className="text-emerald-700" />
          }
        </button>
      </div>

      <div className="space-y-4">
        {renderSchemePreview(scheme)}
      </div>

      {expanded && (
        <div className="mt-8 pt-8 border-t border-emerald-200/50 space-y-6 animate-fadeIn">
          {renderSchemeFullInfo(scheme)}

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href={scheme["Website Link"]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Apply Now 
              <ExternalLink size={20} className="flex-shrink-0" />
            </a>

            <button className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Get Help
              <HelpCircle size={20} className="flex-shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderSchemePreview(scheme: SchemeData) {
  const previewFields = [
    "Scheme Description",
    "Ministry / Department Name",
    "Benefits Provided",
    "Eligibility Requirements",
    "How To Apply",
  ];

  return previewFields.map((field) =>
    scheme[field] ? (
      <div 
        key={field} 
        className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100/70 hover:border-emerald-200 transition-all duration-300 group hover:shadow-sm"
      >
        <p className="font-bold text-emerald-800 text-xs uppercase tracking-wide mb-2">
          {field}
        </p>
        <p className="text-gray-700 leading-relaxed text-sm line-clamp-3 group-hover:line-clamp-none transition-all">
          {scheme[field]}
        </p>
      </div>
    ) : null
  ).filter(Boolean);
}

function renderSchemeFullInfo(scheme: SchemeData) {
  const fields = [
    "Required Documents",
    "Application Start Date",
    "Last date",
    "AI Overview",
  ];

  return fields.map((field) =>
    scheme[field] ? (
      <div 
        key={field} 
        className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100/70 hover:border-blue-200 transition-all duration-300 group hover:shadow-sm"
      >
        <p className="font-bold text-blue-800 text-xs uppercase tracking-wide mb-2">
          {field}
        </p>
        <p className="text-gray-700 leading-relaxed text-sm">
          {scheme[field]}
        </p>
      </div>
    ) : null
  ).filter(Boolean);
}