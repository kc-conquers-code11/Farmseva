import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// --- Types ---
interface KPIs {
    totalPigs: number;
    mortalityRate: string;
    adg: string; // Average Daily Gain (grams)
    fcr: string; // Feed Conversion Ratio
    revenue: number;
}

interface PigEntry {
    batch_id: string;
    entry_date: string;
    opening_pigs: number;
    closing_pigs: number;
    dead_today: number;
    culled: number;
    sold: number;
    feed_eaten: number;
    average_weight: number;
}

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState<KPIs>({
        totalPigs: 0,
        mortalityRate: '0.00',
        adg: '0',
        fcr: '0.00',
        revenue: 0
    });

    useEffect(() => {
        fetchAndCalculateData();
    }, []);

    const fetchAndCalculateData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // 1. Fetch ALL data sorted by date
            const { data, error } = await supabase
                .from('daily_pig_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('entry_date', { ascending: true }); // Oldest first

            if (error) throw error;

            if (data) {
                processFarmData(data);
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const processFarmData = (entries: PigEntry[]) => {
        // --- Step 1: Group Entries by Batch ID ---
        const batches: Record<string, PigEntry[]> = {};
        
        entries.forEach(entry => {
            if (!batches[entry.batch_id]) {
                batches[entry.batch_id] = [];
            }
            batches[entry.batch_id].push(entry);
        });

        // --- Step 2: Global Accumulators ---
        let globalCurrentPigs = 0;
        let globalDeaths = 0;
        let globalSold = 0;
        let globalCulled = 0;
        let globalFeedEaten = 0;
        
        // For Weighted Averages (ADG & FCR)
        let totalWeightGainAllBatches = 0;
        let totalPigDays = 0;

        // --- Step 3: Iterate through each Batch ---
        Object.keys(batches).forEach(batchId => {
            const batchData = batches[batchId];
            
            // Sort by date to be safe
            batchData.sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());

            // Get Current Status (Latest Record)
            const lastRecord = batchData[batchData.length - 1];
            globalCurrentPigs += Number(lastRecord.closing_pigs) || 0;

            // Sum up totals for this batch
            batchData.forEach(r => {
                globalDeaths += Number(r.dead_today) || 0;
                globalCulled += Number(r.culled) || 0;
                globalSold += Number(r.sold) || 0;
                globalFeedEaten += Number(r.feed_eaten) || 0;
            });

            // --- Advanced Calculations (ADG & FCR) ---
            // We need entries where average_weight > 0 to calculate gain
            const weightRecords = batchData.filter(r => Number(r.average_weight) > 0);
            
            if (weightRecords.length >= 2) {
                const startRecord = weightRecords[0];
                const endRecord = weightRecords[weightRecords.length - 1];

                const startWeight = Number(startRecord.average_weight);
                const endWeight = Number(endRecord.average_weight);

                // Calculate Weight Gain per Pig
                const weightGainPerPig = endWeight - startWeight;
                
                if (weightGainPerPig > 0) {
                    // Total herd weight gain (Approximate using current count to be conservative)
                    const batchTotalGain = weightGainPerPig * lastRecord.closing_pigs;
                    totalWeightGainAllBatches += batchTotalGain;

                    // Calculate Duration in Days
                    const date1 = new Date(startRecord.entry_date).getTime();
                    const date2 = new Date(endRecord.entry_date).getTime();
                    const diffDays = Math.ceil((date2 - date1) / (1000 * 3600 * 24));
                    
                    if (diffDays > 0) {
                        totalPigDays += (diffDays * lastRecord.closing_pigs);
                    }
                }
            }
        });

        // --- Step 4: Final Formulas ---

        // 1. RECONSTRUCTED STARTING POPULATION
        // This fixes the >100% mortality bug. 
        // Initial = Current + Dead + Sold + Culled
        const reconstructedInitialPigs = globalCurrentPigs + globalDeaths + globalSold + globalCulled;

        // Mortality Rate = (Deaths / Initial) * 100
        const mortalityRate = reconstructedInitialPigs > 0 
            ? ((globalDeaths / reconstructedInitialPigs) * 100).toFixed(2) 
            : '0.00';

        // 2. ADG (Grams per day)
        // Total Gain (kg) / Total Pig-Days * 1000
        const adg = totalPigDays > 0 
            ? ((totalWeightGainAllBatches / totalPigDays) * 1000).toFixed(0) 
            : '0';

        // 3. FCR
        // Total Feed / Total Weight Gain
        const fcr = totalWeightGainAllBatches > 0 
            ? (globalFeedEaten / totalWeightGainAllBatches).toFixed(2) 
            : '0.00';

        // 4. Revenue (Estimated)
        const AVG_PRICE_PER_PIG = 15000; // Adjust this constant as needed
        const revenue = globalSold * AVG_PRICE_PER_PIG;

        // Debugging logs to help you see the raw numbers if issues persist
        console.log("--- DASHBOARD DEBUG ---");
        console.log("Current Pigs:", globalCurrentPigs);
        console.log("Total Dead:", globalDeaths);
        console.log("Reconstructed Start:", reconstructedInitialPigs);
        console.log("Weight Gain:", totalWeightGainAllBatches);
        console.log("Feed Eaten:", globalFeedEaten);

        // --- Step 5: Update UI ---
        setKpis({
            totalPigs: globalCurrentPigs,
            mortalityRate,
            adg,
            fcr,
            revenue
        });
    };

    if (loading) {
        return (
            <div className="fade-in p-8 text-center">
                <p>Analyzing Farm Data...</p>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Farm Dashboard</h1>
                <p className="page-subtitle">Real-time performance metrics based on daily entries</p>
            </div>

            {/* KPI Grid */}
            <div className="dashboard-grid">
                
                {/* Total Pigs */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-title">Total Pigs</div>
                        <div className="kpi-icon">🐷</div>
                    </div>
                    <div className="kpi-value">{kpis.totalPigs}</div>
                    <div className="kpi-trend positive">
                        Active herd size
                    </div>
                </div>

                {/* Mortality Rate */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-title">Mortality Rate</div>
                        <div className="kpi-icon">📉</div>
                    </div>
                    <div className="kpi-value">{kpis.mortalityRate}%</div>
                    {/* Logic: Green if < 5%, Red if > 5% */}
                    <div className={`kpi-trend ${parseFloat(kpis.mortalityRate) < 5 ? 'positive' : 'negative'}`}>
                        {parseFloat(kpis.mortalityRate) < 5 ? '✓ Healthy Range' : '⚠ Above Target (5%)'}
                    </div>
                </div>

                {/* ADG */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-title">Avg Daily Gain (ADG)</div>
                        <div className="kpi-icon">📈</div>
                    </div>
                    <div className="kpi-value">{kpis.adg}g</div>
                    <div className={`kpi-trend ${parseInt(kpis.adg) > 600 ? 'positive' : 'warning'}`}>
                        {parseInt(kpis.adg) === 0 ? 'Add weights to calc' : 'Per pig / day'}
                    </div>
                </div>

                {/* FCR */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-title">FCR</div>
                        <div className="kpi-icon">⚖️</div>
                    </div>
                    <div className="kpi-value">{kpis.fcr}</div>
                    <div className={`kpi-trend ${parseFloat(kpis.fcr) > 0 && parseFloat(kpis.fcr) < 3.0 ? 'positive' : 'negative'}`}>
                        {parseFloat(kpis.fcr) === 0 ? 'Add weights to calc' : 'Kg Feed / Kg Gain'}
                    </div>
                </div>

                {/* Revenue */}
                <div className="kpi-card">
                    <div className="kpi-header">
                        <div className="kpi-title">Est. Revenue</div>
                        <div className="kpi-icon">💰</div>
                    </div>
                    <div className="kpi-value">₹{kpis.revenue.toLocaleString()}</div>
                    <div className="kpi-trend positive">
                        Based on sold count
                    </div>
                </div>
            </div>

            {/* Charts Placeholders (Visuals) */}
            <div className="form-section" style={{ marginTop: '2rem' }}>
                <h2 className="section-title">Performance Trends</h2>
                <div className="chart-container" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h3 className="chart-title" style={{ marginBottom: '1rem' }}>Data Analysis</h3>
                    <p style={{ color: '#666' }}>
                        The metrics above are calculated dynamically from your <strong>Daily Pig Entries</strong>. 
                        <br />
                        <small>
                            Note: For ADG and FCR to appear, you must record different weights in the Daily Entry page on at least two different dates.
                        </small>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;