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

  // NEW: Delete User Function
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setUpdatingUserId(userId);
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    
    if (error) {
      alert("Failed to delete user: " + error.message);
    } else {
      // Remove from local state
      setProfiles(prev => prev.filter(p => p.id !== userId));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    }
    setUpdatingUserId(null);
  };

  // --- Role guard ---
  const isAdmin = !!user && (user.role === 'admin' || user.email?.includes('admin') || user.email === 'soham@gmail.com');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-green-600"/></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p>You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-light text-neutral-800">
                Admin Control Panel
              </h1>
              <p className="text-neutral-600 text-sm">
                Overview of FarmSeva Network, Outbreaks, and Schemes.
              </p>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'mdi:view-dashboard' },
              { id: 'outbreaks', label: 'Disease Outbreaks', icon: 'mdi:chart-timeline-variant' },
              { id: 'community', label: 'Community Reports', icon: 'mdi:account-alert' },
              { id: 'broadcast', label: 'Broadcast Center', icon: 'mdi:broadcast' },
              { id: 'schemes', label: 'Schemes Data', icon: 'mingcute:government-line' },
              { id: 'noc', label: 'NOC Verification', icon: 'mdi:file-certificate-outline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-neutral-600 hover:bg-green-50'
                }`}
              >
                <Icon icon={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <div className="flex justify-between items-center mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Icon icon="mdi:account-group" size={24}/></div>
                    <span className="text-xs font-bold text-gray-400">TOTAL USERS</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{stats.total}</h2>
                  <p className="text-xs text-green-600 flex items-center gap-1"><Icon icon="mdi:trending-up"/> +12% this month</p>
                </Card>
                <Card>
                  <div className="flex justify-between items-center mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Icon icon="mdi:file-document-multiple" size={24}/></div>
                    <span className="text-xs font-bold text-gray-400">PENDING NOCS</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{mockNocRequests.filter(n => n.status === 'Pending').length}</h2>
                  <p className="text-xs text-blue-600">Needs Action</p>
                </Card>
                <Card>
                  <div className="flex justify-between items-center mb-2">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600"><Icon icon="mdi:virus" size={24}/></div>
                    <span className="text-xs font-bold text-gray-400">ACTIVE OUTBREAKS</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">5</h2>
                  <p className="text-xs text-red-600">2 High Severity</p>
                </Card>
                <Card>
                  <div className="flex justify-between items-center mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Icon icon="mingcute:government-fill" size={24}/></div>
                    <span className="text-xs font-bold text-gray-400">SCHEME APPS</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">268</h2>
                  <p className="text-xs text-purple-600">Total processed</p>
                </Card>
              </div>

              {/* User Table Preview */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {profiles.map(p => (
                        <tr key={p.id}>
                          <td className="px-4 py-3 font-medium text-gray-900">{p.full_name || 'N/A'}</td>
                          <td className="px-4 py-3">
                             <select
                                className="text-xs border border-gray-200 rounded px-2 py-1"
                                value={p.role || 'farmer'}
                                disabled={updatingUserId === p.id}
                                onChange={(e) => handleRoleChange(p.id, e.target.value)}
                              >
                                <option value="farmer">Farmer</option>
                                <option value="vet">Vet</option>
                                <option value="admin">Admin</option>
                              </select>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{p.phone}</td>
                          <td className="px-4 py-3 text-gray-500">{new Date(p.created_at || '').toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                             <button 
                                onClick={() => handleDeleteUser(p.id)}
                                disabled={updatingUserId === p.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Delete User"
                             >
                               {updatingUserId === p.id ? <Icon icon="mdi:loading" className="animate-spin"/> : <Icon icon="mdi:trash-can-outline" size={18}/>}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Daily Trend */}
                 <Card>
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Icon icon="mdi:calendar-today" className="text-blue-500"/> Daily Cases (Last 7 Days)
                      </h3>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">Live Data</span>
                   </div>
                   <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={dailyOutbreakData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="day" axisLine={false} tickLine={false} />
                         <YAxis axisLine={false} tickLine={false} />
                         <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                         <Legend />
                         <Line type="monotone" dataKey="pig" stroke="#10b981" strokeWidth={3} activeDot={{r: 8}} name="Pig Cases" />
                         <Line type="monotone" dataKey="poultry" stroke="#f59e0b" strokeWidth={3} name="Poultry Cases" />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                 </Card>

                 {/* Weekly Trend */}
                 <Card>
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Icon icon="mdi:calendar-week" className="text-purple-500"/> Weekly Aggregate
                      </h3>
                   </div>
                   <div className="h-72">
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={weeklyOutbreakData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis dataKey="week" axisLine={false} tickLine={false} />
                         <YAxis axisLine={false} tickLine={false} />
                         <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}} />
                         <Legend />
                         <Bar dataKey="pig" fill="#10b981" radius={[4, 4, 0, 0]} name="Pig Cases" />
                         <Bar dataKey="poultry" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Poultry Cases" />
                       </BarChart>
                     </ResponsiveContainer>
                   </div>
                 </Card>
               </div>
            </motion.div>
          )}

          {/* ================= COMMUNITY REPORTS TAB ================= */}
          {activeTab === 'community' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Icon icon="mdi:flag" className="text-red-500"/> Moderation Queue
                  </h3>
                  <span className="text-sm text-gray-500">{mockReportedPosts.filter(p => p.status === 'Pending').length} Pending Reviews</span>
                </div>
                
                <div className="space-y-4">
                   {mockReportedPosts.map((report) => (
                     <div key={report.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-800">@{report.author}</span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-medium">{report.reason}</span>
                              {report.status === 'Reviewed' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md">Reviewed</span>}
                           </div>
                           <p className="text-sm text-gray-600 italic">"{report.content}"</p>
                        </div>
                        <div className="flex gap-2">
                           <button className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Dismiss</button>
                           <button className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Post</button>
                        </div>
                     </div>
                   ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ================= BROADCAST CENTER TAB ================= */}
          {activeTab === 'broadcast' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {/* Form */}
                   <div className="md:col-span-2">
                      <Card>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Icon icon="mdi:tower-broadcast" className="text-blue-600"/> Send Broadcast Message
                        </h3>
                        {broadcastSent ? (
                           <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center py-10">
                              <Icon icon="mdi:check-circle" className="w-12 h-12 mx-auto mb-2 text-green-500"/>
                              <h4 className="font-bold text-lg">Message Queued Successfully</h4>
                              <p className="text-sm">It will be delivered to {broadcast.target} users shortly.</p>
                           </div>
                        ) : (
                          <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                                  <select 
                                    value={broadcast.type}
                                    onChange={e => setBroadcast({...broadcast, type: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-green-500"
                                  >
                                     <option value="weather">Weather Alert</option>
                                     <option value="scheme">Scheme Announcement</option>
                                     <option value="emergency">Disease Emergency</option>
                                     <option value="general">General Info</option>
                                  </select>
                               </div>
                               <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                  <select 
                                    value={broadcast.target}
                                    onChange={e => setBroadcast({...broadcast, target: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-green-500"
                                  >
                                     <option value="all">All Users</option>
                                     <option value="farmers">Farmers Only</option>
                                     <option value="vets">Veterinarians Only</option>
                                  </select>
                               </div>
                            </div>
                            
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Title</label>
                               <input 
                                  required
                                  type="text" 
                                  value={broadcast.title}
                                  onChange={e => setBroadcast({...broadcast, title: e.target.value})}
                                  placeholder="e.g. Heavy Rainfall Alert for Pune District"
                                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                               />
                            </div>

                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                               <textarea 
                                  required
                                  rows={4}
                                  value={broadcast.message}
                                  onChange={e => setBroadcast({...broadcast, message: e.target.value})}
                                  placeholder="Type your message here..."
                                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500"
                               />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                               <Icon icon="mdi:send" /> Send Broadcast
                            </button>
                          </form>
                        )}
                      </Card>
                   </div>
                   
                   {/* History Sidebar */}
                   <div className="md:col-span-1">
                      <Card>
                         <h3 className="font-semibold text-gray-800 mb-4">Recent Broadcasts</h3>
                         <div className="space-y-4">
                            {[
                               { title: "Heatwave Warning", date: "2 hrs ago", type: "Weather" },
                               { title: "New Subsidy Live", date: "1 day ago", type: "Scheme" },
                               { title: "System Maintenance", date: "3 days ago", type: "General" },
                            ].map((item, i) => (
                               <div key={i} className="border-l-2 border-gray-200 pl-3 py-1">
                                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                     <span>{item.type}</span>
                                     <span>{item.date}</span>
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
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card>
                      <h3 className="font-semibold text-gray-800 mb-4">Application Volume by Scheme</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={mockSchemeData}>
                               <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
                               <XAxis type="number" hide/>
                               <YAxis dataKey="scheme" type="category" width={150} tick={{fontSize: 10}}/>
                               <Tooltip />
                               <Bar dataKey="applicants" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Total Applicants" barSize={20} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                   </Card>
                   <Card>
                      <h3 className="font-semibold text-gray-800 mb-4">Approval Rate</h3>
                      <div className="h-64 flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                               <Pie data={mockSchemeData} dataKey="approved" nameKey="scheme" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                  <Cell fill="#10b981" />
                                  <Cell fill="#3b82f6" />
                                  <Cell fill="#f59e0b" />
                               </Pie>
                               <Tooltip />
                               <Legend />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                   </Card>
                </div>

                <Card>
                   <h3 className="font-semibold text-gray-800 mb-4">Detailed Application Records</h3>
                   <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                         <thead className="bg-gray-50 border-b">
                            <tr>
                               <th className="px-4 py-3 text-left">Farmer Name</th>
                               <th className="px-4 py-3 text-left">Scheme Name</th>
                               <th className="px-4 py-3 text-left">Applied Date</th>
                               <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {[1,2,3,4].map((i) => (
                               <tr key={i}>
                                  <td className="px-4 py-3">Farmer {i}</td>
                                  <td className="px-4 py-3">National Livestock Mission</td>
                                  <td className="px-4 py-3">Dec 0{i}, 2025</td>
                                  <td className="px-4 py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Processing</span></td>
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
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card>
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                         <Icon icon="mdi:file-certificate-outline" className="text-orange-500" /> NOC Verification Queue
                      </h3>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                         <thead className="bg-orange-50 text-orange-800 border-b border-orange-100">
                            <tr>
                               <th className="px-4 py-3 text-left">Request ID</th>
                               <th className="px-4 py-3 text-left">Farmer / Farm</th>
                               <th className="px-4 py-3 text-left">Purpose</th>
                               <th className="px-4 py-3 text-left">Date</th>
                               <th className="px-4 py-3 text-left">Document</th>
                               <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {mockNocRequests.map((req) => (
                               <tr key={req.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-mono text-gray-500">#{req.id}</td>
                                  <td className="px-4 py-3">
                                     <div className="font-medium text-gray-900">{req.farmer}</div>
                                     <div className="text-xs text-gray-500">{req.farm}</div>
                                  </td>
                                  <td className="px-4 py-3">{req.type}</td>
                                  <td className="px-4 py-3">{req.date}</td>
                                  <td className="px-4 py-3">
                                     <button className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                                        <Icon icon="mdi:paperclip" /> View PDF
                                     </button>
                                  </td>
                                  <td className="px-4 py-3">
                                     {req.status === 'Pending' ? (
                                        <div className="flex gap-2">
                                           <button className="bg-green-100 text-green-700 hover:bg-green-200 p-1.5 rounded" title="Approve">
                                              <Icon icon="mdi:check" />
                                           </button>
                                           <button className="bg-red-100 text-red-700 hover:bg-red-200 p-1.5 rounded" title="Reject">
                                              <Icon icon="mdi:close" />
                                           </button>
                                        </div>
                                     ) : (
                                        <span className="text-xs font-bold text-green-600">Approved</span>
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

        </div>
      </div>
    </div>
  );
}