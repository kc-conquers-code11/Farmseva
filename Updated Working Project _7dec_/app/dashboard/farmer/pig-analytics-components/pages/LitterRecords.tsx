import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define Batch Interface
interface Batch {
    id: string;
    name: string;
    start_date: string;
}

function LitterRecords() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // --- 1. Hardcoded Batches --- (dropdown hatane ke baad ab use nahi ho raha, chahe to hata bhi sakte ho)
    const [batches] = useState<Batch[]>([
        { id: 'BATCH-001', name: 'Batch A - Nov 2024', start_date: '2024-11-01' },
        { id: 'BATCH-002', name: 'Batch B - Dec 2024', start_date: '2024-12-01' },
        { id: 'BATCH-003', name: 'Batch C - Jan 2025', start_date: '2025-01-01' },
        { id: 'BATCH-004', name: 'Batch D - Feb 2025', start_date: '2025-02-01' },
    ]);

    const [formData, setFormData] = useState({
        batchId: '', // Added Batch Selection
        pigletId: '',
        birthWeight: 0,
        ironInjectionDate: '',
        weaningWeight: 0,
        weaningDate: '',
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
                .from('litter_records')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching litter records:', error);
            } else if (data) {
                // Map snake_case (DB) to camelCase (UI)
                const formatted = data.map(item => ({
                    id: item.id,
                    batchId: item.batch_id,
                    pigletId: item.piglet_id,
                    birthWeight: item.birth_weight,
                    ironInjectionDate: item.iron_injection_date,
                    weaningWeight: item.weaning_weight,
                    weaningDate: item.weaning_date,
                    weightGain: item.weight_gain,
                    remarks: item.remarks
                }));
                setRecords(formatted);
            }
        }
        setLoading(false);
    };

    const calculateWeightGain = () => {
        return Math.max(0, formData.weaningWeight - formData.birthWeight);
    };

    // --- Validation ---
    const validateForm = () => {
        const newErrors: any = {};
        if (!formData.batchId) newErrors.batchId = 'Batch is required';
        if (!formData.pigletId.trim()) newErrors.pigletId = 'Piglet ID is required';
        if (formData.birthWeight < 0) newErrors.birthWeight = 'Must be non-negative';
        if (formData.weaningWeight < 0) newErrors.weaningWeight = 'Must be non-negative';
        if (!formData.birthWeight) newErrors.birthWeight = 'Birth Weight is required';

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

            const weightGain = calculateWeightGain();

            // Prepare Payload (snake_case)
            const dbPayload = {
                user_id: user.id,
                batch_id: formData.batchId,
                piglet_id: formData.pigletId,
                birth_weight: formData.birthWeight,
                iron_injection_date: formData.ironInjectionDate || null, // handle empty strings
                weaning_weight: formData.weaningWeight,
                weaning_date: formData.weaningDate || null,
                weight_gain: weightGain,
                remarks: formData.remarks
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('litter_records')
                    .update(dbPayload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('litter_records')
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
                .from('litter_records')
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
            pigletId: record.pigletId,
            birthWeight: record.birthWeight,
            ironInjectionDate: record.ironInjectionDate || '',
            weaningWeight: record.weaningWeight || 0,
            weaningDate: record.weaningDate || '',
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData(prev => ({
            ...prev,
            pigletId: '',
            birthWeight: 0,
            ironInjectionDate: '',
            weaningWeight: 0,
            weaningDate: '',
            remarks: ''
        }));
        setErrors({});
        setEditingId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Litter Records</h1>
                <p className="page-subtitle">Track individual piglet data and growth metrics</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Piglet Record</h2>
                    <p className="card-subtitle">Enter individual piglet details</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>

                        {/* Batch Input (Dropdown hata ke simple input field) */}
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

                        {/* Piglet Details Section */}
                        <div className="form-section">
                            <h3 className="section-title">Piglet Details</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label required">Piglet ID</label>
                                    <input
                                        type="text"
                                        name="pigletId"
                                        className={`form-input ${errors.pigletId ? 'error' : ''}`}
                                        placeholder="PIG-001"
                                        value={formData.pigletId}
                                        onChange={handleChange}
                                    />
                                    {errors.pigletId && <span className="form-error">⚠ {errors.pigletId}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Birth Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="birthWeight"
                                        className={`form-input ${errors.birthWeight ? 'error' : ''}`}
                                        min="0"
                                        step="0.1"
                                        placeholder="1.5"
                                        value={formData.birthWeight}
                                        onChange={handleChange}
                                    />
                                    {errors.birthWeight && <span className="form-error">⚠ {errors.birthWeight}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Iron Injection Date</label>
                                    <input
                                        type="date"
                                        name="ironInjectionDate"
                                        className="form-input"
                                        value={formData.ironInjectionDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Weaning Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weaningWeight"
                                        className={`form-input ${errors.weaningWeight ? 'error' : ''}`}
                                        min="0"
                                        step="0.1"
                                        value={formData.weaningWeight}
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
                            </div>
                        </div>

                        {/* Growth Metrics Section */}
                        <div className="form-section">
                            <h3 className="section-title">Growth Metrics</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Weight Gain (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={calculateWeightGain().toFixed(2)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        className="form-textarea"
                                        placeholder="Health or growth notes..."
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

            {/* Records Table (Always Visible) */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h2 className="card-title">Litter Records ({records.length})</h2>
                    <p className="card-subtitle">View all piglet records</p>
                </div>

                <div className="table-container">
                    {records.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            <p>No litter records found. Add one above.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Piglet ID</th>
                                    <th>Birth Weight</th>
                                    <th>Iron Injection</th>
                                    <th>Weaning Weight</th>
                                    <th>Weaning Date</th>
                                    <th>Weight Gain</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{record.pigletId}</strong></td>
                                        <td>{record.birthWeight} kg</td>
                                        <td>{record.ironInjectionDate ? new Date(record.ironInjectionDate).toLocaleDateString() : '-'}</td>
                                        <td>{record.weaningWeight > 0 ? `${record.weaningWeight} kg` : '-'}</td>
                                        <td>{record.weaningDate ? new Date(record.weaningDate).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <span className={`badge ${record.weightGain > 0 ? 'badge-success' : 'badge-warning'}`}>
                                                {record.weightGain > 0 ? `${record.weightGain.toFixed(2)} kg` : '-'}
                                            </span>
                                        </td>
                                        <td>{record.remarks || '-'}</td>
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default LitterRecords;
