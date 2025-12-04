"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
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
  equipmentHygiene: "none" | "occasional" | "strict"; // From BiosecurityForm
  fencing: "none" | "partial" | "secure"; // From BiosecurityForm (Unauthorized access)

  // --- Section 3: Operations & Environment (NEW SECTION) ---
  cleaningFreq: "weekly" | "twice_week" | "daily";
  
  // NEW FROM UPLOADED FILES:
  ventilation: "poor" | "moderate" | "good"; // From EnvironmentalForm
  tempControl: "no" | "yes"; // From EnvironmentalForm (Pig/Poultry Temp)
  feedStorage: "open" | "sealed_dry"; // From FeedNutritionForm
  waterSource: "open_pond" | "borewell" | "municipal"; // Critical addition for accuracy
  recordKeeping: "none" | "basic" | "detailed"; // From OperationalForm

  // --- Section 4: Health ---
  vaccination: "none" | "occasional" | "regular";
  recentMortality: "no" | "yes"; // From AnimalHealthForm (Sudden deaths)
  mortalityNotes: string; // From AnimalHealthForm (Visible wounds, strange behavior)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4"
          />
          <p className="text-neutral-600">Loading your session…</p>
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

      setSuccessMsg("Risk assessment completed successfully.");
      
      setTimeout(() => {
        router.push("/dashboard/farmer?tab=risk");
      }, 800);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:clipboard-text-outline"
                  className="w-6 h-6 text-green-600"
                />
                <div>
                  <h1 className="text-xl font-semibold text-neutral-800">
                    Comprehensive Risk Checklist
                  </h1>
                  <p className="text-sm text-neutral-600">
                    Complete this form to get an accurate analysis of your farm's health.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/dashboard/farmer")}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                ← Back to dashboard
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* --- SECTION 1: FARM DETAILS --- */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b pb-2">
                  1. Farm Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Farm Name</label>
                    <input
                      type="text"
                      value={form.farmName}
                      onChange={updateField("farmName")}
                      placeholder="e.g. Green Valley Farm"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Species</label>
                    <select
                      value={form.species}
                      onChange={updateField("species")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="pig">Pig</option>
                      <option value="poultry">Poultry</option>
                      <option value="mixed">Mixed (Pig + Poultry)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Herd/Flock Size</label>
                    <input
                      type="number"
                      min={0}
                      value={form.herdSize}
                      onChange={updateField("herdSize")}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-1">State</label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={updateField("state")}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-700 mb-1">District</label>
                      <input
                        type="text"
                        value={form.district}
                        onChange={updateField("district")}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* --- SECTION 2: BIOSECURITY --- */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b pb-2">
                  2. Biosecurity Infrastructure
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Housing Type</label>
                    <select
                      value={form.housing}
                      onChange={updateField("housing")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="open">Open / Backyard (Low security)</option>
                      <option value="semi">Semi-covered sheds</option>
                      <option value="closed">Closed / Controlled Environment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Perimeter Fencing</label>
                    <select
                      value={form.fencing}
                      onChange={updateField("fencing")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="none">No fencing (Open access)</option>
                      <option value="partial">Partial / Damaged fencing</option>
                      <option value="secure">Secure perimeter (No stray animals)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Visitor Control</label>
                    <select
                      value={form.visitors}
                      onChange={updateField("visitors")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="none">Anyone can enter</option>
                      <option value="log">Logbook only</option>
                      <option value="log_footbath_ppe">Logbook + Footbath + PPE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Vehicle & Equipment Hygiene</label>
                    <select
                      value={form.equipmentHygiene}
                      onChange={updateField("equipmentHygiene")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="none">Shared equipment, no cleaning</option>
                      <option value="occasional">Cleaned occasionally with water</option>
                      <option value="strict">Disinfected before every entry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Dead Animal Disposal</label>
                    <select
                      value={form.deadDisposal}
                      onChange={updateField("deadDisposal")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="open_pit">Throw in open / nearby field</option>
                      <option value="covered_pit">Deep burial / Covered pit</option>
                      <option value="incineration">Incineration (Burned)</option>
                    </select>
                  </div>

                   <div>
                    <label className="block text-sm text-neutral-700 mb-1">Wild Bird / Stray Contact</label>
                    <select
                      value={form.wildBirdContact}
                      onChange={updateField("wildBirdContact")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="high">High (Birds enter sheds easily)</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low (Nets installed)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* --- SECTION 3: OPERATIONS & ENVIRONMENT (NEW) --- */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b pb-2">
                  3. Operations & Environment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Ventilation Quality</label>
                    <select
                      value={form.ventilation}
                      onChange={updateField("ventilation")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="poor">Poor (Smell of ammonia/stuffiness)</option>
                      <option value="moderate">Average airflow</option>
                      <option value="good">Good (Fans/Cross-ventilation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Temperature Control</label>
                    <select
                      value={form.tempControl}
                      onChange={updateField("tempControl")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="no">No specific control (Natural)</option>
                      <option value="yes">Yes (Heaters/Coolers/Foggers)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Feed Storage</label>
                    <select
                      value={form.feedStorage}
                      onChange={updateField("feedStorage")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="open">Open bags (Risk of moisture/rats)</option>
                      <option value="sealed_dry">Sealed containers / Silos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Water Source</label>
                    <select
                      value={form.waterSource}
                      onChange={updateField("waterSource")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="open_pond">Open pond / Canal</option>
                      <option value="municipal">Municipal / Tanker</option>
                      <option value="borewell">Deep Borewell (Safest)</option>
                    </select>
                  </div>

                   <div>
                    <label className="block text-sm text-neutral-700 mb-1">Cleaning Frequency</label>
                    <select
                      value={form.cleaningFreq}
                      onChange={updateField("cleaningFreq")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="weekly">Once a week or less</option>
                      <option value="twice_week">2-3 times a week</option>
                      <option value="daily">Daily cleaning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Record Keeping</label>
                    <select
                      value={form.recordKeeping}
                      onChange={updateField("recordKeeping")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="none">No written records</option>
                      <option value="basic">Basic notes (Sales/Mortality)</option>
                      <option value="detailed">Detailed (Feed, Meds, Visitors)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* --- SECTION 4: HEALTH STATUS --- */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide border-b pb-2">
                  4. Current Health Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Vaccination Schedule</label>
                    <select
                      value={form.vaccination}
                      onChange={updateField("vaccination")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="none">No regular vaccination</option>
                      <option value="occasional">Only during outbreaks</option>
                      <option value="regular">Regular (As per Vet schedule)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">Sudden Deaths (Last 30 Days)</label>
                    <select
                      value={form.recentMortality}
                      onChange={updateField("recentMortality")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-neutral-700 mb-1">
                      Health Observations (Wounds, Strange Behavior, Diarrhea)
                    </label>
                    <textarea
                      rows={3}
                      value={form.mortalityNotes}
                      onChange={updateField("mortalityNotes")}
                      placeholder="E.g., 5 birds stopped eating, 2 pigs have skin redness..."
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Messages & Submit */}
              {errorMsg && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                  {successMsg}
                </div>
              )}

              <div className="flex items-center justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting && (
                    <Icon
                      icon="mdi:loading"
                      className="w-4 h-4 animate-spin mr-2"
                    />
                  )}
                  {submitting ? "Analyzing..." : "Calculate Risk Score"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
