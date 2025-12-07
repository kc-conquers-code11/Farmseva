'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabaseClient';

// --- Types ---
type RoleStats = {
  farmers: number;
  vets: number;
  admins: number;
  total: number;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  created_at: string | null;
};

// --- Mock Data ---
const dailyOutbreakData = [
  { day: 'Mon', pig: 2, poultry: 1 },
  { day: 'Tue', pig: 3, poultry: 2 },
  { day: 'Wed', pig: 1, poultry: 5 },
  { day: 'Thu', pig: 4, poultry: 3 },
  { day: 'Fri', pig: 2, poultry: 4 },
  { day: 'Sat', pig: 5, poultry: 2 },
  { day: 'Sun', pig: 3, poultry: 3 },
];

const weeklyOutbreakData = [
  { week: 'Week 1', pig: 12, poultry: 15 },
  { week: 'Week 2', pig: 18, poultry: 10 },
  { week: 'Week 3', pig: 10, poultry: 22 },
  { week: 'Week 4', pig: 15, poultry: 18 },
];

const mockNocRequests = [
  { id: 101, farmer: "Rajesh Kumar", farm: "Green Valley", type: "Transport", status: "Pending", date: "2025-11-28" },
  { id: 102, farmer: "Suresh Patil", farm: "Patil Poultry", type: "Sale", status: "Pending", date: "2025-11-29" },
  { id: 103, farmer: "Amit Singh", farm: "Sunrise Pork", type: "Loan", status: "Approved", date: "2025-11-25" },
];

const mockSchemeData = [
  { scheme: "KCC (Kisan Credit Card)", applicants: 145, approved: 120 },
  { scheme: "NLM Subsidy", applicants: 89, approved: 45 },
  { scheme: "AHIDF Loan", applicants: 34, approved: 12 },
];

const mockReportedPosts = [
  { id: 1, author: "User_123", reason: "Spam", content: "Buy cheap crypto now...", status: "Pending" },
  { id: 2, author: "User_999", reason: "Misinformation", content: "Vaccines kill pigs, dont use them!", status: "Reviewed" },
];

export default function AdminDashboardPage() {
  const { user, loading } = useSupabaseUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'outbreaks' | 'community' | 'broadcast' | 'schemes' | 'noc'>('overview');
  
  // Data States
  const [stats, setStats] = useState<RoleStats>({ farmers: 0, vets: 0, admins: 0, total: 0 });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Broadcast Form State
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'weather', target: 'all' });
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Fetch user stats from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, fullname, role, phone, created_at');

      if (!error && data) {
        const farmers = data.filter((p) => p.role === 'farmer').length;
        const vets = data.filter((p) => p.role === 'vet').length;
        const admins = data.filter((p) => p.role === 'admin').length;

        setStats({ farmers, vets, admins, total: data.length });
        setProfiles(
          data.map((p: any) => ({
            id: p.id,
            full_name: p.fullname,
            phone: p.phone,
            role: p.role,
            created_at: p.created_at,
          }))
        );
      }
      setLoadingData(false);
    }
    fetchData();
    
    // Global styles for custom scrollbar
    const styles = `
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  // --- Actions ---

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcast({ title: '', message: '', type: 'weather', target: 'all' });
    }, 3000);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
    } else {
      alert("Failed to update role");
    }
    setUpdatingUserId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setUpdatingUserId(userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    
    if (error) {
      alert("Failed to delete user: " + error.message);
    } else {
      setProfiles(prev => prev.filter(p => p.id !== userId));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    }
    setUpdatingUserId(null);
  };

  const tabList = [
    { id: 'overview', label: 'Overview', icon: 'mdi:view-dashboard' },
    { id: 'outbreaks', label: 'Disease Outbreaks', icon: 'mdi:chart-timeline-variant' },
    { id: 'community', label: 'Moderation Queue', icon: 'mdi:account-alert' },
    { id: 'broadcast', label: 'Broadcast Center', icon: 'mdi:broadcast' },
    { id: 'schemes', label: 'Schemes Data', icon: 'mingcute:government-line' },
    { id: 'noc', label: 'NOC Verification', icon: 'mdi:file-certificate-outline' },
  ];

  // --- Role guard ---
  const isAdmin = !!user && (user.role === 'admin' || user.email?.includes('admin') || user.email === 'soham@gmail.com');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-green-600"/></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
             <Icon icon="mdi:lock-alert" className="w-8 h-8 text-red-600"/>
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Access Denied</h2>
        <p className="text-neutral-500 mt-2">You do not have administrative privileges to view this dashboard.</p>
        <button onClick={() => window.history.back()} className="mt-6 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-16">
        
        {/* === LEFT SIDEBAR === */}
        <aside className="w-full md:w-72 bg-white md:bg-transparent z-40 border-b md:border-b-0 md:border-r border-neutral-200 sticky top-16 md:h-[calc(100vh-64px)] overflow-x-auto md:overflow-y-auto no-scrollbar md:pr-4 py-4 md:py-8 flex-shrink-0">
          <div className="flex md:flex-col gap-2 px-4 md:px-0 min-w-max md:min-w-0">
            <div className="hidden md:block mb-6 px-4">
               <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Admin Controls</h2>
            </div>

            {tabList.map((tab) => {
               const isActive = activeTab === tab.id;
               return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
                    ${isActive 
                      ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 translate-x-1" 
                      : "bg-white text-neutral-600 hover:bg-white hover:text-neutral-900 hover:shadow-md hover:shadow-neutral-200/50"
                    }
                  `}
                >
                  <Icon 
                    icon={tab.icon} 
                    className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-neutral-400 group-hover:text-neutral-900'}`} 
                  />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden md:block"></div>}
                </button>
               )
            })}
          </div>

          {/* Admin Profile Card */}
          <div className="hidden md:block mt-auto px-4 pt-8">
            <div className="p-4 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl shadow-lg flex items-center gap-3 text-white">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold border border-white/20">
                  <Icon icon="mdi:shield-account" className="w-5 h-5"/>
               </div>
               <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">Administrator</p>
                  <p className="text-xs text-neutral-400 truncate">Super User</p>
               </div>
            </div>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10 overflow-y-auto">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={activeTab}>
              <h1 className="text-3xl font-light text-neutral-800">
                 {tabList.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-neutral-500 mt-1 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Status: <span className="text-green-600 font-medium">Operational</span>
              </p>
            </motion.div>
          </div>

          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <Icon icon="mdi:account-group" width="24" height="24"/>
                    </div>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Total</span>
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-800 mb-1">{stats.total}</h2>
                  <p className="text-xs text-neutral-500 font-medium">Active Users Registered</p>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                        <Icon icon="mdi:file-document-multiple" width="24" height="24"/>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Pending</span>
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-800 mb-1">{mockNocRequests.filter(n => n.status === 'Pending').length}</h2>
                  <p className="text-xs text-neutral-500 font-medium">NOC Requests Awaiting</p>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100">
                        <Icon icon="mdi:virus" width="24" height="24"/>
                    </div>
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse">Live</span>
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-800 mb-1">5</h2>
                  <p className="text-xs text-neutral-500 font-medium">Active Disease Outbreaks</p>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                        <Icon icon="mingcute:government-fill" width="24" height="24"/>
                    </div>
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Processed</span>
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-800 mb-1">268</h2>
                  <p className="text-xs text-neutral-500 font-medium">Scheme Applications</p>
                </Card>
              </div>

              {/* User Table Preview */}
              <Card className="border-none shadow-sm ring-1 ring-neutral-100 overflow-hidden p-0">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                        <Icon icon="mdi:account-cog" className="text-neutral-500"/> User Management
                    </h3>
                    <div className="text-xs font-medium text-neutral-500 bg-white border px-3 py-1 rounded-full">
                        Showing {profiles.length} users
                    </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-white text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-neutral-100">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 bg-white">
                      {profiles.map(p => (
                        <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-neutral-800">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${p.role === 'admin' ? 'bg-neutral-800' : p.role === 'vet' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                      {p.full_name?.[0] || 'U'}
                                  </div>
                                  {p.full_name || 'Anonymous User'}
                              </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="relative">
                                <select
                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border focus:ring-2 focus:ring-offset-1 cursor-pointer
                                        ${p.role === 'admin' ? 'bg-neutral-100 text-neutral-700 border-neutral-200' : 
                                          p.role === 'vet' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                          'bg-green-50 text-green-700 border-green-100'}`}
                                    value={p.role || 'farmer'}
                                    disabled={updatingUserId === p.id}
                                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                >
                                    <option value="farmer">Farmer</option>
                                    <option value="vet">Vet</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <Icon icon="mdi:chevron-down" className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"/>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-neutral-500 font-mono">{p.phone || 'N/A'}</td>
                          <td className="px-6 py-4 text-neutral-500">{new Date(p.created_at || '').toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                             <button 
                                onClick={() => handleDeleteUser(p.id)}
                                disabled={updatingUserId === p.id}
                                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                title="Delete User"
                             >
                               {updatingUserId === p.id ? <Icon icon="mdi:loading" className="animate-spin"/> : <Icon icon="mdi:trash-can-outline" width="18" height="18"/>}
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ================= OUTBREAKS TAB ================= */}
          {activeTab === 'outbreaks' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Daily Trend */}
                 <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                        <Icon icon="mdi:calendar-today" className="text-blue-500"/> Daily Cases (Last 7 Days)
                      </h3>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span> Live
                      </span>
                   </div>
                   <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={dailyOutbreakData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                         <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                         <Tooltip contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                         <Legend wrapperStyle={{paddingTop: '20px'}} iconType="circle"/>
                         <Line type="monotone" dataKey="pig" stroke="#10b981" strokeWidth={3} activeDot={{r: 8}} name="Pig Cases" />
                         <Line type="monotone" dataKey="poultry" stroke="#f59e0b" strokeWidth={3} name="Poultry Cases" />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </Card>

                 {/* Weekly Trend */}
                 <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-neutral-800 flex items-center gap-2">
                        <Icon icon="mdi:calendar-week" className="text-purple-500"/> Weekly Aggregate
                      </h3>
                   </div>
                   <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={weeklyOutbreakData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                         <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                         <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                         <Legend wrapperStyle={{paddingTop: '20px'}} iconType="circle"/>
                         <Bar dataKey="pig" fill="#10b981" radius={[4, 4, 0, 0]} name="Pig Cases" barSize={30} />
                         <Bar dataKey="poultry" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Poultry Cases" barSize={30} />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </Card>
               </div>
            </motion.div>
          )}

          {/* ================= COMMUNITY REPORTS TAB ================= */}
          {activeTab === 'community' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
              <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                <div className="flex justify-between items-center mb-8 border-b border-neutral-100 pb-4">
                  <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <Icon icon="mdi:shield-alert"/> 
                    </div>
                    Moderation Queue
                  </h3>
                  <span className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold rounded-full">
                     {mockReportedPosts.filter(p => p.status === 'Pending').length} Pending
                  </span>
                </div>
                
                <div className="grid gap-4">
                   {mockReportedPosts.map((report) => (
                     <div key={report.id} className="p-5 rounded-2xl bg-white border border-neutral-200 hover:shadow-md transition-shadow">
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-neutral-900">@{report.author}</span>
                                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-red-100">{report.reason}</span>
                                {report.status === 'Reviewed' && <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md font-bold uppercase tracking-wide border border-green-100">Reviewed</span>}
                             </div>
                             <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                <p className="text-sm text-neutral-600 italic">"{report.content}"</p>
                             </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                             <button className="flex-1 md:flex-none px-4 py-2 text-sm font-semibold bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700 transition-colors">Dismiss</button>
                             <button className="flex-1 md:flex-none px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm shadow-red-200 transition-colors">Delete Post</button>
                          </div>
                       </div>
                     </div>
                   ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ================= BROADCAST CENTER TAB ================= */}
          {activeTab === 'broadcast' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Form */}
                   <div className="lg:col-span-2">
                      <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Icon icon="mdi:tower-broadcast" className="w-6 h-6"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-800">Send Broadcast</h3>
                                <p className="text-xs text-neutral-500">Notify users via SMS & App Notifications</p>
                            </div>
                        </div>

                        {broadcastSent ? (
                           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-2xl text-center py-12">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                  <Icon icon="mdi:check-decagram" className="w-8 h-8"/>
                              </div>
                              <h4 className="font-bold text-xl mb-1">Broadcast Sent!</h4>
                              <p className="text-sm opacity-80">Your message is being delivered to <span className="font-bold">{broadcast.target}</span>.</p>
                           </motion.div>
                        ) : (
                          <form onSubmit={handleBroadcastSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Message Type</label>
                                  <div className="relative">
                                    <select 
                                      value={broadcast.type}
                                      onChange={e => setBroadcast({...broadcast, type: e.target.value})}
                                      className="w-full border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:ring-2 focus:ring-black focus:border-transparent outline-none appearance-none font-medium"
                                    >
                                       <option value="weather">Weather Alert</option>
                                       <option value="scheme">Scheme Announcement</option>
                                       <option value="emergency">Disease Emergency</option>
                                       <option value="general">General Info</option>
                                    </select>
                                    <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"/>
                                  </div>
                               </div>
                               <div>
                                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Target Audience</label>
                                  <div className="relative">
                                    <select 
                                      value={broadcast.target}
                                      onChange={e => setBroadcast({...broadcast, target: e.target.value})}
                                      className="w-full border border-neutral-200 rounded-xl p-3 bg-neutral-50 focus:ring-2 focus:ring-black focus:border-transparent outline-none appearance-none font-medium"
                                    >
                                       <option value="all">All Users</option>
                                       <option value="farmers">Farmers Only</option>
                                       <option value="vets">Veterinarians Only</option>
                                    </select>
                                    <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"/>
                                  </div>
                               </div>
                            </div>
                            
                            <div>
                               <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Subject</label>
                               <input 
                                  required
                                  type="text" 
                                  value={broadcast.title}
                                  onChange={e => setBroadcast({...broadcast, title: e.target.value})}
                                  placeholder="e.g. Heavy Rainfall Alert for Pune District"
                                  className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium"
                               />
                            </div>

                            <div>
                               <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Message Body</label>
                               <textarea 
                                  required
                                  rows={4}
                                  value={broadcast.message}
                                  onChange={e => setBroadcast({...broadcast, message: e.target.value})}
                                  placeholder="Type your important message here..."
                                  className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium resize-none"
                               />
                            </div>

                            <button type="submit" className="w-full bg-neutral-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-lg shadow-neutral-900/20">
                               <Icon icon="mdi:send" className="w-5 h-5" /> Send Broadcast Now
                            </button>
                          </form>
                        )}
                      </Card>
                   </div>
                   
                   {/* History Sidebar */}
                   <div className="lg:col-span-1">
                      <Card className="border-none shadow-sm ring-1 ring-neutral-100 h-full">
                          <h3 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
                             <Icon icon="mdi:history" className="text-neutral-400"/> Recent History
                          </h3>
                          <div className="relative border-l-2 border-neutral-100 ml-3 space-y-8">
                             {[
                                { title: "Heatwave Warning", date: "2 hrs ago", type: "Weather", color: "bg-orange-500" },
                                { title: "New Subsidy Live", date: "1 day ago", type: "Scheme", color: "bg-purple-500" },
                                { title: "System Maintenance", date: "3 days ago", type: "General", color: "bg-gray-500" },
                             ].map((item, i) => (
                                <div key={i} className="relative pl-6">
                                   <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${item.color}`}></div>
                                   <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                                      <p className="text-sm font-bold text-neutral-800">{item.title}</p>
                                      <div className="flex justify-between text-xs text-neutral-500 mt-2 font-medium">
                                         <span className="bg-white px-2 py-0.5 rounded border border-neutral-100">{item.type}</span>
                                         <span>{item.date}</span>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                      </Card>
                   </div>
                </div>
             </motion.div>
          )}

          {/* ================= SCHEMES TAB ================= */}
          {activeTab === 'schemes' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                      <h3 className="font-bold text-neutral-800 mb-6">Application Volume</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={mockSchemeData}>
                               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0"/>
                               <XAxis type="number" hide/>
                               <YAxis dataKey="scheme" type="category" width={100} tick={{fontSize: 11, fill: '#6b7280'}}/>
                               <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} cursor={{fill: 'transparent'}}/>
                               <Bar dataKey="applicants" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Total Applicants" barSize={24} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </Card>
                   <Card className="border-none shadow-sm ring-1 ring-neutral-100">
                      <h3 className="font-bold text-neutral-800 mb-6">Approval Rate</h3>
                      <div className="h-64 flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie data={mockSchemeData} dataKey="approved" nameKey="scheme" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none">
                                  <Cell fill="#10b981" />
                                  <Cell fill="#3b82f6" />
                                  <Cell fill="#f59e0b" />
                               </Pie>
                               <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                               <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                   </Card>
                </div>

                <Card className="border-none shadow-sm ring-1 ring-neutral-100 overflow-hidden p-0">
                   <div className="p-6 border-b border-neutral-100">
                       <h3 className="font-bold text-neutral-800">Recent Applications</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                         <thead className="bg-neutral-50 text-neutral-500 font-semibold text-xs uppercase border-b border-neutral-100">
                            <tr>
                               <th className="px-6 py-4 text-left">Farmer Name</th>
                               <th className="px-6 py-4 text-left">Scheme Name</th>
                               <th className="px-6 py-4 text-left">Applied Date</th>
                               <th className="px-6 py-4 text-left">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-neutral-50">
                            {[1,2,3,4].map((i) => (
                               <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                                  <td className="px-6 py-4 font-medium text-neutral-800">Farmer {i}</td>
                                  <td className="px-6 py-4 text-neutral-600">National Livestock Mission</td>
                                  <td className="px-6 py-4 text-neutral-500 font-mono">Dec 0{i}, 2025</td>
                                  <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">Processing</span></td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </Card>
             </motion.div>
          )}

          {/* ================= NOC VERIFICATION TAB ================= */}
          {activeTab === 'noc' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                <Card className="border-none shadow-sm ring-1 ring-neutral-100 p-0 overflow-hidden">
                   <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-orange-50/30">
                      <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                             <Icon icon="mdi:file-certificate-outline" /> 
                          </div>
                          NOC Verification Queue
                      </h3>
                      <button className="text-sm font-bold text-orange-600 hover:underline">View History</button>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                         <thead className="bg-white text-neutral-400 border-b border-neutral-100 text-xs uppercase font-semibold">
                            <tr>
                               <th className="px-6 py-4 text-left">Request ID</th>
                               <th className="px-6 py-4 text-left">Farmer / Farm</th>
                               <th className="px-6 py-4 text-left">Purpose</th>
                               <th className="px-6 py-4 text-left">Date</th>
                               <th className="px-6 py-4 text-left">Document</th>
                               <th className="px-6 py-4 text-left">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-neutral-50">
                            {mockNocRequests.map((req) => (
                               <tr key={req.id} className="hover:bg-neutral-50 transition-colors">
                                  <td className="px-6 py-4 font-mono text-neutral-400 font-medium">#{req.id}</td>
                                  <td className="px-6 py-4">
                                     <div className="font-bold text-neutral-800">{req.farmer}</div>
                                     <div className="text-xs text-neutral-500 font-medium">{req.farm}</div>
                                  </td>
                                  <td className="px-6 py-4 text-neutral-700">{req.type}</td>
                                  <td className="px-6 py-4 text-neutral-500">{req.date}</td>
                                  <td className="px-6 py-4">
                                     <button className="flex items-center gap-2 text-neutral-600 hover:text-blue-600 transition-colors bg-neutral-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 hover:border-blue-200">
                                        <Icon icon="mdi:file-pdf-box" className="w-4 h-4"/> PDF
                                     </button>
                                  </td>
                                  <td className="px-6 py-4">
                                     {req.status === 'Pending' ? (
                                        <div className="flex gap-2">
                                           <button className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white p-2 rounded-lg transition-all" title="Approve">
                                              <Icon icon="mdi:check-bold" className="w-4 h-4" />
                                           </button>
                                           <button className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-all" title="Reject">
                                              <Icon icon="mdi:close-thick" className="w-4 h-4" />
                                           </button>
                                        </div>
                                     ) : (
                                        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100">
                                            <Icon icon="mdi:check-circle" className="w-4 h-4"/>
                                            <span className="text-xs font-bold uppercase tracking-wide">Approved</span>
                                        </div>
                                     )}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </Card>
             </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}