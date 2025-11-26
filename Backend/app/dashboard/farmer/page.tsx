"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
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
} from "recharts";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

// --- Types ---
type LatestRisk = {
  id: string;
  farmer_id: string;
  farm_profile_id: string | null;
  biosecurity_score: number; // Higher is better usually, but for risk calc we invert it
  disease_risk_score: number; // Higher is worse
  infrastructure_score: number;
  climate_risk_score: number; // Higher is worse
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
    "overview" | "analytics" | "risk" | "weather" | "alerts" | "schemes"
  >("overview");

  // --- State: Risk & Profile ---
  const [latestRisk, setLatestRisk] = useState<LatestRisk | null>(null);
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

  const recentSchemes = [
    {
      id: "ps-1",
      name: "Pig Development Programme",
      category: "Pig",
      deadline: "2025-12-31",
      status: "eligible",
      amount: "Up to ₹50,000",
    },
    {
      id: "ps-2",
      name: "Poultry Venture Capital Fund",
      category: "Poultry",
      deadline: "2025-11-15",
      status: "applied",
      amount: "Up to ₹25 lakh",
    },
    {
      id: "ps-3",
      name: "Biosecurity Infrastructure Support",
      category: "Pig & Poultry",
      deadline: "2025-10-20",
      status: "eligible",
      amount: "Variable",
    },
  ];

  const weatherAlerts = [
    {
      type: "warning",
      title: "Heat Stress Risk (Poultry)",
      description:
        "Increase ventilation and provide cool water to reduce mortality risk in the next 48 hours",
      icon: "mdi:weather-sunny-alert",
    },
    {
      type: "info",
      title: "Rainfall Expected",
      description:
        "Secure pig housing and improve drainage to avoid flooding in pens",
      icon: "mdi:weather-pouring",
    },
  ];

  const securityAlerts = [
    {
      level: "high",
      title: "Fake Vaccine Offers",
      detail:
        "Beware of unverified ASF or AI vaccines. Buy only from licensed suppliers.",
      icon: "mdi:shield-alert",
    },
    {
      level: "medium",
      title: "Scam Hatchery Listings",
      detail:
        "Cross-verify hatchery registrations and batch certificates before payments.",
      icon: "mdi:alert-decagram",
    },
    {
      level: "low",
      title: "Counterfeit Feed Additives",
      detail:
        "Check FSSAI/FDA labels and batch numbers. Avoid bulk prepayments.",
      icon: "mdi:alert",
    },
  ];

  const tips = [
    {
      title: "Biosecurity First",
      description:
        "Footbaths, visitor logs, and pen-specific gear reduce disease risk significantly.",
      icon: "mdi:shield-check",
    },
    {
      title: "Heat Mitigation",
      description:
        "Shade nets and foggers reduce poultry heat stress during summer.",
      icon: "mdi:weather-sunny",
    },
    {
      title: "Feed Efficiency",
      description:
        "Track FCR (feed conversion ratio) weekly for pigs and broilers.",
      icon: "mdi:food-drumstick",
    },
  ];

  // --- Effects ---
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "overview" ||
      tab === "analytics" ||
      tab === "risk" ||
      tab === "weather" ||
      tab === "alerts" ||
      tab === "schemes"
    ) {
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
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (riskData && riskData.length > 0) {
        setLatestRisk(riskData[0] as LatestRisk);
      } else {
        setLatestRisk(null);
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

  // --- Helper: Calculate Overall Risk Score ---
  const calculateOverallRisk = (risk: LatestRisk) => {
    // Logic: (Disease + Climate + (100 - Biosecurity)) / 3
    // This assumes Disease/Climate are "High = Bad" and Biosecurity is "High = Good"
    const score = Math.round(
      (risk.disease_risk_score +
        risk.climate_risk_score +
        (100 - risk.biosecurity_score)) /
        3
    );
    return Math.min(100, Math.max(0, score)); // Clamp 0-100
  };

  // --- Helper: Generate Dynamic Summary ---
  const generateDynamicSummary = (
    overallScore: number,
    profile: FarmProfile
  ) => {
    const isCritical = overallScore > 60;
    const isModerate = overallScore > 30 && overallScore <= 60;

    let text = "";
    let bgColor = "bg-green-50 border-green-100";
    let titleColor = "text-green-800";

    if (isCritical) {
      bgColor = "bg-red-50 border-red-100";
      titleColor = "text-red-800";
      text = `Critical Alert: Your ${profile.species} farm in ${profile.state} is in a HIGH RISK category (${overallScore}%). With a herd size of ${profile.herd_size}, an outbreak could be devastating. Immediate action on biosecurity is required.`;
    } else if (isModerate) {
      bgColor = "bg-yellow-50 border-yellow-100";
      titleColor = "text-yellow-800";
      text = `Caution: Your ${profile.species} farm shows MODERATE RISK (${overallScore}%). While some practices are good, gaps in biosecurity for your herd of ${profile.herd_size} need attention to prevent seasonal diseases.`;
    } else {
      text = `Excellent: Your ${profile.species} farm is currently in the SAFE ZONE (${overallScore}% risk). Your biosecurity measures for ${profile.herd_size} animals are effective. Keep up the good work!`;
    }

    return { text, bgColor, titleColor };
  };

  // --- Helper: Get Color based on Risk ---
  const getRiskColor = (score: number) => {
    if (score > 60) return "#ef4444"; // Red
    if (score > 30) return "#f59e0b"; // Orange/Yellow
    return "#10b981"; // Green
  };

  // --- Handlers ---
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
      setVetMsg(
        "Vet request submitted. District vet officer will contact you soon."
      );
      setVetForm({
        farm_name: "",
        species: "Pig",
        district: "",
        symptoms: "",
        urgency: "medium",
      });
    }
    setVetSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Icon
          icon="mdi:loading"
          className="w-8 h-8 animate-spin text-green-600 mb-4"
        />
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
                Welcome back,{" "}
                <span className="font-medium text-green-600">
                  {user?.displayName || "Farmer"}
                </span>
              </h1>
              <p className="text-neutral-600">
                Your pig &amp; poultry dashboard with live insights and vet
                support.
              </p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: "overview",
                  label: "Overview",
                  icon: "mdi:view-dashboard",
                },
                {
                  key: "analytics",
                  label: "Analytics",
                  icon: "mdi:chart-line",
                },
                { key: "risk", label: "Risk", icon: "mdi:alert-decagram" },
                {
                  key: "weather",
                  label: "Weather",
                  icon: "mdi:weather-cloudy",
                },
                { key: "alerts", label: "Security", icon: "mdi:shield-lock" },
                {
                  key: "schemes",
                  label: "Schemes",
                  icon: "mingcute:government-line",
                },
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

          {/* ========== OVERVIEW ========== */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mingcute:government-fill"
                        className="w-6 h-6 text-green-600"
                      />
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      Active
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    3
                  </div>
                  <div className="text-sm text-neutral-600">
                    Eligible Schemes
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:pig"
                        className="w-6 h-6 text-yellow-600"
                      />
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">
                      This Month
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    ₹62,400
                  </div>
                  <div className="text-sm text-neutral-600">
                    Pig &amp; Poultry Sales
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:thermometer"
                        className="w-6 h-6 text-blue-600"
                      />
                    </div>
                    <span className="text-sm text-blue-600 font-medium">
                      Alerts
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    2
                  </div>
                  <div className="text-sm text-neutral-600">
                    Weather &amp; Security
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:chart-line"
                        className="w-6 h-6 text-emerald-600"
                      />
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">
                      +10%
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    86%
                  </div>
                  <div className="text-sm text-neutral-600">
                    Productivity Score
                  </div>
                </Card>
              </div>

              {/* Weather Alerts Summary */}
              <Card>
                <div className="flex items-center mb-6">
                  <Icon
                    icon="mdi:weather-cloudy"
                    className="w-6 h-6 text-blue-500 mr-2"
                  />
                  <h2 className="text-xl font-medium text-neutral-800">
                    Weather Alerts
                  </h2>
                </div>
                <div className="space-y-4">
                  {weatherAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.type === "warning"
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-blue-50 border-blue-400"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon
                          icon={alert.icon}
                          className={`w-5 h-5 mt-0.5 ${
                            alert.type === "warning"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}
                        />
                        <div>
                          <h3 className="font-medium text-neutral-800 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Vet Request Form */}
              <Card>
                <div className="flex items-center mb-4">
                  <Icon
                    icon="mdi:stethoscope"
                    className="w-6 h-6 text-green-600 mr-2"
                  />
                  <h2 className="text-xl font-medium text-neutral-800">
                    Request Vet Visit
                  </h2>
                </div>
                {vetMsg && (
                  <p className="text-sm mb-3 text-green-700">{vetMsg}</p>
                )}
                <form className="space-y-3" onSubmit={handleVetRequest}>
                  <input
                    required
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Farm name / unit ID"
                    value={vetForm.farm_name}
                    onChange={(e) =>
                      setVetForm({ ...vetForm, farm_name: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      className="border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      value={vetForm.species}
                      onChange={(e) =>
                        setVetForm({ ...vetForm, species: e.target.value })
                      }
                    >
                      <option value="Pig">Pig</option>
                      <option value="Poultry">Poultry</option>
                    </select>
                    <input
                      className="border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="District"
                      value={vetForm.district}
                      onChange={(e) =>
                        setVetForm({ ...vetForm, district: e.target.value })
                      }
                    />
                    <select
                      className="border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                      value={vetForm.urgency}
                      onChange={(e) =>
                        setVetForm({ ...vetForm, urgency: e.target.value })
                      }
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
                    onChange={(e) =>
                      setVetForm({ ...vetForm, symptoms: e.target.value })
                    }
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
                  <Icon
                    icon="mdi:lightbulb"
                    className="w-6 h-6 text-yellow-500 mr-2"
                  />
                  <h2 className="text-xl font-medium text-neutral-800">
                    Productivity Tips
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tips.map((t, i) => (
                    <div key={i} className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Icon
                            icon={t.icon}
                            className="w-5 h-5 text-green-600"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-neutral-800 mb-1">
                            {t.title}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {t.description}
                          </p>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Icon
                      icon="mdi:alert-decagram"
                      className="w-6 h-6 text-orange-600 mr-2"
                    />
                    <h2 className="text-xl font-medium text-neutral-800">
                      Farm Risk Snapshot
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/farmer/risk-form")}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Re-run assessment
                  </button>
                </div>

                {loadingRisk && (
                  <p className="text-sm text-neutral-500">
                    Loading latest assessment…
                  </p>
                )}

                {!loadingRisk && !latestRisk && (
                  <p className="text-sm text-neutral-500">
                    You haven&apos;t filled the risk checklist yet. Click{" "}
                    <span className="font-medium">Re-run assessment</span> to
                    start.
                  </p>
                )}

                {!loadingRisk && latestRisk && (
                  <div className="space-y-8">
                    {/* NEW: Overall Risk Percentage + Safe Ranges */}
                    <div className="flex flex-col md:flex-row gap-6 items-center bg-gray-50 p-6 rounded-xl border border-gray-100">
                      {/* Left: Donut Chart for Overall Risk */}
                      <div className="relative w-40 h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  value: calculateOverallRisk(latestRisk),
                                  color: getRiskColor(
                                    calculateOverallRisk(latestRisk)
                                  ),
                                },
                                {
                                  value: 100 - calculateOverallRisk(latestRisk),
                                  color: "#e5e7eb",
                                },
                              ]}
                              innerRadius={50}
                              outerRadius={70}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                            >
                              <Cell
                                key="risk"
                                fill={getRiskColor(
                                  calculateOverallRisk(latestRisk)
                                )}
                              />
                              <Cell key="rest" fill="#e5e7eb" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span
                            className="text-2xl font-bold"
                            style={{
                              color: getRiskColor(
                                calculateOverallRisk(latestRisk)
                              ),
                            }}
                          >
                            {calculateOverallRisk(latestRisk)}%
                          </span>
                          <span className="text-xs text-neutral-500 font-medium uppercase">
                            Overall Risk
                          </span>
                        </div>
                      </div>

                      {/* Right: Safe Score Ranges & Legend */}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-semibold text-neutral-800">
                          Risk Level Breakdown
                        </h3>
                        <p className="text-sm text-neutral-600 mb-3">
                          This score is calculated based on your biosecurity
                          practices, disease pressure, and infrastructure.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-green-100">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div>
                              <p className="text-xs font-bold text-neutral-700">
                                Safe Zone
                              </p>
                              <p className="text-xs text-neutral-500">
                                0% - 30%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-yellow-100">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div>
                              <p className="text-xs font-bold text-neutral-700">
                                Moderate
                              </p>
                              <p className="text-xs text-neutral-500">
                                31% - 60%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-red-100">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div>
                              <p className="text-xs font-bold text-neutral-700">
                                Critical
                              </p>
                              <p className="text-xs text-neutral-500">
                                61% - 100%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Chart & Dynamic Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-72">
                        <p className="text-sm font-semibold text-neutral-700 mb-2">
                          Detailed Factor Analysis
                        </p>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: "Biosecurity Gaps",
                                value: 100 - latestRisk.biosecurity_score,
                              },
                              {
                                name: "Disease Risk",
                                value: latestRisk.disease_risk_score,
                              },
                              {
                                name: "Infra. Gaps",
                                value: 100 - latestRisk.infrastructure_score,
                              },
                              {
                                name: "Climate Risk",
                                value: latestRisk.climate_risk_score,
                              },
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              name="Risk Level"
                              fill="#6b7280"
                            >
                              {/* Dynamic bar colors */}
                              {[
                                100 - latestRisk.biosecurity_score,
                                latestRisk.disease_risk_score,
                                100 - latestRisk.infrastructure_score,
                                latestRisk.climate_risk_score,
                              ].map((val, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={getRiskColor(val)}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-4">
                        {farmProfile ? (
                          (() => {
                            const { text, bgColor, titleColor } =
                              generateDynamicSummary(
                                calculateOverallRisk(latestRisk),
                                farmProfile
                              );
                            return (
                              <div
                                className={`p-4 rounded-lg border ${bgColor}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p
                                    className={`text-sm font-bold uppercase ${titleColor}`}
                                  >
                                    {farmProfile.species} Farm •{" "}
                                    {farmProfile.state}
                                  </p>
                                  <span className="text-xs bg-white/50 px-2 py-1 rounded text-neutral-600">
                                    Herd: {farmProfile.herd_size}
                                  </span>
                                </div>
                                <p className="text-sm text-neutral-800 font-medium">
                                  {text}
                                </p>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <p className="text-sm text-neutral-600">
                              {latestRisk.summary}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-semibold text-neutral-500 mb-1">
                            Recommended actions
                          </p>
                          <ul className="text-sm text-neutral-700 list-disc pl-5 space-y-1">
                            {latestRisk.recommendations
                              ?.split("\n")
                              .filter((line) => line.trim().length > 0)
                              .map((line, i) => (
                                <li key={i}>{line.replace(/^- /, "")}</li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* ========== TAB: ANALYTICS ========== */}
          {activeTab === "analytics" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="font-semibold text-neutral-800 mb-4">
                    Market Price Trend (₹/kg)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="pig"
                          stroke="#10b981"
                          name="Pig Meat"
                        />
                        <Line
                          type="monotone"
                          dataKey="poultry"
                          stroke="#f59e0b"
                          name="Poultry"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-semibold text-neutral-800 mb-4">
                    Revenue Distribution
                  </h3>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-800">
                    Rainfall Forecast (mm)
                  </h3>
                  <Icon
                    icon="mdi:weather-pouring"
                    className="text-blue-500 w-6 h-6"
                  />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
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
                      <h3 className="font-semibold text-neutral-800">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-1">
                        {alert.detail}
                      </p>
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

          {/* ========== TAB: SCHEMES ========== */}
          {activeTab === "schemes" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {recentSchemes.map((scheme) => (
                <Card key={scheme.id}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">
                      {scheme.category}
                    </span>
                    {scheme.status === "applied" && (
                      <Icon
                        icon="mdi:check-circle"
                        className="text-blue-500"
                      />
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2 h-12 line-clamp-2">
                    {scheme.name}
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-600 mb-4">
                    <div className="flex justify-between">
                      <span>Benefit:</span>
                      <span className="font-medium text-neutral-800">
                        {scheme.amount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span className="text-red-500">{scheme.deadline}</span>
                    </div>
                  </div>
                  <button className="w-full py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                    {scheme.status === "applied"
                      ? "View Status"
                      : "Apply Now"}
                  </button>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}