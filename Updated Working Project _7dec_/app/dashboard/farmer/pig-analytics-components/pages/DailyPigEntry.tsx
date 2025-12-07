import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ensure path is correct

// Define the shape of the Batch data
interface Batch {
    id: string;
    name: string;
    start_date: string;
}

function DailyPigEntry() {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<any[]>([]); // Store history here
    
    // --- Hardcoded Batches ---
    const [batches] = useState<Batch[]>([
        { id: 'BATCH-001', name: 'Batch A - Nov 2024', start_date: '2024-11-01' },
        { id: 'BATCH-002', name: 'Batch B - Dec 2024', start_date: '2024-12-01' },
        { id: 'BATCH-003', name: 'Batch C - Jan 2025', start_date: '2025-01-01' },
        { id: 'BATCH-004', name: 'Batch D - Feb 2025', start_date: '2025-02-01' },
    ]);

    const [formData, setFormData] = useState({
        // Batch Info
        batchId: '',
        date: new Date().toISOString().split('T')[0],

        // Pig Status
        openingPigs: '',
        deadToday: '',
        culled: '',
        sold: '',

        // Feed Intake
        feedGiven: '',
        leftoverFeed: '',

        // Weight Sampling
        pigsWeighed: '',
        totalWeight: '',
        standardWeight: '',

        // Remarks
        remarks: ''
    });

    // --- 1. Fetch Records on Load ---
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('daily_pig_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('entry_date', { ascending: false }); // Newest first

            if (error) console.error('Error fetching records:', error);
            if (data) setRecords(data);
        }
    };

    // --- Calculated Fields ---
    const selectedBatch = batches.find(b => b.id === formData.batchId);
    
    const farmDay = selectedBatch
        ? Math.floor((new Date(formData.date).getTime() - new Date(selectedBatch.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 0;

    const deadToday = Number(formData.deadToday) || 0;
    const culled = Number(formData.culled) || 0;
    const sold = Number(formData.sold) || 0;
    const openingPigs = Number(formData.openingPigs) || 0;

    const closingPigs = openingPigs - deadToday - culled - sold;

    const mortalityPercent = openingPigs > 0
        ? ((deadToday / openingPigs) * 100).toFixed(2)
        : 0;

    const feedGiven = Number(formData.feedGiven) || 0;
    const leftoverFeed = Number(formData.leftoverFeed) || 0;
    const feedEaten = feedGiven - leftoverFeed;

    const feedPerPigGrams = openingPigs > 0
        ? ((feedEaten / openingPigs) * 1000).toFixed(0)
        : 0;

    const pigsWeighed = Number(formData.pigsWeighed) || 0;
    const totalWeight = Number(formData.totalWeight) || 0;
    const standardWeight = Number(formData.standardWeight) || 0;

    const averageWeight = pigsWeighed > 0
        ? (totalWeight / pigsWeighed).toFixed(2)
        : 0;

    const weightDifferenceGrams = standardWeight > 0
        ? ((Number(averageWeight) - standardWeight) * 1000).toFixed(0)
        : 0;

    // --- Handle Input Changes ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // --- Handle Delete ---
    const handleDelete = async (id: string) => {
        if (confirm("Delete this entry?")) {
            const { error } = await supabase.from('daily_pig_entries').delete().eq('id', id);
            if (!error) {
                setRecords(prev => prev.filter(r => r.id !== id));
            } else {
                alert(error.message);
            }
        }
    };

    // --- Submit Logic ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                alert("You must be logged in to save records.");
                setLoading(false);
                return;
            }

            if (!formData.batchId) {
                alert("Please select a batch first.");
                setLoading(false);
                return;
            }

            // Prepare Payload (Match DB Column Names)
            const dbPayload = {
                user_id: user.id,
                batch_id: formData.batchId,
                entry_date: formData.date,
                farm_day: farmDay,

                // Pig Status
                opening_pigs: openingPigs,
                dead_today: deadToday,
                culled: culled,
                sold: sold,
                closing_pigs: closingPigs,
                mortality_percent: Number(mortalityPercent),

                // Feed
                feed_given: feedGiven,
                leftover_feed: leftoverFeed,
                feed_eaten: feedEaten,
                feed_per_pig_grams: Number(feedPerPigGrams),

                // Weight
                pigs_weighed: pigsWeighed,
                total_weight: totalWeight,
                average_weight: Number(averageWeight),
                standard_weight: standardWeight,
                weight_diff_grams: Number(weightDifferenceGrams),

                remarks: formData.remarks
            };

            const { error } = await supabase
                .from('daily_pig_entries')
                .insert([dbPayload]);

            if (error) throw error;

            alert('Daily pig entry saved successfully!');
            
            // Refresh list immediately
            fetchRecords();

            // Reset form partially
            setFormData(prev => ({
                ...prev,
                openingPigs: String(closingPigs), 
                deadToday: '',
                culled: '',
                sold: '',
                feedGiven: '',
                leftoverFeed: '',
                pigsWeighed: '',
                totalWeight: '',
                remarks: ''
            }));

        } catch (error: any) {
            console.error("Submission Error:", error);
            alert(`Error saving entry: ${error.message || error.details}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in page-container">
            <div className="page-header">
                <h1 className="page-title">🐖 Daily Pig Entry</h1>
                <p className="page-subtitle">Record daily pig status, feed intake, and weight measurements</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Batch Info Section */}
                <div className="card section-card">
                    <div className="card-header">
                        <h3 className="section-title">🐖 Batch Info</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label required">Batch ID</label>
                                <select
                                    name="batchId"
                                    value={formData.batchId}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select Batch</option>
                                    {batches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label required">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Farm Day #</label>
                                <input
                                    type="number"
                                    value={farmDay}
                                    className="form-input calculated-field"
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pig Status Section */}
                <div className="card section-card">
                    <div className="card-header">
                        <h3 className="section-title">📊 Pig Status</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label required">Opening Pigs</label>
                                <input
                                    type="number"
                                    name="openingPigs"
                                    value={formData.openingPigs}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    required
                                    placeholder="Start of day count"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Dead Today</label>
                                <input
                                    type="number"
                                    name="deadToday"
                                    value={formData.deadToday}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Culled</label>
                                <input
                                    type="number"
                                    name="culled"
                                    value={formData.culled}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sold</label>
                                <input
                                    type="number"
                                    name="sold"
                                    value={formData.sold}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Closing Pigs</label>
                                <input
                                    type="number"
                                    value={closingPigs}
                                    className="form-input calculated-field"
                                    disabled
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mortality %</label>
                                <input
                                    type="text"
                                    value={`${mortalityPercent}%`}
                                    className="form-input calculated-field"
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Intake Section */}
                <div className="card section-card">
                    <div className="card-header">
                        <h3 className="section-title">🌾 Feed Intake</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Feed Given (kg)</label>
                                <input
                                    type="number"
                                    name="feedGiven"
                                    value={formData.feedGiven}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Leftover Feed (kg)</label>
                                <input
                                    type="number"
                                    name="leftoverFeed"
                                    value={formData.leftoverFeed}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Feed Eaten (kg)</label>
                                <input
                                    type="number"
                                    value={feedEaten.toFixed(2)}
                                    className="form-input calculated-field"
                                    disabled
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Feed per Pig (g)</label>
                                <input
                                    type="text"
                                    value={`${feedPerPigGrams} g`}
                                    className="form-input calculated-field"
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weight Sampling Section */}
                <div className="card section-card">
                    <div className="card-header">
                        <h3 className="section-title">⚖️ Weight Sampling</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Pigs Weighed (Sample)</label>
                                <input
                                    type="number"
                                    name="pigsWeighed"
                                    value={formData.pigsWeighed}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Total Sample Weight (kg)</label>
                                <input
                                    type="number"
                                    name="totalWeight"
                                    value={formData.totalWeight}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Avg Weight (kg)</label>
                                <input
                                    type="text"
                                    value={`${averageWeight} kg`}
                                    className="form-input calculated-field"
                                    disabled
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Standard Weight (kg)</label>
                                <input
                                    type="number"
                                    name="standardWeight"
                                    value={formData.standardWeight}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    min="0"
                                    step="0.01"
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Weight Diff (g)</label>
                                <input
                                    type="text"
                                    value={`${weightDifferenceGrams} g`}
                                    className={`form-input calculated-field ${Number(weightDifferenceGrams) < 0 ? 'text-red-500' : 'text-green-600'}`}
                                    disabled
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Remarks Section */}
                <div className="card section-card">
                    <div className="card-header">
                        <h3 className="section-title">📝 Remarks</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                className="form-textarea"
                                rows={3}
                                placeholder="Enter any additional notes..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="btn-group" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                    >
                        {loading ? '💾 Saving...' : '💾 Save Daily Entry'}
                    </button>
                </div>
            </form>

            {/* --- NEW: RECORDS LIST AT THE BOTTOM --- */}
            {records.length > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <div className="card-header">
                        <h2 className="card-title">Recent Entries ({records.length})</h2>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Farm Day</th>
                                    <th>Pigs (Dead/Culled)</th>
                                    <th>Feed Eaten</th>
                                    <th>Feed/Pig</th>
                                    <th>Avg Wt</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{new Date(record.entry_date).toLocaleDateString()}</strong></td>
                                        <td>Day {record.farm_day}</td>
                                        <td>
                                            {record.closing_pigs} 
                                            <small className="text-gray-500"> (-{record.dead_today + record.culled})</small>
                                        </td>
                                        <td>{record.feed_eaten} kg</td>
                                        <td>{record.feed_per_pig_grams} g</td>
                                        <td>{record.average_weight ? `${record.average_weight} kg` : '-'}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-danger" 
                                                onClick={() => handleDelete(record.id)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DailyPigEntry;