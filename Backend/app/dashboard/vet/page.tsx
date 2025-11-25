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
} from "recharts";

import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

export default function VetDashboardPage() {
  const { user, loading } = useSupabaseUser();
  const [activeTab, setActiveTab] = useState<
    "overview" | "outbreaks" | "visits" | "training"
  >("overview");

  // ---------- Mock data (later connect to Supabase / APIs) ----------

  const openCases = [
    {
      id: "ASF-2025-001",
      farm: "Green Valley Pig Unit",
      species: "Pig",
      district: "Pune",
      status: "under-investigation",
      severity: "high",
      reported: "2025-11-20",
    },
    {
      id: "AI-2025-014",
      farm: "Sunrise Layer Farm",
      species: "Poultry",
      district: "Nashik",
      status: "sample-collected",
      severity: "medium",
      reported: "2025-11-18",
    },
    {
      id: "COCC-2025-031",
      farm: "Happy Broilers",
      species: "Poultry",
      district: "Satara",
      status: "treatment-started",
      severity: "low",
      reported: "2025-11-17",
    },
  ];

  const visitScheduleToday = [
    {
      farm: "Green Valley Pig Unit",
      time: "10:30 AM",
      purpose: "ASF clinical exam & sample collection",
      priority: "high",
    },
    {
      farm: "Sunrise Layer Farm",
      time: "01:00 PM",
      purpose: "Avian influenza response drill",
      priority: "medium",
    },
    {
      farm: "Sai Poultry Farm",
      time: "04:15 PM",
      purpose: "Routine biosecurity audit",
      priority: "low",
    },
  ];

  const outbreakTrendData = [
    { month: "Jul", pig: 2, poultry: 1 },
    { month: "Aug", pig: 1, poultry: 3 },
    { month: "Sep", pig: 3, poultry: 2 },
    { month: "Oct", pig: 4, poultry: 3 },
    { month: "Nov", pig: 2, poultry: 4 },
  ];

  const checklistStats = [
    { label: "Biosecurity audits completed", value: 32, total: 40 },
    { label: "Farms with valid vaccination records", value: 28, total: 35 },
    { label: "Farms using digital logs", value: 21, total: 35 },
  ];

  const trainingModules = [
    {
      id: "TRN-ASF",
      title: "Field management of African Swine Fever (ASF)",
      duration: "35 min",
      status: "in-progress",
      tag: "Pig",
    },
    {
      id: "TRN-AI",
      title: "Rapid response to Avian Influenza in backyard poultry",
      duration: "25 min",
      status: "pending",
      tag: "Poultry",
    },
    {
      id: "TRN-BIO",
      title: "Scoring farm-level biosecurity on FarmSeva",
      duration: "18 min",
      status: "completed",
      tag: "Both",
    },
  ];

  // ---------- Loading / role guard ----------

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4"
          />
          <p className="text-neutral-600">Loading vet session…</p>
        </div>
      </div>
    );
  }

  // Only vets allowed (by role OR fixed email)
  const isVet =
    !!user &&
    (user.role === "vet" || user.email === "vet@farmseva.in");

  if (!isVet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center">
          <Card>
            <div className="flex flex-col items-center gap-3">
              <Icon
                icon="mdi:shield-lock"
                className="w-8 h-8 text-red-500"
              />
              <h2 className="text-lg font-semibold text-neutral-800">
                Access Restricted
              </h2>
              <p className="text-sm text-neutral-600 text-center max-w-sm">
                This dashboard is only available for veterinary officers.
                Please login with a vet account or contact your admin.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-light text-neutral-800 mb-2">
                Vet field console,&nbsp;
                <span className="font-medium text-green-600">
                  {user.displayName || "Veterinary Officer"}
                </span>
              </h1>
              <p className="text-neutral-600 text-sm md:text-base">
                Track outbreaks, farm visits and biosecurity compliance for pig
                &amp; poultry units in your district.
              </p>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "overview", label: "Overview", icon: "mdi:view-dashboard" },
                { key: "outbreaks", label: "Outbreaks", icon: "mdi:virus" },
                { key: "visits", label: "Visits", icon: "mdi:map-marker-path" },
                { key: "training", label: "Training", icon: "mdi:school-outline" },
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

          {/* --------- TAB: OVERVIEW --------- */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:alert-octagram"
                        className="w-6 h-6 text-red-600"
                      />
                    </div>
                    <span className="text-xs text-red-600 font-medium">
                      Priority
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    {openCases.length}
                  </div>
                  <p className="text-xs text-neutral-500">
                    Active disease investigations
                  </p>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:clipboard-list"
                        className="w-6 h-6 text-blue-600"
                      />
                    </div>
                  <span className="text-xs text-blue-600 font-medium">
                      Visits today
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    {visitScheduleToday.length}
                  </div>
                  <p className="text-xs text-neutral-500">
                    Scheduled farm visits
                  </p>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:shield-check-outline"
                        className="w-6 h-6 text-emerald-600"
                      />
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">
                      Biosecurity
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    80%
                  </div>
                  <p className="text-xs text-neutral-500">
                    Farms passing last audit
                  </p>
                </Card>

                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Icon
                        icon="mdi:school-outline"
                        className="w-6 h-6 text-amber-600"
                      />
                    </div>
                    <span className="text-xs text-amber-600 font-medium">
                      Training
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-800 mb-1">
                    {
                      trainingModules.filter((m) => m.status === "completed")
                        .length
                    }
                    /{trainingModules.length}
                  </div>
                  <p className="text-xs text-neutral-500">
                    e-modules completed
                  </p>
                </Card>
              </div>

              {/* Outbreak trend chart */}
              <Card>
                <div className="flex items-center mb-4">
                  <Icon
                    icon="mdi:chart-line"
                    className="w-5 h-5 text-green-600 mr-2"
                  />
                  <h2 className="text-lg font-medium text-neutral-800">
                    Monthly suspected outbreaks (pig &amp; poultry)
                  </h2>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={outbreakTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="pig"
                        name="Pig cases"
                        stroke="#f97316"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="poultry"
                        name="Poultry cases"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Checklist progress */}
              <Card>
                <div className="flex items-center mb-4">
                  <Icon
                    icon="mdi:clipboard-check-outline"
                    className="w-5 h-5 text-emerald-600 mr-2"
                  />
                  <h2 className="text-lg font-medium text-neutral-800">
                    Field checklist progress
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {checklistStats.map((item) => {
                    const pct = Math.round(
                      (item.value / item.total) * 100
                    );
                    return (
                      <div
                        key={item.label}
                        className="p-4 rounded-lg bg-green-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-neutral-800">
                            {item.label}
                          </p>
                          <span className="text-xs text-neutral-500">
                            {item.value}/{item.total}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 rounded">
                          <div
                            className="h-2 rounded bg-emerald-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-500">
                          Connect this with digital audit forms in the next
                          phase.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* --------- TAB: OUTBREAKS --------- */}
          {activeTab === "outbreaks" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="mdi:virus"
                      className="w-5 h-5 text-red-600"
                    />
                    <h2 className="text-lg font-medium text-neutral-800">
                      Active outbreak investigations
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500">
                    In real deployment this reads from an `outbreak_reports`
                    table
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-3 py-2 font-medium text-neutral-700">
                          Case ID
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-neutral-700">
                          Farm
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-neutral-700">
                          Species
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-neutral-700">
                          District
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-neutral-700">
                          Status
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-neutral-700">
                          Reported
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {openCases.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-100 hover:bg-slate-50/60"
                        >
                          <td className="px-3 py-2 text-neutral-800">
                            {c.id}
                          </td>
                          <td className="px-3 py-2 text-neutral-800">
                            {c.farm}
                          </td>
                          <td className="px-3 py-2 text-neutral-700">
                            {c.species}
                          </td>
                          <td className="px-3 py-2 text-neutral-700">
                            {c.district}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                c.severity === "high"
                                  ? "bg-red-50 text-red-700"
                                  : c.severity === "medium"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {c.status.replace("-", " ")}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-neutral-500 text-xs">
                            {c.reported}
                          </td>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Card>
                <div className="flex items-center mb-4">
                  <Icon
                    icon="mdi:map-marker-path"
                    className="w-5 h-5 text-blue-600 mr-2"
                  />
                  <h2 className="text-lg font-medium text-neutral-800">
                    Today&apos;s visit plan
                  </h2>
                </div>
                <div className="space-y-3">
                  {visitScheduleToday.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium text-neutral-800">
                          {v.farm}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {v.purpose}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-700">
                          {v.time}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                            v.priority === "high"
                              ? "bg-red-50 text-red-700"
                              : v.priority === "medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {v.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-neutral-400">
                  Next phase: integrate this with GPS check-in and digital
                  visit forms.
                </p>
              </Card>
            </motion.div>
          )}

          {/* --------- TAB: TRAINING --------- */}
          {activeTab === "training" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Card>
                <div className="flex items-center mb-4">
                  <Icon
                    icon="mdi:school-outline"
                    className="w-5 h-5 text-amber-600 mr-2"
                  />
                  <h2 className="text-lg font-medium text-neutral-800">
                    Vet training modules
                  </h2>
                </div>
                <div className="space-y-3">
                  {trainingModules.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium text-neutral-800">
                          {m.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Tag: {m.tag} • {m.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500">
                          {m.duration}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                            m.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : m.status === "in-progress"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {m.status.replace("-", " ")}
                        </span>
                        <button className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700">
                          Open module
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
