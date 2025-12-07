'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; 
import { Save, Calendar, Bird, Home, History, Trash2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

interface FormData {
    arrivalDate: string;
    shedName: string;
    breed: string;
    count: number;
    price: number;
    plannedDays: number;
    initialWeight: number;
}

export default function ChicksEntry() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sheds, setSheds] = useState<string[]>(['Shed 1', 'Shed 2', 'Brooder House']);
    const [flockHistory, setFlockHistory] = useState<any[]>([]); // Store history

    const [formData, setFormData] = useState<FormData>({
        arrivalDate: format(new Date(), 'yyyy-MM-dd'),
        shedName: 'Shed 1',
        breed: 'Broiler',
        count: 0,
        price: 0,
        plannedDays: 45,
        initialWeight: 40
    });

    // Fetch Sheds & History on Load
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // 1. Get Sheds
                const { data: shedData } = await supabase.from('poultry_sheds').select('name');
                if (shedData && shedData.length > 0) setSheds(shedData.map(s => s.name));

                // 2. Get Flock History
                fetchHistory(user.id);
            }
        };
        fetchData();
    }, []);

    const fetchHistory = async (userId: string) => {
        const { data } = await supabase
            .from('poultry_batches')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (data) setFlockHistory(data);
    };

    // Calculate Expected Sale Date
    const expectedSaleDate = formData.arrivalDate
        ? format(addDays(new Date(formData.arrivalDate), formData.plannedDays), 'yyyy-MM-dd')
        : '';

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this flock? This will delete all its logs too.")) {
            const { error } = await supabase.from('poultry_batches').delete().eq('id', id);
            if (!error) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) fetchHistory(user.id);
            } else {
                alert("Error deleting flock: " + error.message);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.breed || formData.count <= 0) {
            alert('Please fill in Breed and Chick Count.');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // 2. Create New Batch in Supabase
            const { error } = await supabase
                .from('poultry_batches')
                .insert([{
                    user_id: user.id,
                    batch_name: `${formData.breed} - ${formData.shedName} (${formData.arrivalDate})`,
                    bird_type: formData.breed,
                    start_date: formData.arrivalDate,
                    initial_birds: formData.count,
                    current_birds: formData.count,
                    status: 'active'
                }]);

            if (error) throw error;

            alert("Flock started successfully!");
            
            // Refresh history instead of redirecting
            fetchHistory(user.id);
            
            // Reset form partially
            setFormData(prev => ({ ...prev, count: 0, price: 0 }));

        } catch (error: any) {
            console.error("Error creating batch:", error);
            alert("Failed to create flock: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in">
            
            {/* --- FORM SECTION --- */}
            <div className="text-center mb-10">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Bird className="text-emerald-600" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Start New Flock</h2>
                <p className="text-gray-500 mt-2">Enter initial details to track your new batch</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-8 mb-12">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Arrival Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Arrival Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pl-10 transition-all"
                                value={formData.arrivalDate}
                                onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })}
                                required
                            />
                            <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* Shed Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Housing / Shed</label>
                        <div className="relative">
                            <select
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none pl-10 appearance-none bg-white transition-all"
                                value={formData.shedName}
                                onChange={e => setFormData({ ...formData, shedName: e.target.value })}
                            >
                                {sheds.map((shed, i) => (
                                    <option key={i} value={shed}>{shed}</option>
                                ))}
                            </select>
                            <Home className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Breed */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Breed Type</label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.breed}
                            onChange={e => setFormData({ ...formData, breed: e.target.value })}
                            placeholder="e.g., Cobb 500"
                            required
                        />
                    </div>

                    {/* Chick Count */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Chicks</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.count || ''}
                            onChange={e => setFormData({ ...formData, count: parseInt(e.target.value) || 0 })}
                            placeholder="e.g., 1000"
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price per Chick */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cost per Chick (₹)</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.price || ''}
                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            placeholder="Optional"
                        />
                    </div>

                    {/* Initial Weight */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Avg Chick Weight (g)</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.initialWeight || ''}
                            onChange={e => setFormData({ ...formData, initialWeight: parseFloat(e.target.value) || 0 })}
                            placeholder="Standard: 40g"
                        />
                    </div>
                </div>

                {/* Planning Section */}
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <Calendar size={16} /> Harvest Planning
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-blue-600 mb-1">Planned Cycle (Days)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm focus:ring-1 focus:ring-blue-400 outline-none"
                                value={formData.plannedDays}
                                onChange={e => setFormData({ ...formData, plannedDays: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-blue-600 mb-1">Expected Sale Date</label>
                            <div className="flex items-center px-3 py-2 bg-white rounded-lg border border-blue-200 text-sm font-medium text-blue-900">
                                {expectedSaleDate || '...'}
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 mt-6"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="animate-pulse">Creating Flock...</span>
                    ) : (
                        <>
                            <Save size={20} /> Start Flock
                        </>
                    )}
                </button>
            </form>

            {/* --- HISTORY TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <History size={18} className="text-gray-500" />
                    <h3 className="font-bold text-gray-800">Flock History</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Batch Name</th>
                                <th className="px-6 py-3">Start Date</th>
                                <th className="px-6 py-3">Birds</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3 text-right">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {flockHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        No flocks recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                flockHistory.map((flock) => (
                                    <tr key={flock.id} className="hover:bg-blue-50/50 transition">
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            {flock.batch_name}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {new Date(flock.start_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-gray-700">
                                            {flock.initial_birds}
                                        </td>
                                        <td className="px-6 py-3 text-gray-700">
                                            {flock.bird_type}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${flock.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {flock.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button 
                                                onClick={() => handleDelete(flock.id)} 
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
    );
}