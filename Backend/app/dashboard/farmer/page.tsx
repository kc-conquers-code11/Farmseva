"use client";

import React, { useState } from "react";
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
} from "recharts";

import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function FarmerDashboardPage() {
  const { user, loading } = useSupabaseUser();

  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "risk" | "weather" | "alerts" | "schemes"
  >("overview");

  // ---------- Demo analytics data (same as before) ----------
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

  const productivityData = [
    { animal: "Pig", current: 82, target: 100 },
    { animal: "Poultry", current: 90, target: 100 },
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

  const [riskForm, setRiskForm] = useState({
    animal: "Pig",
    state: "Punjab",
    season: "Summer",
  });
  const riskScores = { climate: 0.58, pest: 0.33, price: 0.52 };

  // ---------- NEW: Vet Request form state ----------
  const [vetForm, setVetForm] = useState({
    farm_name: "",
    species: "Pig",
    district: "",
    symptoms: "",
    urgency: "medium",
  });
  const [vetSubmitting, setVetSubmitting] = useState(false);
  const [vetMsg, setVetMsg] = useState<string | null>(null);

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
      console.error(error);
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

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4"
          />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
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

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "overview", label: "Overview", icon: "mdi:view-dashboard" },
                { key: "analytics", label: "Analytics", icon: "mdi:chart-line" },
                { key: "risk", label: "Risk", icon: "mdi:alert-decagram" },
                { key: "weather", label: "Weather", icon: "mdi:weather-cloudy" },
                { key: "alerts", label: "Security", icon: "mdi:shield-lock" },
                {
                  key: "schemes",
                  label: "Schemes",
                  icon: "mingcute:government-line",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(tab.key as typeof activeTab)
                  }
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

          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
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

              {/* Weather Alerts */}
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

              {/* NEW: Request Vet Visit */}
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

              {/* Tips */}
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

          {/* ========== BAQI TABS (analytics, weather, risk, alerts, schemes) – 
             */}
        </div>
      </div>
    </div>
  );
}
