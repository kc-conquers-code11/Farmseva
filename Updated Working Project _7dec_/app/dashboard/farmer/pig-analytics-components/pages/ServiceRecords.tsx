import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define Types
interface ServiceRecord {
    id: string;
    batchId: string;
    sowId: string;
    boarId: string;
    serviceDate: string;
    lastWeanedDate: string;
    parity: number;
    serviceNumber: number;
    remarks: string;
    expectedFarrowingDate: string;
}

interface FormData {
    batchId: string;
    sowId: string;
    boarId: string;
    serviceDate: string;
    lastWeanedDate: string;
    parity: number;
    serviceNumber: number;
    remarks: string;
}

interface FormErrors {
    [key: string]: string;
}

function ServiceRecords() {
    const [records, setRecords] = useState<ServiceRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        batchId: '',
        sowId: '',
        boarId: '',
        serviceDate: '',
        lastWeanedDate: '',
        parity: 0,
        serviceNumber: 1,
        remarks: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- Fetch Records on Mount ---
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('service_records')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching service records:', error);
            } else if (data) {
                // Map snake_case (DB) to camelCase (UI)
                const formatted = data.map((item: any) => ({
                    id: item.id,
                    batchId: item.batch_id,
                    sowId: item.sow_id,
                    boarId: item.boar_id,
                    serviceDate: item.service_date,
                    lastWeanedDate: item.last_weaned_date,
                    parity: item.parity,
                    serviceNumber: item.service_number,
                    expectedFarrowingDate: item.expected_farrowing_date,
                    remarks: item.remarks
                }));
                setRecords(formatted);
            }
        }
        setLoading(false);
    };

    const calculateExpectedFarrowingDate = (serviceDate: string): string => {
        if (!serviceDate) return '';
        const date = new Date(serviceDate);
        date.setDate(date.getDate() + 115); // Add 115 days gestation
        return date.toISOString().split('T')[0];
    };

    // --- Validation ---
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.batchId.trim()) newErrors.batchId = 'Batch is required';
        if (!formData.sowId.trim()) newErrors.sowId = 'Sow ID is required';
        if (!formData.boarId.trim()) newErrors.boarId = 'Boar ID is required';
        if (!formData.serviceDate) newErrors.serviceDate = 'Service Date is required';
        if (formData.parity < 0) newErrors.parity = 'Parity must be non-negative';
        if (formData.serviceNumber < 1) newErrors.serviceNumber = 'Service Number must be 1+';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Handle Submit ---
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            const expectedFarrowingDate = calculateExpectedFarrowingDate(formData.serviceDate);

            // Prepare Payload (snake_case)
            const dbPayload = {
                user_id: user.id,
                batch_id: formData.batchId,
                sow_id: formData.sowId,
                boar_id: formData.boarId,
                service_date: formData.serviceDate,
                last_weaned_date: formData.lastWeanedDate || null,
                parity: formData.parity,
                service_number: formData.serviceNumber,
                expected_farrowing_date: expectedFarrowingDate,
                remarks: formData.remarks
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('service_records')
                    .update(dbPayload)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('service_records')
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

    // --- Handle Delete ---
    const handleDelete = async (id: string) => {
        if (confirm('Delete this record?')) {
            const { error } = await supabase
                .from('service_records')
                .delete()
                .eq('id', id);

            if (!error) {
                setRecords(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Error deleting: " + error.message);
            }
        }
    };

    const handleEdit = (record: ServiceRecord) => {
        setFormData({
            batchId: record.batchId || '',
            sowId: record.sowId,
            boarId: record.boarId,
            serviceDate: record.serviceDate,
            lastWeanedDate: record.lastWeanedDate || '',
            parity: record.parity,
            serviceNumber: record.serviceNumber,
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            batchId: '',
            sowId: '',
            boarId: '',
            serviceDate: '',
            lastWeanedDate: '',
            parity: 0,
            serviceNumber: 1,
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
                <h1 className="page-title">Service Records</h1>
                <p className="page-subtitle">Manage sow mating and service details</p>
            </div>

            {/* Form Card */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Service Record</h2>
                    <p className="card-subtitle">Enter mating details for sows</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>

                        {/* Batch Input Field (NO DROPDOWN) */}
                        <div className="form-group mb-4">
                            <label className="form-label required">Batch ID</label>
                            <input
                                type="text"
                                name="batchId"
                                value={formData.batchId}
                                onChange={handleChange}
                                placeholder="Enter Batch ID (e.g. BATCH-001)"
                                className={`form-input ${errors.batchId ? 'error' : ''}`}
                            />
                            {errors.batchId && (
                                <span className="form-error">⚠ {errors.batchId}</span>
                            )}
                        </div>

                        {/* Mating Details Section */}
                        <div className="form-section">
                            <h3 className="section-title">Mating Details</h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label required">Sow ID</label>
                                    <input
                                        type="text"
                                        name="sowId"
                                        className={`form-input ${errors.sowId ? 'error' : ''}`}
                                        placeholder="SOW-001"
                                        value={formData.sowId}
                                        onChange={handleChange}
                                    />
                                    {errors.sowId && <span className="form-error">⚠ {errors.sowId}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Boar ID</label>
                                    <input
                                        type="text"
                                        name="boarId"
                                        className={`form-input ${errors.boarId ? 'error' : ''}`}
                                        placeholder="BOAR-001"
                                        value={formData.boarId}
                                        onChange={handleChange}
                                    />
                                    {errors.boarId && <span className="form-error">⚠ {errors.boarId}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Service Date</label>
                                    <input
                                        type="date"
                                        name="serviceDate"
                                        className={`form-input ${errors.serviceDate ? 'error' : ''}`}
                                        value={formData.serviceDate}
                                        onChange={handleChange}
                                    />
                                    {errors.serviceDate && <span className="form-error">⚠ {errors.serviceDate}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Last Weaned Date</label>
                                    <input
                                        type="date"
                                        name="lastWeanedDate"
                                        className="form-input"
                                        value={formData.lastWeanedDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Parity</label>
                                    <input
                                        type="number"
                                        name="parity"
                                        className={`form-input ${errors.parity ? 'error' : ''}`}
                                        min="0"
                                        value={formData.parity}
                                        onChange={handleChange}
                                    />
                                    {errors.parity && <span className="form-error">⚠ {errors.parity}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Service Number</label>
                                    <input
                                        type="number"
                                        name="serviceNumber"
                                        className={`form-input ${errors.serviceNumber ? 'error' : ''}`}
                                        min="1"
                                        value={formData.serviceNumber}
                                        onChange={handleChange}
                                    />
                                    {errors.serviceNumber && <span className="form-error">⚠ {errors.serviceNumber}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Expected Farrowing</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={calculateExpectedFarrowingDate(formData.serviceDate)}
                                        disabled
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        className="form-textarea"
                                        placeholder="Any additional notes..."
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
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Records Table */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h2 className="card-title">Service Records ({records.length})</h2>
                </div>
                <div className="table-container">
                    {records.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                            <p>No service records found. Add one above.</p>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Batch</th>
                                    <th>Sow ID</th>
                                    <th>Boar ID</th>
                                    <th>Service Date</th>
                                    <th>Last Weaned</th>
                                    <th>Parity</th>
                                    <th>Service #</th>
                                    <th>Expected Farrowing</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td>{record.batchId || '-'}</td>
                                        <td><strong>{record.sowId}</strong></td>
                                        <td>{record.boarId}</td>
                                        <td>{new Date(record.serviceDate).toLocaleDateString()}</td>
                                        <td>{record.lastWeanedDate ? new Date(record.lastWeanedDate).toLocaleDateString() : '-'}</td>
                                        <td>{record.parity}</td>
                                        <td>{record.serviceNumber}</td>
                                        <td>
                                            <span
                                                className="badge badge-primary"
                                                style={{
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#0d47a1',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {new Date(record.expectedFarrowingDate).toLocaleDateString()}
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

export default ServiceRecords;
