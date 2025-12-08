'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Save, Loader2, Trash2, History } from 'lucide-react';

export default function FeedSetup() {
    const router = useRouter();
    const [batchId, setBatchId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [feedHistory, setFeedHistory] = useState<any[]>([]); // Store history

    const [formData, setFormData] = useState({
        company: '',
        bagWeight: 50,
        bagPrice: 0,
        initialStock: 0
    });

    // 1. Fetch Active Batch & History
    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if(user) {
                    // Get Active Batch
                    const { data: batchData } = await supabase
                        .from('poultry_batches')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('status', 'active')
                        .order('created_at', {ascending: false})
                        .limit(1)
                        .single();

                    if (batchData) {
                        setBatchId(batchData.id);
                        fetchFeedHistory(batchData.id); // Load history
                    } else {
                        alert("No active flock found. Please go back to Step 1.");
                        router.push('/dashboard/farmer/poultry-analytics/setup-chicks');
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setInitializing(false);
            }
        };
        
        init();
    }, [router]);

    // Fetch History Function
    const fetchFeedHistory = async (batchId: string) => {
        const { data } = await supabase
            .from('poultry_feed_settings')
            .select('*')
            .eq('batch_id', batchId)
            .order('created_at', { ascending: false });
        
        if (data) setFeedHistory(data);
    };

    // Handle Delete
    const handleDelete = async (id: string) => {
        if(confirm("Delete this feed record?")) {
            const { error } = await supabase.from('poultry_feed_settings').delete().eq('id', id);
            if(!error && batchId) {
                fetchFeedHistory(batchId);
            }
        }
    };

    // Handle Submit (Add New)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!batchId) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            const { error } = await supabase.from('poultry_feed_settings').insert([{
                user_id: user?.id,
                batch_id: batchId,
                company: formData.company,
                bag_weight: formData.bagWeight,
                bag_price: formData.bagPrice,
                initial_stock: formData.initialStock
            }]);

            if (error) throw error;

            // Refresh history and clear form (optional)
            await fetchFeedHistory(batchId);
            alert("Feed Added Successfully!");
            
            // Reset form but keep Company Name for convenience
            setFormData(prev => ({ ...prev, initialStock: 0, bagPrice: 0 }));

        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        router.push('/dashboard/farmer/poultry-analytics/analytics');
    };

    if (initializing) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Feed Management</h2>
                    <p className="text-gray-500 mt-1">Add feed stock & view history</p>
                </div>
                
                {/* --- FORM SECTION --- */}
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md border border-gray-200 space-y-6 mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                            <Save size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">Add New Feed Stock</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Feed Company / Type</label>
                        <input 
                            className="w-full p-3 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                            placeholder="e.g. Godrej Starter" 
                            value={formData.company} 
                            onChange={e => setFormData({...formData, company: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bag Weight (kg)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                                value={formData.bagWeight} 
                                onChange={e => setFormData({...formData, bagWeight: parseFloat(e.target.value) || 0})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price/Bag (₹)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                                value={formData.bagPrice} 
                                onChange={e => setFormData({...formData, bagPrice: parseFloat(e.target.value) || 0})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (Bags)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                                value={formData.initialStock} 
                                onChange={e => setFormData({...formData, initialStock: parseFloat(e.target.value) || 0})} 
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            type="submit" 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-md"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Add Stock
                        </button>
                        
                        <button 
                            type="button"
                            onClick={handleFinish}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                        >
                            Done / Go to Dashboard
                        </button>
                    </div>
                </form>

                {/* --- HISTORY TABLE SECTION --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <History size={18} className="text-gray-500" />
                        <h3 className="font-bold text-gray-800">Feed Purchase History</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Feed Details</th>
                                    <th className="px-6 py-3">Quantity</th>
                                    <th className="px-6 py-3">Cost</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {feedHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            No feed history yet. Add stock above.
                                        </td>
                                    </tr>
                                ) : (
                                    feedHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/50 transition">
                                            <td className="px-6 py-3 text-gray-500">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-900">
                                                {item.company} <span className="text-gray-400 text-xs font-normal">({item.bag_weight}kg bags)</span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-700">
                                                {item.initial_stock} Bags
                                            </td>
                                            <td className="px-6 py-3 text-emerald-700 font-medium">
                                                ₹{(item.bag_price * item.initial_stock).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button 
                                                    onClick={() => handleDelete(item.id)} 
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
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
        </div>
    );
}