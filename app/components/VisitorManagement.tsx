"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { 
  UserPlus, 
  History, 
  Phone, 
  Calendar, 
  FileText, 
  Search, 
  User,
  Clock
} from "lucide-react";

type Visitor = {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visit_date: string;
};

export default function VisitorManagement({ farmerId }: { farmerId: string }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"log" | "history">("log");
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "",
    visit_date: new Date().toISOString().split('T')[0] // Default to today
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch Visitors
  useEffect(() => {
    if(farmerId) fetchVisitors();
  }, [farmerId]);

  const fetchVisitors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('farm_visitors')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('visit_date', { ascending: false });
    
    if (data) setVisitors(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('farm_visitors').insert({
      farmer_id: farmerId,
      name: formData.name,
      phone: formData.phone,
      purpose: formData.purpose,
      visit_date: formData.visit_date
    });

    if (!error) {
      // Reset form and refresh list
      setFormData({ name: "", phone: "", purpose: "", visit_date: new Date().toISOString().split('T')[0] });
      fetchVisitors();
      setActiveTab("history"); // Auto switch to history to show entry
    } else {
      console.error("Error logging visitor:", error);
    }
    setSubmitting(false);
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setActiveTab("log")}
          className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${activeTab === "log" ? "bg-green-600 text-white shadow-lg shadow-green-200 border-green-600" : "bg-white text-neutral-600 border-neutral-200 hover:border-green-300"}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === "log" ? "bg-white/20" : "bg-green-50 text-green-600"}`}>
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Log New Visitor</h3>
            <p className={`text-sm ${activeTab === "log" ? "text-green-100" : "text-neutral-500"}`}>Register entry for biosecurity</p>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab("history")}
          className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${activeTab === "history" ? "bg-blue-600 text-white shadow-lg shadow-blue-200 border-blue-600" : "bg-white text-neutral-600 border-neutral-200 hover:border-blue-300"}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === "history" ? "bg-white/20" : "bg-blue-50 text-blue-600"}`}>
            <History size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Visitor History</h3>
            <p className={`text-sm ${activeTab === "history" ? "text-blue-100" : "text-neutral-500"}`}>View past logs ({visitors.length})</p>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 md:p-8">
        
        {/* === LOG ENTRY FORM === */}
        {activeTab === "log" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded-full"></span>
              Enter Visitor Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Visitor Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-neutral-400 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-neutral-400 w-5 h-5" />
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Purpose of Visit</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-neutral-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Vaccination checkup, Feed delivery"
                    value={formData.purpose}
                    onChange={e => setFormData({...formData, purpose: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Date of Visit</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-neutral-400 w-5 h-5" />
                  <input 
                    type="date" 
                    required
                    value={formData.visit_date}
                    onChange={e => setFormData({...formData, visit_date: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {submitting ? "Logging..." : "Save Entry Log"}
              </button>
            </form>
          </motion.div>
        )}

        {/* === HISTORY LIST === */}
        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-neutral-800">Logbook Records</h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-neutral-400">Loading records...</div>
            ) : filteredVisitors.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="text-neutral-400" />
                </div>
                <p className="text-neutral-500 font-medium">No records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVisitors.map((visitor) => (
                  <div key={visitor.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border border-neutral-100 rounded-xl hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {visitor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-800">{visitor.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-neutral-500 mt-0.5">
                          <span className="flex items-center gap-1"><Phone size={12}/> {visitor.phone || "No phone"}</span>
                          <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                          <span className="flex items-center gap-1"><FileText size={12}/> {visitor.purpose}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 pl-16 md:pl-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs font-medium border border-neutral-200">
                        <Calendar size={12} />
                        {new Date(visitor.visit_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}