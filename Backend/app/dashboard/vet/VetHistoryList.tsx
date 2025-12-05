"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/components/Card";
import { Icon } from "@iconify/react";

export default function VetHistoryList({ vetId }: { vetId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      // Fetch requests that are NOT pending (accepted, rejected, completed)
      const { data, error } = await supabase
        .from("vet_requests")
        .select(`
          *,
          profiles!fk_farmer_profile (fullname, phone)
        `)
        .eq("vet_id", vetId)
        .neq("status", "pending") // neq = Not Equal
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading history:", error);
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    }

    if (vetId) loadHistory();
  }, [vetId]);

  if (loading) return <div className="p-4 text-neutral-500">Loading history...</div>;

  if (history.length === 0)
    return (
      <Card>
        <div className="text-center py-8 text-neutral-500">
          <Icon icon="mdi:history" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No past request history found.</p>
        </div>
      </Card>
    );

  return (
    <Card>
      <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
        <Icon icon="mdi:history" className="w-5 h-5 text-blue-600" />
        Request History
      </h2>
      <div className="space-y-4">
        {history.map((req) => (
          <div key={req.id} className="border border-neutral-100 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-neutral-800">{req.farm_name}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(req.created_at).toLocaleDateString()} • {req.profiles?.fullname}
                </p>
                <p className="text-sm mt-1 text-neutral-700">"{req.symptoms}"</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  req.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : req.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {req.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}