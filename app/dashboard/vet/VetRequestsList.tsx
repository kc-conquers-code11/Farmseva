"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/components/Card";
import { Icon } from "@iconify/react";

export default function VetRequestsList({ vetId }: { vetId: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch initial data
  async function loadRequests() {
    const { data, error } = await supabase
      .from("vet_requests")
      .select(`
        *,
        profiles:farmer_id (
          fullname,
          phone
        )
      `)
      .eq("vet_id", vetId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase Error:", error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  }

  // 2. Handle Status Updates (Accept via API / Reject via DB)
  async function handleStatusUpdate(id: string, newStatus: "accepted" | "rejected", farmName: string) {
    // Optimistic Update: Remove from list immediately
    const originalRequests = [...requests];
    setRequests((prev) => prev.filter((req) => req.id !== id));

    try {
      if (newStatus === "accepted") {
        // --- Call API for Acceptance (Updates DB + Sends SMS) ---
        const response = await fetch('/api/vet/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: id,
            vetId: vetId,
            vetName: "Veterinarian" // Ideally, pass the real vet name from props/user context
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to accept");
        }
        console.log("✅ Request Accepted & SMS Sent");

      } else {
        // --- Direct DB Update for Rejection (No SMS cost) ---
        const { error } = await supabase
          .from("vet_requests")
          .update({ status: "rejected" })
          .eq("id", id);

        if (error) throw error;
        console.log("❌ Request Rejected");
      }

    } catch (error) {
      console.error("Action failed:", error);
      alert("Failed to update status. Please try again.");
      setRequests(originalRequests); // Revert UI on failure
    }
  }

  useEffect(() => {
    if (!vetId) return;
    loadRequests();

    // Request Notification Permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // 3. Realtime Subscription
    const channel = supabase
      .channel("vet-dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vet_requests",
          filter: `vet_id=eq.${vetId}`,
        },
        (payload) => {
          console.log("New Request!", payload);
          if (Notification.permission === "granted") {
            new Notification("New Farmer Request", {
              body: `Urgency: ${payload.new.urgency}`,
            });
          }
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vetId]);

  const getUrgencyStyles = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-50 text-red-700 border-red-100 ring-red-100';
      case 'medium': return 'bg-orange-50 text-orange-700 border-orange-100 ring-orange-100';
      default: return 'bg-green-50 text-green-700 border-green-100 ring-green-100';
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Icon icon="mdi:loading" className="animate-spin text-neutral-400 w-6 h-6" />
      </div>
    );

  if (requests.length === 0)
    return (
      <Card className="border-none shadow-sm ring-1 ring-neutral-100">
        <div className="text-center py-10">
          <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
            <Icon icon="mdi:check-all" className="text-green-600 w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800">All Caught Up!</h3>
          <p className="text-sm text-neutral-500 mt-1">No pending requests at the moment.</p>
        </div>
      </Card>
    );

  return (
    <Card className="border-none shadow-sm ring-1 ring-neutral-100">
      <div className="flex items-center justify-between mb-6 border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-xl text-red-600">
                <Icon icon="mdi:bell-ring-outline" className="w-6 h-6 animate-pulse" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-neutral-800">Incoming Requests</h2>
                <p className="text-xs text-neutral-500">Farmers needing assistance</p>
            </div>
        </div>
        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm shadow-red-200">
          {requests.length} Pending
        </span>
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="group relative bg-white rounded-xl border border-neutral-200 p-5 hover:border-red-200 hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-4">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${req.species === 'Pig' ? 'bg-pink-50 border-pink-100' : 'bg-orange-50 border-orange-100'}`}>
                    <Icon icon={req.species === 'Pig' ? 'mdi:pig' : 'mdi:bird'} className={req.species === 'Pig' ? 'text-pink-500' : 'text-orange-500'} />
                 </div>
                 
                 <div>
                    <h3 className="font-bold text-lg text-neutral-900 leading-tight">
                        {req.farm_name || "Unknown Farm"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mt-1">
                        <span className="flex items-center gap-1">
                            <Icon icon="mdi:account" /> {req.profiles?.fullname || "Farmer"}
                        </span>
                        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                            <Icon icon="mdi:map-marker" /> {req.district}
                        </span>
                    </div>
                 </div>
              </div>

              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${getUrgencyStyles(req.urgency)}`}>
                {req.urgency} Priority
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 mb-4">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Symptoms Reported</p>
                <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                    "{req.symptoms}"
                </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleStatusUpdate(req.id, "rejected", req.farm_name)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-neutral-200 text-neutral-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:close" className="w-4 h-4" /> Reject
              </button>
              
              <button
                onClick={() => handleStatusUpdate(req.id, "accepted", req.farm_name)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-neutral-900 text-white font-bold text-sm hover:bg-black transition-all shadow-lg shadow-neutral-200 flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Icon icon="mdi:check" className="w-4 h-4" /> Accept Request
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}