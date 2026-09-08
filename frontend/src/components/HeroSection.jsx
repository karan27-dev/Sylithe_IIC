import React, { useState, useMemo, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
// --- ICON IMPORT ---
import { HiCheck } from "react-icons/hi";
import SEOHead from './SEOHead';
import CreditingStandards from './CreditingStandards';

// --- IMAGES ---
import treeRight from '../assets/chm22.png';
import satelliteImg from '../assets/Tree50.png';
import graphImg from '../assets/DCAB30.png';
import indiaImg from '../assets/home1.png';

const s = {
  bg: '#F1F1F1',
  color: '#08292F',
  accent: '#16a34a',
  body: 'var(--font-body)',
  heading: 'var(--font-heading)',
};

// --- TYPOGRAPHY COMPONENTS ---
const H2 = ({ children, className = "" }) => (
  <h2
    className={`text-3xl md:text-4xl font-normal leading-[1.2] tracking-tight mb-6 ${className}`}
    style={{ fontFamily: s.heading, color: '#0F172A' }}
  >
    {children}
  </h2>
);

const H3 = ({ children, className = "" }) => (
  <h3
    className={`text-xl md:text-2xl font-normal mb-4 leading-tight tracking-tight ${className}`}
    style={{ fontFamily: s.heading, color: '#0F172A' }}
  >
    {children}
  </h3>
);

const Body = ({ children, className = "", style = {} }) => (
  <p
    className={`text-slate-600 leading-[1.7] opacity-80 font-normal ${className}`}
    style={{ fontFamily: s.body, ...style }}
  >
    {children}
  </p>
);

const SectionLabel = ({ children, className = "" }) => (
  <span
    className={`font-medium tracking-widest uppercase text-xs mb-4 block ${className}`}
    style={{ fontFamily: s.body, color: s.accent }}
  >
    {children}
  </span>
);


// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const textVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const imageVariant = {
  hidden: { opacity: 0, scale: 0.9, x: 50, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 50,
    transition: { duration: 1.0, ease: "easeOut" }
  },
};

const HeroSection = () => {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["climate action.", "trust.", "credits.", "verification."],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <main className="w-full bg-[#F1F1F1] overflow-hidden font-sans text-[#0F172A]">
      <SEOHead
        title="Carbon Credits in India — dMRV Verification & MRV Platform | Sylithe"
        description="Sylithe is India's satellite-powered dMRV platform for carbon credit verification — from LULC to audit-ready MRV for ARR, REDD+ & agroforestry projects. Trusted by developers and corporate credit buyers."
        keywords="carbon credits in India, carbon credit price in India, carbon credit verification India, dMRV platform India, carbon credit MRV India, verra carbon credits India, sell carbon credits India, nature-based carbon credits India, ARR REDD+ agroforestry carbon credits, ICM CCTS carbon market India"
        path="/"
        speakableSelectors={['h1', '.hero-description']}
      />

      {/* ================= 1. MAIN HERO SECTION ================= */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#F1F1F1] pt-24 lg:pt-0">
        <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center px-6 md:px-12 lg:px-16">

          {/* --- LEFT COLUMN: Text --- */}
          <div className="flex justify-start">
            <motion.div
              className="w-full text-left"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.h1 variants={textVariant} className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-heading font-medium text-[#08292F] leading-[1.15] tracking-[-0.04em] mb-6">
                India's leading <br className="hidden md:block" /> dMRV platform <br />
                enabling <br />
                <span className="text-[#0fa958]">confident</span> <br />
                <span className="relative flex w-full justify-start overflow-hidden text-left" style={{ height: "1.05em" }}>
                  <span className="invisible pointer-events-none select-none" aria-hidden="true">
                    carbon.
                  </span>
                  <AnimatePresence mode="popLayout">
                    {titles.map((title, index) => (
                      titleNumber === index && (
                        <motion.span
                          key={index}
                          className="absolute text-[#0fa958] left-0 top-0 whitespace-nowrap"
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -50 }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                          {title}
                        </motion.span>
                      )
                    ))}
                  </AnimatePresence>
                </span>
              </motion.h1>

              <motion.p variants={textVariant} className="text-base sm:text-lg md:text-xl leading-relaxed text-[#1a383a] mb-10 max-w-2xl font-normal opacity-85 tracking-tight">
                Measure, reduce, and verify carbon projects with India's best science-backed digital MRV (dMRV) platform.
              </motion.p>

              <motion.div variants={textVariant}>
                <Link to="/signup" className="bg-[#08292f] text-white px-8 py-4 rounded-full font-sans font-medium text-base hover:bg-[#062125] transition-all shadow-lg active:scale-95 inline-block">
                  Get started
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: Tree Image --- */}
          <motion.div
            className="hidden lg:flex justify-center lg:justify-end items-center h-full"
            variants={imageVariant}
            initial="hidden"
            animate="visible"
          >
            <img
              src={treeRight}
              alt="Sylithe dMRV platform dashboard"
              className="w-full max-w-[720px] h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

        </div>
      </section>


      {/* ================= 2. BENEFITS SECTION ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#E8E8E8] border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <SectionLabel>Benefits with Sylithe</SectionLabel>
            <H2 className="mt-3 max-w-3xl">
              High-integrity carbon intelligence for every market participant.
            </H2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {[
              { title: "De-risk your portfolio", desc: "Uncover risks before you invest. Our pre-issuance detection flags reversal risks and leakage." },
              { title: "Built for India (ICM)", desc: "Stay compliant with local regulations. Our models are aligned with the Indian Carbon Market and Verra." },
              { title: "Science-first verification", desc: "Move beyond paper audits. We use multi-scale LiDAR and GEDI fusion to provide pixel-level biomass accuracy." },
              { title: "Real-time intelligence", desc: "Accelerate time to issuance. Our continuous monitoring replaces static reports with live data." }
            ].map((item, index) => (
              <motion.div key={index} variants={textVariant} className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-full bg-[#16a34a] flex items-center justify-center text-white shadow-sm">
                  <HiCheck className="text-xl" />
                </div>
                <H3>{item.title}</H3>
                <Body className="text-sm">{item.desc}</Body>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= 2.5 CREDITING STANDARDS ================= */}
      <CreditingStandards />

      {/* ================= 3. WHAT WE DO (Full Page Scroll Layout) ================= */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">

        <motion.div
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <SectionLabel>
            WHAT WE DO
          </SectionLabel>
          <H2 className="text-3xl md:text-4xl lg:text-5xl mx-auto">
            We measure, monitor, and justify carbon credits continuously before they are sold.
          </H2>
        </motion.div>

        <div className="max-w-7xl mx-auto">

          {/* ROW 1 — BUYERS */}
          <motion.div
            className="min-h-screen grid lg:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
            variants={containerVariants}
          >
            <div className="flex flex-col items-start gap-0">
              <H2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-5">
                High-quality carbon, backed by evidence
              </H2>

              <Body className="text-lg leading-relaxed max-w-lg mb-8" style={{ fontSize: '18px' }}>
                Sylithe is a dMRV platform for project developers and credit buyers — providing pre-issuance MRV intelligence to evaluate project quality, performance, and risk before purchasing credits.
              </Body>

              <motion.ul variants={containerVariants} className="space-y-4 mb-10">
                {[
                  "Tracks change as it unfolds",
                  "Detects deviation from expected outcomes",
                  "Surfaces risk early, not retrospectively"
                ].map((item, i) => (
                  <motion.li key={i} variants={textVariant} className="flex items-center gap-3 text-[#0F172A] font-medium text-lg tracking-tight" style={{ fontFamily: s.body }}>
                    <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={textVariant}>
                <Link
                  to="/for-buyers"
                  className="rounded-full border-2 border-[#0F172A] px-8 py-3 text-[#0F172A] font-medium text-sm hover:bg-[#0F172A] hover:text-white transition-all duration-300 inline-block"
                  style={{ fontFamily: s.body }}
                >
                  Learn more
                </Link>
              </motion.div>
            </div>

            <motion.div variants={imageVariant} className="flex justify-center">
              <img src={satelliteImg} className="max-h-[500px] object-contain mix-blend-multiply" alt="Satellite MRV for Indian Carbon Market (ICM)" />
            </motion.div>
          </motion.div>

          {/* ROW 2 — RISK */}
          <motion.div
            className="min-h-screen grid lg:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
            variants={containerVariants}
          >
            <motion.div variants={imageVariant} className="order-2 lg:order-1 flex justify-center">
              <img src={graphImg} className="max-h-[500px] object-contain mix-blend-multiply" alt="Dynamic Baseline Carbon Computation Graph India" />
            </motion.div>

            <div className="order-1 lg:order-2 flex flex-col items-start gap-0">
              <H2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-5">
                Dynamic baselines & risk
              </H2>

              <Body className="text-lg leading-relaxed max-w-lg mb-8" style={{ fontSize: '18px' }}>
                We move beyond one-time assumptions. Using dynamic baselines and time-series analysis, we track project performance against real-world controls.
              </Body>

              <motion.ul variants={containerVariants} className="space-y-4 mb-10">
                {[
                  "Time-series performance analysis",
                  "Pre-issuance risk detection"
                ].map((item, i) => (
                  <motion.li key={i} variants={textVariant} className="flex items-center gap-3 text-[#0F172A] font-medium text-lg tracking-tight" style={{ fontFamily: s.body }}>
                    <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={textVariant}>
                <Link
                  to="/methodology/dcab"
                  className="rounded-full border-2 border-[#0F172A] px-8 py-3 text-[#0F172A] font-medium text-sm hover:bg-[#0F172A] hover:text-white transition-all duration-300 inline-block"
                  style={{ fontFamily: s.body }}
                >
                  Explore methodology
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* ROW 3 — DEVELOPERS */}
          <motion.div
            className="min-h-screen grid lg:grid-cols-2 gap-12 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
            variants={containerVariants}
          >
            <div className="flex flex-col items-start gap-0">
              <H2 className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-5">
                Build carbon projects with continuous visibility
              </H2>

              <Body className="text-lg leading-relaxed max-w-lg mb-8" style={{ fontSize: '18px' }}>
                Sylithe provides pre-issuance intelligence so developers can monitor performance, manage risk, and strengthen credibility before issuance.
              </Body>

              <motion.ul variants={containerVariants} className="space-y-4 mb-10">
                {[
                  "Continuous monitoring of performance",
                  "Baseline credibility signals",
                  "Permanence and reversal indicators"
                ].map((item, i) => (
                  <motion.li key={i} variants={textVariant} className="flex items-center gap-3 text-[#0F172A] font-medium text-lg tracking-tight" style={{ fontFamily: s.body }}>
                    <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={textVariant}>
                <Link
                  to="/what-we-offer"
                  className="rounded-full border-2 border-[#0F172A] px-8 py-3 text-[#0F172A] font-medium text-sm hover:bg-[#0F172A] hover:text-white transition-all duration-300 inline-block"
                  style={{ fontFamily: s.body }}
                >
                  View solutions
                </Link>
              </motion.div>
            </div>

            <motion.div variants={imageVariant} className="flex justify-center">
              <img src={indiaImg} className="max-h-[500px] object-contain mix-blend-multiply" alt="Sylithe dMRV Platform across India Carbon Landscape" />
            </motion.div>
          </motion.div>

        </div>
      </section>

    </main>
  );
};

export default HeroSection;