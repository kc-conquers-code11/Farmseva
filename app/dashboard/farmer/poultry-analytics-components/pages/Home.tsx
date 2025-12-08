'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
    Plus,
    Zap,
    LayoutDashboard,
    FileBarChart,
    Settings,
    Home as HomeIcon,
    Egg,
    Wheat,
    Loader2
} from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const [activeBatches, setActiveBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const BASE_PATH = '/dashboard/farmer/poultry-analytics';

    useEffect(() => {
        const checkActiveBatches = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Fetch ALL active batches
                    const { data, error } = await supabase
                        .from('poultry_batches')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('status', 'active')
                        .order('created_at', { ascending: false });
                    
                    if (data) {
                        setActiveBatches(data);
                    }
                }
            } catch (error) {
                console.error("Error checking batches:", error);
            } finally {
                setLoading(false);
            }
        };
        checkActiveBatches();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                        Poultry System Online
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Poultry Management</h1>
                <p className="text-gray-500 mt-1">Overview of your flock operations</p>
            </div>

            {/* --- ACTIVE FLOCKS SECTION --- */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Active Flocks ({activeBatches.length})</h2>
                
                {activeBatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeBatches.map((batch) => (
                            <div 
                                key={batch.id}
                                className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
                                onClick={() => router.push(`${BASE_PATH}/analytics`)} // Currently goes to main analytics (latest flock usually)
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                    <Egg size={80} />
                                </div>
                                <div>
                                    <div className="text-blue-100 font-medium text-xs mb-1 uppercase tracking-wide">{batch.bird_type}</div>
                                    <div className="text-2xl font-bold mb-2">{batch.batch_name}</div>
                                    <div className="flex items-center gap-3 text-blue-50 text-sm">
                                        <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                                            {new Date(batch.start_date).toLocaleDateString()}
                                        </span>
                                        <span>• {batch.current_birds} Birds Active</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Add New Card (Small) */}
                        <div 
                            className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 hover:text-emerald-600 hover:border-emerald-300"
                            onClick={() => router.push(`${BASE_PATH}/setup-chicks`)}
                        >
                            <Plus size={32} className="mb-2" />
                            <span className="font-semibold">Add Another Flock</span>
                        </div>
                    </div>
                ) : (
                    /* --- EMPTY STATE --- */
                    <div 
                        className="bg-white border-2 border-dashed border-gray-300 p-10 rounded-2xl text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                        onClick={() => router.push(`${BASE_PATH}/setup-chicks`)}
                    >
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="text-emerald-600" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Start a New Flock</h2>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            No active batches found. Click here to register a new batch of chicks.
                        </p>
                        <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">
                            Initialize Cycle
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Daily Log */}
                    <div 
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                        onClick={() => router.push(`${BASE_PATH}/daily-entry`)}
                    >
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                            <Zap className="text-orange-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Daily Log</h3>
                        <p className="text-xs text-gray-500 mt-1">Record mortality & feed</p>
                    </div>

                    {/* Analytics */}
                    <div 
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                        onClick={() => router.push(`${BASE_PATH}/analytics`)}
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                            <LayoutDashboard className="text-blue-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Analytics Dashboard</h3>
                        <p className="text-xs text-gray-500 mt-1">View growth charts & FCR</p>
                    </div>

                    {/* Feed Setup */}
                    <div 
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                        onClick={() => router.push(`${BASE_PATH}/setup-feed`)}
                    >
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                            <Wheat className="text-yellow-600" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Feed Settings</h3>
                        <p className="text-xs text-gray-500 mt-1">Manage bags & prices</p>
                    </div>
                </div>
            </div>

            {/* Management */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-pink-300 cursor-pointer transition-all flex items-center gap-4" onClick={() => router.push(`${BASE_PATH}/reports`)}>
                        <div className="p-3 bg-pink-50 rounded-lg">
                            <FileBarChart className="text-pink-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Reports</h3>
                            <p className="text-xs text-gray-500">Export data as PDF/CSV</p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-400 cursor-pointer transition-all flex items-center gap-4" onClick={() => router.push(`${BASE_PATH}/setup-farm`)}>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HomeIcon className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Farm Setup</h3>
                            <p className="text-xs text-gray-500">Configure sheds & details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}