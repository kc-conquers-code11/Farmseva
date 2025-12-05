"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/components/Card";
import { Icon } from "@iconify/react";

export default function VetRequestsList({ vetId }: { vetId: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch initial data (Joined with Profiles to get Farmer Name)
  async function loadRequests() {
    console.log("Fetching requests for Vet ID:", vetId);

    // FIX: Use the new simple name "fk_farmer_profile"
    const { data, error } = await supabase
      .from("vet_requests")
      .select(`
        *,
        profiles!fk_farmer_profile (
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
      console.log("✅ Requests Loaded:", data);
      setRequests(data || []);
    }
    setLoading(false);
  }

  // 2. Handle Status Updates (Accept/Reject)
  async function updateStatus(id: string, newStatus: string) {
    // Optimistic Update: Remove from UI immediately so it feels fast
    setRequests((prev) => prev.filter((req) => req.id !== id));

    const { error } = await supabase
      .from("vet_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      loadRequests(); // Revert/Reload if it failed
    }
  }

  useEffect(() => {
    if (!vetId) return;

    // Load initial data
    loadRequests();

    // Request Browser Notification Permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // 3. SUBSCRIBE TO REALTIME CHANGES
    const channel = supabase
      .channel("vet-dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vet_requests",
          filter: `vet_id=eq.${vetId}`, // Only listen for requests for THIS vet
        },
        (payload) => {
          console.log("New Request Received!", payload);

          // Trigger System Notification
          if (Notification.permission === "granted") {
            new Notification("New Farmer Request", {
              body: `Urgency: ${payload.new.urgency}. Check your dashboard.`,
            });
          }

          // Reload the list to get the joined 'profile' data (Farmer Name)
          // (Payload only contains raw IDs, so we re-fetch to get the name)
          loadRequests();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [vetId]);

  if (loading)
    return (
      <div className="flex items-center gap-2 text-neutral-500 py-4">
        <Icon icon="mdi:loading" className="animate-spin" /> Loading requests...
      </div>
    );

  if (requests.length === 0)
    return (
      <Card>
        <div className="text-center py-8">
          <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon icon="mdi:check" className="text-green-600 w-6 h-6" />
          </div>
          <p className="text-neutral-500">No pending requests.</p>
          <p className="text-xs text-neutral-400">You are all caught up!</p>
        </div>
      </Card>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Icon icon="mdi:bell-ring-outline" className="w-5 h-5 text-red-500 animate-pulse" />
          Incoming Requests
        </h2>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
          {requests.length} Pending
        </span>
      </div>

      <div className="grid gap-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="border-l-4 border-l-red-500 bg-white rounded-r-lg shadow-sm p-4 hover:shadow-md transition-shadow animate-in slide-in-from-top-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-neutral-800">
                  {req.farm_name || "Unknown Farm"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                    <Icon icon="mdi:paw" className="text-neutral-500" />
                    {req.species}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                    <Icon icon="mdi:map-marker" className="text-neutral-500" />
                    {req.district}
                  </span>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  req.urgency === "high"
                    ? "bg-red-100 text-red-700"
                    : req.urgency === "medium"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {req.urgency}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-lg text-sm text-neutral-700 mb-3 border border-neutral-100">
              <span className="font-semibold text-neutral-900">Symptoms: </span>
              {req.symptoms}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-neutral-500 flex flex-col">
                <span>Farmer: {req.profiles?.fullname || "Unknown"}</span>
                <span>Phone: {req.profiles?.phone || "N/A"}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(req.id, "rejected")}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  Reject
                </button>
                <button
                  onClick={() => updateStatus(req.id, "accepted")}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-1"
                >
                  <Icon icon="mdi:check" /> Accept
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}