"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FiSettings,
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronDown,
  FiInfo,
  FiSearch,
} from "react-icons/fi";

interface Email {
  id: string;
  type: string;
  subject: string;
  body: string;
  sentAt: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emails?: Email[];
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "email-logs" ? "email-logs" : "general";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailFilter, setEmailFilter] = useState("");
  const [emailSearch, setEmailSearch] = useState("");

  // General settings state (display-only in MVP)
  const [settings, setSettings] = useState({
    companyName: "DiCillo Services / Mulch Now",
    phone: "(772) 555-MULCH",
    email: "info@mulchnow.com",
    serviceAreas: ["south-florida", "ohio"],
    defaultMarket: "south-florida",
  });

  const allServiceAreas = [
    { value: "south-florida", label: "South Florida" },
    { value: "ohio", label: "Ohio" },
    { value: "central-florida", label: "Central Florida" },
    { value: "tampa-bay", label: "Tampa Bay" },
  ];

  useEffect(() => {
    if (activeTab === "email-logs") {
      setLoadingEmails(true);
      fetch("/api/leads")
        .then((res) => res.json())
        .then((data) => setLeads(data.leads || []))
        .catch(() => toast.error("Failed to load email logs"))
        .finally(() => setLoadingEmails(false));
    }
  }, [activeTab]);

  const allEmails = useMemo(() => {
    const emails: (Email & { recipientName: string; recipientEmail: string })[] = [];
    leads.forEach((lead) => {
      (lead.emails || []).forEach((em) => {
        emails.push({
          ...em,
          recipientName: `${lead.firstName} ${lead.lastName}`,
          recipientEmail: lead.email,
        });
      });
    });
    emails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    return emails;
  }, [leads]);

  const filteredEmails = useMemo(() => {
    return allEmails.filter((em) => {
      const matchesType = !emailFilter || em.type === emailFilter;
      const matchesSearch =
        !emailSearch ||
        em.recipientName.toLowerCase().includes(emailSearch.toLowerCase()) ||
        em.subject.toLowerCase().includes(emailSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [allEmails, emailFilter, emailSearch]);

  const emailTypes = useMemo(() => {
    const types = new Set(allEmails.map((e) => e.type));
    return Array.from(types);
  }, [allEmails]);

  const toggleServiceArea = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(value)
        ? prev.serviceAreas.filter((a) => a !== value)
        : [...prev.serviceAreas, value],
    }));
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "general"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiSettings className="w-4 h-4" />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("email-logs")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "email-logs"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FiMail className="w-4 h-4" />
          Email Logs
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Company Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FiPhone className="inline w-4 h-4 mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <FiMail className="inline w-4 h-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">
              <FiMapPin className="inline w-4 h-4 mr-1" />
              Service Areas
            </h3>
            <div className="space-y-3 mb-6">
              {allServiceAreas.map((area) => (
                <label
                  key={area.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      settings.serviceAreas.includes(area.value)
                        ? "bg-forest-600 border-forest-600"
                        : "border-gray-300 group-hover:border-forest-400"
                    }`}
                  >
                    {settings.serviceAreas.includes(area.value) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-gray-700 cursor-pointer"
                    onClick={() => toggleServiceArea(area.value)}
                  >
                    {area.label}
                  </span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Default Market
              </label>
              <div className="relative max-w-xs">
                <select
                  value={settings.defaultMarket}
                  onChange={(e) => setSettings({ ...settings, defaultMarket: e.target.value })}
                  className="input-field appearance-none cursor-pointer"
                >
                  {allServiceAreas
                    .filter((a) => settings.serviceAreas.includes(a.value))
                    .map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* MVP Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <FiInfo className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">MVP Notice</p>
              <p className="text-sm text-amber-700 mt-1">
                These settings are for display purposes in the MVP. They will be connected to the live system in production.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Email Logs */}
      {activeTab === "email-logs" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="input-field !pl-10"
              />
            </div>
            {emailTypes.length > 0 && (
              <div className="relative">
                <select
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="input-field !pr-8 appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  {emailTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Email Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loadingEmails ? (
              <div className="p-8 space-y-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-20 bg-gray-100 rounded" />
                    <div className="h-4 flex-1 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {allEmails.length === 0 ? "No emails have been sent yet" : "No emails match your filters"}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredEmails.map((em) => (
                  <details key={em.id} className="group">
                    <summary className="px-6 py-4 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-gray-50/50 transition-colors">
                      <span className="text-xs text-gray-400 w-28 flex-shrink-0">
                        {new Date(em.sentAt).toLocaleDateString()}{" "}
                        {new Date(em.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-sm font-medium text-gray-900 w-36 flex-shrink-0 truncate">
                        {em.recipientName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 w-fit ${
                        em.type.includes("quote")
                          ? "bg-blue-50 text-blue-600"
                          : em.type.includes("completed")
                          ? "bg-green-50 text-green-600"
                          : em.type.includes("scheduled")
                          ? "bg-purple-50 text-purple-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {em.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-600 flex-1 truncate">
                        {em.subject}
                      </span>
                    </summary>
                    <div className="px-6 pb-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap">
                        <div className="text-xs text-gray-400 mb-2">
                          To: {em.recipientEmail}
                        </div>
                        {em.body}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
