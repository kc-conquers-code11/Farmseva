'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
    LayoutDashboard, 
    Wheat, 
    Skull, 
    Activity, 
    Egg, 
    Loader2
} from 'lucide-react';

// Add props interface
interface DashboardProps {
    onRequestTab?: (tab: string) => void;
}

export default function Dashboard({ onRequestTab }: DashboardProps) {
    const [loading, setLoading] = useState(true);
    const [activeBatch, setActiveBatch] = useState<any>(null);
    const [kpis, setKpis] = useState({
        currentBirds: 0,
        mortalityRate: '0.00',
        totalFeed: 0,
        fcr: '0.00',
        avgWeight: 0,
        age: 1
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: batch } = await supabase
                .from('poultry_batches')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);

            if (batch && batch.length > 0) {
                const currentBatch = batch[0];
                setActiveBatch(currentBatch);

                const { data: dailyLogs } = await supabase
                    .from('poultry_daily_logs')
                    .select('*')
                    .eq('batch_id', currentBatch.id)
                    .order('log_date', { ascending: true });

                if (dailyLogs) {
                    calculateStats(currentBatch, dailyLogs);
                }
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (batch: any, dailyLogs: any[]) => {
        const totalDead = dailyLogs.reduce((sum, log) => sum + (log.mortality || 0), 0);
        const totalCulls = dailyLogs.reduce((sum, log) => sum + (log.culls || 0), 0);
        const totalFeed = dailyLogs.reduce((sum, log) => sum + (log.feed_intake || 0), 0);
        const currentBirds = batch.initial_birds - totalDead - totalCulls;
        
        const mortalityRate = batch.initial_birds > 0 
            ? ((totalDead / batch.initial_birds) * 100).toFixed(2) 
            : '0.00';

        const start = new Date(batch.start_date);
        const today = new Date();
        const age = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        const lastLogWithWeight = [...dailyLogs].reverse().find(l => l.average_weight > 0);
        const currentWeight = lastLogWithWeight ? lastLogWithWeight.average_weight : 0;

        let fcr = '0.00';
        if (currentWeight > 0) {
            const initialBiomass = batch.initial_birds * 0.04; 
            const currentBiomass = (currentBirds * currentWeight) / 1000; 
            const weightGain = currentBiomass - initialBiomass;
            if (weightGain > 0) fcr = (totalFeed / weightGain).toFixed(2);
        }

        setKpis({
            currentBirds,
            mortalityRate,
            totalFeed: parseFloat(totalFeed.toFixed(1)),
            fcr,
            avgWeight: currentWeight,
            age: age > 0 ? age : 1
        });
    };

    if (loading) return <div className="flex h-[30vh] items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

    if (!activeBatch) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-center min-h-[50vh]">
                <div className="bg-emerald-100 p-6 rounded-full mb-6">
                    <Egg size={48} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Flock Found</h2>
                <p className="text-gray-500 mb-8">Analytics will appear here once you start a flock.</p>
                <button onClick={() => onRequestTab && onRequestTab('setup')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition">
                    Start New Flock
                </button>
            </div>
        );
    }

    return (
        <div className="p-2 animate-fade-in">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{activeBatch.batch_name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Active
                        </span>
                        <span className="text-gray-500 text-sm">• Started {new Date(activeBatch.start_date).toLocaleDateString()}</span>
                    </div>
                </div>
                {/* 👇 This button now switches the tab */}
                <button 
                    onClick={() => onRequestTab && onRequestTab('entry')}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-100"
                >
                    <Activity size={18} /> Add Daily Log
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><Egg size={24} /></div>
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">Day {kpis.age}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 relative z-10">{kpis.currentBirds.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 font-medium relative z-10">Live Birds</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-red-50 rounded-xl text-red-600"><Skull size={24} /></div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${parseFloat(kpis.mortalityRate) < 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {kpis.mortalityRate}%
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 relative z-10">{activeBatch.initial_birds - kpis.currentBirds}</div>
                    <p className="text-sm text-gray-500 font-medium relative z-10">Total Mortality</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600"><Wheat size={24} /></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 relative z-10">{kpis.totalFeed.toLocaleString()} <span className="text-lg text-gray-400 font-normal">kg</span></div>
                    <p className="text-sm text-gray-500 font-medium relative z-10">Total Feed Consumed</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><Activity size={24} /></div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${parseFloat(kpis.fcr) > 0 && parseFloat(kpis.fcr) < 1.6 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {parseFloat(kpis.fcr) > 0 ? 'Running' : 'No Data'}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 relative z-10">{kpis.fcr}</div>
                    <p className="text-sm text-gray-500 font-medium relative z-10">Feed Conversion Ratio</p>
                </div>
            </div>
        </div>
    );
}