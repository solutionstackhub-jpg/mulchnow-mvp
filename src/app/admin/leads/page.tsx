"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiPlus,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronDown,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";

interface Email {
  id: string;
  type: string;
  subject: string;
  body: string;
  sentAt: string;
}

interface Quote {
  id: string;
  totalSqFt: number;
  mulchType: string;
  depth: number;
  yardsNeeded: number;
  pricePerYard: number;
  totalPriceLow: number;
  totalPriceHigh: number;
  status: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string;
  source: string;
  notes: string | null;
  createdAt: string;
  quotes: Quote[];
  emails?: Email[];
}

const STATUSES = ["new", "quoted", "scheduled", "completed"] as const;

const statusColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  new: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" },
  quoted: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", border: "border-blue-200" },
  scheduled: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400", border: "border-purple-200" },
  completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400", border: "border-green-200" },
};

const statusHeaderColors: Record<string, string> = {
  new: "text-amber-600",
  quoted: "text-blue-600",
  scheduled: "text-purple-600",
  completed: "text-green-600",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pipeline" | "list">("pipeline");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailNotes, setDetailNotes] = useState("");
  const [detailStatus, setDetailStatus] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !search ||
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.address.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !filterStatus || lead.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, filterStatus]);

  const grouped = useMemo(() => {
    const g: Record<string, Lead[]> = { new: [], quoted: [], scheduled: [], completed: [] };
    filteredLeads.forEach((l) => {
      if (g[l.status]) g[l.status].push(l);
    });
    return g;
  }, [filteredLeads]);

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailNotes(lead.notes || "");
    setDetailStatus(lead.status);
  };

  const saveLeadUpdate = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: detailStatus,
          notes: detailNotes,
          sendEmail: detailStatus !== selectedLead.status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, ...data.lead } : l))
        );
        setSelectedLead((prev) => (prev ? { ...prev, ...data.lead } : null));
        toast.success("Lead updated");
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      if (res.ok) {
        toast.success("Lead added");
        setShowAddForm(false);
        setNewLead({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "", notes: "" });
        fetchLeads();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add lead");
      }
    } catch {
      toast.error("Failed to add lead");
    } finally {
      setSaving(false);
    }
  };

  const sendEmail = async () => {
    if (!selectedLead) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedLead.status, sendEmail: true }),
      });
      if (res.ok) {
        toast.success("Email sent");
        fetchLeads();
      } else {
        toast.error("Failed to send email");
      }
    } catch {
      toast.error("Failed to send email");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-10"
          />
        </div>
        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field !pl-9 !pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("pipeline")}
              className={`p-2 rounded-md transition-colors ${
                view === "pipeline" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-md transition-colors ${
                view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-800 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pipeline-column animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="lead-card mb-3">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : view === "pipeline" ? (
        /* Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {STATUSES.map((status) => (
            <div key={status} className="pipeline-column">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold ${statusHeaderColors[status]} capitalize`}>
                  {status}
                </h3>
                <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">
                  {grouped[status].length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {grouped[status].map((lead) => {
                    const quote = lead.quotes?.[0];
                    return (
                      <motion.div
                        key={lead.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => openDetail(lead)}
                        className="lead-card"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FiMapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{lead.address}</span>
                        </p>
                        {quote && (
                          <p className="text-xs font-medium text-forest-700 mt-2">
                            ${quote.totalPriceLow} - ${quote.totalPriceHigh}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-2">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {grouped[status].length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">No leads</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Address</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Quote</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.map((lead) => {
                  const sc = statusColors[lead.status] || statusColors.new;
                  const quote = lead.quotes?.[0];
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => openDetail(lead)}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{lead.email}</td>
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
                        {quote ? `$${quote.totalPriceLow} - $${quote.totalPriceHigh}` : "-"}
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
          {filteredLeads.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No leads found</div>
          )}
        </div>
      )}

      {/* Lead Detail Slide-in Panel */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-900">Lead Details</h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Lead Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      {selectedLead.email}
                    </p>
                    {selectedLead.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-gray-400" />
                        {selectedLead.phone}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-400" />
                      {selectedLead.address}
                      {selectedLead.city && `, ${selectedLead.city}`}
                      {selectedLead.state && `, ${selectedLead.state}`}
                      {selectedLead.zip && ` ${selectedLead.zip}`}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <div className="relative">
                    <select
                      value={detailStatus}
                      onChange={(e) => setDetailStatus(e.target.value)}
                      className="input-field appearance-none cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Quote Details */}
                {selectedLead.quotes?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quote Details</label>
                    {selectedLead.quotes.map((q) => (
                      <div key={q.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Material</span>
                          <span className="font-medium text-gray-900 capitalize">
                            {q.mulchType.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Area</span>
                          <span className="font-medium text-gray-900">{q.totalSqFt.toLocaleString()} sq ft</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Depth</span>
                          <span className="font-medium text-gray-900">{q.depth}&quot;</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Yards Needed</span>
                          <span className="font-medium text-gray-900">{q.yardsNeeded}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-sm">
                          <span className="text-gray-500 font-medium">Price Range</span>
                          <span className="font-bold text-forest-700">
                            ${q.totalPriceLow} - ${q.totalPriceHigh}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FiMessageSquare className="inline w-4 h-4 mr-1" />
                    Notes
                  </label>
                  <textarea
                    value={detailNotes}
                    onChange={(e) => setDetailNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this lead..."
                    className="input-field resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={saveLeadUpdate}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-forest-800 hover:bg-forest-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={sendEmail}
                    className="py-2.5 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <FiSend className="w-4 h-4" />
                    Send Email
                  </button>
                </div>

                {/* Email History */}
                {selectedLead.emails && selectedLead.emails.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email History</label>
                    <div className="space-y-2">
                      {selectedLead.emails.map((em) => (
                        <details key={em.id} className="bg-gray-50 rounded-xl overflow-hidden group">
                          <summary className="px-4 py-3 cursor-pointer flex items-center justify-between text-sm hover:bg-gray-100 transition-colors">
                            <div>
                              <span className="font-medium text-gray-900">{em.subject}</span>
                              <span className="text-gray-400 ml-2 text-xs">
                                {new Date(em.sentAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              em.type.includes("quote") ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                            }`}>
                              {em.type.replace(/_/g, " ")}
                            </span>
                          </summary>
                          <div className="px-4 pb-3 text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-200 pt-3">
                            {em.body}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <p>Source: {selectedLead.source}</p>
                  <p>Created: {new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setShowAddForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Add New Lead</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleAddLead} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={newLead.firstName}
                        onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={newLead.lastName}
                        onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      required
                      value={newLead.address}
                      onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newLead.city}
                        onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={newLead.state}
                        onChange={(e) => setNewLead({ ...newLead, state: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                      <input
                        type="text"
                        value={newLead.zip}
                        onChange={(e) => setNewLead({ ...newLead, zip: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={newLead.notes}
                      onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-forest-800 hover:bg-forest-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                  >
                    {saving ? "Adding..." : "Add Lead"}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
