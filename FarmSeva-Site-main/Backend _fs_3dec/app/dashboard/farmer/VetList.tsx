"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/components/Card";
import { Icon } from "@iconify/react";

export default function VetList() {
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadVets() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, fullname, phone, district, specialization")
      .eq("role", "vet")                     // ONLY vets
      .order("fullname", { ascending: true });

    if (error) {
      console.error("Failed loading vets:", error);
    } else {
      setVets(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadVets();
  }, []);

  if (loading)
    return <p className="text-neutral-600">Loading FarmSeva vets…</p>;

  if (vets.length === 0)
    return (
      <Card>
        <p className="text-neutral-500 text-center py-4">
          No veterinary officers available in your region.
        </p>
      </Card>
    );

  return (
    <Card>
      <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
        <Icon icon="mdi:stethoscope" className="w-5 h-5 text-green-600" />
        Nearby FarmSeva Vets
      </h2>

      <div className="space-y-4">
        {vets.map((vet) => (
          <div
            key={vet.id}
            className="border border-neutral-200 rounded-lg p-4 bg-white"
          >
            <p className="font-bold text-neutral-800">{vet.fullname}</p>

            {vet.specialization && (
              <p className="text-sm text-neutral-600">
                {vet.specialization}
              </p>
            )}

            <p className="text-sm mt-1 text-neutral-700">
              District: {vet.district}
            </p>

            <p className="text-sm text-neutral-500 mt-1">
              Contact: {vet.phone}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
