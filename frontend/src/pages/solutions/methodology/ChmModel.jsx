import React from 'react';
import SEOHead from '../../../components/SEOHead';
import { HiCheck, HiArrowRight, HiGlobe, HiShieldCheck, HiChartBar } from "react-icons/hi";
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import CreditingStandards from '../../../components/CreditingStandards';

// --- IMAGE IMPORTS ---
import chmHeroImage from '../../../assets/chm12.png';
import measurementGapImage1 from '../../../assets/tree22.png';
import measurementGapImage2 from '../../../assets/chm14.png';
import measurementGapImage3 from '../../../assets/chm19.png';
import solutionImage from '../../../assets/chm16.png';
import processImage from '../../../assets/chm26.png';
import coverageImage from '../../../assets/chm22.png';
import testimonialImage from '../../../assets/home1.png';

// --- EXACT STYLING FROM DCAB MODEL ---
const cdStyle = {
  color: '#08292F',
  headingFont: 'var(--font-heading)',
  bodyFont: 'var(--font-body)',
  accentColor: '#16a34a',
  lightAccent: '#f7fce5',
};

// --- ANIMATION VARIANTS (From DCAB) ---
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

const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// --- COMPONENTS (From DCAB) ---

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

const CDHeading = ({ children, className = "", as = "h2", size = "large" }) => {
  const Component = as;

  const sizeClasses = {
    hero: 'text-5xl md:text-6xl lg:text-7xl',
    section: 'text-4xl md:text-5xl',
    card: 'text-2xl md:text-3xl',
  };

  const lineHeights = {
    hero: '1.15',
    section: '1.2',
    card: '1.25',
  };

  return (
    <Component
      className={`font-normal tracking-tight mb-6 ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: cdStyle.headingFont,
        color: cdStyle.color,
        lineHeight: lineHeights[size] || '1.15',
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </Component>
  );
};

const CDBody = ({ children, className = "", large = false }) => (
  <p
    className={`${large ? 'text-xl md:text-2xl' : 'text-lg'} ${className}`}
    style={{
      fontFamily: cdStyle.bodyFont,
      fontSize: large ? '22px' : '18px',
      lineHeight: '1.7',
      color: cdStyle.color,
      opacity: 0.8,
    }}
  >
    {children}
  </p>
);

const PillOutlineButton = ({ children }) => (
  <button
    className="group relative px-8 py-4 rounded-full border-2 font-medium text-lg transition-all duration-300 active:scale-95 flex items-center gap-2 hover:bg-[#08292F] hover:text-white"
    style={{
      borderColor: cdStyle.color,
      color: cdStyle.color,
      fontFamily: cdStyle.bodyFont,
    }}
  >
    {children}
    <HiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
  </button>
);

// --- MARQUEE REMOVED (Using Centralized CreditingStandards Component) ---

const ChmModel = () => {
  const faqs = [
    {
      question: "What is a Canopy Height Model (CHM)?",
      answer: "A Canopy Height Model (CHM) is a 3D representation of the continuous height of trees and vegetation above the bare earth. Sylithe generates high-resolution CHMs using Spaceborne LiDAR and satellite data to map the vertical structure of forests."
    },
    {
      question: "Why is CHM important for measuring forest carbon?",
      answer: "Tree height is a critical variable for calculating Above-Ground Biomass (AGB) and determining the total carbon stock of a project. A satellite-derived CHM provides objective, large-scale height data without the need to manually measure thousands of trees."
    },
    {
      question: "How does Sylithe generate CHM without drones or airplanes?",
      answer: "Sylithe uses Spaceborne LiDAR data (such as NASA GEDI and ICESat-2) fused with continuous optical satellite imagery. Our machine learning models extrapolate this structural data to create continuous, highly accurate canopy height maps globally."
    },
    {
      question: "Is satellite LiDAR accurate enough for carbon credit verification?",
      answer: "Yes. Sylithe's AI-driven fusion of Spaceborne LiDAR and SAR data achieves state-of-the-art accuracy, meeting the rigorous standards required by registries like Verra, Gold Standard, and the Indian Carbon Market for digital MRV."
    },
    {
      question: "How does CHM help in ARR (Afforestation) projects?",
      answer: "For Afforestation, Reforestation, and Revegetation (ARR) projects, CHM is used to continuously track tree growth rates over time. Sylithe allows developers to visualize and report the actual vertical growth of their newly planted forests."
    },
    {
      question: "Can CHM data replace manual forest inventory?",
      answer: "While some strategic ground-truthing is necessary, Sylithe's continuous CHM significantly reduces the need for dense field plots. This lowers digital MRV costs and accelerates the carbon credit verification timeline."
    }
  ];

  return (
    <div
      className="w-full bg-[#F1F1F1] pt-20 overflow-hidden"
      style={{ fontFamily: cdStyle.bodyFont, color: cdStyle.color }}
    >
      <SEOHead
        title="Canopy Height Model (CHM) for Carbon MRV | Sylithe"
        description="Satellite-powered CHM for carbon MRV in India. LiDAR and GEDI fusion for pixel-level biomass accuracy — ICM and Verra-compliant. Request a demo."
        path="/methodology/chm"
        speakableSelectors={['h1', '.chm-hero-description']}
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

      {/* ================= 1. HERO SECTION ================= */}
      <section className="pt-12 pb-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Text Left */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <span
              className="font-medium tracking-wide uppercase text-sm mb-6 block"
              style={{ color: cdStyle.accentColor, fontFamily: cdStyle.bodyFont }}
            >
              Sylithe Forest Intelligence
            </span>

            <CDHeading as="h1" size="hero" className="mb-8">
              See your forest carbon with <span style={{ color: cdStyle.accentColor }}>absolute clarity.</span>
            </CDHeading>

            <div style={{ maxWidth: '520px' }}>
              <CDBody large className="mb-10">
                Satellite-powered canopy height measurement calibrated by airborne LiDAR. Finally, know exactly how much carbon your forest is storing—without the cost and delay of manual field surveys.
              </CDBody>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 rounded-full font-medium text-lg text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 hover:bg-[#08292f]"
                style={{
                  backgroundColor: '#062125',
                  fontFamily: cdStyle.bodyFont,
                }}
              >
                <span>Request a demo</span>
                <HiArrowRight className="text-xl" />
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 rounded-full font-medium text-lg border-2 transition-all hover:bg-[#08292F] hover:text-white flex items-center justify-center"
                style={{
                  borderColor: cdStyle.color,
                  color: cdStyle.color,
                  fontFamily: cdStyle.bodyFont,
                }}
              >
                View coverage map
              </Link>
            </div>
          </motion.div>

          {/* Image Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <CleanImage src={chmHeroImage} alt="Canopy Height Model Visualization" priority={true} className="min-h-[500px]" />
          </motion.div>
        </div>
      </section>

      {/* ================= 2. THE MEASUREMENT GAP (Problem) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <CDHeading as="h2" size="section" className="mb-6">
              Traditional forest carbon estimates leave you exposed.
            </CDHeading>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <p
                className="text-xl text-gray-600 leading-relaxed"
                style={{ fontFamily: cdStyle.bodyFont }}
              >
                Whether you're issuing credits or buying them, unreliable biomass estimates create regulatory and reputational risk. Ground surveys are expensive and infrequent. Satellite indices alone lack validation. And static carbon maps miss the changes that matter.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerStagger}
          >
            {[
              {
                title: "Expensive & Slow",
                desc: "Manual field surveys cost thousands per site and take months to complete.",
                img: measurementGapImage1
              },
              {
                title: "Unreliable Indices",
                desc: "Optical greenness confuses crops for forests and misses degradation entirely.",
                img: measurementGapImage2
              },
              {
                title: "Outdated Maps",
                desc: "Static biomass estimates can't detect the disturbances that threaten permanence.",
                img: measurementGapImage3
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemFade}
                className="flex flex-col items-start bg-[#F1F1F1] border border-gray-200 rounded-lg p-10 h-full hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-8 h-24 flex items-center justify-start">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-auto object-contain rounded-md"
                  />
                </div>

                <h3
                  className="text-2xl font-bold mb-4 text-[#08292F]"
                  style={{ fontFamily: cdStyle.headingFont, lineHeight: '1.2' }}
                >
                  {item.title}
                </h3>

                <p
                  className="text-lg text-gray-600 leading-relaxed flex-grow"
                  style={{ fontFamily: cdStyle.bodyFont }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= 3. WHAT WE OFFER (Solution) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Image Left */}
          <motion.div className="lg:order-first" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <CleanImage src={solutionImage} alt="Accurate Canopy Height Measurement" className="min-h-[500px]" />
          </motion.div>

          {/* Text Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <CDHeading as="h2" size="section" className="mb-8">
              Canopy height measurement you can bank on.
            </CDHeading>

            <CDBody large className="mb-6">
              We combine satellite imagery with spaceborne and airborne LiDAR to deliver annual canopy height maps.
            </CDBody>

            <CDBody className="mb-8">
              This isn't theoretical modeling—these are measurements validated against actual laser scans of the forest. Understand forest structure from 2000 to present, anywhere in the world, with uncertainty quantified for every hectare.
            </CDBody>


          </motion.div>
        </div>
      </section>

      {/* ================= 4. HOW IT WORKS (Process) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-y" style={{ borderColor: 'rgba(8, 41, 47, 0.06)' }}>
        <div className="max-w-7xl mx-auto">

          <motion.div className="text-center max-w-4xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <span
              className="font-medium tracking-widest uppercase text-sm mb-4 block"
              style={{ color: 'rgba(8, 41, 47, 0.5)', fontFamily: cdStyle.bodyFont }}
            >
              The Process
            </span>
            <CDHeading as="h2" size="section">From raw signal to structural certainty.</CDHeading>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Process Steps */}
            <motion.div
              className="space-y-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerStagger}
            >
              {[
                { step: "01", title: "Ingest", desc: "We pull multi-source satellite data—optical, radar, and LiDAR—for your specific area of interest." },
                { step: "02", title: "Calibrate", desc: "Our AI models learn from millions of GEDI and airborne LiDAR measurements to ground-truth the satellite signals." },
                { step: "03", title: "Measure", desc: "Generate annual canopy height maps showing precise tree growth and structural change year-over-year." },
                { step: "04", title: "Validate", desc: "Every pixel carries confidence intervals. We quantify uncertainty so you can defend your numbers in any audit." }
              ].map((item, idx) => (
                <motion.div key={idx} variants={itemFade} className="flex gap-8">
                  <span
                    className="text-5xl font-medium"
                    style={{ color: 'rgba(132, 204, 22, 0.4)', fontFamily: cdStyle.headingFont, lineHeight: '1' }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <CDHeading as="h3" size="card" className="mb-2">{item.title}</CDHeading>
                    <CDBody className="mb-0">{item.desc}</CDBody>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Visual */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
              <CleanImage src={processImage} alt="Data Fusion Process" className="min-h-[600px]" />
            </motion.div>
          </div>
        </div>
      </section>



      {/* ================= 6. THE ACCURACY ADVANTAGE (Dark Section) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#08292F] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16">
            <span
              className="font-medium tracking-widest uppercase text-sm mb-4 block"
              style={{ color: cdStyle.accentColor, fontFamily: cdStyle.bodyFont }}
            >
              Why Canopy Height
            </span>
            <CDHeading as="h2" size="section" className="!text-white max-w-3xl">
              Why canopy height beats traditional biomass proxies
            </CDHeading>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Direct Measurement", desc: "We measure physical tree height, not spectral greenness—which often confuses crops for mature forests." },
              { title: "LiDAR-Calibrated", desc: "Every pixel is grounded in actual laser measurements from GEDI and airborne surveys, not modeling assumptions." },
              { title: "Uncertainty Transparent", desc: "We tell you exactly how confident we are in every measurement—critical for audit trails and risk management." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={itemFade}
                className="border-t border-white/20 pt-8"
              >
                <h3
                  className="text-2xl font-medium mb-4"
                  style={{ fontFamily: cdStyle.headingFont }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: cdStyle.bodyFont }}
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 7. GLOBAL COVERAGE (Capability) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Text Left */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <CDHeading as="h2" size="section" className="mb-8">
              From the Amazon to your backyard.
            </CDHeading>

            <CDBody large className="mb-6">
              Historical analysis back to 2015 (extending to 2000), covering tropical rainforests, temperate woodlands, and plantation projects. If it has canopy, we can measure it.
            </CDBody>

            {/* <div className="grid grid-cols-3 gap-8 mt-12">
                  <div 
                    className="p-8 rounded-2xl"
                    style={{ backgroundColor: cdStyle.lightAccent }}
                  >
                      <div 
                        className="text-5xl font-medium mb-2"
                        style={{ color: cdStyle.accentColor, fontFamily: cdStyle.headingFont }}
                      >
                        100+
                      </div>
                      <div 
                        className="text-lg font-medium"
                        style={{ color: cdStyle.color, fontFamily: cdStyle.bodyFont }}
                      >
                        Countries
                      </div>
                  </div>
                  <div 
                    className="p-8 rounded-2xl"
                    style={{ backgroundColor: cdStyle.lightAccent }}
                  >
                      <div 
                        className="text-5xl font-medium mb-2"
                        style={{ color: cdStyle.accentColor, fontFamily: cdStyle.headingFont }}
                      >
                        10m
                      </div>
                      <div 
                        className="text-lg font-medium"
                        style={{ color: cdStyle.color, fontFamily: cdStyle.bodyFont }}
                      >
                        Native Resolution
                      </div>
                  </div>
                  <div 
                    className="p-8 rounded-2xl"
                    style={{ backgroundColor: cdStyle.lightAccent }}
                  >
                      <div 
                        className="text-5xl font-medium mb-2"
                        style={{ color: cdStyle.accentColor, fontFamily: cdStyle.headingFont }}
                      >
                        Annual
                      </div>
                      <div 
                        className="text-lg font-medium"
                        style={{ color: cdStyle.color, fontFamily: cdStyle.bodyFont }}
                      >
                        Updates
                      </div> */}
            {/* </div> */}
            {/* </div> */}
          </motion.div>

          {/* Image Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <CleanImage src={coverageImage} alt="Global Coverage Map" className="min-h-[500px]" />
          </motion.div>
        </div>
      </section>

      {/* ================= 8. SEAMLESS INTEGRATION (Marquee) ================= */}
      <CreditingStandards title="Works with your existing workflow">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-8 text-center text-lg max-w-3xl mx-auto"
          style={{ color: 'rgba(8, 41, 47, 0.64)', fontFamily: cdStyle.bodyFont }}
        >
          Export data directly to major carbon accounting platforms. Our canopy height layers integrate with VM0047 methodologies and align with emerging IC-VCM integrity guidelines.
        </motion.p>
      </CreditingStandards>

      {/* ================= 9. MISSION (Commitment) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="rounded-3xl p-12 md:p-16 relative overflow-hidden"
            style={{ backgroundColor: cdStyle.lightAccent }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="relative z-10 grid md:grid-cols-3 gap-12 items-center">
              <div className="md:col-span-2">
                <span
                  className="font-medium tracking-widest uppercase text-sm mb-4 block"
                  style={{ color: cdStyle.accentColor, fontFamily: cdStyle.bodyFont }}
                >
                  Mission
                </span>
                <CDHeading as="h2" size="card" className="mb-6">
                  Understanding Forests at Planetary Scale
                </CDHeading>
                <blockquote
                  className="text-xl md:text-2xl font-normal leading-relaxed mb-8"
                  style={{ color: cdStyle.color, fontFamily: cdStyle.bodyFont, fontStyle: 'italic' }}
                >
                  "Sylithe develops advanced geospatial models that convert satellite data into quantifiable insights on canopy structure, biomass, and carbon dynamics. Through AI-driven analysis and transparent methodologies, we aim to improve how forests are measured, monitored, and understood globally."
                </blockquote>
                <div>
                  <div
                    className="font-bold text-lg"
                    style={{ color: cdStyle.color, fontFamily: cdStyle.headingFont }}
                  >
                    The Sylithe Vision
                  </div>
                  <div
                    className="text-gray-600"
                    style={{ fontFamily: cdStyle.bodyFont }}
                  >
                    Building the foundation
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <img src={testimonialImage} alt="Canopy Height Model (CHM) Forest LiDAR Measurement India" className="rounded-2xl shadow-lg w-full object-cover h-64 border border-white/20" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#16a34a]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </motion.div>
        </div>
      </section>

      {/* ================= 10. FAQ SECTION ================= */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#FAFAFA] border-t border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 relative z-10">
          <div className="lg:col-span-4">
            <CDHeading as="h2" size="section" className="!text-[#0F172A] !mb-4">FAQs</CDHeading>
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
                <div className="pb-8 text-slate-600 leading-relaxed text-base md:text-lg pr-12 font-medium opacity-80" style={{ fontFamily: cdStyle.bodyFont }}>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 11. CLOSING CTA ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <CDHeading as="h2" size="hero" className="mb-8">
              Stop estimating.<br />
              <span style={{ color: cdStyle.accentColor }}>Start measuring.</span>
            </CDHeading>
            <div className="max-w-2xl mx-auto mb-10">
              <CDBody large>
                Get a sample canopy height analysis for your project area and see the difference that validated measurement makes.
              </CDBody>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup"
                className="px-10 py-4 rounded-full font-medium text-lg text-white transition-all shadow-xl active:scale-95 hover:bg-[#08292f] flex items-center justify-center"
                style={{ backgroundColor: '#062125', fontFamily: cdStyle.bodyFont }}
              >
                Launch Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default ChmModel;