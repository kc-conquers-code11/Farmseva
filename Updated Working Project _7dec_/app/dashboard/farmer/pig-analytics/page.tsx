'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Activity } from 'lucide-react';

// Import all page components
import Dashboard from '../pig-analytics-components/pages/Dashboard';
import ServiceRecords from '../pig-analytics-components/pages/ServiceRecords';
import FarrowingRecords from '../pig-analytics-components/pages/FarrowingRecords';
import LitterRecords from '../pig-analytics-components/pages/LitterRecords';
import DailyPigEntry from '../pig-analytics-components/pages/DailyPigEntry';
import DailyFeedWeight from '../pig-analytics-components/pages/DailyFeedWeight';
import TreatmentRecords from '../pig-analytics-components/pages/TreatmentRecords';
import FeedStock from '../pig-analytics-components/pages/FeedStock';
import MedicineStock from '../pig-analytics-components/pages/MedicineStock';
import DispatchRecords from '../pig-analytics-components/pages/DispatchRecords';

interface NavItem {
    id: string;
    label: string;
    icon: string;
}

export default function PigAnalyticsPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<string>('dashboard');

    const navigation: NavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'service', label: 'Service Records', icon: '🐷' },
        { id: 'farrowing', label: 'Farrowing Records', icon: '🍼' },
        { id: 'litter', label: 'Litter Records', icon: '👶' },
        { id: 'daily-pig-entry', label: 'Daily Pig Entry', icon: '🐖' },
        { id: 'feed-weight', label: 'Daily Feed & Weight', icon: '⚖️' },
        { id: 'treatment', label: 'Treatment Records', icon: '💉' },
        { id: 'feed-stock', label: 'Feed Stock', icon: '🌾' },
        { id: 'medicine-stock', label: 'Medicine Stock', icon: '💊' },
        { id: 'dispatch', label: 'Dispatch Records', icon: '🚚' },
    ];

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'service':
                return <ServiceRecords />;
            case 'farrowing':
                return <FarrowingRecords />;
            case 'litter':
                return <LitterRecords />;
            case 'daily-pig-entry':
                return <DailyPigEntry />;
            case 'feed-weight':
                return <DailyFeedWeight />;
            case 'treatment':
                return <TreatmentRecords />;
            case 'feed-stock':
                return <FeedStock />;
            case 'medicine-stock':
                return <MedicineStock />;
            case 'dispatch':
                return <DispatchRecords />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-gray-50 pt-[118px] md:pt-[126px]">
            {/* Enhanced Header with Gradient */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => router.push('/dashboard/farmer?tab=analytics')}
                        className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-all duration-200 mb-4 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Analytics</span>
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">🐖</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">
                                    Pig Farm Analytics
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">Comprehensive farm management and insights</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-lg">
                                <Activity className="w-4 h-4 text-pink-600" />
                                <span className="text-sm font-medium text-pink-700">Live Data</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                                <BarChart3 className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Analytics Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex max-w-7xl mx-auto">
                {/* Enhanced Sidebar Navigation */}
                <aside className="w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-140px)] sticky top-[140px] self-start shadow-sm">
                    <nav className="p-4">
                        <div className="mb-4 px-4 py-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
                        </div>
                        <ul className="space-y-1">
                            {navigation.map((item) => (
                                <li key={item.id}>
                                    <button
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${currentPage === item.id
                                                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md shadow-pink-200 scale-[1.02]'
                                                : 'text-gray-700 hover:bg-gray-50 hover:scale-[1.01]'
                                            }`}
                                        onClick={() => setCurrentPage(item.id)}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {currentPage === item.id && (
                                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Enhanced Main Content Area */}
                <main className="flex-1 p-8">
                    <div className="pig-analytics-content">
                        {renderPage()}
                    </div>
                </main>
            </div>

            {/* Scoped Styles */}
            <style jsx global>{`
                .pig-analytics-content {
                    /* Scoped styles for pig analytics components */
                }
                
                .pig-analytics-content .card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 20px;
                    transition: all 0.2s;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                
                .pig-analytics-content .card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .pig-analytics-content .form-input,
                .pig-analytics-content .form-select,
                .pig-analytics-content .form-textarea {
                    width: 100%;
                    padding: 12px;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    color: #1f2937;
                    font-size: 14px;
                    transition: all 0.2s;
                    outline: none;
                }
                
                .pig-analytics-content .form-input:focus,
                .pig-analytics-content .form-select:focus,
                .pig-analytics-content .form-textarea:focus {
                    border-color: #ec4899;
                    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
                }
                
                .pig-analytics-content .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .pig-analytics-content .btn-primary {
                    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
                    color: white;
                    box-shadow: 0 2px 4px rgba(236, 72, 153, 0.2);
                }
                
                .pig-analytics-content .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(236, 72, 153, 0.3);
                }
                
                .pig-analytics-content .btn-secondary {
                    background: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }
                
                .pig-analytics-content .btn-secondary:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }
                
                .pig-analytics-content .table-container {
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                
                .pig-analytics-content .table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                }
                
                .pig-analytics-content .table thead {
                    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
                    border-bottom: 2px solid #fbcfe8;
                }
                
                .pig-analytics-content .table th {
                    padding: 12px 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #831843;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .pig-analytics-content .table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f3f4f6;
                    color: #4b5563;
                }
                
                .pig-analytics-content .table tbody tr {
                    transition: all 0.15s;
                }
                
                .pig-analytics-content .table tbody tr:hover {
                    background: #fdf2f8;
                }
                
                .pig-analytics-content .kpi-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }
                
                .pig-analytics-content .kpi-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #ec4899 0%, #db2777 100%);
                }
                
                .pig-analytics-content .kpi-card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
