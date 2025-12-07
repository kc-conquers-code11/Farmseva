import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define Batch Interface
interface Batch {
    id: string;
    name: string;
    start_date: string;
}

function TreatmentRecords() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // --- 1. Hardcoded Batches (Matching Feed Page) ---
    const [batches] = useState<Batch[]>([
        { id: 'BATCH-001', name: 'Batch A - Nov 2024', start_date: '2024-11-01' },
        { id: 'BATCH-002', name: 'Batch B - Dec 2024', start_date: '2024-12-01' },
        { id: 'BATCH-003', name: 'Batch C - Jan 2025', start_date: '2025-01-01' },
        { id: 'BATCH-004', name: 'Batch D - Feb 2025', start_date: '2025-02-01' },
    ]);

    const [formData, setFormData] = useState({
        batchId: '', // Added Batch Selection
        date: new Date().toISOString().split('T')[0],
        penNo: '',
        pigId: '',
        medicineGiven: '',
        dose: '',
        route: '',
        reason: '',
        treatedBy: '',
        remarks: ''
    });
    
    const [errors, setErrors] = useState<any>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- 2. Fetch Records on Load ---
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('treatment_records')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }); // Show newest entries at top

            if (error) {
                console.error('Error fetching treatments:', error);
            } else if (data) {
                // Map DB columns (snake_case) to UI (camelCase)
                const formatted = data.map(item => ({
                    id: item.id,
                    batchId: item.batch_id,
                    date: item.date,
                    penNo: item.pen_no,
                    pigId: item.pig_id,
                    medicineGiven: item.medicine_given,
                    dose: item.dose,
                    route: item.route,
                    reason: item.reason,
                    treatedBy: item.treated_by,
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
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.penNo.trim()) newErrors.penNo = 'Pen No. is required';
        if (!formData.pigId.trim()) newErrors.pigId = 'Pig ID is required';
        if (!formData.medicineGiven.trim()) newErrors.medicineGiven = 'Medicine is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- 3. Handle Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation Check
        if (!validateForm()) {
            alert("Please fill in all required fields."); // Visual feedback if validation fails
            return;
        }
        
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            // Prepare DB Payload (snake_case)
            const dbPayload = {
                user_id: user.id,
                batch_id: formData.batchId, // Saving Batch ID now
                date: formData.date,
                pen_no: formData.penNo,
                pig_id: formData.pigId,
                medicine_given: formData.medicineGiven,
                dose: formData.dose,
                route: formData.route,
                reason: formData.reason,
                treated_by: formData.treatedBy,
                remarks: formData.remarks
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('treatment_records')
                    .update(dbPayload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('treatment_records')
                    .insert([dbPayload]);
                error = insertError;
            }

            if (error) throw error;

            // Success: Refresh List & Clear Form
            await fetchRecords();
            resetForm();
            // alert(editingId ? "Updated successfully!" : "Treatment added successfully!");

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
                .from('treatment_records')
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
            date: record.date,
            penNo: record.penNo,
            pigId: record.pigId,
            medicineGiven: record.medicineGiven,
            dose: record.dose || '',
            route: record.route || '',
            reason: record.reason || '',
            treatedBy: record.treatedBy || '',
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData(prev => ({
            ...prev,
            penNo: '',
            pigId: '',
            medicineGiven: '',
            dose: '',
            route: '',
            reason: '',
            treatedBy: '',
            remarks: ''
        }));
        setErrors({});
        setEditingId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">💊 Treatment Records</h1>
                <p className="page-subtitle">Log health interventions and medications</p>
            </div>

            {/* FORM CARD */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Treatment</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        
                        {/* Batch Selector */}
                        <div className="form-group mb-4">
                            <label className="form-label required">Select Batch</label>
                            <select 
                                name="batchId" 
                                value={formData.batchId} 
                                onChange={handleChange}
                                className={`form-select ${errors.batchId ? 'error' : ''}`}
                            >
                                <option value="">-- Choose Batch --</option>
                                {batches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            {errors.batchId && <span className="form-error">⚠ {errors.batchId}</span>}
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Details</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label required">Date</label>
                                    <input type="date" name="date" className={`form-input ${errors.date ? 'error' : ''}`} value={formData.date} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Pen No.</label>
                                    <input type="text" name="penNo" className={`form-input ${errors.penNo ? 'error' : ''}`} placeholder="e.g. A1" value={formData.penNo} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Pig ID</label>
                                    <input type="text" name="pigId" className={`form-input ${errors.pigId ? 'error' : ''}`} placeholder="e.g. 001" value={formData.pigId} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Medicine</label>
                                    <input type="text" name="medicineGiven" className={`form-input ${errors.medicineGiven ? 'error' : ''}`} placeholder="e.g. Iron" value={formData.medicineGiven} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dose</label>
                                    <input type="text" name="dose" className="form-input" placeholder="e.g. 2ml" value={formData.dose} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Route</label>
                                    <input type="text" name="route" className="form-input" placeholder="e.g. IM" value={formData.route} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <input type="text" name="reason" className="form-input" placeholder="e.g. Weakness" value={formData.reason} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Treated By</label>
                                    <input type="text" name="treatedBy" className="form-input" value={formData.treatedBy} onChange={handleChange} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Remarks</label>
                                    <textarea name="remarks" className="form-textarea" value={formData.remarks} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="btn-group">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : (editingId ? '✓ Update' : '+ Add Record')}
                            </button>
                            {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
                        </div>
                    </form>
                </div>
            </div>

            {/* LIST TABLE (Always visible now) */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h2 className="card-title">Treatment History ({records.length})</h2>
                </div>
                <div className="table-container">
                    {records.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            <p>No treatments recorded yet.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Pen</th>
                                    <th>Pig ID</th>
                                    <th>Medicine</th>
                                    <th>Dose</th>
                                    <th>Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{new Date(record.date).toLocaleDateString()}</strong></td>
                                        <td>{record.penNo}</td>
                                        <td>{record.pigId}</td>
                                        <td><span className="badge badge-primary" style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '4px 8px', borderRadius: '4px' }}>{record.medicineGiven}</span></td>
                                        <td>{record.dose || '-'}</td>
                                        <td>{record.reason || '-'}</td>
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

export default TreatmentRecords;