"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from "@/app/components/Navbar";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Minus, History, 
  Edit3, Trash2, Save, X, 
  ClipboardList, TrendingUp, TrendingDown, Loader2,
  AlertCircle
} from 'lucide-react';

// --- Types ---
interface FeedStockRecord {
    id: string;
    feedType: string;
    openingStock: number;
    additions: number;
    issued: number;
    closingStock: number;
    remarks: string;
    createdAt: string;
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

export default function FeedStockPage() {
    const [records, setRecords] = useState<FeedStockRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<FormData>({
        feedType: '',
        openingStock: 0,
        additions: 0,
        issued: 0,
        remarks: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    // --- 1. Fetch Data ---
    const fetchRecords = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('feed_stock_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching feed stock:', error);
        } else if (data) {
            const formatted = data.map(item => ({
                id: item.id,
                feedType: item.feed_type,
                openingStock: item.opening_stock,
                additions: item.additions,
                issued: item.issued,
                closingStock: item.closing_stock,
                remarks: item.remarks,
                createdAt: item.created_at
            }));
            setRecords(formatted);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // --- Stats Calculation ---
    const stats = useMemo(() => {
        return records.reduce((acc, curr) => ({
            totalAdded: acc.totalAdded + (Number(curr.additions) || 0),
            totalIssued: acc.totalIssued + (Number(curr.issued) || 0),
            entries: acc.entries + 1
        }), { totalAdded: 0, totalIssued: 0, entries: 0 });
    }, [records]);

    // --- Form Logic ---
    const calculateClosingStock = (): number => {
        const open = Number(formData.openingStock) || 0;
        const add = Number(formData.additions) || 0;
        const issue = Number(formData.issued) || 0;
        return open + add - issue;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.feedType.trim()) newErrors.feedType = 'Feed Type is required';
        if (formData.openingStock < 0) newErrors.openingStock = 'Cannot be negative';
        if (formData.additions < 0) newErrors.additions = 'Cannot be negative';
        if (formData.issued < 0) newErrors.issued = 'Cannot be negative';
        
        const closing = calculateClosingStock();
        if (closing < 0) newErrors.closingStock = 'Closing stock cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please login');
            setSubmitting(false);
            return;
        }

        const dbPayload = {
            user_id: user.id,
            feed_type: formData.feedType,
            opening_stock: formData.openingStock,
            additions: formData.additions,
            issued: formData.issued,
            remarks: formData.remarks
            // closing_stock is typically calculated by DB trigger, or we can send it if DB allows
        };

        let error;
        if (editingId) {
            const { error: updateError } = await supabase
                .from('feed_stock_logs')
                .update(dbPayload)
                .eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('feed_stock_logs')
                .insert([dbPayload]);
            error = insertError;
        }

        if (error) {
            alert('Failed to save: ' + error.message);
        } else {
            resetForm();
            fetchRecords();
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        const { error } = await supabase
            .from('feed_stock_logs')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Delete failed: ' + error.message);
        } else {
            fetchRecords();
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
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            <Navbar />

            <div className="pt-20 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
                
                {/* Header & Stats */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                                    <Package size={28} />
                                </div>
                                Feed Inventory
                            </h1>
                            <p className="text-neutral-500 mt-2">Track daily feed consumption and stock levels.</p>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Added</p>
                                <p className="text-2xl font-black text-neutral-800">{stats.totalAdded.toFixed(1)} <span className="text-sm font-medium text-neutral-400">kg</span></p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                <TrendingDown size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Issued</p>
                                <p className="text-2xl font-black text-neutral-800">{stats.totalIssued.toFixed(1)} <span className="text-sm font-medium text-neutral-400">kg</span></p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Records</p>
                                <p className="text-2xl font-black text-neutral-800">{stats.entries}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* === LEFT: ENTRY FORM === */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100 border border-indigo-50 overflow-hidden sticky top-24">
                            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                                <h2 className="font-bold flex items-center gap-2">
                                    {editingId ? <Edit3 size={18}/> : <Plus size={18}/>} 
                                    {editingId ? 'Edit Entry' : 'New Entry'}
                                </h2>
                                {editingId && (
                                    <button onClick={resetForm} className="text-indigo-200 hover:text-white transition">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Feed Type</label>
                                    <input
                                        type="text"
                                        name="feedType"
                                        placeholder="e.g. Broiler Starter"
                                        className={`w-full p-3 bg-neutral-50 border rounded-xl font-medium outline-none focus:ring-2 focus:bg-white transition-all ${errors.feedType ? 'border-red-500 ring-red-100' : 'border-neutral-200 focus:ring-indigo-500'}`}
                                        value={formData.feedType}
                                        onChange={handleChange}
                                    />
                                    {errors.feedType && <p className="text-red-500 text-xs mt-1 font-medium">{errors.feedType}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Opening Stock (kg)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="openingStock"
                                                min="0"
                                                step="0.01"
                                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                                value={formData.openingStock}
                                                onChange={handleChange}
                                            />
                                            <Package size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"/>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-green-600 uppercase tracking-wider mb-1.5">Additions (+)</label>
                                        <input
                                            type="number"
                                            name="additions"
                                            min="0"
                                            step="0.01"
                                            className="w-full p-3 bg-green-50 border border-green-200 rounded-xl font-bold text-green-800 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                            value={formData.additions}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1.5">Issued (-)</label>
                                        <input
                                            type="number"
                                            name="issued"
                                            min="0"
                                            step="0.01"
                                            className="w-full p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-800 outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                            value={formData.issued}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-neutral-900 rounded-xl text-white">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Closing Stock</span>
                                        <span className={`text-xl font-black ${calculateClosingStock() < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                            {calculateClosingStock().toFixed(2)} <span className="text-sm text-neutral-500 font-medium">kg</span>
                                        </span>
                                    </div>
                                    {errors.closingStock && <p className="text-red-400 text-xs mt-2 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.closingStock}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Remarks (Optional)</label>
                                    <textarea
                                        name="remarks"
                                        rows={2}
                                        placeholder="Batch No, Supplier..."
                                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                                >
                                    {submitting ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>}
                                    {editingId ? 'Update Record' : 'Save Record'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* === RIGHT: DATA TABLE === */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-neutral-700 flex items-center gap-2">
                                    <History size={18} className="text-indigo-500"/> Transaction History
                                </h3>
                                <span className="text-xs font-bold bg-white border border-neutral-200 px-3 py-1 rounded-full text-neutral-500">
                                    Latest Entries
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400 font-semibold">
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Feed Type</th>
                                            <th className="px-6 py-4 text-right">Opening</th>
                                            <th className="px-6 py-4 text-right text-green-600">Added</th>
                                            <th className="px-6 py-4 text-right text-red-600">Issued</th>
                                            <th className="px-6 py-4 text-right">Closing</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                                                    <Loader2 size={24} className="animate-spin mx-auto mb-2 opacity-50"/>
                                                    Loading records...
                                                </td>
                                            </tr>
                                        ) : records.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                                                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <ClipboardList size={24} className="opacity-50"/>
                                                    </div>
                                                    No records found. Start by adding stock.
                                                </td>
                                            </tr>
                                        ) : (
                                            records.map((record) => (
                                                <tr key={record.id} className="hover:bg-neutral-50/80 transition-colors group">
                                                    <td className="px-6 py-4 text-sm font-medium text-neutral-600">
                                                        {new Date(record.createdAt).toLocaleDateString()}
                                                        <div className="text-[10px] text-neutral-400 font-normal">{new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-neutral-800 text-sm">{record.feedType}</span>
                                                        {record.remarks && <p className="text-xs text-neutral-400 mt-0.5 max-w-[150px] truncate">{record.remarks}</p>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-neutral-500 font-mono">
                                                        {record.openingStock}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-bold text-green-600 font-mono bg-green-50/30">
                                                        {record.additions > 0 ? `+${record.additions}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-bold text-red-600 font-mono bg-red-50/30">
                                                        {record.issued > 0 ? `-${record.issued}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-black text-neutral-800 font-mono bg-neutral-50/50">
                                                        {Number(record.closingStock).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleEdit(record)}
                                                                className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
                                                                title="Edit"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(record.id)}
                                                                className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-500 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}