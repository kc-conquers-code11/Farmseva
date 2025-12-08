import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define Types
interface Batch {
    id: string;
    name: string;
    start_date: string;
}

interface DispatchRecord {
    id: string;
    batchId: string;
    dispatchDate: string;
    pigTag: string;
    type: string;
    liveWeight: number;
    buyerName: string;
    price: number;
    remarks: string;
}

interface FormData {
    batchId: string;
    dispatchDate: string;
    pigTag: string;
    type: string;
    liveWeight: number;
    buyerName: string;
    price: number;
    remarks: string;
}

interface FormErrors {
    [key: string]: string;
}

function DispatchRecords() {
    const [records, setRecords] = useState<DispatchRecord[]>([]);
    const [loading, setLoading] = useState(false);

    // --- 1. Hardcoded Batches ---
    const [batches] = useState<Batch[]>([
        { id: 'BATCH-001', name: 'Batch A - Nov 2024', start_date: '2024-11-01' },
        { id: 'BATCH-002', name: 'Batch B - Dec 2024', start_date: '2024-12-01' },
        { id: 'BATCH-003', name: 'Batch C - Jan 2025', start_date: '2025-01-01' },
        { id: 'BATCH-004', name: 'Batch D - Feb 2025', start_date: '2025-02-01' },
    ]);

    const [formData, setFormData] = useState<FormData>({
        batchId: '',
        dispatchDate: new Date().toISOString().split('T')[0],
        pigTag: '',
        type: 'Grower',
        liveWeight: 0,
        buyerName: '',
        price: 0,
        remarks: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
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
                .from('dispatch_records')
                .select('*')
                .eq('user_id', user.id)
                .order('dispatch_date', { ascending: false });

            if (error) {
                console.error('Error fetching dispatch records:', error);
            } else if (data) {
                // Map snake_case (DB) to camelCase (UI)
                const formatted = data.map(item => ({
                    id: item.id,
                    batchId: item.batch_id,
                    dispatchDate: item.dispatch_date,
                    pigTag: item.pig_tag,
                    type: item.type,
                    liveWeight: item.live_weight,
                    buyerName: item.buyer_name,
                    price: item.price,
                    remarks: item.remarks
                }));
                setRecords(formatted);
            }
        }
        setLoading(false);
    };

    const calculateTotalRevenue = () => {
        return records.reduce((sum, record) => sum + (record.price || 0), 0);
    };

    // --- Validation ---
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.batchId) newErrors.batchId = 'Batch is required';
        if (!formData.dispatchDate) newErrors.dispatchDate = 'Date is required';
        if (!formData.pigTag.trim()) newErrors.pigTag = 'Pig ID/Tag is required';
        if (!formData.type) newErrors.type = 'Type is required';
        if (formData.liveWeight <= 0) newErrors.liveWeight = 'Must be positive';
        if (formData.price <= 0) newErrors.price = 'Must be positive';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- 3. Handle Submit ---
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
                dispatch_date: formData.dispatchDate,
                pig_tag: formData.pigTag,
                type: formData.type,
                live_weight: formData.liveWeight,
                buyer_name: formData.buyerName,
                price: formData.price,
                remarks: formData.remarks
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('dispatch_records')
                    .update(dbPayload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('dispatch_records')
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
                .from('dispatch_records')
                .delete()
                .eq('id', id);

            if (!error) {
                setRecords(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Error deleting: " + error.message);
            }
        }
    };

    const handleEdit = (record: DispatchRecord) => {
        setFormData({
            batchId: record.batchId || '',
            dispatchDate: record.dispatchDate,
            pigTag: record.pigTag,
            type: record.type,
            liveWeight: record.liveWeight,
            buyerName: record.buyerName || '',
            price: record.price,
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            batchId: '',
            dispatchDate: '',
            pigTag: '',
            type: 'Grower',
            liveWeight: 0,
            buyerName: '',
            price: 0,
            remarks: ''
        });
        setErrors({});
        setEditingId(null);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Dispatch Records</h1>
                <p className="page-subtitle">Track pig sales and dispatch details</p>
            </div>

            {/* Revenue Summary */}
            <div className="kpi-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="kpi-header">
                    <div className="kpi-title">Total Revenue</div>
                    <div className="kpi-icon">💰</div>
                </div>
                <div className="kpi-value">₹{calculateTotalRevenue().toLocaleString()}</div>
                <div className="kpi-trend positive">
                    From {records.length} sale{records.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Dispatch Record</h2>
                    <p className="card-subtitle">Log pig sales and transfers</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>

                        {/* Batch Input (Dropdown → Text Input) */}
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

                        <div className="form-section">
                            <h3 className="section-title">Sale Details</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label required">Dispatch Date</label>
                                    <input
                                        type="date"
                                        name="dispatchDate"
                                        className={`form-input ${errors.dispatchDate ? 'error' : ''}`}
                                        value={formData.dispatchDate}
                                        onChange={handleChange}
                                    />
                                    {errors.dispatchDate && <span className="form-error">⚠ {errors.dispatchDate}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Pig ID/Tag No.</label>
                                    <input
                                        type="text"
                                        name="pigTag"
                                        className={`form-input ${errors.pigTag ? 'error' : ''}`}
                                        placeholder="PIG-001"
                                        value={formData.pigTag}
                                        onChange={handleChange}
                                    />
                                    {errors.pigTag && <span className="form-error">⚠ {errors.pigTag}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Type</label>
                                    <select
                                        name="type"
                                        className={`form-select ${errors.type ? 'error' : ''}`}
                                        value={formData.type}
                                        onChange={handleChange}
                                    >
                                        <option value="Grower">Grower</option>
                                        <option value="Finisher">Finisher</option>
                                        <option value="Breeder">Breeder</option>
                                        <option value="Cull">Cull</option>
                                    </select>
                                    {errors.type && <span className="form-error">⚠ {errors.type}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Live Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="liveWeight"
                                        className={`form-input ${errors.liveWeight ? 'error' : ''}`}
                                        min="0"
                                        step="0.1"
                                        value={formData.liveWeight}
                                        onChange={handleChange}
                                    />
                                    {errors.liveWeight && <span className="form-error">⚠ {errors.liveWeight}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Buyer Name</label>
                                    <input
                                        type="text"
                                        name="buyerName"
                                        className="form-input"
                                        placeholder="Purchaser's name"
                                        value={formData.buyerName}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        className={`form-input ${errors.price ? 'error' : ''}`}
                                        min="0"
                                        step="0.01"
                                        placeholder="15000"
                                        value={formData.price}
                                        onChange={handleChange}
                                    />
                                    {errors.price && <span className="form-error">⚠ {errors.price}</span>}
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        className="form-textarea"
                                        placeholder="Carcass quality, buyer feedback..."
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
                <div className="card" style={{ marginTop: '2rem' }}>
                    <div className="card-header">
                        <h2 className="card-title">Dispatch Records ({records.length})</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>ID</th>
                                    <th>Type</th>
                                    <th>Weight</th>
                                    <th>Buyer</th>
                                    <th>Price</th>
                                    <th>Price/kg</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{new Date(record.dispatchDate).toLocaleDateString()}</strong></td>
                                        <td>{record.pigTag}</td>
                                        <td>
                                            <span className={`badge ${record.type === 'Finisher' ? 'badge-success' : record.type === 'Grower' ? 'badge-primary' : 'badge-warning'}`}>
                                                {record.type}
                                            </span>
                                        </td>
                                        <td>{record.liveWeight} kg</td>
                                        <td>{record.buyerName || '-'}</td>
                                        <td><strong>₹{record.price.toLocaleString()}</strong></td>
                                        <td>₹{(record.price / (record.liveWeight || 1)).toFixed(2)}/kg</td>
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default DispatchRecords;
