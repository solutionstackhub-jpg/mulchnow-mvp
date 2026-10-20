"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FiMapPin, FiSliders, FiTruck, FiCheck, FiPhone, FiMail, FiArrowRight, FiMap } from "react-icons/fi";
import QuoteWizard from "@/components/QuoteWizard";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function SectionHeading({ eyebrow, title, description, light = false }: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-16">
      <span className={`text-sm font-semibold tracking-widest uppercase ${light ? "text-forest-300" : "text-earth-500"}`}>
        {eyebrow}
      </span>
      <h2 className={`font-display text-4xl sm:text-5xl mt-3 mb-4 leading-tight ${light ? "text-white" : "text-forest-950"}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-lg leading-relaxed ${light ? "text-white/70" : "text-gray-500"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative min-h-screen bg-hero overflow-hidden flex items-center">
      {/* Ambient gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-forest-400/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-earth-400/[0.08] blur-[100px]" />

      {/* Decorative landscape image */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-[70%] hidden lg:block"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        <div className="relative w-full h-full">
          <motion.div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          >
            <img
              src="https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80"
              alt="Professional landscaping with fresh mulch beds"
              className="w-full h-full object-cover rounded-3xl"
              style={{ maskImage: "linear-gradient(to left, black 50%, transparent 100%)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-forest-950/90 rounded-3xl" />
          </motion.div>
        </div>
      </motion.div>

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-forest-400 animate-pulse" />
            <span className="text-sm text-white/80 font-medium">Now serving South Florida &amp; Northeast Ohio</span>
          </motion.div>

          <motion.h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.08] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Fresh Mulch,{" "}
            <span className="text-gradient-warm inline-block">Blown In.</span>
            <br />
            Not Shoveled.
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-white/70 max-w-lg mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Our trucks blow mulch directly into your beds &mdash; 10x faster than hand-spreading,
            zero wheelbarrow ruts, and coverage so even your neighbors will ask who did it.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <a href="#quote" className="btn-accent text-lg px-8 py-4 gap-2 group">
              Get Your Instant Quote
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 text-white/90 font-semibold rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: "500+", label: "Properties Serviced" },
              { value: "2", label: "Markets" },
              { value: "Same-Day", label: "Quotes" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */

const steps = [
  {
    icon: FiMapPin,
    title: "Enter Your Address",
    description:
      "Type in your address and we pull your property measurements automatically. No tape measure required — we know your square footage before you hang up the phone.",
  },
  {
    icon: FiSliders,
    title: "Pick Your Mulch",
    description:
      "Choose your material — hardwood, cedar, dyed black, pine bark — and pick your depth. You'll see your exact price before you commit to anything.",
  },
  {
    icon: FiTruck,
    title: "We Blow It In",
    description:
      "Our trucks pull up and blow mulch directly into every bed, edge, and corner. No wheelbarrows tearing up your grass. Most jobs are done in under two hours.",
  },
];

function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-section-warm" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="Three Steps to a Better Yard"
          description="From quote to finished beds in as little as 48 hours. No back-and-forth, no surprises."
        />

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              custom={i}
              className="glass-card p-8 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Step number badge */}
              <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {i + 1}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-forest-50 flex items-center justify-center mb-6 group-hover:bg-forest-100 transition-colors">
                <step.icon className="w-7 h-7 text-forest-600" />
              </div>

              <h3 className="font-display text-xl text-forest-950 mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  WHY BLOWN-IN                                                       */
/* ------------------------------------------------------------------ */

const benefits = [
  "10x faster than hand-spreading",
  "Even coverage every time",
  "Gets into tight spots hand-crews can't reach",
  "No wheelbarrow ruts in your lawn",
];

function WhyBlownIn() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 sm:py-32 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="text-sm font-semibold tracking-widest uppercase text-earth-500"
            >
              Why Blown-In
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl sm:text-5xl text-forest-950 mt-3 mb-6 leading-tight"
            >
              Your Landscaper Uses a Shovel.{" "}
              <span className="text-gradient">We Use a Cannon.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-gray-500 mb-8 leading-relaxed"
            >
              Blown-in mulch installation isn't just faster — it's better. Our
              truck-mounted blowers deliver mulch through a 200-foot hose,
              reaching every bed, slope, and island without a single wheelbarrow
              touching your property.
            </motion.p>

            <motion.ul className="space-y-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-4 h-4 text-forest-600" />
                  </div>
                  <span className="text-forest-900 font-medium">{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} custom={5} className="mt-10">
              <a href="#quote" className="btn-primary text-base px-8 py-4 gap-2 group">
                See What It Costs
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            className="relative"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"
                alt="Beautiful garden with freshly mulched beds"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/40 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              className="absolute -bottom-6 -left-6 glass-card p-5 shadow-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            >
              <div className="text-3xl font-bold text-forest-700">10x</div>
              <div className="text-sm text-gray-500">Faster than hand-spreading</div>
            </motion.div>

            {/* Decorative dot pattern */}
            <div className="absolute -top-4 -right-4 w-24 h-24 opacity-20" style={{
              backgroundImage: "radial-gradient(circle, #28773b 1.5px, transparent 1.5px)",
              backgroundSize: "12px 12px",
            }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  QUOTE SECTION                                                      */
/* ------------------------------------------------------------------ */

function QuoteSection() {
  return (
    <section id="quote" className="py-24 sm:py-32 bg-section-warm relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-earth-200/30 blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            eyebrow="Instant Pricing"
            title="Get Your Instant Quote"
            description="No phone tag, no waiting for callbacks. Enter your details and see your price in under 60 seconds."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-3xl mx-auto"
        >
          <QuoteWizard />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SERVICE AREAS                                                      */
/* ------------------------------------------------------------------ */

const serviceAreas = [
  {
    region: "South Florida",
    tagline: "Treasure Coast to Broward",
    cities: ["Vero Beach", "Port St. Lucie", "Stuart", "Jupiter", "West Palm Beach", "Boca Raton", "Fort Lauderdale"],
  },
  {
    region: "Northeast Ohio",
    tagline: "Greater Cleveland",
    cities: ["Cleveland", "Lakewood", "Rocky River", "Westlake", "Avon", "Strongsville", "Parma"],
  },
];

function ServiceAreas() {
  return (
    <section id="service-areas" className="py-24 sm:py-32 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Where We Work"
          title="Service Areas"
          description="Professional blown-in mulch installation, currently in two markets and growing."
          light
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {serviceAreas.map((area, i) => (
            <motion.div
              key={area.region}
              className="glass-dark p-8 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiMap className="w-6 h-6 text-forest-300" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-white">{area.region}</h3>
                  <p className="text-white/50 text-sm mt-1">{area.tagline}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {area.cities.map((city) => (
                  <span
                    key={city}
                    className="inline-block px-3 py-1.5 text-sm text-white/80 bg-white/[0.08] rounded-lg border border-white/10"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  const links = [
    { label: "Get a Quote", href: "#quote" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Service Areas", href: "#service-areas" },
    { label: "Admin Login", href: "/admin" },
  ];

  return (
    <footer className="bg-forest-950 text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-display text-2xl text-white mb-2">Mulch Now</div>
            <p className="text-sm text-white/40 mb-1">A DiCillo Services Company</p>
            <p className="text-sm leading-relaxed mt-4">
              Professional blown-in mulch installation for homeowners who want it done
              right &mdash; fast, clean, and priced fairly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:+17725556852" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <FiPhone className="w-4 h-4" />
                  (772) 555-MULCH
                </a>
              </li>
              <li>
                <a href="mailto:info@mulchnow.com" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                  <FiMail className="w-4 h-4" />
                  info@mulchnow.com
                </a>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Ready to Start?</h4>
            <p className="text-sm mb-4 leading-relaxed">
              Get a quote in under 60 seconds. No commitment, no sales calls.
            </p>
            <a href="#quote" className="btn-accent text-sm px-5 py-2.5">
              Get a Free Quote
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; 2024 DiCillo Services. All rights reserved.
          </p>
          <p className="text-sm text-white/30">
            Mulch Now &mdash; Blown-in mulch done right.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <WhyBlownIn />
      <QuoteSection />
      <ServiceAreas />
      <Footer />
    </main>
  );
}
