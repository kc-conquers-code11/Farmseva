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
          profiles:farmer_id (fullname, phone)
        `)
        .eq("vet_id", vetId)
        .neq("status", "pending")
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:history" className="w-8 h-8 text-neutral-300" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800">No History Found</h3>
          <p className="text-sm text-neutral-500">Past consultations will appear here.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm ring-1 ring-neutral-100">
      <div className="flex items-center gap-2 mb-6 border-b border-neutral-100 pb-4">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Icon icon="mdi:history" className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-neutral-800">Consultation History</h2>
      </div>

      <div className="space-y-4">
        {history.map((req) => (
          <div 
            key={req.id} 
            className="group p-5 bg-white border border-neutral-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm shrink-0 ${req.species === 'Pig' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>
                    {req.species === 'Pig' ? 'P' : 'H'}
                </div>
                <div>
                    <h3 className="font-bold text-neutral-900">{req.farm_name}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                       <Icon icon="mdi:calendar-blank" /> {new Date(req.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                       <span className="w-1 h-1 bg-neutral-300 rounded-full mx-1"></span>
                       {req.profiles?.fullname || 'Unknown Farmer'}
                    </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border self-start ${getStatusColor(req.status)}`}>
                {req.status}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <p className="text-sm text-neutral-600 italic leading-relaxed">
                    "{req.symptoms}"
                </p>
            </div>
            
            {/* Optional: Add action button for completed cases if needed */}
            {req.status === 'completed' && (
                <div className="mt-3 flex justify-end">
                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                        View Report <Icon icon="mdi:arrow-right" />
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}