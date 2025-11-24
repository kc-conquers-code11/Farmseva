'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import Navbar from '@/app/components/Navbar';
import Card from '@/app/components/Card';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabaseClient';

type RoleStats = {
  farmers: number;
  vets: number;
  admins: number;
  total: number;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  created_at: string | null;
};

export default function AdminDashboardPage() {
  const { user, loading } = useSupabaseUser();
  const [stats, setStats] = useState<RoleStats>({
    farmers: 0,
    vets: 0,
    admins: 0,
    total: 0,
  });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch user stats from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, phone, created_at');

      if (!error && data) {
        const farmers = data.filter((p) => p.role === 'farmer').length;
        const vets = data.filter((p) => p.role === 'vet').length;
        const admins = data.filter((p) => p.role === 'admin').length;

        setStats({
          farmers,
          vets,
          admins,
          total: data.length,
        });

        setProfiles(
          data.map((p: any) => ({
            id: p.id,
            full_name: p.full_name,
            email: null, // we are not selecting email here to keep it light
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

  const roleChartData = [
    { role: 'Farmers', count: stats.farmers },
    { role: 'Vets', count: stats.vets },
    { role: 'Admins', count: stats.admins },
  ];

  const mockSystemAlerts = [
    {
      id: 1,
      level: 'high',
      title: 'Biosecurity non-compliance spike',
      detail:
        '3 farms have reported repeated biosecurity violations in the last 7 days.',
      icon: 'mdi:shield-alert',
    },
    {
      id: 2,
      level: 'medium',
      title: 'Unreviewed outbreak reports',
      detail:
        '5 suspected ASF/AI events are pending veterinary review and verification.',
      icon: 'mdi:virus',
    },
    {
      id: 3,
      level: 'low',
      title: 'Stale training content',
      detail:
        '2 training modules have not been updated in more than 6 months.',
      icon: 'mdi:book-alert',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="mdi:loading"
            className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4"
          />
          <p className="text-neutral-600">Loading admin session…</p>
        </div>
      </div>
    );
  }

  // Role guard – only admins allowed
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center">
          <Card>
            <div className="flex flex-col items-center gap-3">
              <Icon
                icon="mdi:shield-lock"
                className="w-8 h-8 text-red-500"
              />
              <h2 className="text-lg font-semibold text-neutral-800">
                Access Restricted
              </h2>
              <p className="text-sm text-neutral-600 text-center max-w-sm">
                This dashboard is only available for platform administrators.
                Please login with an admin account or contact support.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-light text-neutral-800 mb-2">
                Admin control panel,{' '}
                <span className="font-medium text-green-600">
                  {user.displayName || 'Administrator'}
                </span>
              </h1>
              <p className="text-neutral-600">
                Monitor users, schemes and biosecurity compliance across pig
                &amp; poultry farms.
              </p>
            </motion.div>
          </div>

          {/* Top Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="mdi:account-group"
                      className="w-6 h-6 text-emerald-600"
                    />
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">
                    Total Users
                  </span>
                </div>
                <div className="text-2xl font-semibold text-neutral-800 mb-1">
                  {stats.total}
                </div>
                <p className="text-xs text-neutral-500">
                  Across all roles in the system
                </p>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="mdi:account-cowboy-hat"
                      className="w-6 h-6 text-green-600"
                    />
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    Farmers
                  </span>
                </div>
                <div className="text-2xl font-semibold text-neutral-800 mb-1">
                  {stats.farmers}
                </div>
                <p className="text-xs text-neutral-500">
                  Registered pig &amp; poultry farmers
                </p>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="mdi:stethoscope"
                      className="w-6 h-6 text-blue-600"
                    />
                  </div>
                  <span className="text-xs text-blue-600 font-medium">
                    Veterinary Staff
                  </span>
                </div>
                <div className="text-2xl font-semibold text-neutral-800 mb-1">
                  {stats.vets}
                </div>
                <p className="text-xs text-neutral-500">
                  District / block vets onboarded
                </p>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="mdi:account-tie"
                      className="w-6 h-6 text-amber-600"
                    />
                  </div>
                  <span className="text-xs text-amber-600 font-medium">
                    Admins
                  </span>
                </div>
                <div className="text-2xl font-semibold text-neutral-800 mb-1">
                  {stats.admins}
                </div>
                <p className="text-xs text-neutral-500">
                  State / national level operators
                </p>
              </Card>
            </div>
          </motion.div>

          {/* Middle: User distribution + System alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="mdi:chart-bar"
                      className="w-5 h-5 text-emerald-600"
                    />
                    <h2 className="text-lg font-medium text-neutral-800">
                      User distribution by role
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500">
                    Live from profiles table
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="role" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Users" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Card>
                <div className="flex items-center mb-4">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    className="w-5 h-5 text-red-500 mr-2"
                  />
                  <h2 className="text-lg font-medium text-neutral-800">
                    System & field alerts
                  </h2>
                </div>
                <div className="space-y-3">
                  {mockSystemAlerts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-start gap-2">
                        <Icon
                          icon={a.icon}
                          className={`w-5 h-5 mt-0.5 ${
                            a.level === 'high'
                              ? 'text-red-600'
                              : a.level === 'medium'
                              ? 'text-amber-500'
                              : 'text-emerald-600'
                          }`}
                        />
                        <div>
                          <h3 className="text-sm font-medium text-neutral-800">
                            {a.title}
                          </h3>
                          <p className="text-xs text-neutral-600">
                            {a.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-neutral-400">
                  In real deployment, these cards pull from outbreak reports,
                  training CMS, and compliance logs.
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Bottom: User table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mdi:table-account"
                    className="w-5 h-5 text-slate-700"
                  />
                  <h2 className="text-lg font-medium text-neutral-800">
                    Registered profiles
                  </h2>
                </div>
                <span className="text-xs text-neutral-500">
                  {loadingData ? 'Syncing…' : `Showing ${profiles.length} users`}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-3 py-2 font-medium text-neutral-700">
                        Name
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-neutral-700">
                        Role
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-neutral-700">
                        Phone
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-neutral-700">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.length === 0 && !loadingData && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-6 text-neutral-500"
                        >
                          No profiles found yet. Ask farmers and vets to
                          register through the portal.
                        </td>
                      </tr>
                    )}

                    {profiles.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-3 py-2 text-neutral-800">
                          {p.full_name || 'Unnamed user'}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                              p.role === 'farmer'
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.role === 'vet'
                                ? 'bg-blue-50 text-blue-700'
                                : p.role === 'admin'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            {p.role || 'unknown'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-neutral-700">
                          {p.phone || '—'}
                        </td>
                        <td className="px-3 py-2 text-neutral-500 text-xs">
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
