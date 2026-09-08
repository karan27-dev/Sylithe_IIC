

import React, { useRef, useEffect, useState } from 'react';
import { HiCheck, HiThumbDown, HiArrowRight, HiOutlineLightningBolt, HiOutlineDatabase, HiOutlineGlobeAlt, HiOutlineShieldCheck, HiArrowLeft } from "react-icons/hi";
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// --- IMAGE IMPORTS ---
import heroDashboard from '../assets/home1.png';
import systemArch from '../assets/lulc10.png';
import dataFusion from '../assets/chm22.png';
import brandLogo from '../assets/treee13.png';
import dcabImg from '../assets/DCAB30.png';
import HowItWorksCarousel from '../components/HowItWorksCarousel';


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

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

// --- DESIGN TOKENS ---
const s = {
    bg: '#F1F1F1',
    color: '#0F172A',
    accent: '#16a34a',
    body: 'var(--font-body)',
    heading: 'var(--font-heading)',
};

// --- TYPOGRAPHY COMPONENTS ---
const H1 = ({ children, className = "" }) => (
    <h1 className={`text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.15] tracking-tight mb-8 ${className}`} style={{ fontFamily: s.heading }}>
        {children}
    </h1>
);

const H2 = ({ children, className = "" }) => (
    <h2 className={`text-4xl md:text-5xl font-normal leading-[1.2] tracking-tight mb-6 ${className}`} style={{ fontFamily: s.heading }}>
        {children}
    </h2>
);

const H3 = ({ children, className = "" }) => (
    <h3 className={`text-2xl font-normal text-[#0F172A] mb-4 leading-tight ${className}`} style={{ fontFamily: s.heading }}>
        {children}
    </h3>
);

const Body = ({ children, className = "", large = false }) => (
    <p className={`${large ? 'text-lg md:text-xl' : 'text-base md:text-lg'} text-slate-600 leading-[1.7] opacity-80 font-normal mb-6 ${className}`} style={{ fontFamily: s.body }}>
        {children}
    </p>
);

const SectionLabel = ({ children, className = "" }) => (
    <span className={`text-[#16a34a] font-medium tracking-widest uppercase text-xs mb-6 block ${className}`} style={{ fontFamily: s.body }}>
        {children}
    </span>
);

// --- REUSABLE COMPONENTS ---
const CleanImage = ({ src, alt, className = "", priority = false }) => (
    <div className={`w-full h-full min-h-[400px] relative flex items-center justify-center ${className}`}>
        <img
            src={src}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-contain"
        />
    </div>
);

// --- HORIZONTAL SCROLL SECTION ---
const HorizontalScrollSection = ({ title, accent, children, panelCount }) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateProgress = () => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const current = el.scrollLeft;
        setScrollProgress(max > 0 ? current / max : 0);
        setCanScrollLeft(current > 0);
        setCanScrollRight(current < max - 2);
    };

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
        return () => el.removeEventListener('scroll', updateProgress);
    }, []);

    const scroll = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.75;
        el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <section ref={containerRef} className="py-24 overflow-hidden border-b border-gray-200">
            {/* Section Header */}
            <div className="px-6 md:px-12 lg:px-24 pb-16">
                <div className="max-w-7xl mx-auto flex items-end justify-between">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                        <SectionLabel className="mb-4">
                            {accent}
                        </SectionLabel>
                        <H2 className="leading-tight">
                            {title}
                        </H2>
                    </motion.div>
                    {/* Arrow Controls */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200
                                ${canScrollLeft
                                    ? 'border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white'
                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                        >
                            <HiArrowLeft className="text-lg" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-200
                                ${canScrollRight
                                    ? 'border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white'
                                    : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
                        >
                            <HiArrowRight className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="max-w-7xl mx-auto mt-6">
                    <div className="w-full h-[1.5px] bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#16a34a] rounded-full transition-all duration-150"
                            style={{ width: `${scrollProgress * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Track */}
            <div
                ref={trackRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pr-12"
                style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    paddingLeft: 'calc(max(24px, (100vw - 1280px) / 2 + 24px))', // Base padding
                    paddingBottom: '2rem'
                }}
            >
                {children}
            </div>
        </section>
    );
};

// Snap Panel wrapper
const SnapPanel = ({ children, className = "" }) => (
    <div
        className={`flex-shrink-0 scroll-snap-align-start ${className}`}
        style={{ scrollSnapAlign: 'start' }}
    >
        {children}
    </div>
);


// --- STEP CARD (for How It Works) ---
const StepCard = ({ number, title, desc, color }) => (
    <SnapPanel className="w-[320px] md:w-[380px]">
        <div className="h-full bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between min-h-[320px]">
            <div>
                <div className={`text-7xl font-bold mb-6 leading-none ${color} opacity-15 group-hover:opacity-25 transition-opacity`}>
                    {String(number).padStart(2, '0')}
                </div>
                <H3 className="mb-4">{title}</H3>
                <p className="text-slate-500 text-sm leading-relaxed font-normal">{desc}</p>
            </div>
            <div className={`w-8 h-[2px] ${color.replace('text', 'bg')} mt-6 group-hover:w-16 transition-all duration-300`} />
        </div>
    </SnapPanel>
);


// --- INTEGRATION CARD ---
const IntegrationCard = ({ name, category, desc, abbr, tag }) => (
    <SnapPanel className="w-[280px] md:w-[300px]">
        <div className="h-full bg-white border border-gray-200 rounded-3xl p-7 min-h-[250px] flex flex-col hover:shadow-xl hover:border-[#16a34a]/30 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16a34a]/10 text-[#16a34a] font-bold text-[13px] group-hover:bg-[#16a34a] group-hover:text-white transition-colors duration-200">
                    {abbr}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-gray-200 rounded-full px-2.5 py-1">
                    {tag}
                </span>
            </div>
            <H3 className="text-lg mb-1">{name}</H3>
            <SectionLabel className="mb-3">{category}</SectionLabel>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    </SnapPanel>
);




// --- MAIN COMPONENT ---
const Platform = () => {
    const bodyStyle = "text-base md:text-lg text-slate-600 leading-[1.7] mb-6 font-normal opacity-80";
    const accentColor = "text-[#16a34a]";

    const capabilities = [
        {
            icon: <HiOutlineDatabase className="text-3xl text-[#16a34a]" />,
            title: "Multi-Sensor Ingestion",
            desc: "Native integration of Optical, SAR, LiDAR, and GEDI data streams continuously feeding into our models."
        },
        {
            icon: <HiOutlineLightningBolt className="text-3xl text-[#16a34a]" />,
            title: "AI-Driven Processing",
            desc: "Proprietary deep learning models that execute complex LULC, CHM, and DCAB derivations in real time."
        },
        {
            icon: <HiOutlineGlobeAlt className="text-3xl text-[#16a34a]" />,
            title: "Dynamic Baselines",
            desc: "Algorithmic generation of dynamic baselines allowing for highly precise additionality assessments."
        },
        {
            icon: <HiOutlineShieldCheck className="text-3xl text-[#16a34a]" />,
            title: "Automated MRV & Reporting",
            desc: "Generate Verra and ICM-aligned audit reports instantaneously, drastically reducing verification cycles."
        }
    ];

    const steps = [
        {
            number: 1,
            title: "Upload Project Boundary",
            desc: "Submit your KML or GeoJSON boundary file. Sylithe automatically validates geometry, resolves overlaps, and queues the project for satellite archive fetching within minutes.",
            color: "text-[#16a34a]"
        },
        {
            number: 2,
            title: "Automatic Data Ingestion",
            desc: "Our pipeline fetches all relevant historical and current satellite passes — Sentinel-2, SAR, GEDI spaceborne LiDAR — and aligns them into a unified spatiotemporal stack.",
            color: "text-[#16a34a]"
        },
        {
            number: 3,
            title: "AI Classification & Analysis",
            desc: "Proprietary transformer models run LULC stratification, disturbance detection, canopy height modelling, and carbon stock quantification across every pixel in your AOI.",
            color: "text-[#16a34a]"
        },
        {
            number: 4,
            title: "Baseline & Additionality",
            desc: "Dynamic counterfactual baselines are algorithmically generated using matched control areas, removing subjective assumptions and delivering defensible additionality figures.",
            color: "text-[#16a34a]"
        },
        {
            number: 5,
            title: "Issuance Report Generated",
            desc: "An audit-ready report, fully aligned to Verra VCS and CCB standards, is compiled and delivered as a structured PDF with all underlying data accessible via API.",
            color: "text-[#16a34a]"
        },
        {
            number: 6,
            title: "Continuous Monitoring",
            desc: "Once live, the platform continuously monitors the project area, flagging disturbance events, reversals, or data anomalies in real time for immediate corrective action.",
            color: "text-[#16a34a]"
        },
    ];


    // What Sylithe provides — capabilities, models and outputs.
    const integrations = [
        { abbr: 'VHR', name: 'High-Resolution Monitoring', category: 'Monitoring', desc: 'Very-high-resolution satellite monitoring down to 30 cm for tree-level tracking and independent verification.', tag: '≤30 cm' },
        { abbr: 'ELG', name: 'Land Eligibility', category: 'Screening', desc: 'Instant carbon-eligible vs ineligible land breakdown to qualify a plot before you invest.', tag: 'Free' },
        { abbr: 'HIS', name: 'Land History', category: 'Screening', desc: 'A decade of land-cover change, vegetation, deforestation, fire and rainfall for the project area.', tag: '10+ yr' },
        { abbr: 'LUL', name: 'LULC Classification', category: 'Model', desc: 'High-resolution land-use / land-cover mapping for eligibility, baselines and change detection.', tag: 'Model' },
        { abbr: 'CHM', name: 'Canopy Height Model', category: 'Model', desc: 'Per-pixel canopy height for stand structure, growth tracking and biomass calibration.', tag: 'Model' },
        { abbr: 'DCB', name: 'Dynamic Baseline (DCAB)', category: 'Model', desc: 'A dynamic counterfactual baseline from matched control areas to prove real additionality.', tag: 'Model' },
        { abbr: 'AGB', name: 'AGB / BGB Estimation', category: 'Model', desc: 'Above- and below-ground biomass and carbon stock, aligned to IPCC Tier 2 guidance.', tag: 'Model' },
        { abbr: 'SEG', name: 'Tree Count & Segmentation', category: 'Model', desc: 'Individual tree detection and crown segmentation for plot inventory and verification.', tag: 'Model' },
        { abbr: 'STK', name: 'Carbon Stock Monitoring', category: 'Monitoring', desc: 'Continuous carbon-stock tracking across the project with quantified uncertainty.', tag: 'Live' },
        { abbr: 'CHG', name: 'Change Detection', category: 'Monitoring', desc: 'Near real-time vegetation, deforestation and fire alerts across your entire portfolio.', tag: 'Alerts' },
        { abbr: 'PRM', name: 'Permanence & Risk', category: 'Risk', desc: 'Reversal, leakage and non-permanence risk scoring for the VCS buffer pool.', tag: 'Risk' },
        { abbr: 'RPT', name: 'Audit-Ready MRV Reports', category: 'Reporting', desc: 'Exportable, verification-grade diligence and MRV reports for VVBs and buyers.', tag: 'Export' },
        { abbr: 'STD', name: 'Verra & Gold Standard', category: 'Compliance', desc: 'Aligned with Verra VCS (VM0047 ARR, VM0048 REDD+) and Gold Standard requirements.', tag: 'Aligned' },
        { abbr: 'ICM', name: 'ICM / CCTS Aligned', category: 'Compliance', desc: 'Indian Carbon Market and CCTS-aligned reporting under the BEE framework.', tag: 'India' },
        { abbr: 'BCR', name: 'Biochar Carbon Removal', category: 'Compliance', desc: 'Durable CDR MRV — feedstock verification, pyrolysis batch records and chain of custody, aligned to Puro.earth and Verra VM0044.', tag: 'New' },
        { abbr: 'GEO', name: 'Boundary Import / Export', category: 'Data I/O', desc: 'Upload any project boundary (KML, GeoJSON, Shapefile) and export audit-ready files.', tag: 'I/O' },
    ];


    const faqs = [
        {
            question: "How does Sylithe cut MRV costs by up to 70%?",
            answer: "Sylithe significantly reduces MRV costs by replacing slow, expensive manual field surveys with automated satellite intelligence. By leveraging AI, remote sensing, and continuous spaceborne monitoring, we eliminate the need for extensive on-the-ground measurements, cutting operational verification costs by up to 70% while improving data accuracy and speed."
        },
        {
            question: "What is dMRV in India?",
            answer: "dMRV stands for digital Measurement, Reporting and Verification. In India, dMRV replaces expensive manual field surveys with satellite-based, real-time carbon monitoring. Sylithe is the leading dMRV platform in India, supporting ICM, CCTS, REDD+, and ARR carbon projects."
        },
        {
            question: "What is a dMRV platform?",
            answer: "A dMRV platform automates the Measurement, Reporting and Verification (MRV) process for carbon projects using digital tools like satellite imagery, AI, and remote sensing. Sylithe's dMRV platform covers LULC classification, canopy height modelling, biomass estimation, and dynamic baseline computation for Indian carbon projects."
        },
        {
            question: "What makes Sylithe the leading dMRV platform for India?",
            answer: "Sylithe combines satellite intelligence, AI-driven analysis, and India-specific regulatory alignment (ICM, CCTS, Verra VCS, Gold Standard) to deliver the most complete nature-based dMRV pipeline available in the Indian market — covering LULC, CHM, AGB, and DCAB in a single platform."
        },
        {
            question: "Which is the best nature-based dMRV platform in India?",
            answer: "Sylithe is India's leading nature-based dMRV platform. It provides satellite intelligence for REDD+, ARR (Afforestation, Reforestation & Revegetation), agroforestry, and ecosystem restoration projects. Sylithe is the only Indian platform combining LULC, CHM, AGB, and DCAB in a single nature-based dMRV pipeline."
        },
        {
            question: "How is Sylithe different from traditional MRV in India?",
            answer: "Unlike traditional MRV that relies on expensive field surveys done every 5 years, Sylithe delivers continuous near-real-time dMRV using satellites. It reduces MRV costs by up to 90%, detects carbon reversals early, and produces audit-ready reports for ICM, Verra, and Gold Standard — making it the best dMRV platform in India."
        },
        {
            question: "Is there a digital MRV platform for nature-based solutions in India?",
            answer: "Yes. Sylithe is India's dedicated digital MRV platform for nature-based solutions (NbS). It supports forest carbon projects, agroforestry carbon credits, community carbon projects, REDD+, and ARR through continuous satellite-based monitoring, dynamic baselines, and ICM-compliant verification."
        },
        {
            question: "Who uses the Sylithe dMRV platform in India?",
            answer: "Sylithe is used by forest and agroforestry carbon project developers, institutional carbon buyers, ESG-driven Indian corporates, and government agencies. It is India's first platform combining LULC, CHM, AGB, and DCAB in a single dMRV pipeline for nature-based and forest carbon projects."
        },
        {
            question: "How does Sylithe support the Indian Carbon Market (ICM) and CCTS?",
            answer: "Sylithe is built for the Indian Carbon Market (ICM) and Carbon Credit Trading Scheme (CCTS). It provides satellite-based carbon stock estimation, LULC classification, CHM modelling, and DCAB baseline computation — enabling ICM-compliant, audit-ready digital MRV for Indian forest and nature-based carbon projects."
        },
        {
            question: "How does Sylithe help with REDD+ and ARR carbon projects in India?",
            answer: "Sylithe uses multi-scale satellite intelligence to continuously monitor Avoided Deforestation (REDD+), Afforestation, Reforestation & Revegetation (ARR), and agroforestry projects in India. It automates above-ground biomass measurement using spaceborne LiDAR (NASA GEDI) and provides dynamic baselines (DCAB) aligned with Verra VM0047."
        },
        {
            question: "Does Sylithe support biochar and other durable carbon removal projects?",
            answer: "Yes. Sylithe now supports Biochar Carbon Removal (BCR) alongside its nature-based project types. Biochar is a durable CDR pathway where waste biomass is converted through pyrolysis into stable carbon that resists decay for centuries. Because biochar integrity depends on a chain of custody rather than satellite measurement alone, Sylithe verifies feedstock sourcing through LULC screening, logs pyrolysis batch records and laboratory H:Corg results, tracks material to the application plot, and assembles an evidence pack aligned to the Puro.earth Biochar Methodology, Verra VM0044 and the European Biochar Certificate."
        },
        {
            question: "Can Sylithe help Indian exporters with CBAM and Scope 3 reporting?",
            answer: "Yes. Sylithe provides auditable carbon reduction and verification data for Indian corporates, supporting BRSR reporting, Net Zero 2070 goals, and EU Carbon Border Adjustment Mechanism (CBAM) compliance. It helps businesses measure Scope 1, 2, and 3 emissions with satellite-verified carbon data."
        }
    ];

    return (
        <main className="w-full bg-[#F1F1F1] font-sans text-[#0F172A] pt-20 overflow-hidden">
            <SEOHead
                title="dMRV Platform | Carbon Credit Verification in India | Sylithe"
                description="satellite & Ai powered dMRV platform for carbon credit verification. ICM, Verra & Gold Standard aligned — from LULC to audit-ready issuance reports."
                keywords="dMRV platform India, carbon credit platform India, carbon credit verification India, digital MRV India, ICM carbon market, carbon compliance India, nature-based solutions MRV"
                path="/platform"
                speakableSelectors={['h1', '.platform-overview']}
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
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Sylithe dMRV Platform",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "url": "https://sylithe.com/platform",
                        "description": "Satellite-powered digital MRV platform for carbon credit verification in India. Continuous monitoring from LULC classification to AGB estimation — ICM, Verra, and Gold Standard aligned.",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "INR",
                            "category": "dMRV & Carbon Verification Platform"
                        },
                        "featureList": [
                            "LULC Classification at 10m resolution",
                            "Canopy Height Model (CHM) with LiDAR fusion",
                            "Dynamic Counterfactual Baseline (DCAB)",
                            "Above-Ground Biomass (AGB) estimation",
                            "ICM and Verra VM0047 compliance reporting",
                            "Real-time leakage and reversal monitoring"
                        ]
                    })}
                </script>
            </Helmet>

            {/* ========== 1. HERO ========== */}
            <section className="pt-12 pb-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-b border-gray-200">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
                        <SectionLabel>
                            The Sylithe Platform
                        </SectionLabel>
                        <H1>
                            Continuous <br />
                            carbon <span className="text-[#16a34a]">intelligence.</span>
                        </H1>
                        <Body large className="max-w-[500px] mb-10">
                            The unified operating system for high-integrity nature-based solutions. From pixel to portfolio, we power the next generation of MRV.
                        </Body>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/signup" className="bg-[#16a34a] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-[#0F172A] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                Request a Demo <HiArrowRight />
                            </Link>
                        </div>
                    </motion.div>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
                        <CleanImage src={heroDashboard} alt="Sylithe Platform Dashboard" priority={true} />
                    </motion.div>
                </div>
            </section>


            {/* ========== 3. PLATFORM INFRASTRUCTURE — feature cards ========== */}
            <section className="py-28 px-6 md:px-12 lg:px-24 bg-[#FAFBF6] border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-16 max-w-3xl">
                        <motion.div variants={fadeInUp}><SectionLabel className="mb-4">Platform Infrastructure</SectionLabel></motion.div>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-normal leading-[1.12] tracking-tight text-[#08292F]" style={{ fontFamily: s.heading }}>
                            Built for global scale and pixel-level precision.
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="mt-5 text-lg leading-relaxed text-slate-600">
                            Accurate carbon stock with independent data. Verify claims before you commit, with the wall-to-wall coverage and accuracy that field campaigns can't deliver.
                        </motion.p>
                    </motion.div>

                    <motion.div className="grid gap-6 md:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}>
                        {[
                            { title: 'Land cover & eligibility', desc: 'High-resolution LULC classification across the whole boundary — eligible vs ineligible land, decade-long change history and baselines.', img: systemArch },
                            { title: 'Canopy height & biomass', desc: 'Per-pixel canopy height and above / below-ground biomass to quantify carbon stock, aligned to IPCC Tier 2 guidance.', img: dataFusion },
                            { title: 'Dynamic baseline (DCAB)', desc: 'A dynamic counterfactual baseline from matched control areas — real additionality, not static assumptions.', img: dcabImg },
                        ].map((c) => (
                            <motion.div key={c.title} variants={fadeInUp} className="group flex flex-col rounded-3xl border border-black/5 bg-[#F4F4EE] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(8,41,47,0.1)]">
                                <h3 className="text-2xl font-normal text-[#08292F]" style={{ fontFamily: s.heading }}>{c.title}</h3>
                                <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{c.desc}</p>
                                <div className="mt-8 flex flex-1 items-end justify-center">
                                    <img src={c.img} alt={c.title} loading="lazy" className="w-full max-h-64 object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ========== 4. HOW IT WORKS — carousel ========== */}
            <section className="bg-[#F1F1F1] px-6 py-28 md:px-12 lg:px-24 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-14 text-center">
                        <motion.div variants={fadeInUp}><SectionLabel className="mb-4">Step by Step</SectionLabel></motion.div>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-normal leading-[1.12] tracking-tight text-[#08292F]" style={{ fontFamily: s.heading }}>
                            How it works.
                        </motion.h2>
                    </motion.div>
                    <HowItWorksCarousel />
                </div>
            </section>

            {/* ========== 5. SYSTEM ARCHITECTURE ========== */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-b border-gray-200">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div className="lg:order-first" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
                        <CleanImage src={systemArch} alt="Sylithe System Architecture" className="min-h-[500px]" />
                    </motion.div>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
                        <SectionLabel>Unified Workflow</SectionLabel>
                        <H2>End-to-end processing pipeline.</H2>
                        <Body>
                            Stop stitching together disparate GIS tools, spreadsheets, and manual scripts. The Sylithe platform unifies the entire MRV lifecycle into a single, cohesive interface.
                        </Body>
                        <ul className="space-y-4 mt-8">
                            {['Upload standard project boundaries (KML/GeoJSON)', 'Automatically fetch historical satellite archives', 'Execute LULC stratification and disturbance checks', 'Generate audit-ready issuance reports in one click'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                    <HiCheck className="text-[#16a34a] text-xl shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* ========== 6. DATA FUSION ========== */}
            <section className="py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
                        <SectionLabel>Deep Integration</SectionLabel>
                        <H2>Multi-source algorithmic fusion.</H2>
                        <Body>
                            Relying solely on optical data is no longer adequate for modern integrity standards. Sylithe's architecture natively fuses Optical indices with Synthetic Aperture Radar (SAR) and Spaceborne LiDAR.
                        </Body>
                        <Body>
                            This tri-layered approach guarantees penetration through dense cloud cover and accurate above-ground biomass quantification, regardless of geographic location.
                        </Body>
                    </motion.div>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
                        <CleanImage src={dataFusion} alt="Multi-Sensor Fusion Engine" />
                    </motion.div>
                </div>
            </section>


            {/* ========== 8. CAPABILITIES — comparison ========== */}
            <section className="bg-[#FAFBF8] px-6 py-28 md:px-12 lg:px-24 border-b border-gray-200">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-14 text-center">
                        <motion.div variants={fadeInUp}><SectionLabel className="mb-4">Capabilities</SectionLabel></motion.div>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-normal leading-[1.12] tracking-tight text-[#08292F]" style={{ fontFamily: s.heading }}>
                            Everything in the Sylithe stack.
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="mt-5 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600">
                            Verification built on high-resolution satellite data and dynamic baselines, delivering market-leading accuracy at a fraction of field-survey cost and time.
                        </motion.p>
                    </motion.div>

                    <motion.div className="grid gap-6 md:grid-cols-2" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                        {/* Conventional */}
                        <motion.div variants={fadeInUp} className="rounded-3xl border border-black/5 bg-[#F5F6F2] p-8">
                            <h3 className="pb-5 text-center text-xl font-medium text-slate-500" style={{ fontFamily: s.heading }}>Conventional dMRV</h3>
                            <div className="-mx-8 mb-6 border-b border-black/10" />
                            <div className="space-y-5">
                                {['Expensive, infrequent manual field surveys', 'Static baselines locked in for 10+ years', 'Months of delay before verification', 'Fragmented tools for LULC, CHM and biomass', 'Assumption-based additionality', 'Opaque, hard-to-audit uncertainty'].map((t) => (
                                    <div key={t} className="flex items-start gap-3.5">
                                        <HiThumbDown className="mt-0.5 shrink-0 text-lg text-slate-400" />
                                        <p className="text-[15px] leading-snug text-slate-600">{t}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        {/* Sylithe */}
                        <motion.div variants={fadeInUp} className="rounded-3xl border-2 border-[#16a34a]/50 bg-white p-8 shadow-[0_20px_60px_rgba(8,41,47,0.08)]">
                            <div className="flex items-center justify-center gap-2 pb-5">
                                <img src={brandLogo} alt="" className="h-6 w-6 object-contain" />
                                <span className="text-xl font-medium text-[#08292F]" style={{ fontFamily: s.heading }}>Sylithe</span>
                            </div>
                            <div className="-mx-8 mb-6 border-b border-[#16a34a]/30" />
                            <div className="space-y-5">
                                {['Satellite monitoring down to 30 cm resolution', 'Dynamic counterfactual baselines (DCAB)', 'Near real-time, continuous monitoring', 'LULC, CHM, AGB/BGB and segmentation in one platform', 'Evidence-based additionality from control areas', 'Audit-ready reports with quantified uncertainty'].map((t) => (
                                    <div key={t} className="flex items-start gap-3.5">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#08292F] text-white"><HiCheck className="text-sm" /></span>
                                        <p className="text-[15px] leading-snug text-[#0F172A]">{t}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-12 flex justify-center">
                        <Link to="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#a4fca1] px-8 py-3.5 text-sm font-semibold text-[#08292F] transition-colors duration-200 hover:bg-[#16a34a] hover:text-white">
                            Start with Sylithe
                            <HiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </motion.div>
                </div>
            </section>


            {/* ========== 9. FAQ SECTION ========== */}
            <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#FAFAFA] border-b border-gray-200 relative overflow-hidden">
                {/* Subtle background wave/pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)' }} />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 relative z-10">
                    <div className="lg:col-span-4">
                        <H2 className="text-[#0F172A] mb-4">FAQs</H2>
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

            {/* ========== 10. BOTTOM CTA ========== */}
            <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#0F172A] text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full border border-white/5 rounded-[100%] scale-[2] pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full border border-[#16a34a]/20 rounded-[100%] scale-[1.5] bg-[#16a34a]/5 pointer-events-none blur-3xl" />
                <motion.div
                    className="max-w-3xl mx-auto relative z-10"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <H1 className="text-white mb-8">Ready to integrate <br /> with Sylithe?</H1>
                    <Body large className="text-slate-300 mb-10">
                        Join the leading project developers and carbon registries using Sylithe to power the next generation of high-integrity carbon credits.
                    </Body>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="bg-[#16a34a] text-white px-10 py-4 rounded-full font-bold text-base hover:bg-white hover:text-[#0F172A] transition-all shadow-xl active:scale-95 flex items-center justify-center">
                            Schedule Demo
                        </Link>
                        <Link to="/signup" className="bg-transparent border border-white/20 text-white px-10 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-all shadow-md active:scale-95 flex items-center justify-center">
                            Contact us
                        </Link>
                    </div>
                </motion.div>
            </section>

        </main>
    );
};

export default Platform;