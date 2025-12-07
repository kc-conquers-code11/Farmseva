'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileText, Download, FileBarChart } from 'lucide-react';
import ToastNotification, { useToast } from '@/app/components/ToastNotification';

export default function Reports() {
    const { farmDetails, currentFlock, dailyEntries } = useApp();
    const { toasts, success, error, info, removeToast } = useToast();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);

    const generatePDF = async () => {
        if (dailyEntries.length === 0) {
            info('No daily entries available to generate report');
            return;
        }

        try {
            setIsGeneratingPDF(true);

            const doc = new jsPDF();

            // Header with timestamp
            doc.setFontSize(20);
            doc.text('Poultry Analytics - Flock Report', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
            doc.setTextColor(0);

            doc.setFontSize(12);
            doc.text(`Farm: ${farmDetails?.name || '-'}`, 14, 36);
            doc.text(`Flock: ${(currentFlock as any)?.breed || '-'} (Started: ${(currentFlock as any)?.startDate || '-'})`, 14, 42);

            // Summary Table
            const totalDead = dailyEntries.reduce((sum, d) => sum + ((d as any).dead || 0), 0);
            const totalFeed = dailyEntries.reduce((sum, d) => sum + ((d as any).feedEaten || 0), 0);
            const lastEntry = dailyEntries[dailyEntries.length - 1] || {} as any;

            const initialCount = (currentFlock as any)?.count || 0;
            const cumulativeMortalityRate = initialCount > 0
                ? ((totalDead / initialCount) * 100).toFixed(2)
                : '0.00';

            const summaryData = [
                ['Initial Count', initialCount],
                ['Current Birds Alive', lastEntry.birdsAlive || '-'],
                ['Total Mortality', totalDead],
                ['Cumulative Mortality Rate', `${cumulativeMortalityRate}%`],
                ['Total Feed Consumed (kg)', totalFeed.toFixed(1)],
                ['Current FCR', lastEntry.fcr || '-'],
                ['Avg Weight (kg)', lastEntry.avgWeight?.toFixed(3) || '-']
            ];

            (doc as any).autoTable({
                startY: 50,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [59, 130, 246] }
            });

            // Daily Data Table
            const dailyDataHeaders = ['Day', 'Date', 'Dead', 'Alive', 'Feed (kg)', 'Avg Weight (kg)', 'FCR'];
            const dailyDataBody = dailyEntries.map(d => [
                d.day,
                d.date,
                (d as any).dead || 0,
                (d as any).birdsAlive || 0,
                ((d as any).feedEaten || 0).toFixed(1),
                ((d as any).avgWeight || 0).toFixed(3),
                (d as any).fcr || '-'
            ]);

            (doc as any).autoTable({
                startY: (doc as any).autoTable.previous.finalY + 10,
                head: [dailyDataHeaders],
                body: dailyDataBody,
                theme: 'striped',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [59, 130, 246] }
            });

            // Add footer with page numbers
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            doc.save(`flock_report_${new Date().toISOString().split('T')[0]}.pdf`);
            success('PDF report generated successfully!');
        } catch (err) {
            console.error('Error generating PDF:', err);
            error('Failed to generate PDF report. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const generateCSV = async () => {
        if (dailyEntries.length === 0) {
            info('No daily entries available to export');
            return;
        }

        try {
            setIsGeneratingCSV(true);

            const headers = ['Day,Date,OpeningBirds,BirdsAlive,Dead,Culled,Sold,FeedGiven(kg),FeedLeftover(kg),FeedEaten(kg),BirdsWeighed,SampleWeight(kg),AvgWeight(kg),TotalFeed(kg),CumulativeDead,FCR,Remarks'];
            const rows = dailyEntries.map(d => {
                const entry = d as any;
                const remarks = (entry.remarks || '').replace(/,/g, ';'); // Replace commas in remarks
                return `${d.day},${d.date},${entry.openingBirds || 0},${entry.birdsAlive || 0},${entry.dead || 0},${entry.culled || 0},${entry.sold || 0},${entry.feedGiven || 0},${entry.feedLeftover || 0},${entry.feedEaten || 0},${entry.birdsWeighed || 0},${entry.sampleWeight || 0},${entry.avgWeight || 0},${entry.totalFeed || 0},${entry.cumulativeDead || 0},${entry.fcr || 0},"${remarks}"`;
            });

            const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `flock_data_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            success('CSV data exported successfully!');
        } catch (err) {
            console.error('Error generating CSV:', err);
            error('Failed to export CSV. Please try again.');
        } finally {
            setIsGeneratingCSV(false);
        }
    };

    if (!currentFlock) return (
        <div className="max-w-2xl mx-auto py-10 px-4 text-center">
            <h2 className="page-title">Reports & Exports</h2>
            <div className="glass-panel p-12 space-y-4 mt-6">
                <FileBarChart size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p>No active flock found. Reports will be available after starting a flock.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 text-center">
            <h2 className="page-title">Reports & Exports</h2>
            <p className="page-subtitle">Download data for offline analysis</p>

            <div className="glass-panel p-12 space-y-8 mt-6">
                <div className="grid-2">
                    <button
                        onClick={generatePDF}
                        className="btn btn-primary flex-col h-32 gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={dailyEntries.length === 0 || isGeneratingPDF}
                    >
                        {isGeneratingPDF ? (
                            <>
                                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <FileText size={48} />
                                <span>Download Full Report (PDF)</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={generateCSV}
                        className="btn btn-secondary flex-col h-32 gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={dailyEntries.length === 0 || isGeneratingCSV}
                    >
                        {isGeneratingCSV ? (
                            <>
                                <div className="w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin" />
                                <span>Exporting CSV...</span>
                            </>
                        ) : (
                            <>
                                <Download size={48} />
                                <span>Export Data (CSV)</span>
                            </>
                        )}
                    </button>
                </div>
                {dailyEntries.length === 0 && (
                    <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded border border-amber-200">
                        💡 No daily entries logged yet. Add entries from the Daily Entry page to generate reports.
                    </div>
                )}
            </div>

            {/* Toast Notifications */}
            <ToastNotification toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
