"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/app/components/Card";
import { Icon } from "@iconify/react";

// --- Main VetList Component ---
export default function VetList() {
  const [vets, setVets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State to manage the popup modal
  const [selectedVet, setSelectedVet] = useState<any | null>(null);

  async function loadVets() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, fullname, phone, district, specialization")
      .eq("role", "vet") // ONLY vets
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
    return (
      <div className="flex justify-center p-4">
        <Icon icon="mdi:loading" className="animate-spin text-green-600 w-6 h-6" />
        <span className="ml-2 text-neutral-600">Loading FarmSeva vets…</span>
      </div>
    );

  if (vets.length === 0)
    return (
      <Card>
        <p className="text-neutral-500 text-center py-4">
          No veterinary officers available in your region.
        </p>
      </Card>
    );

  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Icon icon="mdi:stethoscope" className="w-5 h-5 text-green-600" />
          Nearby FarmSeva Vets
        </h2>

        <div className="space-y-4">
          {vets.map((vet) => (
            <div
              key={vet.id}
              className="border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-neutral-800 text-lg">{vet.fullname}</p>
                  {vet.specialization && (
                    <p className="text-sm text-green-700 font-medium mb-1">
                      {vet.specialization}
                    </p>
                  )}
                  <div className="text-sm text-neutral-600 space-y-0.5">
                     <p className="flex items-center gap-1">
                        <Icon icon="mdi:map-marker" className="w-4 h-4 text-neutral-400"/> 
                        {vet.district}
                     </p>
                     <p className="flex items-center gap-1">
                        <Icon icon="mdi:phone" className="w-4 h-4 text-neutral-400"/> 
                        {vet.phone}
                     </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVet(vet)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                >
                  <Icon icon="mdi:message-alert-outline" className="w-4 h-4" />
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* --- Popup Modal --- */}
      {selectedVet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl scale-100 transform transition-all">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-semibold text-neutral-800">
                Contact Dr. {selectedVet.fullname}
              </h2>
              <button 
                onClick={() => setSelectedVet(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="mdi:close" className="w-6 h-6" />
              </button>
            </div>

            <ContactForm 
              vet={selectedVet} 
              onClose={() => setSelectedVet(null)} 
            />
          </div>
        </div>
      )}
    </>
  );
}

// --- Sub-Component: Contact Form Logic ---
function ContactForm({ vet, onClose }: { vet: any; onClose: () => void }) {
  const [form, setForm] = useState({
    farm_name: "",
    species: "Pig",
    district: vet.district || "", // Auto-fill district from vet if available
    symptoms: "",
    urgency: "medium",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // DEBUG LOG: Check your browser console to see these values
    console.log("Logged In User ID:", user?.id);
    console.log("Vet ID being sent:", vet.id);

    if (!user) {
        alert("You are not logged in!");
        setLoading(false);
        return;
    }

    // 2. Insert with explicit logging
    const { error } = await supabase.from("vet_requests").insert({
      farmer_id: user.id,  // This matches the logged in user
      vet_id: vet.id,
      farm_name: form.farm_name,
      symptoms: form.symptoms,
      species: form.species,
      urgency: form.urgency,
      district: form.district,
      status: "pending",
    });

    if (error) {
        console.error("Supabase Write Error:", error); 
        // If this prints 42501, it means the SQL policy is still blocking you.
    } else {
        console.log("Success!");
        onClose(); // Close modal on success
    }
    
    setLoading(false);
}

  // If success, show simple success view
  if (msg?.type === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:check" className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-neutral-800">Request Sent!</h3>
        <p className="text-neutral-600 mt-2">{msg.text}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submitRequest} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase">Farm Details</label>
        <input
          required
          placeholder="Farm Name"
          className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          value={form.farm_name}
          onChange={(e) => setForm({ ...form, farm_name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
           <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase">District</label>
           <input
             placeholder="District"
             className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
             value={form.district}
             onChange={(e) => setForm({ ...form, district: e.target.value })}
           />
        </div>
        <div>
           <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase">Species</label>
           <select
             className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
             value={form.species}
             onChange={(e) => setForm({ ...form, species: e.target.value })}
           >
             <option value="Pig">Pig</option>
             <option value="Poultry">Poultry</option>
             <option value="Cattle">Cattle</option>
             <option value="Other">Other</option>
           </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase">Urgency Level</label>
        <select
          className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
          value={form.urgency}
          onChange={(e) => setForm({ ...form, urgency: e.target.value })}
        >
          <option value="low">Low - Routine Checkup</option>
          <option value="medium">Medium - Sick Animal</option>
          <option value="high">High - Emergency / Mortality</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase">Symptoms / Description</label>
        <textarea
          required
          rows={3}
          placeholder="Describe symptoms (e.g., high fever, not eating...)"
          className="w-full border border-neutral-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
          value={form.symptoms}
          onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
        />
      </div>

      {msg?.type === 'error' && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
           <Icon icon="mdi:alert-circle" /> {msg.text}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {loading ? (
             <>
               <Icon icon="mdi:loading" className="animate-spin" /> Sending...
             </>
          ) : (
             "Send Request"
          )}
        </button>
      </div>
    </form>
  );
}