'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, Skull, Wheat, Activity, Trash2, Edit } from 'lucide-react';

// Add Props Interface so it can talk to Home.tsx
interface DailyEntryProps {
    onRequestTab?: (tab: string) => void;
}

export default function DailyEntry({ onRequestTab }: DailyEntryProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [activeBatch, setActiveBatch] = useState<any>(null);
    const [logId, setLogId] = useState<string | null>(null);
    const [recentLogs, setRecentLogs] = useState<any[]>([]); // Store history here
    
    // Form State
    const [formData, setFormData] = useState({
        logDate: new Date().toISOString().split('T')[0],
        mortality: 0,
        culls: 0,
        feedIntake: 0,
        waterIntake: 0,
        avgWeight: 0,
        eggsCollected: 0,
        remarks: ''
    });

    // 1. Fetch Active Batch & Data
    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get latest active batch
                const { data: batches, error } = await supabase
                    .from('poultry_batches')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (batches && batches.length > 0) {
                    const batch = batches[0];
                    setActiveBatch(batch);
                    
                    // Load data for this batch
                    checkLog(batch.id, formData.logDate);
                    fetchRecentLogs(batch.id);
                }
            } catch (error) {
                console.error("Error init:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Fetch list of recent logs for the table
    const fetchRecentLogs = async (batchId: string) => {
        const { data } = await supabase
            .from('poultry_daily_logs')
            .select('*')
            .eq('batch_id', batchId)
            .order('log_date', { ascending: false }); // Newest first
        
        if (data) setRecentLogs(data);
    };

    // Check if log exists for specific date (for editing in form)
    const checkLog = async (batchId: string, date: string) => {
        const { data } = await supabase
            .from('poultry_daily_logs')
            .select('*')
            .eq('batch_id', batchId)
            .eq('log_date', date)
            .maybeSingle();
        
        if (data) {
            setLogId(data.id);
            setFormData({
                logDate: data.log_date,
                mortality: data.mortality,
                culls: data.culls,
                feedIntake: data.feed_intake,
                waterIntake: data.water_intake,
                avgWeight: data.average_weight || 0,
                eggsCollected: data.eggs_collected || 0,
                remarks: data.remarks || ''
            });
        } else {
            setLogId(null);
            // Reset numbers, keep date
            setFormData(prev => ({
                ...prev,
                mortality: 0,
                culls: 0,
                feedIntake: 0,
                waterIntake: 0,
                avgWeight: 0,
                eggsCollected: 0,
                remarks: ''
            }));
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setFormData(prev => ({ ...prev, logDate: newDate }));
        if (activeBatch) checkLog(activeBatch.id, newDate);
    };

    // --- Actions ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeBatch) return;
        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const payload = {
                user_id: user?.id,
                batch_id: activeBatch.id,
                log_date: formData.logDate,
                mortality: formData.mortality,
                culls: formData.culls,
                feed_intake: formData.feedIntake,
                water_intake: formData.waterIntake,
                average_weight: formData.avgWeight,
                eggs_collected: formData.eggsCollected,
                remarks: formData.remarks
            };

            let error;
            if (logId) {
                const { error: uErr } = await supabase
                    .from('poultry_daily_logs')
                    .update(payload)
                    .eq('id', logId);
                error = uErr;
            } else {
                const { error: iErr } = await supabase
                    .from('poultry_daily_logs')
                    .insert([payload]);
                error = iErr;
            }

            if (error) throw error;

            alert("Saved successfully!");
            
            // 👇 Navigate back to Analytics Tab
            if (onRequestTab) {
                onRequestTab('analytics');
            } else {
                // Fallback just in case it's used standalone
                fetchRecentLogs(activeBatch.id); 
            }
            
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this log entry?")) {
            const { error } = await supabase
                .from('poultry_daily_logs')
                .delete()
                .eq('id', id);
            
            if (!error && activeBatch) {
                fetchRecentLogs(activeBatch.id);
                // If we deleted the currently selected date, reset form
                if (id === logId) {
                    setLogId(null);
                    setFormData(prev => ({ ...prev, mortality: 0, feedIntake: 0, remarks: '' }));
                }
            }
        }
    };

    const handleEditClick = (date: string) => {
        setFormData(prev => ({ ...prev, logDate: date }));
        if (activeBatch) checkLog(activeBatch.id, date);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!activeBatch) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-700">No Active Flock Found</h2>
                <p className="text-gray-500 mb-4">Please start a new batch first.</p>
                {/* Safe fallback if onRequestTab is missing */}
                <button 
                    onClick={() => onRequestTab ? onRequestTab('setup-chicks') : null}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                >
                    Start Flock
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Entry</h1>
                    <p className="text-gray-500 text-sm">{activeBatch.batch_name}</p>
                </div>
                <div className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                    Active Birds: {activeBatch.current_birds}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                
                {/* LEFT COLUMN: Core Data */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Date Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Log Date</label>
                        <input 
                            type="date" 
                            className="w-full p-3 border rounded-lg text-gray-900 bg-gray-50 focus:bg-white transition-colors"
                            value={formData.logDate}
                            onChange={handleDateChange}
                            required 
                        />
                    </div>

                    {/* Mortality Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                        <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                            <Skull size={20} /> Mortality & Culls
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dead</label>
                                <input 
                                    type="number" min="0" 
                                    className="w-full p-3 border border-red-200 rounded-lg text-red-900 font-bold text-lg"
                                    value={formData.mortality}
                                    onChange={e => setFormData({...formData, mortality: parseInt(e.target.value) || 0})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Culls</label>
                                <input 
                                    type="number" min="0" 
                                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-900"
                                    value={formData.culls}
                                    onChange={e => setFormData({...formData, culls: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feed & Water Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-100">
                        <h3 className="font-bold text-yellow-700 mb-4 flex items-center gap-2">
                            <Wheat size={20} /> Consumption
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Feed (kg)</label>
                                <input 
                                    type="number" min="0" step="0.1"
                                    className="w-full p-3 border border-yellow-200 rounded-lg text-gray-900"
                                    value={formData.feedIntake}
                                    onChange={e => setFormData({...formData, feedIntake: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Water (L)</label>
                                <input 
                                    type="number" min="0" step="0.1"
                                    className="w-full p-3 border border-blue-200 rounded-lg text-gray-900"
                                    value={formData.waterIntake}
                                    onChange={e => setFormData({...formData, waterIntake: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Growth & Actions */}
                <div className="space-y-6">
                    {/* Growth Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-emerald-700 mb-4 flex items-center gap-2">
                            <Activity size={20} /> Growth
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Avg Weight (g)</label>
                                <input 
                                    type="number" min="0" 
                                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-900"
                                    value={formData.avgWeight}
                                    onChange={e => setFormData({...formData, avgWeight: parseInt(e.target.value) || 0})}
                                    placeholder="Optional"
                                />
                            </div>
                            {activeBatch.bird_type === 'Layer' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Eggs Collected</label>
                                    <input 
                                        type="number" min="0" 
                                        className="w-full p-3 border border-gray-200 rounded-lg text-gray-900"
                                        value={formData.eggsCollected}
                                        onChange={e => setFormData({...formData, eggsCollected: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Remarks</label>
                        <textarea 
                            className="w-full p-3 border border-gray-200 rounded-lg h-24 text-sm"
                            placeholder="Vaccines given, symptoms, etc."
                            value={formData.remarks}
                            onChange={e => setFormData({...formData, remarks: e.target.value})}
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save size={20} /> Save Log
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* --- HISTORY TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">Recent History ({recentLogs.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Mortality</th>
                                <th className="px-6 py-3">Feed (kg)</th>
                                <th className="px-6 py-3">Water (L)</th>
                                <th className="px-6 py-3">Weight (g)</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No logs found.</td>
                                </tr>
                            ) : (
                                recentLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-blue-50/50 transition">
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            {new Date(log.log_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-red-600 font-medium">
                                            {log.mortality + log.culls > 0 ? `-${log.mortality + log.culls}` : '-'}
                                        </td>
                                        <td className="px-6 py-3 text-gray-700">{log.feed_intake}</td>
                                        <td className="px-6 py-3 text-gray-700">{log.water_intake}</td>
                                        <td className="px-6 py-3 text-gray-700">{log.average_weight || '-'}</td>
                                        <td className="px-6 py-3 flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleEditClick(log.log_date)} 
                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(log.id)} 
                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}