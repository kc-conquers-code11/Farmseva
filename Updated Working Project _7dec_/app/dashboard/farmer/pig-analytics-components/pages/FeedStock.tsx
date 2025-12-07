import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

interface FeedStockRecord {
    id: string;
    feedType: string;
    openingStock: number;
    additions: number;
    issued: number;
    closingStock: number;
    remarks: string;
}

interface FormData {
    feedType: string;
    openingStock: number;
    additions: number;
    issued: number;
    remarks: string;
}

interface FormErrors {
    [key: string]: string;
}

function FeedStock() {
    const [records, setRecords] = useState<FeedStockRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        feedType: '',
        openingStock: 0,
        additions: 0,
        issued: 0,
        remarks: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- 1. Fetch Records on Mount ---
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('feed_stock_records')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching feed stock:', error);
            } else if (data) {
                // Map snake_case (DB) to camelCase (UI)
                const formatted = data.map(item => ({
                    id: item.id,
                    feedType: item.feed_type,
                    openingStock: item.opening_stock,
                    additions: item.additions,
                    issued: item.issued,
                    closingStock: item.closing_stock,
                    remarks: item.remarks
                }));
                setRecords(formatted);
            }
        }
        setLoading(false);
    };

    const calculateClosingStock = (): number => {
        return formData.openingStock + formData.additions - formData.issued;
    };

    // --- Validation ---
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.feedType.trim()) newErrors.feedType = 'Feed Type is required';
        if (formData.openingStock < 0) newErrors.openingStock = 'Must be non-negative';
        if (formData.additions < 0) newErrors.additions = 'Must be non-negative';
        if (formData.issued < 0) newErrors.issued = 'Must be non-negative';

        const closing = calculateClosingStock();
        if (closing < 0) {
            newErrors.closingStock = `Closing stock cannot be negative (${closing} kg)`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- 2. Handle Submit ---
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            const closingStock = calculateClosingStock();

            // Prepare Payload (snake_case)
            const dbPayload = {
                user_id: user.id,
                feed_type: formData.feedType,
                opening_stock: formData.openingStock,
                additions: formData.additions,
                issued: formData.issued,
                closing_stock: closingStock,
                remarks: formData.remarks
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('feed_stock_records')
                    .update(dbPayload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('feed_stock_records')
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

    // --- 3. Handle Delete ---
    const handleDelete = async (id: string) => {
        if (confirm('Delete this record?')) {
            const { error } = await supabase
                .from('feed_stock_records')
                .delete()
                .eq('id', id);

            if (!error) {
                setRecords(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Error deleting: " + error.message);
            }
        }
    };

    const handleEdit = (record: FeedStockRecord) => {
        setFormData({
            feedType: record.feedType,
            openingStock: record.openingStock,
            additions: record.additions,
            issued: record.issued,
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            feedType: '',
            openingStock: 0,
            additions: 0,
            issued: 0,
            remarks: ''
        });
        setErrors({});
        setEditingId(null);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Feed Stock Management</h1>
                <p className="page-subtitle">Track daily feed inventory and usage</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Feed Stock Record</h2>
                    <p className="card-subtitle">Manage feed inventory</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h3 className="section-title">Inventory Details</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label required">Feed Type</label>
                                    <input
                                        type="text"
                                        name="feedType"
                                        className={`form-input ${errors.feedType ? 'error' : ''}`}
                                        placeholder="Starter, Grower, Finisher..."
                                        value={formData.feedType}
                                        onChange={handleChange}
                                    />
                                    {errors.feedType && <span className="form-error">⚠ {errors.feedType}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Opening Stock (kg)</label>
                                    <input
                                        type="number"
                                        name="openingStock"
                                        className={`form-input ${errors.openingStock ? 'error' : ''}`}
                                        min="0"
                                        step="0.1"
                                        value={formData.openingStock}
                                        onChange={handleChange}
                                    />
                                    {errors.openingStock && <span className="form-error">⚠ {errors.openingStock}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Additions (kg)</label>
                                    <input
                                        type="number"
                                        name="additions"
                                        className={`form-input ${errors.additions ? 'error' : ''}`}
                                        min="0"
                                        step="0.1"
                                        value={formData.additions}
                                        onChange={handleChange}
                                    />
                                    {errors.additions && <span className="form-error">⚠ {errors.additions}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Issued/Used (kg)</label>
                                    <input
                                        type="number"
                                        name="issued"
                                        className={`form-input ${errors.issued ? 'error' : ''}`}
                                        min="0"
                                        step="0.1"
                                        value={formData.issued}
                                        onChange={handleChange}
                                    />
                                    {errors.issued && <span className="form-error">⚠ {errors.issued}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Closing Stock (kg)</label>
                                    <input
                                        type="number"
                                        className={`form-input ${errors.closingStock ? 'error' : ''}`}
                                        value={calculateClosingStock().toFixed(2)}
                                        disabled
                                    />
                                    {errors.closingStock && <span className="form-error">⚠ {errors.closingStock}</span>}
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        className="form-textarea"
                                        placeholder="Quality notes, spoilage, supplier info..."
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
                        <h2 className="card-title">Inventory History ({records.length})</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Feed Type</th>
                                    <th>Opening</th>
                                    <th>Added</th>
                                    <th>Used</th>
                                    <th>Closing</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{record.feedType}</strong></td>
                                        <td>{record.openingStock} kg</td>
                                        <td><span className="badge badge-success">+{record.additions}</span></td>
                                        <td><span className="badge badge-warning">-{record.issued}</span></td>
                                        <td>
                                            <strong className={record.closingStock < 50 ? 'text-danger' : 'text-success'}>
                                                {record.closingStock?.toFixed(2)} kg
                                            </strong>
                                        </td>
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

export default FeedStock;