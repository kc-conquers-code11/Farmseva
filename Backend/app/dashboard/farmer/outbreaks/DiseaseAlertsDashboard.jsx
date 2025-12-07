"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import Papa from "papaparse";

/* ---------------------------
   Minimal icon components (From Old UI)
   --------------------------- */
const LocationIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const FilterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);
const DiseaseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

/* ---------------------------
   Helpers
   --------------------------- */
const parsePreventiveMeasures = (measuresText) => {
  if (!measuresText) return [];
  const measures = measuresText
    .split(/\d+\.|\n|•|--| - /)
    .map((m) => m.replace(/[•\-]\s*/, "").trim())
    .filter((m) => m.length > 3)
    .slice(0, 8);
  return measures.length > 0 ? measures : ["Regular health checkups and maintain hygiene"];
};

const getSeverityLevel = (type) => {
  switch (type?.toLowerCase()) {
    case "outbreak": return 4;
    case "alert": return 3;
    case "warning": return 2;
    case "info": return 1;
    default: return 0;
  }
};

/* ---------------------------
   Component
   --------------------------- */
const DiseaseAlertsDashboard = () => {
  // data
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("current");
  const [showAll, setShowAll] = useState(false);

  // location
  const [profileCity, setProfileCity] = useState(null);

  // modal
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch User Profile City (New Logic)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('city')
            .eq('id', user.id)
            .single();
          
          if (data && data.city) {
            setProfileCity(data.city.trim());
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // 2. Fetch CSV Data (New Logic: Single Locations Column)
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        Papa.parse("/api/outbreak", {
          download: true,
          header: true,
          complete: (result) => {
            const rows = result.data || [];
            const cleaned = rows
              .filter((row) => row && row.Type && row.DiseaseName && row.DiseaseName.trim() !== "")
              .map((row, i) => {
                // Parse the single "Locations Effected" column
                const rawLocations = row["Locations Effected"] || "";
                const allLocations = rawLocations.split(",").map((s) => s.trim()).filter(Boolean);

                return {
                  id: i + 1,
                  ...row,
                  allLocations, 
                  preventiveMeasures: parsePreventiveMeasures(row["Possible Preventive Measure"]),
                  severity: getSeverityLevel(row.Type),
                };
              });

            setAlerts(cleaned);
            setLoading(false);
          },
          error: (err) => {
            console.error("CSV parse error:", err);
            setError("Failed to fetch outbreak data");
            setLoading(false);
          },
        });
      } catch (err) {
        console.error("fetch error:", err);
        setError("Failed to fetch outbreak data");
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  // 3. Filter Logic (Combines New Logic with Old Tab Logic)
  useEffect(() => {
    let results = [...alerts];

    // Tab Filtering
    if (activeTab === "current") {
        results = results.slice(0, 9); // Mock current vs history
    } else {
        results = results.slice(9);
    }

    // Location Filtering (New Logic using profileCity)
    if (!showAll && profileCity) {
      results = results.filter(alert => {
        return alert.allLocations.some(loc => 
          loc.toLowerCase().includes(profileCity.toLowerCase())
        );
      });
    }

    // Search Filtering
    if (searchTerm && searchTerm.trim() !== "") {
      const st = searchTerm.trim().toLowerCase();
      results = results.filter((a) => {
        return (
          (a.DiseaseName || "").toLowerCase().includes(st) ||
          (a["Disease Overview"] || "").toLowerCase().includes(st) ||
          (a.allLocations || []).join(" ").toLowerCase().includes(st)
        );
      });
    }

    // Type Filtering
    if (selectedType && selectedType !== "all") {
      results = results.filter((a) => (a.Type || "").toLowerCase() === selectedType.toLowerCase());
    }

    setFilteredAlerts(results);
  }, [alerts, activeTab, searchTerm, selectedType, showAll, profileCity]);

  const alertTypes = ["all", ...Array.from(new Set(alerts.map((a) => a.Type).filter(Boolean)))];

  /* Modal controls */
  const openModal = useCallback((alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAlert(null);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    if (isModalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 font-medium">Loading disease alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-6">
          <div className="text-red-600 font-bold mb-3">Error</div>
          <div className="mb-4">{error}</div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-md">Retry</button>
        </div>
      </div>
    );
  }

  /* ---------------------------
     Render (Exact Old UI Structure)
     --------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-16">
      <header className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="inline-block p-2 bg-green-100 rounded-full">
                <DiseaseIcon className="w-6 h-6 text-green-600" />
              </span>
              Disease Alerts & Prevention
            </h1>
            <p className="text-sm text-slate-600 mt-1">Monitoring disease outbreaks — location-aware</p>

            <div className="mt-3 text-sm text-slate-700 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <LocationIcon className="w-4 h-4 text-green-600" />
                <span className="font-medium"> {profileCity || "Location Unknown"}</span>
                {/* Changed: No lat/lon display since we fetch from DB */}
                <span className="text-slate-400 ml-1">(From Profile)</span>
              </div>

              <div className="ml-6 flex items-center gap-2">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={() => setShowAll((s) => !s)}
                    className="hidden"
                  />
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${showAll ? "bg-green-500" : "bg-gray-300"}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${showAll ? "translate-x-6" : "translate-x-0"}`} />
                  </div>
                </label>
                <div className="text-sm">{showAll ? "Showing all alerts" : "Showing only nearby alerts"}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-xs text-slate-500">Last Updated</div>
            <div className="font-bold">{new Date().toLocaleDateString("en-IN")}</div>
            <div className="text-green-600 text-sm mt-1">{alerts.length} Total Alerts</div>
          </div>
        </div>
      </header>

      {/* Filters (Exact Old UI) */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex gap-6">
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
              <SearchIcon className="w-4 h-4" />
              Search Diseases & Locations
            </label>
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by disease name, location, overview..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none"
              />
              <SearchIcon className="w-5 h-5 absolute right-3 top-3 text-slate-400" />
            </div>
          </div>

          <div className="w-64">
            <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
              <FilterIcon className="w-4 h-4" />
              Filter by Alert Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white"
            >
              {alertTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All types" : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs (Exact Old UI) */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-5 py-2 rounded-2xl font-semibold ${activeTab === "current" ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2 rounded-2xl font-semibold ${activeTab === "history" ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            History
          </button>
        </div>
      </div>

      {/* Alerts Grid (Old UI Structure, New Logic) */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
            <div className="text-3xl font-bold text-slate-700 mb-2">No outbreaks found</div>
            <p className="text-slate-500 mb-4">
              {showAll ? "No alerts match your filters." : `No outbreaks in ${profileCity || "your area"}.`}
            </p>
            {!showAll && (
              <button onClick={() => setShowAll(true)} className="px-6 py-2 bg-blue-600 text-white rounded-md">
                Show all alerts
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlerts.map((alert, i) => {
              // Calculate Dynamic "Your" vs "Other" based on profileCity
              const yourLocs = profileCity ? alert.allLocations.filter(l => l.toLowerCase().includes(profileCity.toLowerCase())) : [];
              const otherLocs = profileCity ? alert.allLocations.filter(l => !l.toLowerCase().includes(profileCity.toLowerCase())) : alert.allLocations;
              const isRelevant = yourLocs.length > 0;

              return (
                <article key={alert.id || i} className="bg-white rounded-2xl shadow p-5 cursor-pointer hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase text-slate-500 font-semibold mb-1">{alert.Type || "Alert"}</div>
                      <h3 className="text-lg font-bold text-slate-900">{alert.DiseaseName}</h3>
                      <div className="text-xs text-slate-500 mt-1">{alert.MonthYear}</div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isRelevant ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {isRelevant ? "Nearby" : "Not Nearby"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-700 line-clamp-3">{alert["Disease Overview"] || "No overview available."}</div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold text-slate-600">Your Locations</div>
                    {yourLocs.length > 0 ? (
                      <div className="text-sm text-red-600 font-bold mt-1">{yourLocs.join(", ")}</div>
                    ) : (
                      <div className="text-sm text-slate-500 mt-1">—</div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-slate-500">ID: {alert.OBTID || "N/A"}</div>
                    <div>
                      <button
                        onClick={() => openModal(alert)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                      >
                        View details →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal (Exact Old UI Structure) */}
      {isModalOpen && selectedAlert && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-white/20">
            {/* Header */}
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <div className="text-xs uppercase text-slate-500 font-semibold mb-1">{selectedAlert.Type}</div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedAlert.DiseaseName}</h2>
                <div className="text-sm text-slate-500 mt-1">{selectedAlert.MonthYear} • ID: {selectedAlert.OBTID || "N/A"}</div>
              </div>
              <div className="text-right">
                <button onClick={closeModal} className="px-3 py-2 bg-slate-100 rounded-md text-sm">Close</button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Disease Overview</div>
                <p className="text-sm text-slate-800 leading-relaxed">{selectedAlert["Disease Overview"] || "No overview available."}</p>
              </div>

              {/* Dynamic Logic: Recalculate 'Your' vs 'Other' for modal display */}
              {(() => {
                  const modalYourLocs = profileCity ? selectedAlert.allLocations.filter(l => l.toLowerCase().includes(profileCity.toLowerCase())) : [];
                  const modalOtherLocs = profileCity ? selectedAlert.allLocations.filter(l => !l.toLowerCase().includes(profileCity.toLowerCase())) : selectedAlert.allLocations;
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="text-sm font-semibold text-slate-700 mb-2">Your Locations Affected</div>
                        {modalYourLocs.length > 0 ? (
                          <ul className="text-sm text-slate-800 space-y-1">
                            {modalYourLocs.map((loc, idx) => (
                              <li key={idx} className="flex justify-between items-center">
                                <span>{loc}</span>
                                <span className="text-xs text-red-600 font-semibold">High Risk</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-slate-500">—</div>
                        )}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <div className="text-sm font-semibold text-slate-700 mb-2">Other Locations</div>
                        {modalOtherLocs.length > 0 ? (
                          <div className="text-sm text-slate-800">{modalOtherLocs.join(", ")}</div>
                        ) : (
                          <div className="text-sm text-slate-500">—</div>
                        )}
                      </div>
                    </div>
                  );
              })()}

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Preventive Measures</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedAlert.preventiveMeasures && selectedAlert.preventiveMeasures.length > 0 ? (
                    selectedAlert.preventiveMeasures.map((m, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-slate-800"><strong>{idx + 1}.</strong> {m}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No preventive measures listed.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-xs text-slate-500">Updated Date</div>
                  <div className="font-medium">{selectedAlert.UpdatedDate || selectedAlert.UpdatedOn || "N/A"}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <div className="text-xs text-slate-500">Severity</div>
                  <div className="font-medium">{selectedAlert.Type || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex items-center justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 rounded-md bg-slate-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseAlertsDashboard;