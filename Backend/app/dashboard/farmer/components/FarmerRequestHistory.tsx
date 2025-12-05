"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/components/Card";
import { Icon } from "@iconify/react";

export default function FarmerRequestHistory({ farmerId }: { farmerId: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyRequests() {
      // Fetch ALL requests sent by this farmer
      const { data, error } = await supabase
        .from("vet_requests")
        .select(`
          *,
          profiles!fk_vet_profile (fullname, phone)
        `)
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading requests:", error);
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    }

    if (farmerId) loadMyRequests();
  }, [farmerId]);

  if (loading) return <div className="p-4 text-neutral-500">Loading your requests...</div>;

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-neutral-800 flex items-center gap-2">
          <Icon icon="mdi:clipboard-text-clock" className="w-6 h-6 text-orange-500" />
          My Vet Requests
        </h2>
      </div>

      {requests.length === 0 ? (
        <p className="text-neutral-500 text-center py-6">You haven't made any requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                    To: Dr. {req.profiles?.fullname || "Vet"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Sent on {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : req.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {req.status === "pending" && <Icon icon="mdi:clock-outline" />}
                    {req.status === "accepted" && <Icon icon="mdi:check-circle-outline" />}
                    {req.status}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-neutral-700 mb-2">
                <span className="font-semibold">Issue:</span> {req.symptoms}
              </div>

              {req.status === "accepted" && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
                  <Icon icon="mdi:phone" />
                  <span className="font-medium">Vet Contact:</span> {req.profiles?.phone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}