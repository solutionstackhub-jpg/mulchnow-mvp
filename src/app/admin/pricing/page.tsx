"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FiDollarSign,
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiChevronDown,
} from "react-icons/fi";

const MULCH_COLORS: Record<string, string> = {
  hardwood: "#5C4033",
  "pine-bark": "#8B4513",
  "red-dyed": "#8B2500",
  "black-dyed": "#2C2C2C",
  playground: "#D2B48C",
  soil: "#3E2723",
};

interface PricingRule {
  id: string;
  name: string;
  mulchType: string;
  pricePerYard: number;
  minDepth: number;
  maxDepth: number;
  market: string;
  isActive: boolean;
  sortOrder: number;
}

const MARKETS = [
  { value: "", label: "All Markets" },
  { value: "south-florida", label: "South Florida" },
  { value: "ohio", label: "Ohio" },
];

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketFilter, setMarketFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    name: "",
    mulchType: "hardwood",
    pricePerYard: "",
    minDepth: "2",
    maxDepth: "4",
    market: "south-florida",
  });

  // Pricing calculator state
  const [calcSqFt, setCalcSqFt] = useState("");
  const [calcDepth, setCalcDepth] = useState("3");

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/pricing");
      const data = await res.json();
      setRules(data.rules || []);
    } catch {
      toast.error("Failed to load pricing rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const filteredRules = useMemo(() => {
    if (!marketFilter) return rules;
    return rules.filter((r) => r.market === marketFilter);
  }, [rules, marketFilter]);

  const startEdit = (rule: PricingRule) => {
    setEditingId(rule.id);
    setEditValue(String(rule.pricePerYard));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (rule: PricingRule) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, pricePerYard: newPrice }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === rule.id ? { ...r, pricePerYard: newPrice } : r))
        );
        setFlashId(rule.id);
        setTimeout(() => setFlashId(null), 1200);
        toast.success("Price updated");
        cancelEdit();
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const toggleActive = async (rule: PricingRule) => {
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id, isActive: !rule.isActive }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === rule.id ? { ...r, isActive: !rule.isActive } : r))
        );
        toast.success(rule.isActive ? "Rule deactivated" : "Rule activated");
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteRule = async (rule: PricingRule) => {
    if (!confirm(`Delete "${rule.name}" for ${rule.market}?`)) return;
    try {
      const res = await fetch("/api/pricing", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rule.id }),
      });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== rule.id));
        toast.success("Rule deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newRule.pricePerYard);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRule.name,
          mulchType: newRule.mulchType,
          pricePerYard: price,
          minDepth: parseFloat(newRule.minDepth),
          maxDepth: parseFloat(newRule.maxDepth),
          market: newRule.market,
        }),
      });
      if (res.ok) {
        toast.success("Rule added");
        setShowAddForm(false);
        setNewRule({ name: "", mulchType: "hardwood", pricePerYard: "", minDepth: "2", maxDepth: "4", market: "south-florida" });
        fetchRules();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add rule");
      }
    } catch {
      toast.error("Failed to add rule");
    } finally {
      setSaving(false);
    }
  };

  // Pricing calculator
  const calcResults = useMemo(() => {
    const sqft = parseFloat(calcSqFt);
    const depth = parseFloat(calcDepth);
    if (isNaN(sqft) || isNaN(depth) || sqft <= 0) return [];

    const cubicFeet = sqft * (depth / 12);
    const yards = Math.ceil((cubicFeet / 27) * 10) / 10;

    const activeRules = rules.filter((r) => r.isActive);
    const uniqueTypes = Array.from(new Set(activeRules.map((r) => r.mulchType)));

    return uniqueTypes.map((type) => {
      const typeRules = activeRules.filter((r) => r.mulchType === type);
      const avgPrice =
        typeRules.reduce((s, r) => s + r.pricePerYard, 0) / typeRules.length;
      const total = Math.round(yards * avgPrice);
      return {
        mulchType: type,
        name: typeRules[0]?.name || type,
        yards,
        pricePerYard: Math.round(avgPrice),
        total,
        color: MULCH_COLORS[type] || "#666",
      };
    });
  }, [calcSqFt, calcDepth, rules]);

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          {MARKETS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMarketFilter(m.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                marketFilter === m.value
                  ? "bg-forest-800 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="sm:ml-auto inline-flex items-center gap-2 px-4 py-2.5 bg-forest-800 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add New Rule
        </button>
      </div>

      {/* Pricing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gray-200" />
                <div className="h-5 w-40 bg-gray-200 rounded" />
              </div>
              <div className="h-10 w-24 bg-gray-100 rounded mb-3" />
              <div className="h-4 w-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredRules.map((rule) => (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
                  flashId === rule.id
                    ? "border-green-400 ring-2 ring-green-100"
                    : "border-gray-100"
                } ${!rule.isActive ? "opacity-60" : ""}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg shadow-inner flex-shrink-0"
                      style={{ backgroundColor: MULCH_COLORS[rule.mulchType] || "#666" }}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{rule.name}</h3>
                      <p className="text-xs text-gray-400 capitalize">
                        {rule.market.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(rule)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      rule.isActive ? "bg-forest-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        rule.isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Price */}
                <div className="mb-3">
                  {editingId === rule.id ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(rule);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="input-field !pl-8 !py-2 text-lg font-bold"
                        />
                      </div>
                      <button
                        onClick={() => saveEdit(rule)}
                        className="p-2 bg-forest-600 hover:bg-forest-700 text-white rounded-lg transition-colors"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex items-baseline gap-1 cursor-pointer group"
                      onClick={() => startEdit(rule)}
                    >
                      <span className="text-3xl font-bold text-gray-900 group-hover:text-forest-700 transition-colors">
                        ${rule.pricePerYard}
                      </span>
                      <span className="text-sm text-gray-400">/yard</span>
                      <FiEdit2 className="w-3.5 h-3.5 text-gray-300 group-hover:text-forest-500 ml-2 transition-colors" />
                    </div>
                  )}
                </div>

                {/* Depth */}
                <p className="text-xs text-gray-500 mb-4">
                  Depth range: {rule.minDepth}&quot; - {rule.maxDepth}&quot;
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => startEdit(rule)}
                    className="text-xs text-gray-500 hover:text-forest-600 font-medium transition-colors flex items-center gap-1"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRule(rule)}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1 ml-auto"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredRules.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No pricing rules found for this market
        </div>
      )}

      {/* Pricing Calculator */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Pricing Calculator Preview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Square Footage
            </label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={calcSqFt}
              onChange={(e) => setCalcSqFt(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Depth (inches)
            </label>
            <div className="relative">
              <select
                value={calcDepth}
                onChange={(e) => setCalcDepth(e.target.value)}
                className="input-field appearance-none cursor-pointer"
              >
                <option value="2">2&quot; - Refresh existing beds</option>
                <option value="3">3&quot; - Standard (recommended)</option>
                <option value="4">4&quot; - New beds / heavy weed suppression</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {calcResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {calcResults.map((r) => (
              <div
                key={r.mulchType}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <div
                  className="w-6 h-6 rounded-md flex-shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.yards} yds x ${r.pricePerYard}/yd
                  </p>
                </div>
                <p className="text-sm font-bold text-forest-700">${r.total}</p>
              </div>
            ))}
          </div>
        )}

        {!calcSqFt && (
          <p className="text-sm text-gray-400 text-center py-4">
            Enter square footage above to preview pricing
          </p>
        )}
      </div>

      {/* Add Rule Modal */}
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
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Add Pricing Rule</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleAddRule} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Hardwood Mulch"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mulch Type *</label>
                      <div className="relative">
                        <select
                          value={newRule.mulchType}
                          onChange={(e) => setNewRule({ ...newRule, mulchType: e.target.value })}
                          className="input-field appearance-none cursor-pointer"
                        >
                          <option value="hardwood">Hardwood</option>
                          <option value="pine-bark">Pine Bark</option>
                          <option value="red-dyed">Red-Dyed</option>
                          <option value="black-dyed">Black-Dyed</option>
                          <option value="playground">Playground</option>
                          <option value="soil">Soil Blend</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Market *</label>
                      <div className="relative">
                        <select
                          value={newRule.market}
                          onChange={(e) => setNewRule({ ...newRule, market: e.target.value })}
                          className="input-field appearance-none cursor-pointer"
                        >
                          <option value="south-florida">South Florida</option>
                          <option value="ohio">Ohio</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Yard ($) *</label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="65"
                        value={newRule.pricePerYard}
                        onChange={(e) => setNewRule({ ...newRule, pricePerYard: e.target.value })}
                        className="input-field !pl-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Depth (in)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRule.minDepth}
                        onChange={(e) => setNewRule({ ...newRule, minDepth: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Depth (in)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRule.maxDepth}
                        onChange={(e) => setNewRule({ ...newRule, maxDepth: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-forest-800 hover:bg-forest-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                  >
                    {saving ? "Adding..." : "Add Rule"}
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
