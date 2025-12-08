import { useState, useEffect } from 'react';

function DailyPigStatus() {
    const [records, setRecords] = useState([]);
    const [formData, setFormData] = useState({
        date: '',
        openingPigs: 0,
        deadToday: 0,
        culled: 0,
        sold: 0,
        remarks: ''
    });
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('pigStatus');
        if (saved) {
            setRecords(JSON.parse(saved));
        }
    }, []);

    const saveRecords = (newRecords) => {
        localStorage.setItem('pigStatus', JSON.stringify(newRecords));
        setRecords(newRecords);
    };

    const calculateClosingPigs = () => {
        return formData.openingPigs - formData.deadToday - formData.culled - formData.sold;
    };

    const calculateDailyMortality = () => {
        return formData.openingPigs > 0 ? (formData.deadToday / formData.openingPigs * 100) : 0;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.openingPigs || formData.openingPigs <= 0) {
            newErrors.openingPigs = 'Opening Pigs is required and must be positive';
        }

        if (formData.deadToday < 0) {
            newErrors.deadToday = 'Dead Today must be non-negative';
        }

        if (formData.culled < 0) {
            newErrors.culled = 'Culled must be non-negative';
        }

        if (formData.sold < 0) {
            newErrors.sold = 'Sold must be non-negative';
        }

        const closingPigs = calculateClosingPigs();
        if (closingPigs < 0) {
            newErrors.closingPigs = 'Closing Pigs cannot be negative. Check your numbers.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const closingPigs = calculateClosingPigs();
        const dailyMortality = calculateDailyMortality();

        const record = {
            ...formData,
            closingPigs,
            dailyMortality,
            id: editingId || Date.now(),
            createdAt: editingId ? records.find(r => r.id === editingId)?.createdAt : new Date().toISOString()
        };

        let newRecords;
        if (editingId) {
            newRecords = records.map(r => r.id === editingId ? record : r);
            setEditingId(null);
        } else {
            newRecords = [...records, record];
        }

        saveRecords(newRecords);

        // Auto-populate next day's opening pigs
        setFormData(prev => ({
            ...prev,
            openingPigs: closingPigs,
            date: '',
            deadToday: 0,
            culled: 0,
            sold: 0,
            remarks: ''
        }));
        setErrors({});
        setEditingId(null);
    };

    const handleEdit = (record) => {
        setFormData({
            date: record.date,
            openingPigs: record.openingPigs,
            deadToday: record.deadToday,
            culled: record.culled,
            sold: record.sold,
            remarks: record.remarks || ''
        });
        setEditingId(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this record?')) {
            const newRecords = records.filter(r => r.id !== id);
            saveRecords(newRecords);
        }
    };

    const resetForm = () => {
        setFormData({
            date: '',
            openingPigs: 0,
            deadToday: 0,
            culled: 0,
            sold: 0,
            remarks: ''
        });
        setErrors({});
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title">Daily Pig Status</h1>
                <p className="page-subtitle">Track daily herd changes and mortality</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">{editingId ? 'Edit' : 'Add New'} Daily Status</h2>
                    <p className="card-subtitle">Record daily pig movements</p>
                </div>

                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
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
                                    {errors.date && <span className="form-error">⚠ {errors.date}</span>}
                                    <span className="form-help">Record date</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label required">Opening Pigs</label>
                                    <input
                                        type="number"
                                        name="openingPigs"
                                        className={`form-input ${errors.openingPigs ? 'error' : ''}`}
                                        min="1"
                                        step="1"
                                        value={formData.openingPigs}
                                        onChange={handleChange}
                                    />
                                    {errors.openingPigs && <span className="form-error">⚠ {errors.openingPigs}</span>}
                                    <span className="form-help">Pigs at start of day</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Dead Today</label>
                                    <input
                                        type="number"
                                        name="deadToday"
                                        className={`form-input ${errors.deadToday ? 'error' : ''}`}
                                        min="0"
                                        step="1"
                                        value={formData.deadToday}
                                        onChange={handleChange}
                                    />
                                    {errors.deadToday && <span className="form-error">⚠ {errors.deadToday}</span>}
                                    <span className="form-help">Pigs that died this day</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Culled</label>
                                    <input
                                        type="number"
                                        name="culled"
                                        className={`form-input ${errors.culled ? 'error' : ''}`}
                                        min="0"
                                        step="1"
                                        value={formData.culled}
                                        onChange={handleChange}
                                    />
                                    {errors.culled && <span className="form-error">⚠ {errors.culled}</span>}
                                    <span className="form-help">Pigs removed for culling</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Sold</label>
                                    <input
                                        type="number"
                                        name="sold"
                                        className={`form-input ${errors.sold ? 'error' : ''}`}
                                        min="0"
                                        step="1"
                                        value={formData.sold}
                                        onChange={handleChange}
                                    />
                                    {errors.sold && <span className="form-error">⚠ {errors.sold}</span>}
                                    <span className="form-help">Pigs sold today</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Closing Pigs</label>
                                    <input
                                        type="number"
                                        className={`form-input ${errors.closingPigs ? 'error' : ''}`}
                                        value={calculateClosingPigs()}
                                        disabled
                                    />
                                    {errors.closingPigs && <span className="form-error">⚠ {errors.closingPigs}</span>}
                                    <span className="form-help">Opening - Dead - Culled - Sold</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Daily Mortality (%)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={calculateDailyMortality().toFixed(2)}
                                        disabled
                                    />
                                    <span className="form-help">(Dead Today ÷ Opening Pigs) × 100</span>
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        name="remarks"
                                        className="form-textarea"
                                        placeholder="Notes on condition issues, causes of death, etc..."
                                        value={formData.remarks}
                                        onChange={handleChange}
                                    />
                                    <span className="form-help">Optional observations</span>
                                </div>
                            </div>
                        </div>

                        <div className="btn-group">
                            <button type="submit" className="btn btn-primary">
                                {editingId ? '✓ Update Record' : '+ Add Record'}
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
                        <h2 className="card-title">Pig Status Records ({records.length})</h2>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Opening</th>
                                    <th>Dead</th>
                                    <th>Culled</th>
                                    <th>Sold</th>
                                    <th>Closing</th>
                                    <th>Mortality %</th>
                                    <th>Remarks</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id}>
                                        <td><strong>{new Date(record.date).toLocaleDateString()}</strong></td>
                                        <td>{record.openingPigs}</td>
                                        <td>
                                            <span className={`badge ${record.deadToday > 0 ? 'badge-danger' : 'badge-success'}`}>
                                                {record.deadToday}
                                            </span>
                                        </td>
                                        <td>{record.culled}</td>
                                        <td>{record.sold}</td>
                                        <td><strong>{record.closingPigs}</strong></td>
                                        <td>
                                            <span className={`badge ${record.dailyMortality > 2 ? 'badge-danger' : 'badge-success'}`}>
                                                {record.dailyMortality?.toFixed(2)}%
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default DailyPigStatus;
