import React, { useRef } from 'react';
import SEOHead from '../../../components/SEOHead';
import { HiArrowRight, HiChip, HiLightningBolt, HiShieldCheck, HiGlobe } from "react-icons/hi";
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// --- IMAGE IMPORTS ---
import agbHeroImage from '@/assets/agb1.png';
import agbChartImage from '@/assets/agb-chart-nobg.png';
import processImage from '@/assets/DCAB25.png';
import forestImage from '@/assets/home1.png';
import lulcImage from '@/assets/lulc1.png';
import chmImage from '@/assets/chm11.png';
import dcabNewImage from '@/assets/dcab-new.png';

// --- DESIGN TOKENS (Matching DCAB / LULC / CHM System) ---
const s = {
  bg: '#F1F1F1',
  bgDark: '#08292F',
  bgAccentPale: '#f7fce5',
  color: '#08292F',
  accent: '#16a34a',
  accentSoft: 'rgba(22,163,74,0.12)',
  muted: 'rgba(8,41,47,0.55)',
  border: 'rgba(8,41,47,0.08)',
  heading: 'var(--font-heading)',
  body: 'var(--font-body)',
};

// --- ANIMATION VARIANTS ---
const fadeInUp = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } } };
const slideLeft = { hidden: { opacity: 0, x: -52 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
const slideRight = { hidden: { opacity: 0, x: 52 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.13 } } };
const itemFade = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

// --- REUSABLE COMPONENTS ---

const CleanImage = ({ src, alt, className = '', priority = false, contain = false }) => (
  <div className={`w-full relative rounded-3xl overflow-hidden group shadow-sm ${contain ? 'bg-white flex items-center justify-center p-6' : 'min-h-[420px]'} ${className}`}>
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={`w-full h-full transform group-hover:scale-105 transition-transform duration-1000 ease-out ${contain ? 'object-contain max-h-[480px]' : 'object-cover'}`}
    />
  </div>
);

const SectionLabel = ({ children }) => (
  <span className="font-medium tracking-widest uppercase text-xs mb-4 block" style={{ color: s.accent, fontFamily: s.body }}>
    {children}
  </span>
);

const H1 = ({ children, className = '', color }) => (
  <h1 className={`font-normal tracking-tight mb-6 text-5xl md:text-6xl lg:text-7xl leading-[1.15] ${className}`}
    style={{ fontFamily: s.heading, color: color || s.color }}>
    {children}
  </h1>
);

const H2 = ({ children, className = '', color }) => (
  <h2 className={`font-normal tracking-tight mb-6 text-4xl md:text-5xl leading-[1.2] ${className}`}
    style={{ fontFamily: s.heading, color: color || s.color }}>
    {children}
  </h2>
);

const H3 = ({ children, className = '', color }) => (
  <h3 className={`font-medium mb-3 text-2xl md:text-3xl leading-[1.2] ${className}`}
    style={{ fontFamily: s.heading, color: color || s.color }}>
    {children}
  </h3>
);

const Body = ({ children, large = false, className = '', color }) => (
  <p className={`leading-[1.7] ${large ? 'text-xl md:text-2xl' : 'text-lg'} ${className}`}
    style={{ fontFamily: s.body, color: color || s.color, opacity: 0.8, fontSize: large ? '21px' : '18px' }}>
    {children}
  </p>
);

const PillButton = ({ children, outline = false }) => (
  <button
    className={`group px-8 py-4 rounded-full font-medium text-base transition-all duration-300 active:scale-95 flex items-center gap-2 ${outline
      ? 'border-2 hover:bg-[#08292F] hover:text-white'
      : 'text-white shadow-xl hover:bg-[#08292f]'
      }`}
    style={{
      fontFamily: s.body,
      backgroundColor: outline ? 'transparent' : '#062125',
      borderColor: outline ? s.color : undefined,
      color: outline ? s.color : 'white',
    }}
  >
    {children}
    <HiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
  </button>
);

// Equation Display Component — scientific prestige
const Equation = ({ label, eq, note }) => (
  <div className="rounded-2xl border p-6 my-4" style={{ borderColor: s.border, backgroundColor: s.bgAccentPale }}>
    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: s.muted, fontFamily: s.body }}>{label}</p>
    <p className="text-2xl md:text-3xl font-medium my-3" style={{ fontFamily: '"Courier New", monospace', color: s.color }}>{eq}</p>
    {note && <p className="text-sm leading-relaxed" style={{ color: s.muted, fontFamily: s.body }}>{note}</p>}
  </div>
);

// Stat block
const Stat = ({ value, unit, label }) => (
  <div className="flex flex-col">
    <div className="text-5xl font-medium mb-1" style={{ color: s.accent, fontFamily: s.heading }}>{value}<span className="text-3xl ml-1">{unit}</span></div>
    <div className="text-base font-medium" style={{ color: s.color, fontFamily: s.body }}>{label}</div>
  </div>
);

// Standard Badge
const StandardBadge = ({ name, body }) => (
  <div className="flex items-start gap-4 py-5 border-b" style={{ borderColor: s.border }}>
    <HiShieldCheck className="text-2xl mt-0.5 flex-shrink-0" style={{ color: s.accent }} />
    <div>
      <div className="font-medium text-base mb-1" style={{ fontFamily: s.body, color: s.color }}>{name}</div>
      <div className="text-sm leading-relaxed" style={{ color: s.muted, fontFamily: s.body }}>{body}</div>
    </div>
  </div>
);

// Process Step
const Step = ({ num, title, desc }) => (
  <motion.div variants={itemFade} className="flex gap-8">
    <span className="text-5xl font-medium leading-none flex-shrink-0 mt-1"
      style={{ color: 'rgba(22,163,74,0.35)', fontFamily: s.heading }}>{num}</span>
    <div>
      <H3 className="mb-2">{title}</H3>
      <Body>{desc}</Body>
    </div>
  </motion.div>
);

const ProcessCard = ({ src, label, x = 0, y = 0, opacity, scale }) => (
  <motion.div
    style={{ x, y, opacity, scale }}
    className="bg-[#FAF9F6] rounded-3xl p-4 flex flex-col gap-4 shadow-sm border border-black/5 group cursor-pointer hover:shadow-md transition-shadow duration-500"
  >
    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white">
      <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
    </div>
    <div className="flex items-center justify-between px-1">
      <span className="font-semibold text-[#08292F] tracking-tight">{label}</span>
      <HiArrowRight className="text-black/30 group-hover:text-[#16a34a] group-hover:translate-x-1 transition-all" />
    </div>
  </motion.div>
);

// ════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════════════
const AgbCalculation = () => {
  const faqs = [
    {
      question: "How is Above-Ground Biomass (AGB) calculated using satellites?",
      answer: "Sylithe calculates AGB by fusing 3D Canopy Height Models (from Spaceborne LiDAR) with Sentinel SAR and optical imagery. We then apply localized, species-specific allometric equations to accurately estimate the total biomass across the entire forest boundary."
    },
    {
      question: "Why is AGB calculation critical for carbon credits?",
      answer: "Above-Ground Biomass is the core metric that determines how much carbon is stored in a forest. Accurate AGB calculations are directly converted into tradable carbon credits; overestimating risks integrity, while underestimating leaves money on the table."
    },
    {
      question: "How does satellite AGB compare to manual field plots?",
      answer: "Manual field plots only sample 1-2% of a forest and extrapolate the rest. Sylithe’s satellite AGB provides wall-to-wall coverage, analyzing 100% of the project area for highly accurate, scalable, and cost-effective digital MRV."
    },
    {
      question: "How does AGB convert into verified carbon credits?",
      answer: "Sylithe converts the calculated Above-Ground Biomass into total carbon stock using standardized carbon fraction multipliers (typically 0.47). We then generate audit-ready reports that project developers submit to registries like Verra or ICM for issuance."
    },
    {
      question: "Does Sylithe's AGB model work in tropical rainforests?",
      answer: "Yes. Traditional optical satellites struggle with tropical cloud cover, but Sylithe's integration of L-band and C-band SAR data penetrates clouds to measure woody biomass, making it highly effective in regions like the Amazon, Congo Basin, and Southeast Asia."
    },
    {
      question: "How often can AGB be updated for carbon reporting?",
      answer: "Unlike manual inventories conducted every 5 years, Sylithe’s platform can update AGB calculations annually or even quarterly. This continuous monitoring allows developers to issue carbon credits faster and with higher transparency."
    }
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  // Left Column Transforms (Moving from center to left)
  const xLeft = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const yL1 = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const yL2 = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const yL3 = useTransform(scrollYProgress, [0, 1], [-100, 0]);

  // Right Column Transforms (Moving from center to right)
  const xRight = useTransform(scrollYProgress, [0, 1], [-150, 0]);
  const yR1 = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const yR2 = useTransform(scrollYProgress, [0, 1], [0, 0]);
  const yR3 = useTransform(scrollYProgress, [0, 1], [-100, 0]);

  const opacity = useTransform(scrollYProgress, [0, 0.2, 1], [0.2, 0.6, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  return (
    <div className="w-full bg-[#F1F1F1] pt-20 overflow-hidden" style={{ fontFamily: s.body, color: s.color }}>
      <SEOHead
        title="AGB Estimation India — Carbon dMRV | Sylithe"
        description="Quantify Above-Ground Biomass for Indian forest carbon projects using spaceborne LiDAR and radar. ICM, Verra VCS, and Gold Standard compliant."
        path="/methodology/agb"
        speakableSelectors={['h1', '.agb-hero-description']}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })}
        </script>
      </Helmet>

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="pt-12 pb-28 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-b" style={{ borderColor: s.border }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideLeft}>
            <SectionLabel>Sylithe AGB Intelligence</SectionLabel>
            <H1>
              Above-Ground Biomass,<br />
              measured with <span style={{ color: s.accent }}>satellite precision.</span>
            </H1>
            <div style={{ maxWidth: 540 }}>
              <Body large className="mb-10">
                Sylithe quantifies Above-Ground Biomass (AGB) using canopy height models derived from space-borne LiDAR and radar delivering carbon stock estimates that satisfy Verra VCS, Gold Standard, and IC-VCM requirements.
              </Body>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="group px-8 py-4 rounded-full font-medium text-base transition-all duration-300 active:scale-95 flex items-center gap-2 text-white shadow-xl hover:bg-[#08292f]"
                style={{ fontFamily: s.body, backgroundColor: '#062125' }}>
                Assess your AGB
                <HiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Hero visual: Abstract AGB density render placeholder */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideRight}>
            <div className="w-full min-h-[520px] rounded-3xl overflow-hidden relative group shadow-sm bg-[#08292F] flex items-end">
              <img src={agbHeroImage} alt="Biomass Density Model" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-[2000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08292F] via-transparent to-transparent opacity-60" />

              <div className="relative z-10 p-10">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(164,252,161,0.7)', fontFamily: s.body }}>Biomass Density Model</p>
                <p className="text-white text-3xl font-medium" style={{ fontFamily: s.heading }}>AGB Stock Estimate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 2. WHAT IS AGB ═══════════════ */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-20">
            <SectionLabel>Foundation</SectionLabel>
            <H2 className="mx-auto" style={{ maxWidth: 760 }}>
              What is Above-Ground Biomass and why does it matter?
            </H2>
            <p className="text-xl text-center mx-auto leading-relaxed mt-4" style={{ maxWidth: 820, color: s.muted, fontFamily: s.body }}>
              AGB is the total living organic matter above the soil surface, expressed in tonnes of dry matter per hectare (Mg ha⁻¹). It is the primary variable from which carbon stocks and therefore carbon credits are derived.
            </p>
          </motion.div>

          {/* Three-column definition cards */}
          <motion.div className="grid md:grid-cols-3 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {[
              {
                icon: <HiGlobe className="text-3xl" style={{ color: s.accent }} />,
                title: 'IPCC Definition',
                body: 'Per the IPCC 2006 Guidelines, AGB encompasses all living biomass above the soil including stem, stump, branches, bark, seeds, and foliage. It is the largest pool in forest ecosystems and the foundation of any carbon accounting exercise.',
              },
              {
                icon: <HiShieldCheck className="text-3xl" style={{ color: s.accent }} />,
                title: 'Verra VCS Standard',
                body: 'Under VM0047, AGB must be estimated using allometric equations validated for the geographic region and forest type. Verra requires stratified sampling designs and demands uncertainty be reported at the 90% confidence interval a threshold Sylithe meets by default.',
              },
              {
                icon: <HiChip className="text-3xl" style={{ color: s.accent }} />,
                title: 'Gold Standard Protocol',
                body: `Gold Standard's Land Use & Forestry Activity requirements mandate that AGB estimation methods demonstrate equivalence to ground-truthed allometric models. Remote sensing approaches must be validated against field plots, a process Sylithe automates using its global calibration dataset.`,
              },
            ].map((c, i) => (
              <motion.div key={i} variants={itemFade}
                className="rounded-2xl border p-10 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300"
                style={{ borderColor: s.border, background: s.bg }}>
                {c.icon}
                <h3 className="text-xl font-semibold" style={{ fontFamily: s.body, color: s.color }}>{c.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: s.muted, fontFamily: s.body }}>{c.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 4. WHY CHM IS THE KEY INPUT ═══════════════ */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideLeft}>
            <SectionLabel>Why CHM is Central</SectionLabel>
            <H2>Canopy height is the single most important predictor of AGB.</H2>
            <Body large className="mb-6">
              Across tropical, temperate, and boreal forests, canopy height explains 60–85% of the variance in Above-Ground Biomass more than any other remotely sensed variable.
            </Body>
            <Body className="mb-6">
              Sylithe's Canopy Height Model (CHM) integrates NASA GEDI waveform LiDAR, Sentinel-1 SAR time series, and Sentinel-2 optical reflectance into a fused 10 m product with &lt;6 m height RMSE. This precision directly translates into AGB uncertainty that satisfies the 90% CI threshold mandated by Verra's VM0047 and VM0006 methodologies.
            </Body>
            <Body className="mb-10">
              Unlike field-plot-only approaches, which are spatially sparse and temporally lagged, Sylithe's wall-to-wall CHM captures heterogeneous canopy structures edges, gaps, regrowth patches that inventory methods systematically miss.
            </Body>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t" style={{ borderColor: s.border }}>
              <Stat value="10m" unit="" label="Spatial Resolution" />
              <Stat value="<6m" unit="" label="CHM Height RMSE" />
              <Stat value="90%" unit="+" label="CI Compliance" />
            </div>
          </motion.div>

          {/* CHM → AGB visual placeholder */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideRight}>
            <CleanImage src={forestImage} alt="Integrated Forest Monitoring" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 5. HOW SYLITHE CALCULATES AGB ═══════════════ */}
      <section ref={containerRef} className="py-28 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-y" style={{ borderColor: s.border }}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center max-w-4xl mx-auto mb-20" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <SectionLabel>The Process</SectionLabel>
            <H2>How Sylithe calculates AGB at scale.</H2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div className="space-y-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <Step num="01" title="CHM Generation"
                desc="GEDI spaceborne LiDAR pulses are fused with Sentinel-1 SAR coherence and Sentinel-2 NDVI time series to produce a continuous, gap-filled 10 m canopy height map across the project area." />
              <Step num="02" title="Forest Stratification"
                desc="Canopy height pixels are stratified by forest type (tropical moist, tropical dry, temperate broadleaf, etc.) using a globally trained land cover classifier, ensuring the correct allometric model is applied in each stratum." />
              <Step num="03" title="Allometric Conversion"
                desc="Within each stratum, Sylithe applies validated height-to-AGB allometric equations (Chave et al. 2014; Jucker et al. 2017; local equations where available) to estimate per-pixel AGB density in Mg ha⁻¹." />
              <Step num="04" title="Uncertainty Quantification"
                desc="Monte Carlo propagation of CHM measurement error, allometric model uncertainty, and wood density variability produces a spatially explicit 90% confidence interval reported per stratum and project total." />
              <Step num="05" title="Annual Stock Change"
                desc="Year-over-year AGB delta (ΔAGB) is computed to distinguish net sequestration from disturbance-driven loss, feeding directly into the DCAB dynamic baseline for additional credit calculation." />
            </motion.div>

            {/* Image Columns (Right Side - 6 Cards with Fan-out Animation) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 relative">
              <div className="flex flex-col gap-6">
                <ProcessCard src={lulcImage} label="LULC Classification" x={xLeft} y={yL1} opacity={opacity} scale={scale} />
                <ProcessCard src={chmImage} label="Canopy Height Model" x={xLeft} y={yL2} opacity={opacity} scale={scale} />
                <ProcessCard src={dcabNewImage} label="Disturbance Monitoring" x={xLeft} y={yL3} opacity={opacity} scale={scale} />
              </div>
              <div className="flex flex-col gap-6 pt-6 lg:pt-12">
                <ProcessCard src={agbChartImage} label="Carbon Stock Density" x={xRight} y={yR1} opacity={opacity} scale={scale} />
                <ProcessCard src={processImage} label="Dynamic Baselines" x={xRight} y={yR2} opacity={opacity} scale={scale} />
                <ProcessCard src={agbHeroImage} label="Uncertainty Analytics" x={xRight} y={yR3} opacity={opacity} scale={scale} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 6. UNCERTAINTY & COMPLIANCE ═══════════════ */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-start">

          {/* Left: Standards compliance */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideLeft}>
            <SectionLabel>Standards Alignment</SectionLabel>
            <H2>Engineered for Verra, Gold Standard, and IC-VCM.</H2>
            <Body className="mb-10">
              AGB estimation is not merely a scientific exercise it is a regulatory requirement. Every methodological choice Sylithe makes is traceable to published standards and peer-reviewed literature.
            </Body>

            <div>
              <StandardBadge
                name="Verra VCS — VM0047 (Afforestation, Reforestation & Revegetation)"
                body="VM0047 requires that AGB be estimated via approved allometric equations stratified by forest type, with full uncertainty reporting at 90% CI. Sylithe's pipeline satisfies Section 8.1.2 (Biomass Estimation) and Section 9 (Monitoring) requirements out-of-the-box."
              />
              <StandardBadge
                name="Verra VCS — VM0006 (Improved Forest Management)"
                body="VM0006 mandates defensible carbon stock estimates for both project and baseline scenarios. Sylithe provides stratified carbon stocks with documented allometric sources, satisfying the Approved Methodology modules BL-UP-FM and UP-FM-STR."
              />
              <StandardBadge
                name="Gold Standard — Land Use & Forestry Activity Requirements"
                body="Gold Standard's A/R and REDD+ activity types require AGB quantification methods equivalent to IPCC Tier 2 or Tier 3. Sylithe's validated CHM-allometric approach qualifies as Tier 3, providing the highest confidence level permitted under the standard."
              />
              <StandardBadge
                name="IC-VCM Core Carbon Principles — Quantification"
                body="IC-VCM Criterion 7 (Robust Quantification) requires that emission reductions and removals be quantified using conservative, peer-reviewed methods. Sylithe's uncertainty propagation model ensures conservative estimates, applying the IPCC-recommended 'minus one standard error' adjustment."
              />
              <StandardBadge
                name="IPCC 2006 / 2019 Refinement — Forest Land Remaining Forest Land"
                body="Sylithe's carbon fraction defaults (CF = 0.47) and biomass expansion factors (BEFs) comply with IPCC 2019 Refinement Tables 4.3 and 4.4, ensuring national inventory-compatible reporting for countries using IPCC methodologies."
              />
            </div>
          </motion.div>

          {/* Right: Uncertainty deep-dive */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideRight}>
            <SectionLabel>Uncertainty Quantification</SectionLabel>
            <H2>Uncertainty is not a weakness. It is a scientific obligation.</H2>
            <Body className="mb-8">
              Under Verra's conservative crediting rules, unquantified uncertainty triggers automatic deductions. Sylithe eliminates this risk by making uncertainty explicit, propagated, and reported.
            </Body>
            <div className="my-8 rounded-2xl overflow-hidden border" style={{ borderColor: s.border }}>
              <img src={agbChartImage} alt="Uncertainty Propagation Chart" className="w-full h-auto" />
            </div>

          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 7. AGB + DCAB INTEGRATION ═══════════════ */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-[#08292F] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <SectionLabel>Integrated with DCAB</SectionLabel>
            <H2 className="max-w-3xl" color="white">AGB alone doesn't prove additionality. Pair it with a dynamic baseline.</H2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                Icon: HiLightningBolt,
                title: 'AGB Without Baseline = Phantom Credits',
                body: 'A forest that grew without your intervention still accumulates AGB. Without a dynamic counterfactual baseline, all that growth is incorrectly attributed to your project  generating credits that don\'t represent real additional removal.',
              },
              {
                Icon: HiChip,
                title: 'DCAB Uses AGB as Its Core Signal',
                body: 'Sylithe\'s Dynamic Control Area Baseline (DCAB) compares your project\'s AGB trajectory to statistically matched control areas. The additional AGB and only the additional AGB is converted to credits. This is the gold standard of additionality demonstration.',
              },
              {
                Icon: HiShieldCheck,
                title: 'Annual AGB Updates Feed the Dynamic Baseline',
                body: 'Because AGB is remeasured annually from CHM, the DCAB baseline updates each year to reflect changing land use pressures, commodity cycles, and climate events ensuring your credits remain valid under evolving conditions.',
              },
            ].map(({ Icon, title, body }, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemFade}
                className="border-t pt-8" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <Icon className="text-3xl mb-4" style={{ color: s.accent }} />
                <H3 className="mb-3" color="white">{title}</H3>
                <Body color="rgba(255,255,255,0.72)">{body}</Body>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 8. KEY DIFFERENTIATORS ═══════════════ */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-20 max-w-4xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <SectionLabel>Why Sylithe AGB</SectionLabel>
            <H2>Better data. Fewer deductions. More credits issued.</H2>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            {[
              { num: '10m', label: 'Resolution', desc: 'Wall-to-wall coverage at 10 m  capturing forest edges, clearings, and heterogeneous regrowth that plot-based sampling misses.' },
              { num: 'Annual', label: 'Update Cycle', desc: 'Yearly remeasurement captures disturbance events, seasonal dynamics, and policy-driven land use changes in near real-time.' },
              { num: '40+', label: 'Forest Types', desc: 'Allometric models calibrated across 40+ global forest types from Amazon terra firme to Miombo woodland and Southeast Asian dipterocarp forests.' },
              { num: 'Full', label: 'Audit Trail', desc: 'Every AGB pixel is traceable to its CHM input, allometric model version, uncertainty coefficient, and verification date ready for third-party audit.' },
            ].map((card, i) => (
              <motion.div key={i} variants={itemFade}
                className="rounded-2xl border p-8 hover:shadow-lg transition-shadow duration-300"
                style={{ borderColor: s.border, background: s.bg }}>
                <div className="text-4xl font-medium mb-2" style={{ color: s.accent, fontFamily: s.heading }}>{card.num}</div>
                <div className="text-xs uppercase tracking-widest mb-4" style={{ color: s.muted, fontFamily: s.body }}>{card.label}</div>
                <p className="text-base leading-relaxed" style={{ color: s.muted, fontFamily: s.body }}>{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 9. PHILOSOPHY BLOCK ═══════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="rounded-3xl p-14 md:p-20 relative overflow-hidden"
            style={{ backgroundColor: s.bgAccentPale }}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -mr-40 -mt-40"
              style={{ background: 'rgba(22,163,74,0.12)' }} />
            <div className="relative z-10">
              <SectionLabel>Our Philosophy</SectionLabel>
              <H2 className="max-w-2xl">Carbon is a measurement problem before it is a market problem.</H2>
              <Body large className="mb-4" style={{ maxWidth: 680 }}>
                Sylithe is built on the conviction that every tonne of CO₂e issued as a credit should be traceable to a physical, measurable change in forest biomass  verifiable by any independent party with access to the same satellite data.
              </Body>
              <Body style={{ maxWidth: 680 }}>
                By combining IPCC-grade allometry, space-borne LiDAR, and dynamic baselines into a single auditable pipeline, we give project developers, corporate buyers, and regulators a shared source of truth.
              </Body>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ 10. FAQ SECTION ═══════════════ */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#FAFAFA] border-t border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 relative z-10">
          <div className="lg:col-span-4">
            <H2 className="!text-[#0F172A] !mb-4">FAQs</H2>
          </div>
          
          <div className="lg:col-span-8 flex flex-col">
            {faqs.map((item, i) => (
              <details key={i} className="group transition-all border-b border-gray-200/80 last:border-0">
                <summary className="flex items-center justify-between py-8 cursor-pointer list-none text-[#0F172A] font-bold text-lg md:text-xl hover:text-[#16a34a] transition-colors pr-4">
                  <span className="pr-8">{item.question}</span>
                  <span className="w-8 h-8 rounded-full border border-[#0F172A]/30 flex items-center justify-center text-[#0F172A]/70 group-hover:border-[#16a34a] group-hover:text-[#16a34a] group-open:rotate-45 transition-all duration-300 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </span>
                </summary>
                <div className="pb-8 text-slate-600 leading-relaxed text-base md:text-lg pr-12 font-medium opacity-80" style={{ fontFamily: s.body }}>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 11. CLOSING CTA ═══════════════ */}
      <section className="py-28 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <H2 className="mb-8">
              Issue credits backed by<br />
              <span style={{ color: s.accent }}>measurement, not models.</span>
            </H2>
            <div className="max-w-2xl mx-auto mb-12">
              <Body large>
                Get a full AGB assessment for your reforestation or avoided deforestation project uncertainty-quantified, standard-aligned, and audit-ready.
              </Body>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="group px-8 py-4 rounded-full font-medium text-base transition-all duration-300 active:scale-95 flex items-center gap-2 text-white shadow-xl hover:bg-[#08292f]"
                style={{ fontFamily: s.body, backgroundColor: '#062125' }}>
                Assess your AGB
                <HiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AgbCalculation;