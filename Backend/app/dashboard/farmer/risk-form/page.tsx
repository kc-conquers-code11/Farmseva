//fixed risk asessment and farmer dashboard
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import Navbar from "@/app/components/Navbar";
import Card from "@/app/components/Card";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

type FormState = {
  farmName: string;
  species: "pig" | "poultry" | "mixed";
  herdSize: string;
  state: string;
  district: string;

  housing: "open" | "semi" | "closed";
  visitors: "none" | "log" | "log_footbath_ppe";
  deadDisposal: "open_pit" | "covered_pit" | "incineration";
  vaccination: "none" | "occasional" | "regular";
  wildBirdContact: "high" | "medium" | "low";
  cleaningFreq: "weekly" | "twice_week" | "daily";

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
  vaccination: "occasional",
  wildBirdContact: "medium",
  cleaningFreq: "twice_week",

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

  if (!user) {
    // useSupabaseUser already redirects to /login, but keep a fallback
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      // Safety: user should never be null here, but TS + runtime guard
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

      // 2) Call risk assessment API (this writes to risk_assessments table)
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
        console.error("Risk API error:", j);
        setErrorMsg(j.error || "Risk assessment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const json = await res.json();
      console.log("Risk API result:", json);

      setSuccessMsg("Risk assessment completed successfully.");
      setSubmitting(false);

      // Small delay so user can read success message
      setTimeout(() => {
        // Farmer dashboard risk tab
        router.push("/dashboard/farmer?tab=risk");
      }, 600);
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
                    Know Your Farm – Risk Checklist
                  </h1>
                  <p className="text-sm text-neutral-600">
                    Answer a few questions about your pig / poultry farm. We use
                    this to calculate a simple risk score and show easy-to-understand suggestions.
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
              {/* Farm basics */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                  Farm details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Farm name
                    </label>
                    <input
                      type="text"
                      value={form.farmName}
                      onChange={updateField("farmName")}
                      placeholder="e.g. Green Valley Poultry Farm"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Species
                    </label>
                    <select
                      value={form.species}
                      onChange={updateField("species")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="pig">Pig</option>
                      <option value="poultry">Poultry</option>
                      <option value="mixed">Mixed (Pig + Poultry)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Herd / Flock size (approx.)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.herdSize}
                      onChange={updateField("herdSize")}
                      placeholder="e.g. 300"
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-neutral-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={form.state}
                        onChange={updateField("state")}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={form.district}
                        onChange={updateField("district")}
                        placeholder="e.g. Pune"
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Biosecurity practices */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                  Housing & Biosecurity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Housing type
                    </label>
                    <select
                      value={form.housing}
                      onChange={updateField("housing")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="open">Open / backyard</option>
                      <option value="semi">Semi-covered sheds</option>
                      <option value="closed">
                        Closed, well-ventilated sheds
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Visitor control
                    </label>
                    <select
                      value={form.visitors}
                      onChange={updateField("visitors")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="none">
                        Everyone can enter, no log book
                      </option>
                      <option value="log">Visitor log only</option>
                      <option value="log_footbath_ppe">
                        Log + footbath + separate boots / PPE
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Dead animal disposal
                    </label>
                    <select
                      value={form.deadDisposal}
                      onChange={updateField("deadDisposal")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="open_pit">Open pit / exposed area</option>
                      <option value="covered_pit">
                        Covered pit with lime / fencing
                      </option>
                      <option value="incineration">
                        Incineration / deep burial with full protocol
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Vaccination & deworming
                    </label>
                    <select
                      value={form.vaccination}
                      onChange={updateField("vaccination")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="none">No regular vaccination</option>
                      <option value="occasional">
                        Occasional, only during outbreaks
                      </option>
                      <option value="regular">
                        Regular schedule as advised by vet
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Wild bird / stray animal contact
                    </label>
                    <select
                      value={form.wildBirdContact}
                      onChange={updateField("wildBirdContact")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="high">
                        High – birds / stray pigs / dogs enter sheds
                      </option>
                      <option value="medium">
                        Medium – sometimes seen near sheds
                      </option>
                      <option value="low">
                        Low – sheds mostly closed and fenced
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Shed cleaning & disinfection
                    </label>
                    <select
                      value={form.cleaningFreq}
                      onChange={updateField("cleaningFreq")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="weekly">Once a week or less</option>
                      <option value="twice_week">2–3 times a week</option>
                      <option value="daily">
                        Daily cleaning + disinfectant
                      </option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Health status */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                  Recent health situation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      Any unusual deaths / sudden mortality in last 30 days?
                    </label>
                    <select
                      value={form.recentMortality}
                      onChange={updateField("recentMortality")}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-700 mb-1">
                      If yes, briefly describe (age group, symptoms, numbers)
                    </label>
                    <textarea
                      rows={3}
                      value={form.mortalityNotes}
                      onChange={updateField("mortalityNotes")}
                      placeholder="Example: sudden death in 8–10 week old birds, greenish diarrhoea, 15 deaths in 2 days."
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </section>

              {/* Messages */}
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

              {/* Submit */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-neutral-500 max-w-sm">
                  We never show farm-level details publicly. The risk score is
                  only for you and your vet / department to plan better
                  biosecurity.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-5 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting && (
                    <Icon
                      icon="mdi:loading"
                      className="w-4 h-4 animate-spin mr-2"
                    />
                  )}
                  {submitting
                    ? "Calculating risk…"
                    : "Submit & calculate risk"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
