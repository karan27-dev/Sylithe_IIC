import React from 'react';
import SEOHead from '../../../components/SEOHead';
import { HiCheck, HiX, HiUpload, HiArrowRight } from "react-icons/hi";
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// --- IMAGE IMPORTS ---
// I have separated the imports so you can change them individually.
import heroImage from '../../../assets/lulc1.png';           // Hero Section
import dashboardImage from '../../../assets/lulc4.png';      // Integrity Section
import fusionImage from '../../../assets/lulc8.png';         // Center "What LULC Means" Image
import classificationImage from '../../../assets/lulc10.png'; // Section 4: How Sylithe Classifies
import methodologyImage from '../../../assets/lulc12.png';     // Section 5: Methodology Alignment (Change this file path if needed)

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

// --- REUSABLE COMPONENTS ---

// CleanImage: No borders/shadows/backgrounds. Just the image.
const CleanImage = ({ src, alt, className = "", priority = false }) => (
  <div className={`w-full h-full min-h-[400px] relative rounded-3xl overflow-hidden group ${className}`}>
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
    />
  </div>
);

const SectionHeading = ({ children, className = "" }) => (
  <h2 className={`text-4xl md:text-5xl font-normal text-[#0F172A] leading-tight mb-6 ${className}`}>
    {children}
  </h2>
);

const PillOutlineButton = ({ children }) => (
  <button className="group relative px-8 py-3 rounded-full border-2 border-[#0F172A] text-[#0F172A] font-medium text-base bg-transparent hover:bg-[#0F172A] hover:text-white transition-all duration-300 active:scale-95 flex items-center gap-3">
    {children}
    <HiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
  </button>
);

const LulcClassification = () => {
  // Shared Styles
  const bodyStyle = "text-base md:text-lg text-slate-600 leading-[1.7] mb-6 font-normal";
  const accentColor = "text-[#16a34a]";

  const determinesList = ['Land eligibility', 'Additionality', 'Baseline credibility', 'Leakage risk', 'Permanence exposure'];
  const riskList = ['Over-crediting', 'Project rejection', 'Credit invalidation', 'Buyer confidence loss'];

  const faqs = [
    {
      question: "What is LULC in carbon credit projects?",
      answer: "Land Use and Land Cover (LULC) classification is the process of categorizing Earth's surface using satellite imagery. For carbon projects, Sylithe's LULC analysis establishes the historical land state, proving that a forest project meets the eligibility criteria for carbon credit issuance under Verra and Gold Standard."
    },
    {
      question: "How is LULC mapping used in REDD+ projects?",
      answer: "In REDD+ (Reducing Emissions from Deforestation and forest Degradation) projects, LULC mapping is essential for proving historical deforestation rates and tracking land-use changes over time. Sylithe uses continuous satellite monitoring to detect canopy loss and agricultural expansion."
    },
    {
      question: "What satellite data does Sylithe use for LULC classification?",
      answer: "Sylithe fuses high-resolution optical imagery (like Sentinel-2 and Landsat) with Synthetic Aperture Radar (SAR) data. This multi-sensor approach allows us to penetrate cloud cover and accurately classify land use even in dense tropical rainforests."
    },
    {
      question: "Does Sylithe's LULC analysis comply with Verra VM0047?",
      answer: "Yes, Sylithe's automated LULC classification engine is fully aligned with modern carbon registry methodologies, including Verra VM0047 and the Indian Carbon Market (ICM), providing audit-ready stratification and boundary analysis."
    },
    {
      question: "How much does satellite-based LULC mapping cost compared to field surveys?",
      answer: "Satellite-based LULC mapping through the Sylithe platform reduces traditional MRV costs by up to 90%. By replacing expensive manual field surveys with automated AI-driven remote sensing, project developers can scale faster."
    },
    {
      question: "How often is the LULC data updated for carbon monitoring?",
      answer: "Sylithe provides continuous, near-real-time monitoring. Instead of waiting 5 years for a manual verification cycle, our platform updates LULC classifications continuously as new satellite data becomes available, enabling early reversal detection."
    },
    {
      question: "Can LULC mapping detect forest degradation?",
      answer: "Yes, by combining time-series optical data with structural SAR data, Sylithe's LULC algorithms can detect subtle changes in forest canopy cover, identifying illegal selective logging and forest degradation before it becomes full deforestation."
    }
  ];

  return (
    <div className="w-full bg-[#F1F1F1] font-sans text-[#0F172A] pt-20 overflow-hidden">
      <SEOHead
        title="LULC Classification | Land Use Carbon MRV | Sylithe"
        description="Methodology-aligned LULC eligibility screening for Indian carbon projects — ARR, REDD+, ICM, and Verra-compliant. Detect deforestation at 10m."
        path="/methodology/lulc"
        keywords="lulc classification for carbon projects, land use and land cover change detection, ICM methodology LULC, Verra LULC requirements, ARR LULC eligibility, REDD+ LULC baseline, Indian carbon market LULC, satellite based LULC analysis, land use classification for carbon credits, deforestation detection, afforestation LULC verification, agroforestry LULC analysis, forest carbon project LULC, land eligibility screening for carbon projects, LULC change detection services, remote sensing for LULC, AI based LULC classification, LULC mapping for carbon projects, land use change analysis India"
        speakableSelectors={['h1', '.lulc-hero-description']}
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

      {/* ================= 1. HERO SECTION (Text Left | Image Right) ================= */}
      <section className="pt-12 pb-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Text Left */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <span className={`${accentColor} font-medium tracking-wide uppercase text-xs mb-6 block`}>
              Sylithe LULC Intelligence
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal text-[#0F172A] leading-[1.15] mb-8">
              Methodology aligned

              <span className="text-[#16a34a]"> eligibility</span> <br />
              <span className="text-[#16a34a]">screening.</span>

            </h1>
            <p className={bodyStyle}>
              Sylithe provides spatially explicit, time-series-based LULC intelligence aligned with ICM, Verra, ARR, and REDD+ frameworks—so only eligible land enters the carbon pipeline.
            </p>
            <div className="mt-10">
              <Link to="/signup" className="w-full sm:w-auto bg-[#062125] text-white px-8 py-4 rounded-full font-medium text-base hover:bg-[#08292f] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 inline-flex">
                <HiUpload className="text-xl" />
                <span>Upload Polygon & Check</span>
              </Link>
            </div>
          </motion.div>

          {/* Image Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <CleanImage src={heroImage} alt="LULC Map Interface" priority={true} />
          </motion.div>
        </div>
      </section>

      {/* ================= 2. INTEGRITY CHECKPOINT (Image Left | Text Right) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          {/* Image Left */}
          <motion.div className="lg:order-first" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <CleanImage src={dashboardImage} alt="Integrity Checkpoint Dashboard" />
          </motion.div>

          {/* Text Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <SectionHeading>Land eligibility is the first integrity checkpoint.</SectionHeading>
            <p className="text-lg md:text-xl text-[#0F172A] mb-6 leading-[1.6]">
              Sylithe evaluates land use and land cover eligibility before carbon is quantified.
            </p>
            <p className={bodyStyle}>
              Land Use & Land Cover (LULC) determines whether a carbon project can exist at all. Before baselines, biomass, or crediting periods are assessed, standards require proof that land meets strict historical and methodological criteria.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= 3. WHAT LULC MEANS (3-Column Layout) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <p className="text-xs tracking-widest text-slate-400 uppercase mb-3">
              Land use & land cover
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-[#0F172A] mb-6">
              What LULC means in carbon markets
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              LULC is not a map layer. It is a compliance requirement.
              Incorrect classification can invalidate a project before carbon is quantified.
            </p>
          </div>

          {/* Three Column Layout */}
          <div className="grid lg:grid-cols-3 gap-12 items-stretch">

            {/* LEFT CARD */}
            <div className="rounded-2xl border border-slate-200 p-8 flex flex-col">
              <p className="text-xs tracking-widest text-slate-400 uppercase mb-3">
                LULC Determines
              </p>
              <div className="h-px w-full bg-slate-200 mb-6" />
              <ul className="space-y-4 text-slate-700">
                {determinesList.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CENTER IMAGE */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="w-full h-auto flex items-center justify-center bg-transparent">
                <img
                  src={fusionImage}
                  alt="LULC transformation"
                  className="w-full h-full object-contain max-h-[400px]"
                />
              </div>
            </motion.div>

            {/* RIGHT CARD */}
            <div className="rounded-2xl border border-slate-200 p-8 flex flex-col">
              <p className="text-xs tracking-widest text-slate-400 uppercase mb-3">
                Risk of Error
              </p>
              <div className="h-px w-full bg-slate-200 mb-6" />
              <ul className="space-y-4 text-slate-700">
                {riskList.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 4. CLASSIFICATION (Image Left | Text Right) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          {/* Image Left */}
          <motion.div className="lg:order-first" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            {/* Uses classificationImage (separate from methodology) */}
            <CleanImage src={classificationImage} alt="Sensor Fusion Diagram" />
          </motion.div>

          {/* Text Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <SectionHeading>How Sylithe classifies land</SectionHeading>
            <h3 className="text-lg md:text-xl text-[#0F172A] mb-4 leading-[1.6]">Multi-source, time-aware land classification.</h3>
            <p className={bodyStyle}>Sylithe combines multiple data streams to create time-indexed classifications, not single snapshots.</p>

            <div className="grid sm:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="font-medium text-[#0F172A] mb-3 uppercase tracking-wide text-xs border-b border-gray-100 pb-2">Inputs</h4>
                <ul className="space-y-2 text-slate-600 text-base font-normal leading-[1.6]">
                  {['Optical satellite imagery', 'Radar time series', 'Lidar-derived structure', 'GEDI canopy height', 'AI/ML models'].map((i, idx) => (
                    <li key={idx}>• {i}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-[#0F172A] mb-3 uppercase tracking-wide text-xs border-b border-gray-100 pb-2">Distinguishes</h4>
                <ul className="space-y-2 text-slate-600 text-base font-normal leading-[1.6]">
                  {['Stable land use', 'Temporary disturbance', 'Regrowth vs degradation', 'Human vs natural systems'].map((i, idx) => (
                    <li key={idx}>• {i}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= 5. METHODOLOGY (Text Left | Image Right) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-slate-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          {/* Text Left */}
          <motion.div
            className="flex flex-col justify-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}
          >
            <span className={`${accentColor} font-medium tracking-wide uppercase text-xs mb-6 block`}>
              Methodology Alignment
            </span>
            <SectionHeading>Tailored intelligence for ARR and REDD+ frameworks.</SectionHeading>

            <div className="space-y-12 mt-8">
              {/* ARR Block */}
              <div>
                <h3 className="text-2xl font-normal text-[#0F172A] mb-3">ARR (Reforestation)</h3>
                <p className="text-base md:text-lg text-slate-600 leading-[1.7] mb-6">
                  We verify historical non-forest status to ensure additionality. Sylithe proves that land was not recently cleared to claim credits.
                </p>
                <PillOutlineButton>Explore ARR Guidelines</PillOutlineButton>
              </div>

              {/* REDD+ Block */}
              <div>
                <h3 className="text-2xl font-normal text-[#0F172A] mb-3">REDD+ (Avoided Deforestation)</h3>
                <p className="text-base md:text-lg text-slate-600 leading-[1.7] mb-6">
                  We map existing forest extent and detect degradation signals. Sylithe identifies credible threats to prove avoided loss is real.
                </p>
                <PillOutlineButton>Explore REDD+ Guidelines</PillOutlineButton>
              </div>
            </div>
          </motion.div>

          {/* Image Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            {/* Uses methodologyImage (separate from classification) */}
            <CleanImage src={methodologyImage} alt="ARR vs REDD+ Methodology Map" />
          </motion.div>
        </div>
      </section>

      {/* ================= 6. POSITIONING STATEMENT ================= */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <p className="text-2xl md:text-3xl lg:text-4xl text-[#0F172A] leading-[1.6] font-normal">
            Sylithe provides methodology-aligned land use and land cover intelligence that supports eligibility screening, additionality assessment, and ongoing monitoring for ARR, REDD+, and other forest carbon frameworks.
          </p>
        </motion.div>
      </section>

      {/* ================= 7. FAQ SECTION ================= */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#FAFAFA] border-t border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 relative z-10">
          <div className="lg:col-span-4">
            <SectionHeading className="!text-[#0F172A] !mb-4">FAQs</SectionHeading>
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
                <div className="pb-8 text-slate-600 leading-relaxed text-base md:text-lg pr-12 font-medium opacity-80">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
};

export default LulcClassification;