import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define Batch Interface (ab use nahi ho raha, chahe to hata bhi sakte ho)
// interface Batch {
//     id: string;
//     name: string;
//     start_date: string;
// }

function FarrowingRecords() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // --- 1. Hardcoded Batches --- (DROPDOWN HATANE KE LIYE HATA DIYA)
    // const [batches] = useState<Batch[]>([
    //     { id: 'BATCH-001', name: 'Batch A - Nov 2024', start_date: '2024-11-01' },
    //     { id: 'BATCH-002', name: 'Batch B - Dec 2024', start_date: '2024-12-01' },
    //     { id: 'BATCH-003', name: 'Batch C - Jan 2025', start_date: '2025-01-01' },
    //     { id: 'BATCH-004', name: 'Batch D - Feb 2025', start_date: '2025-02-01' },
    // ]);

    const [formData, setFormData] = useState({
        batchId: '', // Added Batch ID
        farrowingDate: '',
        totalBorn: 0,
        liveBorn: 0,
        stillborn: 0,
        mummified: 0,
        lactationStartDate: '',
        weaningDate: '',
        weanedPiglets: 0,
        sowConditionScore: 3,
        remarks: ''
    });

    const [errors, setErrors] = useState<any>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- 2. Fetch Records on Mount ---
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('farrowing_records')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching records:', error);
            } else if (data) {
                // Map snake_case (DB) to camelCase (UI)
                const formatted = data.map(item => ({
                    id: item.id,
                    batchId: item.batch_id,
                    farrowingDate: item.farrowing_date,
                    totalBorn: item.total_born,
                    liveBorn: item.live_born,
                    stillborn: item.stillborn,
                    mummified: item.mummified,
                    lactationStartDate: item.lactation_start_date,
                    weaningDate: item.weaning_date,
                    weanedPiglets: item.weaned_piglets,
                    sowConditionScore: item.sow_condition_score,
                    remarks: item.remarks
                }));
                setRecords(formatted);
            }
        }
        setLoading(false);
    };

    // --- Validation ---
    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.batchId) newErrors.batchId = 'Batch is required';
        if (!formData.farrowingDate) newErrors.farrowingDate = 'Farrowing Date is required';
        if (formData.liveBorn < 0) newErrors.liveBorn = 'Must be non-negative';
        if (formData.stillborn < 0) newErrors.stillborn = 'Must be non-negative';
        if (formData.mummified < 0) newErrors.mummified = 'Must be non-negative';

        const calculatedTotal = formData.liveBorn + formData.stillborn + formData.mummified;
        if (formData.totalBorn !== calculatedTotal) {
            newErrors.totalBorn = `Total should be ${calculatedTotal}`;
        }

        if (formData.sowConditionScore < 1 || formData.sowConditionScore > 5) {
            newErrors.sowConditionScore = 'Score must be between 1 and 5';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- 3. Handle Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            // Prepare Payload (snake_case)
            const dbPayload = {
                user_id: user.id,
                batch_id: formData.batchId,
                farrowing_date: formData.farrowingDate,
                live_born: formData.liveBorn,
                stillborn: formData.stillborn,
                mummified: formData.mummified,
                total_born: formData.totalBorn,
                lactation_start_date: formData.lactationStartDate || null,
                weaning_date: formData.weaningDate || null,
                weaned_piglets: formData.weanedPiglets,
                sow_condition_score: formData.sowConditionScore,
                remarks: formData.remarks
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('farrowing_records')
                    .update(dbPayload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('farrowing_records')
                    .insert([dbPayload]);
                error = insertError;
            }

            if (error) throw error;

            await fetchRecords();
            resetForm();

        } catch (error: any) {
            console.error("Error saving:", error);
            alert("Failed to save: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- 4. Handle Delete ---
    const handleDelete = async (id: string) => {
        if (confirm('Delete this record?')) {
            const { error } = await supabase
                .from('farrowing_records')
                .delete()
                .eq('id', id);

            if (!error) {
                setRecords(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Error deleting: " + error.message);
            }
        }
    };

    const handleEdit = (record: any) => {
        setFormData({
            batchId: record.batchId || '',
            farrowingDate: record.farrowingDate,
            totalBorn: record.totalBorn,
            liveBorn: record.liveBorn,
            stillborn: record.stillborn,
            mummified: record.mummified,
            lactationStartDate: record.lactationStartDate || '',
            weaningDate: record.weaningDate || '',
            weanedPiglets: record.weanedPiglets,
            sowConditionScore: record.sowConditionScore,
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            batchId: '',
            farrowingDate: '',
            totalBorn: 0,
            liveBorn: 0,
            stillborn: 0,
            mummified: 0,
            lactationStartDate: '',
            weaningDate: '',
            weanedPiglets: 0,
            sowConditionScore: 3,
            remarks: ''
        });
        setErrors({});
        setEditingId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle number inputs strictly
        const newValue = type === 'number' ? (parseFloat(value) || 0) : value;

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };

            // Auto-calculate totalBorn when live, stillborn, or mummified changes
            if (['liveBorn', 'stillborn', 'mummified'].includes(name)) {
                updated.totalBorn =
                    (name === 'liveBorn' ? Number(newValue) : prev.liveBorn) +
                    (name === 'stillborn' ? Number(newValue) : prev.stillborn) +
                    (name === 'mummified' ? Number(newValue) : prev.mummified);
            }

            return updated;
        });
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Farrowing Records</h1>
                <p className="page-subtitle">Track litter birth outcomes and sow performance</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Farrowing Record</h2>
                    <p className="card-subtitle">Log birth details and outcomes</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>

                        {/* Batch Input (Dropdown hata ke simple input) */}
                        <div className="form-group mb-4">
                            <label className="form-label required">Batch ID</label>
                            <input
                                type="text"
                                name="batchId"
                                className={`form-input ${errors.batchId ? 'error' : ''}`}
                                placeholder="e.g. BATCH-001"
                                value={formData.batchId}
                                onChange={handleChange}
                            />
                            {errors.batchId && <span className="form-error">⚠ {errors.batchId}</span>}
                        </div>

                        {/* Farrowing Details Section */}
                        <div className="form-section">
                            <h3 className="section-title">Farrowing Details</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label required">Farrowing Date</label>
                                    <input
                                        type="date"
                                        name="farrowingDate"
                                        className={`form-input ${errors.farrowingDate ? 'error' : ''}`}
                                        value={formData.farrowingDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Live Born</label>
                                    <input
                                        type="number"
                                        name="liveBorn"
                                        className={`form-input ${errors.liveBorn ? 'error' : ''}`}
                                        min="0"
                                        value={formData.liveBorn}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Stillborn</label>
                                    <input
                                        type="number"
                                        name="stillborn"
                                        className={`form-input ${errors.stillborn ? 'error' : ''}`}
                                        min="0"
                                        value={formData.stillborn}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mummified</label>
                                    <input
                                        type="number"
                                        name="mummified"
                                        className={`form-input ${errors.mummified ? 'error' : ''}`}
                                        min="0"
                                        value={formData.mummified}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Total Born</label>
                                    <input
                                        type="number"
                                        name="totalBorn"
                                        className={`form-input ${errors.totalBorn ? 'error' : ''}`}
                                        value={formData.totalBorn}
                                        disabled
                                    />
                                    <span className="form-help">Auto-calculated</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Lactation Start Date</label>
                                    <input
                                        type="date"
                                        name="lactationStartDate"
                                        className="form-input"
                                        value={formData.lactationStartDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Weaning Date</label>
                                    <input
                                        type="date"
                                        name="weaningDate"
                                        className="form-input"
                                        value={formData.weaningDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Weaned Piglets</label>
                                    <input
                                        type="number"
                                        name="weanedPiglets"
                                        className="form-input"
                                        min="0"
                                        value={formData.weanedPiglets}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sow Condition Score</label>
                                    <input
                                        type="number"
                                        name="sowConditionScore"
                                        className={`form-input ${errors.sowConditionScore ? 'error' : ''}`}
                                        min="1"
                                        max="5"
                                        step="0.5"
                                        value={formData.sowConditionScore}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Observations Section */}
                        <div className="form-section">
                            <h3 className="section-title">Observations</h3>
                            <div className="form-group">
                                <label className="form-label">Remarks</label>
                                <textarea
                                    name="remarks"
                                    className="form-textarea"
                                    placeholder="Notes on farrowing, sow health..."
                                    value={formData.remarks}
                                    onChange={handleChange}
                                />
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
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h2 className="card-title">Farrowing History ({records.length})</h2>
                </div>
                <div className="table-container">
                    {records.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            <p>No farrowing records found. Add one above.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Farrowing Date</th>
                                    <th>Total Born</th>
                                    <th>Live</th>
                                    <th>Still</th>
                                    <th>Mummy</th>
                                    <th>Weaned</th>
                                    <th>Score</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{new Date(record.farrowingDate).toLocaleDateString()}</strong></td>
                                        <td><span className="badge badge-primary">{record.totalBorn}</span></td>
                                        <td><span className="badge badge-success">{record.liveBorn}</span></td>
                                        <td><span className="badge badge-danger">{record.stillborn}</span></td>
                                        <td><span className="badge badge-warning">{record.mummified}</span></td>
                                        <td>{record.weanedPiglets}</td>
                                        <td>{record.sowConditionScore}/5</td>
                                        <td>{record.remarks || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(record)}>✏️</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(record.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FarrowingRecords;
