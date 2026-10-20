"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUsers, FiUserPlus, FiCalendar, FiDollarSign, FiArrowUpRight, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

interface Quote {
  id: string;
  totalPriceLow: number;
  totalPriceHigh: number;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  status: string;
  createdAt: string;
  quotes: Quote[];
}

interface Stats {
  totalLeads: number;
  newLeads: number;
  scheduledLeads: number;
  totalRevenue: number;
  recentLeads: Lead[];
  leadsByStatus: { status: string; count: number }[];
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  quoted: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  scheduled: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
};

const statusBarColors: Record<string, string> = {
  new: "bg-amber-400",
  quoted: "bg-blue-400",
  scheduled: "bg-purple-400",
  completed: "bg-green-400",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-16 bg-gray-100 rounded" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-48 bg-gray-100 rounded flex-1" />
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
      <div className="h-4 w-16 bg-gray-100 rounded" />
      <div className="h-4 w-24 bg-gray-100 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Leads",
          value: stats.totalLeads,
          icon: FiUsers,
          color: "text-forest-600",
          bg: "bg-forest-50",
          change: "+12%",
        },
        {
          label: "New This Week",
          value: stats.newLeads,
          icon: FiUserPlus,
          color: "text-earth-600",
          bg: "bg-earth-50",
          change: "+8%",
        },
        {
          label: "Scheduled Jobs",
          value: stats.scheduledLeads,
          icon: FiCalendar,
          color: "text-blue-600",
          bg: "bg-blue-50",
          change: "+3%",
        },
        {
          label: "Revenue",
          value: `$${stats.totalRevenue.toLocaleString()}`,
          icon: FiDollarSign,
          color: "text-green-600",
          bg: "bg-green-50",
          change: "+15%",
        },
      ]
    : [];

  const totalPipelineLeads = stats
    ? stats.leadsByStatus.reduce((sum, s) => sum + s.count, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="stat-card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${card.bg}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <FiArrowUpRight className="w-3 h-3" />
                      {card.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </motion.div>
              );
            })}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Lead Pipeline Chart */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-5">Lead Pipeline</h3>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 h-4 bg-gray-200 rounded" />
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
                  <div className="w-8 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {["new", "quoted", "scheduled", "completed"].map((status) => {
                const count = stats?.leadsByStatus.find((s) => s.status === status)?.count || 0;
                const pct = totalPipelineLeads > 0 ? (count / totalPipelineLeads) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-600 capitalize font-medium">
                      {status}
                    </span>
                    <div className="flex-1 h-9 bg-gray-50 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 2)}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className={`h-full ${statusBarColors[status]} rounded-lg flex items-center justify-end px-3`}
                      >
                        {pct > 15 && (
                          <span className="text-xs font-semibold text-white">{count}</span>
                        )}
                      </motion.div>
                    </div>
                    {pct <= 15 && (
                      <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-5">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/leads"
              className="flex items-center justify-between p-3.5 rounded-xl bg-forest-50 hover:bg-forest-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FiUserPlus className="w-5 h-5 text-forest-600" />
                <span className="text-sm font-medium text-forest-800">Add Lead</span>
              </div>
              <FiArrowRight className="w-4 h-4 text-forest-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/pricing"
              className="flex items-center justify-between p-3.5 rounded-xl bg-earth-50 hover:bg-earth-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FiDollarSign className="w-5 h-5 text-earth-600" />
                <span className="text-sm font-medium text-earth-800">Update Pricing</span>
              </div>
              <FiArrowRight className="w-4 h-4 text-earth-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin/leads"
              className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FiUsers className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">View All Leads</span>
              </div>
              <FiArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Leads Table */}
      <motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Recent Leads</h3>
          <Link
            href="/admin/leads"
            className="text-sm text-forest-600 hover:text-forest-700 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Address
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Quote
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6">
                        <SkeletonRow />
                      </td>
                    </tr>
                  ))
                : stats?.recentLeads.map((lead) => {
                    const sc = statusColors[lead.status] || statusColors.new;
                    const quote = lead.quotes?.[0];
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => router.push("/admin/leads")}
                        className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {lead.firstName} {lead.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap max-w-[200px] truncate">
                          {lead.address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {quote
                            ? `$${quote.totalPriceLow} - $${quote.totalPriceHigh}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
