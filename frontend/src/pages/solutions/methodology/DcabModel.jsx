import React from 'react';
import SEOHead from '../../../components/SEOHead';
import { HiArrowRight } from "react-icons/hi";
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

// --- IMAGE IMPORTS ---
import dcabHeroImage from '../../../assets/dcab1.png';
import problemImage from '../../../assets/tree22.png';
import solutionImage from '../../../assets/tree22.png';
import counterfactualImage from '../../../assets/DCAB26.png';
import processImage from '../../../assets/DCAB25.png';
import methodologyImage from '../../../assets/tree22.png';
import forestImage from '../../../assets/home1.png';

// --- EXACT CARBON DIRECT STYLING FROM SCREENSHOTS ---
// Headings: Dark Teal (#08292F), Medium Weight
// Body: Dark Teal (#08292F), Regular Weight, 18px
// Accent: Light Green (#16a34a)
const cdStyle = {
  color: '#08292F',
  headingFont: 'var(--font-heading)',
  bodyFont: 'var(--font-body)',
  accentColor: '#16a34a',
  lightAccent: '#f7fce5',
};

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

// --- COMPONENTS ---

// Clean Image Component
const CleanImage = ({ src, alt, className = "", priority = false, square = false }) => (
  <div className={`w-full relative rounded-3xl overflow-hidden group shadow-sm ${square ? 'aspect-square bg-white flex items-center justify-center p-6' : 'h-full min-h-[400px]'} ${className}`}>
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={`w-full h-full transform group-hover:scale-105 transition-transform duration-1000 ease-out ${square ? 'object-contain' : 'object-cover'}`}
    />
  </div>
);

// Styled Heading Component (Matching Screenshot Typography)
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

// Styled Body Text Component (Matching Screenshot Typography)
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

// Styled Button Component (Pill Outline)
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

// --- MARQUEE REMOVED TO HOME PAGE ---

const DcabModel = () => {
  const faqs = [
    {
      question: "What is Dynamic Baseline Accounting in carbon markets?",
      answer: "Dynamic Baseline Accounting is an advanced methodology used to measure the true 'additionality' of a carbon project. Instead of relying on static historical data, it continuously compares the project area against similar, unmanaged 'control' areas to determine real-world deforestation pressures."
    },
    {
      question: "How does dynamic baselining improve carbon credit integrity?",
      answer: "Static historical baselines often overestimate carbon savings. Sylithe’s Dynamic Baseline Accounting continuously adjusts to real-world threats, ensuring that every carbon credit verified on our platform represents genuine, additional climate impact."
    },
    {
      question: "Is Dynamic Baseline Accounting required for Verra VM0047?",
      answer: "Yes, modern methodologies like Verra's consolidated REDD+ methodology (VM0047) increasingly mandate dynamic baselines and control areas to prevent over-crediting. Sylithe automates this complex spatial analysis."
    },
    {
      question: "How does Sylithe calculate dynamic baselines using satellites?",
      answer: "Sylithe uses continuous satellite intelligence to automatically monitor matched 'control areas' outside of your project boundary. If deforestation accelerates in the control area, the dynamic baseline adjusts automatically, providing an audit-ready additionality report."
    },
    {
      question: "What is the difference between a static baseline and a dynamic baseline?",
      answer: "A static baseline locks in deforestation predictions based on 10-year-old historical data. A dynamic baseline continuously updates based on what is actually happening in the surrounding region today, providing scientifically rigorous proof of impact."
    },
    {
      question: "How does Dynamic Baseline Accounting prevent carbon credit reversals?",
      answer: "By continuously tracking regional threat levels, dynamic baselines help project developers understand shifting deforestation fronts. This allows for proactive intervention before a reversal occurs, protecting the project's carbon buffer pool."
    }
  ];

  return (
    <div
      className="w-full bg-[#F1F1F1] pt-20 overflow-hidden"
      style={{ fontFamily: cdStyle.bodyFont, color: cdStyle.color }}
    >
      <SEOHead
        title="Dynamic Carbon Baseline for India Carbon Projects | Sylithe"
        description="Prove carbon additionality with dynamic baselines using matched control areas. ICM and Verra VM0047 aligned — the gold standard for dMRV."
        path="/methodology/dcab"
        speakableSelectors={['h1', '.dcab-hero-description']}
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
              Sylithe Baseline Confidence
            </span>

            <CDHeading as="h1" size="hero" className="mb-8">
              Baselines rooted in <span style={{ color: cdStyle.accentColor }}>reality</span>, not assumptions.
            </CDHeading>

            <div style={{ maxWidth: '520px' }}>
              <CDBody large className="mb-10">
                Our Dynamic Baseline Accounting proves your reforestation project is truly additional by comparing it to matched real-world controls that aren't part of any carbon program.
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
            </div>
          </motion.div>

          {/* Image Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <CleanImage src={dcabHeroImage} alt="Dynamic Baseline" priority={true} className="min-h-[500px]" />
          </motion.div>
        </div>
      </section>

      {/* ================= 2. THE CHALLENGE (Carbon Direct Style) ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto">

          {/* Header - Matching Carbon Direct "Our carbon removal options" style */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <CDHeading as="h2" size="section" className="mb-6">
              The challenge with current baselines
            </CDHeading>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <p
                className="text-xl text-gray-600 leading-relaxed"
                style={{ fontFamily: cdStyle.bodyFont }}
              >
                Carbon markets currently suffer from inflated credit issuance because static projections often assume zero background reforestation—even when trees would have grown anyway.
              </p>
            </div>
          </motion.div>

          {/* Two Cards Grid - Exact Carbon Direct Layout */}
          <motion.div
            className="grid md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerStagger}
          >
            {[
              {
                title: "Phantom Credits Risk",
                desc: "Static projections create non-additional credits that damage market integrity and expose buyers to greenwashing accusations.",
                cta: "Learn about additionality",
                link: "/methodology/lulc",
                img: problemImage
              },
              {
                title: "Regulatory Exposure",
                desc: "Emerging IC-VCM standards and buyer due diligence are increasingly rejecting projects with weak, assumption-based baselines.",
                cta: "Explore compliance standards",
                link: "/methodology/dcab",
                img: solutionImage
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemFade}
                className="flex flex-col items-start bg-[#F1F1F1] border border-gray-200 rounded-lg p-10 h-full hover:shadow-lg transition-shadow duration-300"
              >
                {/* Small Image Top (Not Full Width) */}
                <div className="mb-8 h-24 flex items-center justify-start">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-auto object-contain rounded-md"
                  />
                </div>

                {/* Title - Bold, Dark */}
                <h3
                  className="text-2xl font-bold mb-4 text-[#08292F]"
                  style={{ fontFamily: cdStyle.headingFont, lineHeight: '1.2' }}
                >
                  {item.title}
                </h3>

                {/* Description - Gray, Comfortable Reading */}
                <p
                  className="text-lg text-gray-600 leading-relaxed mb-8 flex-grow"
                  style={{ fontFamily: cdStyle.bodyFont }}
                >
                  {item.desc}
                </p>

                {/* Link - Forest Green with Arrow */}
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-2 font-bold text-lg transition-all hover:gap-3 mt-auto"
                  style={{
                    color: '#15803d', // Forest green like Carbon Direct
                    fontFamily: cdStyle.bodyFont
                  }}
                >
                  {item.cta}
                  <HiArrowRight className="text-xl" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* ================= 3. THE DCAB SOLUTION ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

          {/* Text Left */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <CDHeading as="h2" size="section" className="mb-8">
              Observe the counterfactual. Count only the difference.
            </CDHeading>

            <CDBody large className="mb-6">
              Instead of guessing what would have happened to your land, we find actual land that matches yours—same soil, same climate, same starting conditions.
            </CDBody>

            <CDBody>
              The difference between your forest growth and the control's growth? That's your real, additional climate impact.
            </CDBody>
          </motion.div>

          {/* Transparent Independent Image Right */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft} className="w-full flex justify-center items-center group">
            <img src={counterfactualImage} alt="ARR REDD+ Control Matching Analysis for Carbon Additionality India" className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105" />
          </motion.div>

        </div>
      </section>

      {/* ================= 4. HOW IT WORKS ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-y" style={{ borderColor: 'rgba(8, 41, 47, 0.06)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center max-w-4xl mx-auto mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <span
              className="font-medium tracking-widest uppercase text-sm mb-4 block"
              style={{ color: 'rgba(8, 41, 47, 0.5)', fontFamily: cdStyle.bodyFont }}
            >
              The Process
            </span>
            <CDHeading as="h2" size="section">From matching to verification.</CDHeading>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerStagger}
            >
              {[
                { step: "01", title: "Match", desc: "We algorithmically match your project to statistically similar non-project lands based on historical canopy height." },
                { step: "02", title: "Monitor", desc: "We track both your project and the control area annually using canopy height models." },
                { step: "03", title: "Compare", desc: "We calculate the difference in carbon accumulation between project and control." },
                { step: "04", title: "Credit", desc: "You earn credits only for additional carbon removed above the dynamic baseline." }
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

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
              <CleanImage src={processImage} alt="Process" className="min-h-[600px]" />
            </motion.div>
          </div>
        </div>
      </section>



      {/* ================= 6. WHY DYNAMIC ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#08292F] text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16">
            <span
              className="font-medium tracking-widest uppercase text-sm mb-4 block"
              style={{ color: cdStyle.accentColor, fontFamily: cdStyle.bodyFont }}
            >
              Why Dynamic Baselines
            </span>
            <CDHeading as="h2" size="section" className="!text-white max-w-3xl">
              Static guesses can't capture reality. Observation can.
            </CDHeading>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: "Empirically Tested", desc: "Validate matching using 'pseudo-projects'—random non-project areas where we prove the method works." },
              { title: "Annually Updated", desc: "Captures changing commodity prices, policy shifts, and climate events that static projections miss." },
              { title: "Standards Aligned", desc: "Compliant with VM0047 for Afforestation & Reforestation. Recognized by IC-VCM." }
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

      {/* ================= 7. METHODOLOGY ================= */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <CDHeading as="h2" size="section" className="mb-8">
              The science of statistical matching.
            </CDHeading>

            <CDBody large className="mb-6">
              DCAB relies on the principle of causal inference: if two plots of land are statistically identical at the start, their divergence can be attributed to the intervention.
            </CDBody>

            <CDBody className="mb-8">
              Our methodology employs k-Nearest Neighbor matching on canopy height trajectories.
            </CDBody>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="flex flex-col">
                <div className="text-5xl font-medium mb-2" style={{ color: cdStyle.accentColor, fontFamily: cdStyle.headingFont }}>
                  &lt;1m
                </div>
                <div className="text-lg font-medium" style={{ color: cdStyle.color, fontFamily: cdStyle.bodyFont }}>
                  Target Uncertainty
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-5xl font-medium mb-2" style={{ color: cdStyle.accentColor, fontFamily: cdStyle.headingFont }}>
                  95%
                </div>
                <div className="text-lg font-medium" style={{ color: cdStyle.color, fontFamily: cdStyle.bodyFont }}>
                  Confidence Intervals
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <CleanImage src={methodologyImage} alt="Methodology" className="min-h-[500px]" />
          </motion.div>
        </div>
      </section>

      {/* ================= 8. STANDARDS MARQUEE REMOVED ================= */}

      {/* ================= 9. SYLITHE APPROACH ================= */}
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
                  Our Philosophy
                </span>
                <CDHeading as="h2" size="card" className="mb-6">
                  Integrity through observation.
                </CDHeading>
                <CDBody large className="mb-6">
                  Sylithe is built on the belief that carbon markets deserve measurement systems as rigorous as financial auditing.
                </CDBody>
                <CDBody className="mb-0">
                  By treating additionality as an empirical question, we restore confidence in nature-based carbon removal.
                </CDBody>
              </div>
              <div className="hidden md:block">
                <img src={forestImage} alt="Forest Carbon Credit Development India under VM0047" className="rounded-2xl shadow-lg w-full object-cover h-64" />
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
              Eliminate baseline risk from<br />
              <span style={{ color: cdStyle.accentColor }}>your portfolio.</span>
            </CDHeading>
            <div className="max-w-2xl mx-auto mb-10">
              <CDBody large>
                Get a dynamic baseline analysis for your ARR project and issue credits with confidence.
              </CDBody>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="px-10 py-4 rounded-full font-medium text-lg text-white transition-all shadow-xl active:scale-95 hover:bg-[#08292f] flex items-center justify-center"
                style={{ backgroundColor: '#062125', fontFamily: cdStyle.bodyFont }}
              >
                Assess your baseline
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DcabModel;