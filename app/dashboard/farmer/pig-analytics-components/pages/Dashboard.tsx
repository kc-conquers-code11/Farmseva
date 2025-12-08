import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, ComposedChart, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, Activity,
    Scale, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight,
    Coins, Baby, Droplets, Zap, Skull, ShieldCheck // <--- Added ShieldCheck here
} from 'lucide-react';

// --- COLORS ---
const COLORS = {
    primary: '#db2777', // Pink-600
    secondary: '#4f46e5', // Indigo-600
    success: '#10b981', // Emerald-500
    warning: '#f59e0b', // Amber-500
    danger: '#ef4444', // Red-500
    feed: '#d97706', // Amber-600
    weight: '#0891b2', // Cyan-600
    revenue: '#059669', // Emerald-600
    cost: '#dc2626',   // Red-600
    pie: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
};

// --- TYPES ---
interface DashboardData {
    kpis: {
        totalPigs: number;
        mortalityRate: number;
        adg: number;
        fcr: number;
        revenue: number;
        feedConsumedTotal: number;
    };
    trends: {
        feedWeight: any[];
        revenueVsCost: any[]; // New: Revenue vs Estimated Cost
        farrowing: any[];
        inventory: any[];
        mortalityTrend: any[]; // New: Mortality over time
    };
}

function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Parallel Fetching
            const [
                { data: dailyEntries },
                { data: dispatches },
                { data: farrowings },
                { data: feedStock }
            ] = await Promise.all([
                supabase.from('daily_pig_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: true }),
                supabase.from('dispatch_records').select('*').eq('user_id', user.id).order('dispatch_date', { ascending: true }),
                supabase.from('farrowing_records').select('*').eq('user_id', user.id).order('farrowing_date', { ascending: true }),
                supabase.from('feed_stock_logs').select('*').eq('user_id', user.id)
            ]);

            // --- PROCESS DATA ---

            // A. KPIs
            const currentPigs = dailyEntries && dailyEntries.length > 0
                ? dailyEntries[dailyEntries.length - 1].closing_pigs
                : 0;

            const totalRevenue = dispatches?.reduce((sum, r) => sum + (r.price || 0), 0) || 0;
            const totalFeedConsumed = dailyEntries?.reduce((sum, r) => sum + (r.feed_eaten || 0), 0) || 0;

            // Calculate FCR & ADG from latest valid entry
            const validEntries = dailyEntries?.filter((r: any) => r.average_weight > 0 && r.feed_eaten > 0) || [];
            const latestEntry = validEntries.length > 0 ? validEntries[validEntries.length - 1] : null;

            // Rough FCR estimation: Total Feed / Total Weight Gain (Estimated)
            // This is highly simplified. Real FCR needs batch-level tracking.
            const fcr = latestEntry ? (latestEntry.feed_eaten / (latestEntry.weight_diff_grams / 1000 || 1)) : 0;
            const adg = latestEntry ? latestEntry.weight_diff_grams : 0;

            // Mortality Rate
            const totalDead = dailyEntries?.reduce((sum, r) => sum + (r.dead_today || 0), 0) || 0;
            const maxOpening = dailyEntries?.reduce((max, r) => Math.max(max, r.opening_pigs), 0) || 1;
            const mortalityRate = (totalDead / maxOpening) * 100;

            // B. CHARTS PREPARATION

            // 1. Feed vs Weight Trend (Last 30 entries)
            const feedWeightData = dailyEntries?.slice(-30).map((r: any) => ({
                date: new Date(r.entry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                feed: r.feed_eaten,
                weight: r.average_weight,
                fcr: r.weight_diff_grams > 0 ? (r.feed_eaten / (r.weight_diff_grams / 1000)).toFixed(1) : 0
            })) || [];

            // 2. Revenue vs Cost (Monthly)
            const revenueMap = new Map();
            const feedCostMap = new Map(); // Est. cost based on generic feed price (e.g., 30/kg)
            const FEED_PRICE_PER_KG = 35; // Mock price

            dispatches?.forEach((d: any) => {
                const month = new Date(d.dispatch_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                revenueMap.set(month, (revenueMap.get(month) || 0) + d.price);
            });

            dailyEntries?.forEach((d: any) => {
                const month = new Date(d.entry_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                const cost = d.feed_eaten * FEED_PRICE_PER_KG;
                feedCostMap.set(month, (feedCostMap.get(month) || 0) + cost);
            });

            // Merge maps for chart
            const allMonths = new Set([...revenueMap.keys(), ...feedCostMap.keys()]);
            const revenueVsCostData = Array.from(allMonths).map(month => ({
                name: month,
                revenue: revenueMap.get(month) || 0,
                cost: Math.round(feedCostMap.get(month) || 0),
                profit: (revenueMap.get(month) || 0) - (feedCostMap.get(month) || 0)
            })).sort((a, b) => new Date(`01 ${a.name}`).getTime() - new Date(`01 ${b.name}`).getTime());


            // 3. Farrowing Performance
            const farrowingData = farrowings?.map((f: any) => ({
                date: new Date(f.farrowing_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                live: f.live_born,
                mortality: f.stillborn + f.mummified,
                total: f.total_born
            })) || [];

            // 4. Inventory
            const inventoryMap = new Map();
            feedStock?.forEach((f: any) => {
                inventoryMap.set(f.feed_type, f.closing_stock);
            });
            const inventoryData = Array.from(inventoryMap).map(([name, value]) => ({ name, value }));

            // 5. Mortality Trend
            const mortalityData = dailyEntries?.slice(-30).map((r: any) => ({
                date: new Date(r.entry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                dead: r.dead_today,
                culled: r.culled
            })) || [];

            setData({
                kpis: {
                    totalPigs: Number(currentPigs),
                    mortalityRate,
                    adg: Number(adg),
                    fcr: Math.abs(fcr) > 10 ? 0 : Math.abs(fcr),
                    revenue: totalRevenue,
                    feedConsumedTotal: totalFeedConsumed
                },
                trends: {
                    feedWeight: feedWeightData,
                    revenueVsCost: revenueVsCostData,
                    farrowing: farrowingData,
                    inventory: inventoryData,
                    mortalityTrend: mortalityData
                }
            });

        } catch (error) {
            console.error("Dashboard Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-200 shadow-xl rounded-xl text-xs z-50">
                    <p className="font-bold text-slate-800 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1.5 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-slate-600">{entry.name}:</span>
                            <span className="text-slate-900 font-bold">
                                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                                {entry.unit ? ` ${entry.unit}` : ''}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-pink-600 text-xs">Loading</div>
                </div>
                <p className="mt-6 text-slate-500 font-medium animate-pulse">Generating Insights...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">

            {/* 1. HERO KPIS */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Operational Pulse</h2>
                    <span className="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500 shadow-sm">
                        Last updated: Just now
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Total Herd */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Livestock</p>
                                    <h3 className="text-4xl font-black text-slate-800 mt-2">{data?.kpis.totalPigs}</h3>
                                </div>
                                <div className="p-3 bg-pink-100 text-pink-600 rounded-xl shadow-sm group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                    <Activity size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                    <ArrowUpRight size={12} /> Active
                                </span>
                                <span className="text-xs text-slate-400">Current herd size</span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</p>
                                    <h3 className="text-4xl font-black text-slate-800 mt-2">₹{(data?.kpis.revenue || 0).toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <Coins size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                    <TrendingUp size={12} /> Sales
                                </span>
                                <span className="text-xs text-slate-400">Lifetime earnings</span>
                            </div>
                        </div>
                    </div>

                    {/* Feed Efficiency (FCR) */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feed Efficiency (FCR)</p>
                                    <h3 className="text-4xl font-black text-slate-800 mt-2">{data?.kpis.fcr?.toFixed(2)}</h3>
                                </div>
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Scale size={24} />
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 mt-4`}>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${data?.kpis.fcr && data.kpis.fcr < 3 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                    {data?.kpis.fcr && data.kpis.fcr < 3 ? 'Optimal' : 'Attention'}
                                </span>
                                <span className="text-xs text-slate-400">Ratio (Feed/Gain)</span>
                            </div>
                        </div>
                    </div>

                    {/* Mortality */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mortality Rate</p>
                                    <h3 className="text-4xl font-black text-slate-800 mt-2">{data?.kpis.mortalityRate?.toFixed(1)}%</h3>
                                </div>
                                <div className="p-3 bg-red-100 text-red-600 rounded-xl shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Skull size={24} />
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 mt-4`}>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${data?.kpis.mortalityRate && data.kpis.mortalityRate < 5 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                    {data?.kpis.mortalityRate && data.kpis.mortalityRate < 5 ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                                    {data?.kpis.mortalityRate && data.kpis.mortalityRate < 5 ? 'Safe' : 'High'}
                                </span>
                                <span className="text-xs text-slate-400">Global average</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. FINANCIAL & PERFORMANCE GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* REVENUE VS COST CHART */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-600" /> Financial Performance
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Monthly Revenue vs Estimated Feed Cost</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Revenue
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span> Cost (Est)
                            </div>
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.trends.revenueVsCost} barGap={0} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="cost" name="Feed Cost" fill={COLORS.cost} radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* INVENTORY DONUT */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-600" /> Feed Inventory
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">Current stock distribution</p>

                    <div className="flex-1 min-h-[250px] relative">
                        {data?.trends.inventory.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm">No Data Available</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.trends.inventory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.trends.inventory.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-800">{data?.trends.inventory.reduce((a: any, b: any) => a + b.value, 0).toLocaleString()}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">Kg Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. PRODUCTION & HEALTH ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* GROWTH CHART */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-600" /> Growth & Efficiency
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Feed Intake (Bar) vs Weight Gain (Line)</p>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data?.trends.feedWeight}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Feed (kg)', angle: -90, position: 'insideLeft', style: { fill: '#d97706', fontSize: 10 } }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Wt (kg)', angle: 90, position: 'insideRight', style: { fill: '#0891b2', fontSize: 10 } }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar yAxisId="left" dataKey="feed" name="Feed Eaten (kg)" fill={COLORS.feed} radius={[4, 4, 0, 0]} barSize={12} />
                                <Line yAxisId="right" type="monotone" dataKey="weight" name="Avg Weight (kg)" stroke={COLORS.weight} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* MORTALITY & FARROWING */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Mortality Trend */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <h3 className="font-bold text-slate-800">Health Alerts (Mortality)</h3>
                        </div>
                        <div className="h-[100px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.trends.mortalityTrend}>
                                    <defs>
                                        <linearGradient id="colorDeath" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="dead" stroke="#ef4444" strokeWidth={2} fill="url(#colorDeath)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Farrowing Stats */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Baby className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-slate-800">Farrowing Productivity</h3>
                        </div>
                        <div className="h-[140px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.trends.farrowing} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="date" type="category" width={50} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="live" name="Live Born" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
                                    <Bar dataKey="mortality" name="Loss" stackId="a" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;