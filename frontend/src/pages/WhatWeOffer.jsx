import React, { useState } from 'react';
import SEOHead from '../components/SEOHead';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowRight, HiChevronDown } from "react-icons/hi";
import {
  TbBuilding, TbCoin, TbPlant2, TbBuildingBank,
  TbChartBar, TbShieldCheck, TbFileReport, TbCloudStorm,
  TbTruckDelivery, TbMap2, TbSearch, TbChartPie,
  TbBriefcase, TbSatellite, TbCertificate, TbDeviceAnalytics,
  TbTrees, TbLeaf, TbAtom, TbAlertTriangle,
  TbWorld
} from "react-icons/tb";
import { motion, AnimatePresence } from 'framer-motion';

// --- IMAGE IMPORTS ---
import corporateImage from '@/assets/corporate_tower.png';
import buyerImage from '@/assets/home1.png';
import developerImage from '@/assets/lulc1.png';
import governmentImage from '@/assets/gov_lulc.png';
import forestImage from '@/assets/home1.png';
import satelliteProcessImage from '@/assets/chm22.png';
import biomassCarbonImage from '@/assets/agb-chart-nobg.png';
import lulcClassificationImage from '@/assets/lulc8.png';
import climateRiskImage from '@/assets/DCAB25.png';

// --- DESIGN TOKENS (Standard Sylithe System) ---
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
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.13 } } };
const itemFade = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const slideInLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } } };

// --- TYPOGRAPHY COMPONENTS ---
const CDHeading = ({ children, className = "", as = "h2", size = "large", color }) => {
  const Component = as;
  const sizeClasses = {
    hero: 'text-5xl md:text-6xl lg:text-7xl',
    section: 'text-4xl md:text-5xl',
    card: 'text-2xl md:text-3xl',
  };
  return (
    <Component
      className={`font-normal tracking-tight mb-6 ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: 'var(--font-heading)',
        color: color || s.color,
        lineHeight: size === 'hero' ? '1.15' : '1.2',
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </Component>
  );
};

const CDBody = ({ children, className = "", large = false, color }) => (
  <p
    className={`${large ? 'text-lg md:text-xl' : 'text-base md:text-lg'} ${className}`}
    style={{
      fontFamily: 'var(--font-body)',
      lineHeight: '1.7',
      color: color || s.color,
      opacity: 0.8,
      fontWeight: '400',
    }}
  >
    {children}
  </p>
);

const H1 = (props) => <CDHeading as="h1" size="hero" {...props} />;
const H2 = (props) => <CDHeading as="h2" size="section" {...props} />;
const H3 = (props) => <CDHeading as="h3" size="card" {...props} />;
const Body = (props) => <CDBody {...props} />;

// --- REUSABLE COMPONENTS ---

const SectionLabel = ({ children }) => (
  <span className="font-medium tracking-widest uppercase text-xs mb-4 block" style={{ color: s.accent, fontFamily: s.body }}>
    {children}
  </span>
);

const PillButton = ({ children, outline = false, onClick }) => (
  <button
    onClick={onClick}
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

// Stakeholder Card matching AgbCalculation "Process" visual style
const StakeholderCard = ({ id, label, src, scrollTo }) => (
  <motion.button
    variants={itemFade}
    onClick={() => scrollTo(id)}
    className="bg-[#FAF9F6] rounded-3xl p-4 flex flex-col gap-4 shadow-sm border border-black/5 group cursor-pointer hover:shadow-md transition-shadow duration-500 w-full"
  >
    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white">
      <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
    </div>
    <div className="flex items-center justify-between px-1 w-full">
      <span className="font-semibold text-[#08292F] tracking-tight text-lg" style={{ fontFamily: s.body }}>{label}</span>
      <HiArrowRight className="text-black/30 group-hover:text-[#16a34a] group-hover:translate-x-1 transition-all" />
    </div>
  </motion.button>
);

// Solution Card with independent expansion handled by parent
const SolutionCard = ({ icon: Icon, title, description, features, outputs, learnMore, isOpen, onToggle }) => {
  return (
    <motion.div
      variants={itemFade}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-8 flex items-start gap-6"
      >
        <div className="p-4 bg-[#f0fdf4] rounded-xl shrink-0" style={{ backgroundColor: s.accentSoft }}>
          <Icon className="text-2xl" style={{ color: s.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="text-xl font-bold mb-2"
            style={{ color: s.color, fontFamily: s.heading }}
          >
            {title}
          </h4>
          <p className="text-gray-500 text-[15px] leading-relaxed" style={{ fontFamily: s.body }}>
            {description}
          </p>
        </div>
        <HiChevronDown className={`text-xl text-gray-400 shrink-0 mt-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-10 pt-2 grid md:grid-cols-2 gap-10 bg-gray-50/50">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Features</p>
                <ul className="space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-[7px] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Outputs</p>
                <ul className="space-y-3">
                  {outputs.map((o, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#08292F] mt-[7px] shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
                {learnMore && (
                  <Link
                    to={learnMore.to}
                    className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#16a34a] hover:gap-2.5 transition-all"
                  >
                    {learnMore.label}
                    <HiArrowRight />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Stakeholder Section with accordion logic
const StakeholderSection = ({ id, icon: Icon, label, title, subtitle, problems, solutions, dark = false }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();
  const bg = dark ? 'bg-[#08292F]' : 'bg-[#F1F1F1]';
  const textColor = dark ? 'text-white' : 'text-[#08292F]';
  const subtextColor = dark ? 'text-gray-300' : 'text-gray-500';
  const pillBg = dark ? 'bg-white/10' : 'bg-white border-gray-200';
  const pillText = dark ? 'text-[#a4fca1]' : 'text-[#16a34a]';

  return (
    <section id={id} className={`py-32 px-6 md:px-12 lg:px-24 ${bg} border-b`} style={{ borderColor: s.border }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-20"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        >
          <div className={`inline-flex items-center gap-3 px-5 py-2 border rounded-full ${pillBg} mb-8 shadow-sm`}>
            <Icon className={`text-lg ${pillText}`} />
            <span className={`text-[11px] font-bold uppercase tracking-widest ${pillText}`}>{label}</span>
          </div>
          <H2 color={dark ? 'white' : s.color} className="max-w-3xl mb-6">
            {title}
          </H2>
          <Body large color={dark ? 'rgba(255,255,255,0.7)' : 'rgba(8,41,47,0.7)'} className="max-w-2xl">
            {subtitle}
          </Body>
        </motion.div>

        {/* Problems (Key Challenges) - Rounded Pills */}
        <motion.div
          className="mb-20"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        >
          <p className={`text-[11px] font-bold uppercase tracking-widest mb-6 ${subtextColor}`}>Key Challenges</p>
          <div className="flex flex-wrap gap-3">
            {problems.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full border bg-white shadow-sm hover:translate-y-[-1px] transition-all cursor-default"
                style={{ borderColor: s.border }}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                <span className="text-[14px] font-medium" style={{ color: s.color, fontFamily: s.body }}>{p}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Solutions Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 items-start mb-16"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          {solutions.map((sl, i) => (
            <SolutionCard
              key={i}
              {...sl}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* Dashboard CTA */}
        <motion.div
          className="flex justify-center"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        >
          <button
            onClick={() => {
              const routeMap = {
                corporates: 'corporate',
                buyers: 'investor',
                developers: 'developer',
                governments: 'government'
              };
              navigate(`/dashboard/${routeMap[id]}`);
            }}
            className={`group px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-2xl ${dark
              ? 'bg-[#a4fca1] text-[#08292F] hover:bg-white'
              : 'bg-[#08292F] text-white hover:bg-[#16a34a]'
              }`}
          >
            Explore {label} Dashboard
            <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

const stakeholdersList = [
  { id: 'corporates', label: 'Corporates', src: corporateImage },
  { id: 'buyers', label: 'Buyers & Investors', src: buyerImage },
  { id: 'developers', label: 'Project Developers', src: developerImage },
  { id: 'governments', label: 'Governments', src: governmentImage },
];

const WhatWeOffer = () => {
  const navigate = useNavigate();
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="w-full bg-[#F1F1F1] pt-20 overflow-hidden" style={{ fontFamily: s.body, color: s.color }}>
      <SEOHead
        title="Carbon Credit Solutions India — For Corporates, Buyers & Developers | Sylithe"
        description="Satellite-powered carbon credit solutions for carbon compliance, ESG reporting, offset verification & project MRV in India. ICM-aligned. Verra-ready. Explore solutions."
        keywords="carbon credit solutions India, carbon compliance India, carbon offset verification India, ESG reporting India, carbon credit buyers India, carbon project developers India, dMRV solutions India, nature-based solutions India, carbon market India"
        path="/what-we-offer"
      />

      {/* ===== HERO (Static, Rounded) ===== */}
      <section className="pt-24 pb-32 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-b" style={{ borderColor: s.border }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">

          <motion.div initial="hidden" animate="visible" variants={itemFade}>
            <SectionLabel>Platform Offerings</SectionLabel>
            <H1>
              Climate <br />
              intelligence for <br />
              <span className="text-[#16a34a] whitespace-nowrap">every stakeholder.</span>
            </H1>
            <Body large className="mb-12 max-w-[540px]">
              Sylithe combines satellite data, AI models, and geospatial analytics to measure environmental impact, verify carbon projects, and deliver climate risk intelligence tailored to your role.
            </Body>
            <div className="flex flex-col sm:flex-row gap-6">
              <PillButton onClick={() => navigate('/signup')}>Request a demo</PillButton>
              <PillButton outline onClick={() => scrollTo('corporates')}>Explore offerings</PillButton>
            </div>
          </motion.div>

          {/* Right — Static rounded cards */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            initial="hidden" animate="visible" variants={stagger}
          >
            {stakeholdersList.map((st) => (
              <StakeholderCard key={st.id} {...st} scrollTo={scrollTo} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STICKY NAV ===== */}
      <div className="sticky top-20 z-40 bg-[#F1F1F1]/95 backdrop-blur-md border-b" style={{ borderColor: s.border }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex gap-4 py-5 overflow-x-auto scrollbar-hide">
          {stakeholdersList.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="flex items-center gap-3 px-6 py-3 rounded-full border text-[14px] font-bold text-gray-600 hover:bg-[#08292F] hover:text-white hover:border-[#08292F] transition-all whitespace-nowrap shrink-0 active:scale-95"
              style={{ borderColor: s.border, background: 'white' }}
            >
              <TbBuilding className="text-lg" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== 1. CORPORATES ===== */}
      <StakeholderSection
        id="corporates"
        icon={TbBuilding}
        label="For Corporates"
        title="Measure, manage, and reduce your environmental impact."
        subtitle="Comply with ESG regulations, verify carbon offsets, assess climate risks, and monitor supply chains all from one platform."
        problems={[
          'Scope 1, 2, 3 emission measurement',
          'Unreliable carbon offset verification',
          'Manual ESG reporting',
          'Climate risk to supply chains',
          'Increasing regulatory pressure'
        ]}
        solutions={[
          {
            icon: TbChartBar,
            title: 'Carbon Footprint Dashboard',
            description: 'Measure total corporate emissions across all scopes with real-time visualization and reduction planning.',
            features: ['Scope 1, 2, 3 emission calculation', 'Carbon footprint visualization', 'Emission trend tracking', 'Reduction planning tools'],
            outputs: ['Corporate carbon footprint reports', 'Net-zero progress tracking']
          },
          {
            icon: TbShieldCheck,
            title: 'Carbon Offset Verification',
            description: 'Verify carbon credits before purchasing using satellite-based project monitoring and biomass analysis.',
            features: ['Satellite-based project verification', 'Forest health monitoring', 'Deforestation detection', 'Carbon stock analysis'],
            outputs: ['Verified carbon credit validation reports', 'Risk analysis for offset projects']
          },
          {
            icon: TbFileReport,
            title: 'ESG Reporting Automation',
            description: 'Automatically generate investor-ready ESG and sustainability reports with integrated compliance tracking.',
            features: ['ESG metrics dashboard', 'Compliance reports for regulators', 'Sustainability KPI tracking', 'Automated data integration'],
            outputs: ['Investor-ready ESG reports', 'Sustainability disclosures']
          },
          {
            icon: TbCloudStorm,
            title: 'Climate Risk Intelligence',
            description: 'Assess flood, heat, drought, and wildfire risks to business operations and infrastructure.',
            features: ['Flood risk analysis', 'Heat risk mapping', 'Drought monitoring', 'Wildfire risk predictions'],
            outputs: ['Risk reports for infrastructure', 'Climate risk maps']
          },
          {
            icon: TbTruckDelivery,
            title: 'Supply Chain Environmental Monitoring',
            description: 'Track environmental impact and deforestation alerts across your entire supply chain.',
            features: ['Supplier land-use monitoring', 'Deforestation alerts', 'Environmental compliance tracking'],
            outputs: ['Sustainable supply chain reports']
          }
        ]}
      />

      {/* ===== 2. BUYERS & INVESTORS ===== */}
      <StakeholderSection
        id="buyers"
        icon={TbCoin}
        label="For Buyers & Investors"
        title="Identify high-quality projects. Avoid fraudulent credits."
        subtitle="Discover verified carbon projects, independently validate credits, evaluate investment risks, and manage your carbon portfolio."
        dark
        problems={[
          'Low market transparency',
          'Difficulty verifying project impact',
          'Lack of reliable environmental data',
          'Risk of fake carbon credits'
        ]}
        solutions={[
          {
            icon: TbMap2,
            title: 'Carbon Project Discovery Platform',
            description: 'Discover and explore verified carbon projects worldwide with impact metrics and investment opportunities.',
            features: ['Interactive map of global carbon projects', 'Project impact metrics', 'Carbon credit availability', 'Investment opportunities'],
            outputs: ['Verified project listings']
          },
          {
            icon: TbSearch,
            title: 'Carbon Credit Verification Engine',
            description: 'Independent satellite-based verification of carbon credits with continuous monitoring and impact validation.',
            features: ['Satellite monitoring of project sites', 'Biomass and carbon estimation', 'Land use change detection', 'Continuous monitoring'],
            outputs: ['Carbon credit verification score', 'Impact validation reports']
          },
          {
            icon: TbAlertTriangle,
            title: 'Investment Risk Analysis',
            description: 'Evaluate environmental integrity, project longevity, and fraud risk before committing capital.',
            features: ['Environmental integrity score', 'Project longevity analysis', 'Fraud detection algorithms'],
            outputs: ['Investment risk reports']
          },
          {
            icon: TbChartPie,
            title: 'Carbon Portfolio Management',
            description: 'Track carbon credit investments, offset impact, and credit retirement in a unified portfolio dashboard.',
            features: ['Portfolio dashboard', 'Carbon offset impact tracking', 'Credit retirement monitoring'],
            outputs: ['Portfolio analytics reports']
          }
        ]}
      />

      {/* ===== 3. PROJECT DEVELOPERS ===== */}
      <StakeholderSection
        id="developers"
        icon={TbPlant2}
        label="For Project Developers"
        title="Create, monitor, and verify carbon projects."
        subtitle="From reforestation to blue carbon plan projects, run continuous MRV, and accelerate credit issuance with satellite intelligence."
        problems={[
          'Expensive carbon verification',
          'Manual MRV processes',
          'Slow credit certification',
          'Lack of monitoring tools'
        ]}
        solutions={[
          {
            icon: TbBriefcase,
            title: 'Project Development Tools',
            description: 'Assess land suitability, estimate carbon potential, and model environmental impact before breaking ground.',
            features: ['Land suitability analysis', 'Carbon potential estimation', 'Environmental impact modeling'],
            outputs: ['Project feasibility reports']
          },
          {
            icon: TbSatellite,
            title: 'Continuous MRV',
            description: 'Monitor project performance continuously with satellite-based forest growth tracking and biomass estimation.',
            features: ['Satellite monitoring', 'Forest growth tracking', 'Biomass estimation', 'Land use monitoring'],
            outputs: ['Continuous MRV reports']
          },
          {
            icon: TbCertificate,
            title: 'Carbon Credit Issuance Support',
            description: 'Automate carbon stock calculations and compliance reporting to accelerate credit certification.',
            features: ['Carbon stock calculations', 'Compliance with carbon standards', 'Automated reporting'],
            outputs: ['Carbon credit documentation']
          },
          {
            icon: TbDeviceAnalytics,
            title: 'Project Monitoring Dashboard',
            description: 'Real-time satellite imagery updates, environmental change detection, and degradation alerts.',
            features: ['Satellite imagery updates', 'Environmental change detection', 'Alerts for deforestation or degradation'],
            outputs: ['Project monitoring analytics']
          },
          {
            icon: TbAtom,
            title: 'Biochar Carbon Removal (BCR)',
            description: 'Durable CDR MRV for pyrolysis projects — verified feedstock, traceable batches, and audit-ready evidence from kiln to field.',
            features: ['Satellite feedstock sourcing checks', 'Pyrolysis batch & temperature records', 'H:Corg and lab certificate tracking', 'QR chain of custody to application plot'],
            outputs: ['Puro.earth / VM0044-aligned evidence pack'],
            learnMore: { to: '/project-types/biochar', label: 'Explore Biochar Carbon Removal' }
          }
        ]}
      />

      {/* ===== 4. GOVERNMENTS ===== */}
      <StakeholderSection
        id="governments"
        icon={TbBuildingBank}
        label="For Governments"
        title="Monitor ecosystems. Enforce policy. Meet climate commitments."
        subtitle="National-scale land use monitoring, forest health tracking, carbon accounting, compliance enforcement, and climate policy decision support."
        dark
        problems={[
          'Difficulty monitoring forests at scale',
          'Lack of real-time environmental data',
          'Inefficient climate policy enforcement',
          'Limited transparency in carbon projects'
        ]}
        solutions={[
          {
            icon: TbWorld,
            title: 'National Land Use Monitoring',
            description: 'Track LULC changes, deforestation, urban expansion, and agricultural land across the entire country.',
            features: ['LULC classification', 'Deforestation detection', 'Urban expansion monitoring', 'Agricultural land tracking'],
            outputs: ['National land use reports']
          },
          {
            icon: TbTrees,
            title: 'Forest & Biodiversity Monitoring',
            description: 'Track forest cover, biodiversity indicators, and habitat change detection at ecosystem scale.',
            features: ['Forest cover monitoring', 'Biodiversity indicators', 'Habitat change detection'],
            outputs: ['Forest health reports']
          },
          {
            icon: TbLeaf,
            title: 'Carbon Accounting Infrastructure',
            description: 'Track national carbon emissions and sinks with satellite-derived carbon stock estimation.',
            features: ['Carbon stock estimation', 'Emission tracking', 'Climate mitigation analysis'],
            outputs: ['National carbon inventory']
          },
          {
            icon: TbAlertTriangle,
            title: 'Environmental Compliance Monitoring',
            description: 'Detect illegal deforestation, unauthorized mining, and protected area violations in real time.',
            features: ['Illegal deforestation detection', 'Mining activity monitoring', 'Protected area surveillance'],
            outputs: ['Enforcement alerts']
          },
          {
            icon: TbAtom,
            title: 'Climate Policy Decision Support',
            description: 'Scenario modeling, environmental impact forecasts, and policy simulation tools for informed decision-making.',
            features: ['Climate scenario modeling', 'Environmental impact forecasts', 'Policy simulation tools'],
            outputs: ['Policy decision dashboards']
          }
        ]}
      />

      {/* ===== CORE CAPABILITIES ===== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-white border-t" style={{ borderColor: s.border }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-24"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <SectionLabel>Platform Infrastructure</SectionLabel>
            <H2 className="mb-6 mx-auto" style={{ maxWidth: 800 }}>
              Built on satellite data + AI climate models.
            </H2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            {[
              { image: satelliteProcessImage, title: 'Satellite Image Processing', desc: 'Multi-source ingestion of optical, SAR, and LiDAR data streams.' },
              { image: biomassCarbonImage, title: 'Biomass & Carbon Modeling', desc: 'LiDAR-calibrated canopy height and above-ground biomass estimation.' },
              { image: lulcClassificationImage, title: 'LULC Classification', desc: 'Time-series land use and land cover analysis at 10m resolution.' },
              { image: climateRiskImage, title: 'Climate Risk Analytics', desc: 'Flood, drought, heat, and wildfire risk assessment and forecasting.' },
            ].map(({ image: src, title, desc }, i) => (
              <motion.div
                key={i}
                variants={itemFade}
                className="bg-[#F9FAF8] p-10 rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 bg-transparent">
                  <img src={src} alt={title} className="w-full h-full object-contain" />
                </div>
                <H3 className="mb-4 text-xl" style={{ color: s.color }}>{title}</H3>
                <Body className="text-[15px]" color={s.muted}>{desc}</Body>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#08292F] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${forestImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-[#08292F]/80" />

        <motion.div
          className="max-w-3xl mx-auto relative z-10"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        >
          <H1 color="white" className="mb-10 lg:text-8xl">
            Ready to build with <span className="text-[#16a34a]">Sylithe?</span>
          </H1>
          <Body large color="rgba(255,255,255,0.7)" className="mb-12 max-w-xl mx-auto">
            Whether you're a corporate, investor, developer, or government — Sylithe delivers the climate intelligence you need.
          </Body>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#16a34a] text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-[#08292F] transition-all shadow-2xl active:scale-95"
            >
              Contact Us
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default WhatWeOffer;
