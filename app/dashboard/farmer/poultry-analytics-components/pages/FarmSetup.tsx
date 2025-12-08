'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Save, Plus, Trash2, Edit2, MapPin, Phone, User, Home } from 'lucide-react';

interface Shed {
    id?: string; // Optional because new sheds won't have an ID yet
    name: string;
    capacity: number;
}

interface FarmData {
    id?: string;
    farmName: string;
    ownerName: string;
    mobile: string;
    location: string;
    sheds: Shed[];
}

export default function FarmSetup() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(true); // Default to Edit mode if no data
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<FarmData>({
        farmName: '',
        ownerName: '',
        mobile: '',
        location: '',
        sheds: [{ name: 'Shed 1', capacity: 5000 }]
    });

    // 1. Fetch Farm Details on Load
    useEffect(() => {
        const fetchFarm = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Get Farm
                const { data: farm } = await supabase
                    .from('poultry_farms')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (farm) {
                    // Get Sheds
                    const { data: sheds } = await supabase
                        .from('poultry_sheds')
                        .select('*')
                        .eq('farm_id', farm.id);

                    setFormData({
                        id: farm.id,
                        farmName: farm.farm_name,
                        ownerName: farm.owner_name,
                        mobile: farm.mobile,
                        location: farm.location || '',
                        sheds: sheds || []
                    });
                    setIsEditing(false); // Switch to View Mode
                }
            }
            setLoading(false);
        };
        fetchFarm();
    }, []);

    // Form Handlers
    const addShed = () => {
        setFormData(prev => ({
            ...prev,
            sheds: [...prev.sheds, { name: `Shed ${prev.sheds.length + 1}`, capacity: 5000 }]
        }));
    };

    const removeShed = (index: number) => {
        if (formData.sheds.length === 1) return;
        setFormData(prev => ({
            ...prev,
            sheds: prev.sheds.filter((_, i) => i !== index)
        }));
    };

    const updateShed = (index: number, field: keyof Shed, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            sheds: prev.sheds.map((s, i) => i === index ? { ...s, [field]: value } : s)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // 1. Upsert Farm
            const { data: farm, error: farmError } = await supabase
                .from('poultry_farms')
                .upsert({
                    user_id: user.id, // Unique constraint will trigger update if exists
                    farm_name: formData.farmName,
                    owner_name: formData.ownerName,
                    mobile: formData.mobile,
                    location: formData.location
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (farmError) throw farmError;

            // 2. Upsert Sheds
            // First, delete existing sheds to handle removals cleanly (simple approach)
            // In a complex app, you'd diff the lists, but this is safe for small lists.
            if (farm) {
                await supabase.from('poultry_sheds').delete().eq('farm_id', farm.id);
                
                const shedsToInsert = formData.sheds.map(s => ({
                    farm_id: farm.id,
                    name: s.name,
                    capacity: s.capacity
                }));

                const { error: shedError } = await supabase
                    .from('poultry_sheds')
                    .insert(shedsToInsert);

                if (shedError) throw shedError;

                // Update local state
                setFormData(prev => ({ ...prev, id: farm.id }));
                setIsEditing(false); // Exit Edit Mode
                alert("Farm details saved successfully!");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Farm Details...</div>;

    // --- VIEW MODE (Read Only) ---
    if (!isEditing && formData.id) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{formData.farmName}</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <MapPin size={16} /> {formData.location || 'No location set'}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition flex items-center gap-2"
                    >
                        <Edit2 size={16} /> Edit Details
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-2">Owner</div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <User size={18} className="text-gray-400" /> {formData.ownerName}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-2">Contact</div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                            <Phone size={18} className="text-gray-400" /> {formData.mobile}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total Capacity</div>
                        <div className="font-semibold text-emerald-600 flex items-center gap-2">
                            <Home size={18} /> 
                            {formData.sheds.reduce((sum, s) => sum + s.capacity, 0).toLocaleString()} birds
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Sheds & Housing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.sheds.map((shed, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                            <span className="font-medium text-gray-700">{shed.name}</span>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                Cap: {shed.capacity}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- EDIT MODE (Form) ---
    return (
        <div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Farm Setup</h2>
                <p className="text-gray-500 mt-2">Configure your farm details and sheds</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                            <input 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.farmName}
                                onChange={e => setFormData({ ...formData, farmName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                            <input 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.ownerName}
                                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                            <input 
                                type="tel"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Sheds */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Sheds</h3>
                        <button type="button" onClick={addShed} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
                            <Plus size={16} /> Add Shed
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.sheds.map((shed, index) => (
                            <div key={index} className="flex gap-3 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Shed Name</label>
                                    <input 
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                        value={shed.name}
                                        onChange={e => updateShed(index, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Capacity</label>
                                    <input 
                                        type="number"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                        value={shed.capacity}
                                        onChange={e => updateShed(index, 'capacity', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                </div>
                                {formData.sheds.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeShed(index)}
                                        className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition mb-[1px]"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

                <div className="flex gap-4 pt-4">
                    {/* Cancel button (only if farm exists already) */}
                    {formData.id && (
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition flex justify-center items-center gap-2"
                    >
                        {saving ? 'Saving...' : <><Save size={20} /> Save Farm Details</>}
                    </button>
                </div>
            </form>
        </div>
    );
}