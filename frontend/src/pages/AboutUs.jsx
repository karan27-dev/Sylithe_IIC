import React from 'react';
import SEOHead from '../components/SEOHead';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import ScrollExpandMedia from '../components/ui/scroll-expansion-hero';
import { WorldMap } from '../components/ui/map';
import { BackgroundGlow } from '../components/ui/background-glow';
import imgImportKml from '../assets/Importkml.png';
import imgLulc1 from '../assets/lulc1.png';
import imgChm11 from '../assets/chm11.png';
import imgDcabNew from '../assets/dcab-new.png';
import imgAgbChart from '../assets/agb-chart-nobg.png';
import imgTree22 from '../assets/tree22.png';

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
    <p className={`${large ? 'text-xl md:text-2xl' : 'text-base md:text-lg'} text-slate-600 leading-[1.7] opacity-80 font-normal mb-6 ${className}`} style={{ fontFamily: s.body }}>
        {children}
    </p>
);

const SectionLabel = ({ children, className = "" }) => (
    <span className={`text-[#16a34a] font-medium tracking-widest uppercase text-xs mb-6 block ${className}`} style={{ fontFamily: s.body }}>
        {children}
    </span>
);

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};


const AboutUs = () => {
    const faqs = [
        {
            question: "Who is Sylithe and what is its mission?",
            answer: "Sylithe is a next-generation climate technology company dedicated to bridging the gap between ecological reality and the carbon economy. Our mission is to accelerate the transition to a net-zero future by providing high-integrity, satellite-powered dMRV (digital Measurement, Reporting, and Verification) solutions. We focus on transforming complex environmental data into transparent, audit-ready carbon intelligence that builds absolute trust in global climate markets."
        },
        {
            question: "Where is Sylithe Technologies Private Limited based and what markets do you serve?",
            answer: "Sylithe Technologies Private Limited is a leading environmental intelligence firm headquartered in India. While we are a primary technical partner for the emerging Indian Carbon Market (ICM) and the Carbon Credit Trading Scheme (CCTS), our satellite-based monitoring capabilities are global. We serve project developers, registries, and corporate buyers across South Asia, Africa, and Southeast Asia, ensuring that nature-based solutions are verified with scientific rigor regardless of geography."
        },
        {
            question: "What makes Sylithe's carbon verification technology unique?",
            answer: "Unlike traditional MRV which relies on infrequent and labor-intensive manual field surveys, Sylithe utilizes a continuous, full-stack environmental intelligence pipeline. Our proprietary models combine LULC classification, Canopy Height Models (CHM), and Above-Ground Biomass (AGB) estimations powered by a multi-sensor fusion of optical, LiDAR (GEDI), and SAR (Radar) satellite data. This allows for near-real-time monitoring of forest health, carbon stocks, and disturbance events with unprecedented spatial resolution."
        },
        {
            question: "How does Sylithe support the development of the Indian Carbon Market (ICM)?",
            answer: "Sylithe provides the critical digital infrastructure required for the Indian Carbon Market (ICM) to function with integrity. We help developers align their projects with the Bureau of Energy Efficiency (BEE) and Ministry of Power guidelines, offering automated reporting that bridges the gap between domestic CCTS requirements and international voluntary standards like Verra and Gold Standard. Our platform reduces the time and cost of verification, making it easier for Indian forest owners to access global carbon finance."
        },
        {
            question: "What is the philosophy behind the name 'Sylithe'?",
            answer: "The name Sylithe is a fusion of 'Sylvan' (relating to forests) and 'Lithos' (Greek for stone or foundation). It represents our core philosophy: the intersection of deep ecological understanding and solid, unshakeable technical foundations. We believe that for carbon markets to succeed, they must be built on a rock-solid foundation of transparent data, where the growth of a forest is as verifiable as a financial ledger."
        },
        {
            question: "Can Sylithe's platform be used for both REDD+ and ARR projects?",
            answer: "Absolutely. Sylithe’s platform is engineered to handle the distinct monitoring requirements of both REDD+ (Reducing Emissions from Deforestation and Forest Degradation) and ARR (Afforestation, Reforestation, and Revegetation) projects. For REDD+, we provide high-resolution disturbance alerts and dynamic baseline adjustments. For ARR, we track annual biomass accumulation and survival rates, ensuring that every tonne of carbon sequestered is accurately quantified for credit issuance."
        },
        {
            question: "Who are the primary users of Sylithe's carbon intelligence platform?",
            answer: "Our platform is a multi-stakeholder tool used by forest project developers who need to quantify carbon stocks, institutional investors performing due diligence on climate portfolios, and corporate ESG teams seeking high-integrity carbon offsets. Additionally, we provide government agencies with national-level forest monitoring tools to track progress toward Nationally Determined Contributions (NDCs) and biodiversity targets."
        }
    ];

    return (
        <main className="bg-[#F1F1F1] text-gray-900 font-sans w-full">
            <SEOHead
                title="About Sylithe | India's Carbon Credit & dMRV Technology Company"
                description="Sylithe is India's leading carbon credit intelligence company. We build satellite-powered dMRV for the Indian Carbon Market (ICM), REDD+, ARR & nature-based carbon projects."
                keywords="carbon credit company India, dMRV company India, carbon market technology India, Indian Carbon Market ICM, carbon credit technology India, REDD+ India, nature-based solutions India, carbon verification India, climate tech India"
                path="/about"
                speakableSelectors={['h1', '.mission-statement']}
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
            <ScrollExpandMedia
                mediaType="video"
                mediaSrc="https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1"
                posterSrc="https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg"
                bgImageSrc="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop"
                title="Rooted in ecology, driven by intelligence."
                date="Sylithe"
                scrollToExpand="Scroll to explore"
                textBlend={false}
            >
                {/* 
          ========================================================================
          MAIN CONTENT WITH GLOW BACKGROUND
          ========================================================================
        */}
                <div className="bg-[#F1F1F1] w-full z-10 relative">
                    <BackgroundGlow glowColor="#16a34a" glowOpacity={0.08} glowPosition="center 10%">
                        <section className="py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full relative z-10">
                            {/* Introductory Statement */}
                            <motion.div
                                className="max-w-4xl mb-24"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={fadeUp}
                            >
                                <SectionLabel>
                                    About Sylithe
                                </SectionLabel>
                                <H2 className="!md:text-6xl max-w-4xl">
                                    We are bridging the gap between <span className="text-gray-600">ecological reality</span> and the <span className="text-gray-600">carbon economy</span>.
                                </H2>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                                {/* Visual Side — Animated World Map */}
                                <motion.div
                                    className="relative flex flex-col gap-6"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeUp}
                                >
                                    <div className="">
                                        <WorldMap
                                            theme="transparent"
                                            lineColor="#16a34a"
                                            showLabels={true}
                                            dots={[
                                                { start: { lat: 5.3600, lng: -4.0083, label: "Côte d'Ivoire" }, end: { lat: -1.2921, lng: 36.8219, label: "Kenya" } },
                                                { start: { lat: -1.2921, lng: 36.8219, label: "Kenya" }, end: { lat: -15.7975, lng: -47.8919, label: "Brazil" } },
                                                { start: { lat: -15.7975, lng: -47.8919, label: "Brazil" }, end: { lat: 4.3947, lng: 114.0000, label: "Borneo" } },
                                                { start: { lat: 4.3947, lng: 114.0000, label: "Borneo" }, end: { lat: 51.5074, lng: -0.1278, label: "London" } },
                                                { start: { lat: 51.5074, lng: -0.1278, label: "London" }, end: { lat: 28.6139, lng: 77.2090, label: "New Delhi" } },
                                                { start: { lat: 28.6139, lng: 77.2090, label: "New Delhi" }, end: { lat: -33.8688, lng: 151.2093, label: "Sydney" } },
                                            ]}
                                        />
                                    </div>

                                    {/* Italic callout below map */}
                                    <p className="text-sm text-gray-600 italic leading-relaxed opacity-80" style={{ fontFamily: s.body }}>
                                        By combining advanced satellite intelligence, geospatial analytics, and machine learning, <span className="text-gray-900 not-italic font-normal">Sylithe continuously monitors ecosystems</span> to transform static reporting into a living verification engine.
                                    </p>

                                </motion.div>

                                {/* Content Side */}
                                <motion.div
                                    className="text-lg text-gray-700 leading-relaxed font-light flex flex-col justify-center h-full"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeUp}
                                >

                                    <div className="mb-12">
                                        <H3 className="text-2xl leading-relaxed mb-6">
                                            The global carbon market is built on a vital resource: <span className="text-[#16a34a]">Trust</span>. Yet, the legacy systems used to measure forest carbon remain frustratingly fragmented.
                                        </H3>
                                        <Body>
                                            Forests act as Earth's most powerful carbon sinks, but determining their true storage capacity requires understanding complex variables like structure, biomass, and disturbance history. Traditional monitoring relies heavily on limited field surveys and infrequent reporting. This creates dangerous blind spots between what forests actually store and what the market assumes.
                                        </Body>
                                    </div>





                                </motion.div>
                            </div>
                        </section>

                        {/* 
          ========================================================================
          VERIFICATION PIPELINE FLOW SECTION
          ========================================================================
        */}
                        <section className="py-24 px-6 md:px-12 lg:px-24 w-full w-full">
                            <motion.div
                                className="mb-16"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={fadeUp}
                            >
                                <SectionLabel className="mb-4">
                                    The Pipeline
                                </SectionLabel>
                                <H2>
                                    How Sylithe verifies forests,<br className="hidden md:block" /> step by step.
                                </H2>
                                <Body className="mt-4 max-w-2xl">
                                    Every analysis starts from a single project boundary and flows through our full-stack environmental intelligence engine.
                                </Body>
                            </motion.div>

                            {/* Vertical Flow Steps */}
                            <div className="flex flex-col relative">
                                {[
                                    {
                                        step: "01",
                                        label: "Import Project",
                                        sublabel: "KML / Boundary",
                                        desc: "Define the forest area of interest by uploading a KML project file with precise geographic boundaries. This anchors the entire analysis to your specific site.",
                                        img: imgImportKml,
                                    },
                                    {
                                        step: "02",
                                        label: "LULC",
                                        sublabel: "Land Use & Land Cover",
                                        desc: "Classify land use and land cover using multi-source satellite imagery to detect deforestation, degradation, agricultural conversion, and land-use change events.",
                                        img: imgLulc1,
                                    },
                                    {
                                        step: "03",
                                        label: "CHM",
                                        sublabel: "Canopy Height Model",
                                        desc: "Build a precise canopy height model across the entire forest boundary to understand vertical structure, tree density, and above-ground biomass potential.",
                                        img: imgChm11,
                                    },
                                    {
                                        step: "04",
                                        label: "DCAB",
                                        sublabel: "Disturbance & Carbon Adjustment Baseline",
                                        desc: "Apply historical disturbance data — including wildfires, selective logging, and land-use shifts — to dynamically adjust the carbon adjustment baseline for accurate reporting.",
                                        img: imgDcabNew,
                                    },
                                    {
                                        step: "05",
                                        label: "AGB",
                                        sublabel: "Above Ground Biomass",
                                        desc: "Calculate the total above-ground biomass to derive verified carbon stock estimates. The results are ready for third-party validation and carbon market reporting.",
                                        img: imgAgbChart,
                                    },
                                ].map((item, idx, arr) => (
                                    <motion.div
                                        key={item.step}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-50px" }}
                                        variants={fadeUp}
                                    >
                                        {/* Step Row */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-10">
                                            {/* Step Number */}
                                            <div className="lg:col-span-2 flex-shrink-0">
                                                <span className="font-heading text-7xl md:text-8xl font-black leading-none text-gray-200 select-none">
                                                    {item.step}
                                                </span>
                                            </div>

                                            {/* Text Content */}
                                            <div className="lg:col-span-6">
                                                <H3 className="text-3xl md:text-4xl mb-2">
                                                    {item.label}
                                                </H3>
                                                <SectionLabel className="mb-4">
                                                    {item.sublabel}
                                                </SectionLabel>
                                                <Body className="leading-relaxed max-w-xl">
                                                    {item.desc}
                                                </Body>
                                            </div>

                                            {/* Image OR Custom Component */}
                                            <div className="lg:col-span-4 flex justify-center items-center">
                                                <div className="group w-full flex justify-center">
                                                    {item.customComponent ? (
                                                        item.customComponent
                                                    ) : (
                                                        <img
                                                            src={item.img}
                                                            alt={item.label}
                                                            className="max-w-full h-auto max-h-56 object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating Animated Arrow between steps */}
                                        {idx < arr.length - 1 && (
                                            <div className="flex items-center gap-3 pl-4 lg:pl-16 py-2">
                                                <div className="flex items-center gap-2 animate-arrow-float">
                                                    {[0, 1, 2].map(i => (
                                                        <svg
                                                            key={i}
                                                            width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                            className="text-[#16a34a]"
                                                            style={{ opacity: 0.3 + i * 0.3, transform: `translateX(${i * 4}px)` }}
                                                        >
                                                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <div className="flex-1 h-[1px] bg-gradient-to-r from-gray-200 to-transparent"></div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* 
          ========================================================================
          THE IDEA BEHIND SYLITHE SECTION (REDESIGNED)
          ========================================================================
        */}
                        <section className="py-16 md:py-32 px-6 md:px-12 lg:px-24 mb-24 w-full w-full relative z-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                                {/* Content Side */}
                                <motion.div
                                    className="order-2 lg:order-1 text-lg text-gray-700 leading-relaxed font-light flex flex-col justify-center h-full"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeUp}
                                >

                                    <div className="mb-12">
                                        <SectionLabel className="mb-6">
                                            The Philosophy
                                        </SectionLabel>
                                        <H2 className="mb-8">
                                            A foundation built on <br className="hidden md:block" />ecological truth.
                                        </H2>
                                        <Body className="mb-6">
                                            The name <strong className="text-gray-900 font-normal">Sylithe</strong> is a direct reflection of our core philosophy.
                                        </Body>
                                        <Body>
                                            It exists at the exact intersection of deep ecology, satellite intelligence, and climate technology. We are building the definitive system where forests can be continuously monitored, objectively verified, and profoundly understood with rigorous scientific clarity.
                                        </Body>
                                    </div>

                                    {/* Manifesto Quote — plain and simple */}
                                    <div className="mt-2">
                                        <Body className="leading-relaxed">
                                            Together, the name represents our singular guiding principle:
                                        </Body>
                                        <H3 className="text-xl font-normal leading-snug">
                                            Building a solid foundation of <span className="text-[#16a34a]">trust</span> for forests and the new carbon economy.
                                        </H3>
                                    </div>
                                </motion.div>

                                {/* Visual Side with Name Breakdown */}
                                <motion.div
                                    className="order-1 lg:order-2 relative group h-full"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={fadeUp}
                                >

                                    {/* Main Image */}
                                    <div className="relative h-[600px] w-full flex justify-center items-center">
                                        <img
                                            src={imgTree22}
                                            alt="The Philosophy of Sylithe"
                                            className="w-full max-h-[500px] object-contain drop-shadow-2xl transform scale-105 transition-transform duration-700 group-hover:scale-100"
                                        />
                                    </div>


                                </motion.div>
                            </div>
                        </section>

                        {/* 
          ========================================================================
          FAQ SECTION
          ========================================================================
        */}
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
                    </BackgroundGlow>
                </div>
            </ScrollExpandMedia>
        </main>
    );
};

export default AboutUs;
