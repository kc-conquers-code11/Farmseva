'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, RotateCcw } from 'lucide-react';
import ToastNotification, { useToast } from '@/app/components/ToastNotification';

export default function Settings() {
    const { settings, setSettings } = useApp();
    const { toasts, success, error, removeToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const DEFAULT_SETTINGS = {
        currency: 'INR',
        mortalityThreshold: 1.5,
        fcrTarget: 1.6,
        defaultBagWeight: 50,
        medicineReminders: true,
        weightUnit: 'kg',
    };

    const handleChange = (field: string, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSaving(true);

            // Validate inputs
            if (settings.mortalityThreshold < 0 || settings.mortalityThreshold > 100) {
                error('Mortality threshold must be between 0 and 100');
                return;
            }

            if (settings.fcrTarget <= 0) {
                error('FCR target must be greater than 0');
                return;
            }

            // Simulate async save (AppContext already handles Supabase save)
            await new Promise(resolve => setTimeout(resolve, 500));

            success('Settings saved successfully!');
        } catch (err) {
            console.error('Error saving settings:', err);
            error('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset all settings to default values?')) {
            return;
        }

        try {
            setIsResetting(true);
            setSettings(prev => ({ ...prev, ...DEFAULT_SETTINGS }));

            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 300));

            success('Settings reset to defaults!');
        } catch (err) {
            console.error('Error resetting settings:', err);
            error('Failed to reset settings.');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <h2 className="page-title">Application Settings</h2>
            <p className="page-subtitle">Configure application defaults and targets</p>

            <form onSubmit={handleSave} className="glass-panel p-6 space-y-4">

                {/* Performance Targets */}
                <div className="space-y-4">
                    <h3 className="section-title">Performance Targets</h3>
                    <div className="grid-2">
                        <div>
                            <label className="label">Mortality Alert Threshold (%)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={settings.mortalityThreshold}
                                onChange={e => handleChange('mortalityThreshold', parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="label">FCR Target</label>
                            <input
                                type="number"
                                className="input-field"
                                value={settings.fcrTarget}
                                onChange={e => handleChange('fcrTarget', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="space-y-4">
                    <h3 className="section-title">Regional Settings</h3>
                    <div className="grid-2">
                        <div>
                            <label className="label">Weight Unit for Reports</label>
                            <select
                                className="input-field"
                                value={(settings as any).weightUnit || 'kg'}
                                onChange={e => handleChange('weightUnit', e.target.value)}
                            >
                                <option value="kg">Kilograms (kg)</option>
                                <option value="lb">Pounds (lb)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Currency Symbol</label>
                            <select
                                className="input-field"
                                value={settings.currency}
                                onChange={e => handleChange('currency', e.target.value)}
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Utility */}
                <div className="space-y-4">
                    <h3 className="section-title">Utility</h3>
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded">
                        <input
                            type="checkbox"
                            id="medReminders"
                            className="w-5 h-5 accent-primary"
                            checked={settings.medicineReminders}
                            onChange={e => handleChange('medicineReminders', e.target.checked)}
                        />
                        <label htmlFor="medReminders" className="text-slate-200">Enable Medicine Withdrawal Reminders</label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save Settings
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isResetting || isSaving}
                        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResetting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                                Resetting...
                            </>
                        ) : (
                            <>
                                <RotateCcw size={18} /> Reset to Defaults
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Toast Notifications */}
            <ToastNotification toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
