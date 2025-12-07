import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 

// Define Batch Interface
interface Batch {
    id: string;
    name: string;
    start_date: string;
}

function DailyFeedWeight() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // --- UPDATED: Hardcoded Batches ---
    const [batches, setBatches] = useState<Batch[]>([
        { id: 'BATCH-001', name: 'Batch A - Nov 2024', start_date: '2024-11-01' },
        { id: 'BATCH-002', name: 'Batch B - Dec 2024', start_date: '2024-12-01' },
        { id: 'BATCH-003', name: 'Batch C - Jan 2025', start_date: '2025-01-01' },
        { id: 'BATCH-004', name: 'Batch D - Feb 2025', start_date: '2025-02-01' },
    ]);
    
    // Form State
    const [formData, setFormData] = useState({
        batchId: '', // Required by DB
        date: new Date().toISOString().split('T')[0],
        openingPigs: 0,
        feedGiven: 0,
        leftoverFeed: 0,
        pigsWeighed: 0,
        totalSampleWeight: 0,
        standardWeight: 0,
        remarks: ''
    });

    const [errors, setErrors] = useState<any>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- 1. Fetch Records on Mount ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // A. Fetch Batches (REMOVED - Using Hardcoded)

            // B. Fetch Pig Entries (The Table Data)
            const { data: entryData, error } = await supabase
                .from('daily_pig_entries')
                .select('*')
                .eq('user_id', user.id) // Security: Only get my data
                .order('entry_date', { ascending: false });

            if (entryData) {
                // Map DB snake_case columns back to our UI camelCase
                const formatted = entryData.map(r => ({
                    id: r.id,
                    batchId: r.batch_id,
                    date: r.entry_date,
                    openingPigs: r.opening_pigs,
                    feedGiven: r.feed_given,
                    leftoverFeed: r.leftover_feed,
                    feedEaten: r.feed_eaten,
                    pigsWeighed: r.pigs_weighed,
                    totalSampleWeight: r.total_weight,
                    standardWeight: r.standard_weight,
                    averageWeight: r.average_weight,
                    weightDifference: r.weight_diff_grams,
                    remarks: r.remarks,
                    fcr: 0, // Calculated dynamically below if needed
                    feedPerPig: r.feed_per_pig_grams
                }));
                setRecords(formatted);
            }
        }
        setLoading(false);
    };

    // --- Calculations ---
    const calculateFeedEaten = () => {
        return Math.max(0, formData.feedGiven - formData.leftoverFeed);
    };

    const calculateAverageWeight = () => {
        return formData.pigsWeighed > 0 ? formData.totalSampleWeight / formData.pigsWeighed : 0;
    };

    const calculateWeightDifference = () => {
        const avgWeight = calculateAverageWeight();
        return (avgWeight - formData.standardWeight) * 1000; 
    };

    const calculateTotalLiveWeight = () => {
        const avgWeight = calculateAverageWeight();
        return avgWeight * formData.openingPigs;
    };

    const calculateFeedPerPig = () => {
        const feedEaten = calculateFeedEaten();
        return formData.openingPigs > 0 ? (feedEaten / formData.openingPigs) * 1000 : 0;
    };

    // --- Calculate Cumulative Feed for Display ---
    const cumulativeFeed = records.reduce((sum, r) => sum + (Number(r.feedEaten) || 0), 0);

    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.batchId) newErrors.batchId = 'Batch is required';
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.openingPigs || formData.openingPigs <= 0) newErrors.openingPigs = 'Opening Pigs required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- 2. Handle Submit (Insert/Update to Supabase) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // Prepare Payload for DB (snake_case)
            const dbPayload = {
                user_id: user.id,
                batch_id: formData.batchId,
                entry_date: formData.date,
                
                opening_pigs: formData.openingPigs,
                feed_given: formData.feedGiven,
                leftover_feed: formData.leftoverFeed,
                feed_eaten: calculateFeedEaten(),
                
                pigs_weighed: formData.pigsWeighed,
                total_weight: formData.totalSampleWeight,
                standard_weight: formData.standardWeight,
                average_weight: calculateAverageWeight(),
                weight_diff_grams: calculateWeightDifference(),
                
                feed_per_pig_grams: calculateFeedPerPig(),
                remarks: formData.remarks
            };

            let error;
            if (editingId) {
                // UPDATE existing
                const { error: updateError } = await supabase
                    .from('daily_pig_entries')
                    .update(dbPayload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                // INSERT new
                const { error: insertError } = await supabase
                    .from('daily_pig_entries')
                    .insert([dbPayload]);
                error = insertError;
            }

            if (error) throw error;

            // Refresh table
            await fetchInitialData();
            resetForm();

        } catch (error: any) {
            alert("Error saving: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- 3. Handle Delete (Supabase) ---
    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this record?')) {
            const { error } = await supabase
                .from('daily_pig_entries')
                .delete()
                .eq('id', id);
            
            if (!error) {
                setRecords(prev => prev.filter(r => r.id !== id));
            }
        }
    };

    const handleEdit = (record: any) => {
        setFormData({
            batchId: record.batchId,
            date: record.date,
            openingPigs: record.openingPigs,
            feedGiven: record.feedGiven,
            leftoverFeed: record.leftoverFeed,
            pigsWeighed: record.pigsWeighed,
            totalSampleWeight: record.totalSampleWeight,
            standardWeight: record.standardWeight,
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData(prev => ({
            ...prev,
            feedGiven: 0,
            leftoverFeed: 0,
            pigsWeighed: 0,
            totalSampleWeight: 0,
            standardWeight: 0,
            remarks: ''
        }));
        setEditingId(null);
        setErrors({});
    };

    const handleChange = (e: any) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Daily Feed & Weight Records</h1>
                <p className="page-subtitle">Track daily feed consumption and weight sampling</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Daily Record</h2>
                    <p className="card-subtitle">Log feed intake and weight measurements</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        
                        {/* BATCH SELECTOR (Crucial for DB) */}
                        <div className="form-group mb-4">
                            <label className="form-label required">Select Batch</label>
                            <select 
                                name="batchId" 
                                value={formData.batchId} 
                                onChange={handleChange}
                                className={`form-select ${errors.batchId ? 'error' : ''}`}
                            >
                                <option value="">-- Choose a Batch --</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            {errors.batchId && <span className="form-error">⚠ {errors.batchId}</span>}
                        </div>

                        {/* Feed Intake Section */}
                        <div className="form-section">
                            <h3 className="section-title">Feed Intake</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label required">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        className={`form-input ${errors.date ? 'error' : ''}`}
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Opening Pigs</label>
                                    <input
                                        type="number"
                                        name="openingPigs"
                                        className={`form-input ${errors.openingPigs ? 'error' : ''}`}
                                        min="1"
                                        value={formData.openingPigs}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Feed Given (kg)</label>
                                    <input
                                        type="number"
                                        name="feedGiven"
                                        className="form-input"
                                        step="0.1"
                                        value={formData.feedGiven}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Leftover Feed (kg)</label>
                                    <input
                                        type="number"
                                        name="leftoverFeed"
                                        className="form-input"
                                        step="0.1"
                                        value={formData.leftoverFeed}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Feed Eaten (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={calculateFeedEaten().toFixed(2)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Cumulative (Global)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={(cumulativeFeed + calculateFeedEaten()).toFixed(2)}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Weight Tracking Section */}
                        <div className="form-section">
                            <h3 className="section-title">Weight Tracking</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Pigs Weighed</label>
                                    <input
                                        type="number"
                                        name="pigsWeighed"
                                        className="form-input"
                                        value={formData.pigsWeighed}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Total Sample Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="totalSampleWeight"
                                        className="form-input"
                                        step="0.1"
                                        value={formData.totalSampleWeight}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Avg Weight (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={calculateAverageWeight().toFixed(2)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Standard Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="standardWeight"
                                        className="form-input"
                                        step="0.1"
                                        value={formData.standardWeight}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Weight Diff (g)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={calculateWeightDifference().toFixed(0)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Total Live Weight</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={calculateTotalLiveWeight().toFixed(2)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Feed per Pig (g/day)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={calculateFeedPerPig().toFixed(0)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        className="form-textarea"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="btn-group">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : (editingId ? '✓ Update Record' : '+ Add Record')}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    ✕ Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Records Table */}
            {records.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Feed & Weight Records ({records.length})</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Pigs</th>
                                    <th>Feed Eaten</th>
                                    <th>Avg Weight</th>
                                    <th>Weight Diff</th>
                                    <th>Feed/Pig</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{new Date(record.date).toLocaleDateString()}</strong></td>
                                        <td>{record.openingPigs}</td>
                                        <td>{record.feedEaten?.toFixed(1)} kg</td>
                                        <td>{record.averageWeight?.toFixed(2)} kg</td>
                                        <td>
                                            <span className={`badge ${record.weightDifference >= 0 ? 'badge-success' : 'badge-warning'}`}>
                                                {record.weightDifference?.toFixed(0)} g
                                            </span>
                                        </td>
                                        <td>{record.feedPerPig?.toFixed(0)} g</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleEdit(record)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
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

export default DailyFeedWeight;