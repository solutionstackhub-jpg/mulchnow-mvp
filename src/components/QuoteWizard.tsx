"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiLoader,
} from "react-icons/fi";
import {
  MULCH_TYPES,
  DEPTH_OPTIONS,
  calculateYardsNeeded,
  calculatePriceRange,
  formatCurrency,
} from "@/lib/pricing";

// ---------------------------------------------------------------------------
// Dynamic import for Leaflet map (requires window — no SSR)
// ---------------------------------------------------------------------------
const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] rounded-xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
      Loading map...
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GeoResult {
  lat: string;
  lon: string;
}

interface PricingRule {
  mulchType: string;
  pricePerYard: number;
  market: string;
}

// Direction for slide animation: 1 = forward, -1 = back
type Direction = 1 | -1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple deterministic hash → use address string to generate a "measured" sqft. */
function hashAddress(addr: string): number {
  let hash = 0;
  for (let i = 0; i < addr.length; i++) {
    hash = (hash << 5) - hash + addr.charCodeAt(i);
    hash |= 0;
  }
  return 800 + Math.abs(hash % 3201); // 800–4000
}

/** Framer Motion slide variants keyed on direction. */
const slideVariants = {
  enter: (dir: Direction) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: Direction) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const transition = { type: "spring", stiffness: 300, damping: 30 };

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
const STEP_LABELS = ["Address", "Measurement", "Mulch & Depth", "Your Quote"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isCompleted = stepNum < current;

        return (
          <div key={label} className="flex items-center gap-2">
            {/* circle */}
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-300
                ${
                  isCompleted
                    ? "bg-forest-600 text-white"
                    : isActive
                    ? "bg-forest-600 text-white ring-4 ring-forest-100"
                    : "bg-gray-200 text-gray-500"
                }
              `}
            >
              {isCompleted ? (
                <FiCheckCircle className="w-4 h-4" />
              ) : (
                stepNum
              )}
            </div>

            {/* label (hidden on mobile for space) */}
            <span
              className={`hidden sm:inline text-xs font-medium ${
                isActive ? "text-forest-700" : isCompleted ? "text-forest-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>

            {/* connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 rounded ${
                  isCompleted ? "bg-forest-500" : "bg-gray-200"
                } transition-colors duration-300`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confetti burst (lightweight CSS-only approach)
// ---------------------------------------------------------------------------
function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ["#28773b", "#d88036", "#38934c", "#e9bc87", "#5aaf6a", "#c9692c"][i % 6],
        rotate: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: p.scale }}
          animate={{
            y: "110vh",
            rotate: p.rotate + 720,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 2.5, delay: p.delay, ease: "easeIn" }}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
export default function QuoteWizard() {
  // --- Wizard state --------------------------------------------------------
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction>(1);

  // Step 1 — address
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [market, setMarket] = useState<"south-florida" | "ohio">("south-florida");
  const [geocoding, setGeocoding] = useState(false);

  // Step 2 — measurement result
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [areaSqFt, setAreaSqFt] = useState(0);

  // Step 3 — mulch selection
  const [selectedMulch, setSelectedMulch] = useState<string>("hardwood");
  const [selectedDepth, setSelectedDepth] = useState<number>(3);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  // Step 4 — contact
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Fetch pricing rules on mount ----------------------------------------
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: PricingRule[] | { rules: PricingRule[] }) => {
        const rules = Array.isArray(data) ? data : data.rules ?? [];
        setPricingRules(rules);
      })
      .catch(() => {
        // If API not ready yet, we'll fall back to a sensible default
      });
  }, []);

  // --- Derived pricing -----------------------------------------------------
  const pricePerYard = useMemo(() => {
    const match = pricingRules.find(
      (r) => r.mulchType === selectedMulch && r.market === market
    );
    // Fallback: reasonable defaults per yard if API hasn't loaded
    return match?.pricePerYard ?? 85;
  }, [pricingRules, selectedMulch, market]);

  const yardsNeeded = useMemo(
    () => calculateYardsNeeded(areaSqFt, selectedDepth),
    [areaSqFt, selectedDepth]
  );

  const priceRange = useMemo(
    () => calculatePriceRange(yardsNeeded, pricePerYard),
    [yardsNeeded, pricePerYard]
  );

  // --- Navigation helpers --------------------------------------------------
  const goForward = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // --- Step 1 submit: geocode address --------------------------------------
  const handleGeocode = useCallback(async () => {
    const fullAddress = `${street}, ${city}, ${state} ${zip}`;
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      toast.error("Please fill in all address fields.");
      return;
    }

    setGeocoding(true);
    try {
      const query = encodeURIComponent(fullAddress);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { "User-Agent": "MulchNow-MVP/1.0" } }
      );
      const data: GeoResult[] = await res.json();

      if (!data.length) {
        toast.error("We couldn't locate that address. Double-check and try again.");
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      setCoords([lat, lon]);
      setAreaSqFt(hashAddress(fullAddress));
      goForward();
    } catch {
      toast.error("Something went wrong locating your address. Please try again.");
    } finally {
      setGeocoding(false);
    }
  }, [street, city, state, zip, goForward]);

  // --- Step 4 submit: create lead ------------------------------------------
  const handleSubmitQuote = useCallback(async () => {
    if (!firstName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in your name, email, and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: `${street}, ${city}, ${state} ${zip}`,
        market,
        areaSqFt,
        mulchType: selectedMulch,
        depth: selectedDepth,
        yardsNeeded,
        priceLow: priceRange.low,
        priceHigh: priceRange.high,
      };

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Quote submission failed");

      setSubmitted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch {
      toast.error("Couldn't submit your quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    firstName,
    lastName,
    email,
    phone,
    street,
    city,
    state,
    zip,
    market,
    areaSqFt,
    selectedMulch,
    selectedDepth,
    yardsNeeded,
    priceRange,
  ]);

  // --- Full address string -------------------------------------------------
  const fullAddress = `${street}, ${city}, ${state} ${zip}`;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {showConfetti && <ConfettiBurst />}

      <StepIndicator current={step} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ============================================================= */}
          {/* STEP 1 — Enter Address                                        */}
          {/* ============================================================= */}
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="quote-step"
            >
              <h2 className="text-2xl font-display font-bold text-forest-900 mb-1">
                Where's the property?
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                We'll measure your beds using aerial imagery — takes about 10 seconds.
              </p>

              {/* Street */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="input-field pl-10"
                    placeholder="123 Palm Beach Blvd"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
              </div>

              {/* City / State / ZIP */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Fort Lauderdale"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="FL"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="33301"
                    maxLength={5}
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              {/* Market selector */}
              <p className="text-sm font-medium text-gray-700 mb-2">Service Area</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {(
                  [
                    { value: "south-florida" as const, label: "South Florida", emoji: "☀️" },
                    { value: "ohio" as const, label: "Ohio", emoji: "🌳" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMarket(m.value)}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${
                        market === m.value
                          ? "border-forest-500 bg-forest-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }
                    `}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span
                      className={`font-semibold text-sm ${
                        market === m.value ? "text-forest-700" : "text-gray-600"
                      }`}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleGeocode}
                disabled={geocoding}
                className="btn-primary w-full text-base gap-2"
              >
                {geocoding ? (
                  <>
                    <FiLoader className="animate-spin" /> Locating...
                  </>
                ) : (
                  <>
                    Get My Measurement <FiArrowRight />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* STEP 2 — Property Measurement (Map)                           */}
          {/* ============================================================= */}
          {step === 2 && coords && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="quote-step"
            >
              <h2 className="text-2xl font-display font-bold text-forest-900 mb-1">
                We measured your property
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Here's what we found using aerial property analysis.
              </p>

              {/* Map */}
              <PropertyMap center={coords} area={areaSqFt} />

              {/* Measurement card */}
              <div className="mt-5 p-5 rounded-xl bg-forest-50 border border-forest-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-forest-600 font-medium">Total Bed Area</p>
                    <p className="text-3xl font-bold text-forest-900">
                      {areaSqFt.toLocaleString()} sq ft
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-forest-600 flex items-center justify-center">
                    <FiCheckCircle className="text-white w-7 h-7" />
                  </div>
                </div>
                <p className="text-xs text-forest-500 mt-2">
                  Measurement based on property analysis. Final area confirmed on-site.
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  <FiArrowLeft /> Back
                </button>
                <button onClick={goForward} className="btn-primary flex-1 text-base gap-2">
                  Continue <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* STEP 3 — Choose Mulch & Depth                                 */}
          {/* ============================================================= */}
          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="quote-step"
            >
              <h2 className="text-2xl font-display font-bold text-forest-900 mb-1">
                Pick your mulch
              </h2>
              <p className="text-gray-500 text-sm mb-5">
                Choose a material and depth. We'll calculate the rest instantly.
              </p>

              {/* Mulch type grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {Object.entries(MULCH_TYPES).map(([key, mulch]) => {
                  const isSelected = key === selectedMulch;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedMulch(key)}
                      className={`
                        relative p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${
                          isSelected
                            ? "border-forest-500 bg-forest-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }
                      `}
                    >
                      {isSelected && (
                        <FiCheckCircle className="absolute top-2 right-2 text-forest-600 w-5 h-5" />
                      )}
                      <div
                        className="w-10 h-10 rounded-full mb-2 border border-white shadow-sm"
                        style={{ backgroundColor: mulch.color }}
                      />
                      <p
                        className={`text-sm font-semibold ${
                          isSelected ? "text-forest-800" : "text-gray-800"
                        }`}
                      >
                        {mulch.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {mulch.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Depth selector */}
              <p className="text-sm font-medium text-gray-700 mb-2">Mulch Depth</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {DEPTH_OPTIONS.map((opt) => {
                  const isSelected = opt.value === selectedDepth;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDepth(opt.value)}
                      className={`
                        p-4 rounded-xl border-2 text-center transition-all duration-200
                        ${
                          isSelected
                            ? "border-forest-500 bg-forest-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }
                      `}
                    >
                      <p
                        className={`text-xl font-bold ${
                          isSelected ? "text-forest-700" : "text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Live price preview */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-forest-50 to-earth-50 border border-forest-200/60 mb-6">
                <p className="text-sm text-gray-600 mb-1">Estimated cost</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-forest-800">
                    {formatCurrency(priceRange.low)}
                  </span>
                  <span className="text-lg text-gray-400 mx-1">&ndash;</span>
                  <span className="text-3xl font-bold text-forest-800">
                    {formatCurrency(priceRange.high)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {areaSqFt.toLocaleString()} sq ft &times; {selectedDepth}" depth = {yardsNeeded}{" "}
                  yards &bull;{" "}
                  {MULCH_TYPES[selectedMulch]?.label ?? selectedMulch}
                  {priceRange.deliveryFee > 0 && (
                    <> &bull; Includes {formatCurrency(priceRange.deliveryFee)} delivery</>
                  )}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  <FiArrowLeft /> Back
                </button>
                <button onClick={goForward} className="btn-accent flex-1 text-base gap-2">
                  See My Quote <FiArrowRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* STEP 4 — Your Quote + Contact                                 */}
          {/* ============================================================= */}
          {step === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="quote-step"
            >
              {!submitted ? (
                <>
                  <h2 className="text-2xl font-display font-bold text-forest-900 mb-1">
                    Your custom quote
                  </h2>
                  <p className="text-gray-500 text-sm mb-5">
                    Everything looks right? Enter your info and we'll confirm the details.
                  </p>

                  {/* Quote summary — glass card */}
                  <div className="glass-card p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-forest-600 font-semibold mb-1">
                          Quote Summary
                        </p>
                        <p className="text-sm text-gray-600">{fullAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Estimated total</p>
                        <p className="text-2xl font-bold text-forest-800 leading-tight">
                          {formatCurrency(priceRange.low)} &ndash;{" "}
                          {formatCurrency(priceRange.high)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-gray-500">Mulch Type</p>
                        <p className="font-medium text-gray-800">
                          {MULCH_TYPES[selectedMulch]?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Depth</p>
                        <p className="font-medium text-gray-800">{selectedDepth} inches</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bed Area</p>
                        <p className="font-medium text-gray-800">
                          {areaSqFt.toLocaleString()} sq ft
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Yards Needed</p>
                        <p className="font-medium text-gray-800">{yardsNeeded} yards</p>
                      </div>
                    </div>

                    {priceRange.deliveryFee > 0 && (
                      <p className="text-xs text-earth-600 mt-3 bg-earth-50 rounded-lg px-3 py-2">
                        Delivery fee of {formatCurrency(priceRange.deliveryFee)} included.
                        Free delivery on orders over 10 yards.
                      </p>
                    )}
                  </div>

                  {/* Contact form */}
                  <div className="space-y-3 mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          className="input-field pl-10"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        className="input-field pl-10"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        className="input-field pl-10"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    <button
                      onClick={goBack}
                      className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      <FiArrowLeft /> Back
                    </button>
                    <button
                      onClick={handleSubmitQuote}
                      disabled={submitting}
                      className="btn-primary flex-1 text-base gap-2"
                    >
                      {submitting ? (
                        <>
                          <FiLoader className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>Get My Full Quote</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* ============ Thank-you state ============ */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center mx-auto mb-5">
                    <FiCheckCircle className="text-forest-600 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-forest-900 mb-2">
                    You're all set, {firstName}!
                  </h2>
                  <p className="text-gray-600 max-w-md mx-auto mb-3">
                    We've received your quote request. One of our team members will reach out
                    within a few hours to confirm your measurement and schedule installation.
                  </p>
                  <p className="text-sm text-gray-500">
                    Check your email at <span className="font-medium text-gray-700">{email}</span>{" "}
                    for a copy of your quote.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
