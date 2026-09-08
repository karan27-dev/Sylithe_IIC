import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Axe, Users, Ruler,
  LineChart, FileCheck2, Layers, Satellite, MapPinned, ShieldAlert,
} from 'lucide-react';

import SEOHead from '../../components/SEOHead';
import reddFrameworkImage from '../../assets/redd+.png';
import controlAreaImage from '../../assets/DynamicBaselineBlog.png';
import detectionImage from '../../assets/detectDeforestation.png';
import driversImage from '../../assets/DEFORESTATION RISK.png';
import heroImage from '../../assets/leakageHero.png';
import overviewImage from '../../assets/aiDetectDeforestation.png';
import verraLogo from '../../assets/verra logo.png';
import icVcmLogo from '../../assets/Ic VCM logo.png';
import beeLogo from '../../assets/bee-logo (1).png';
import { Helmet } from 'react-helmet-async';

/* ─── ANIMATION VARIANTS (matched to the biochar page) ──────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── SHARED PRIMITIVES ─────────────────────────────────────────────────── */
const SectionHeading = ({ children, className = '' }) => (
  <h2 className={`text-4xl md:text-5xl font-normal text-[#0F172A] leading-tight mb-6 ${className}`}>
    {children}
  </h2>
);

const SectionLabel = ({ children, className = '' }) => (
  <span className={`text-[#16a34a] font-medium tracking-wide uppercase text-xs mb-6 block ${className}`}>
    {children}
  </span>
);

const bodyStyle = 'text-base md:text-lg text-slate-600 leading-[1.7] mb-6 font-normal';

/* ─── EDITORIAL LONG-FORM PRIMITIVES ────────────────────────────────────────
   Heading parked in a narrow left column, prose and media in a wider right
   column, with a rule between blocks. Same treatment as the biochar page.
--------------------------------------------------------------------------- */
const Editorial = ({ eyebrow, title, children }) => (
  <motion.div
    className="grid lg:grid-cols-12 gap-y-8 gap-x-8 lg:gap-x-16 py-14 md:py-16 border-t border-slate-400"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={stagger}
  >
    <div className="lg:col-span-4 lg:self-start lg:sticky lg:top-28">
      {eyebrow && (
        <p className="text-[11px] tracking-widest text-[#16a34a] uppercase font-bold mb-3">
          {eyebrow}
        </p>
      )}
      <h3 className="text-2xl md:text-[30px] font-normal text-[#0F172A] leading-[1.28]">
        {title}
      </h3>
    </div>
    <motion.div variants={slideInRight} className="lg:col-span-7 lg:col-start-6">
      {children}
    </motion.div>
  </motion.div>
);

const P = ({ children }) => (
  <p className="text-[16px] md:text-[17px] leading-[1.75] text-slate-600 mb-5 last:mb-0">
    {children}
  </p>
);

const B = ({ children }) => <strong className="font-semibold text-[#0F172A]">{children}</strong>;

const Bullets = ({ items }) => (
  <ul className="my-7 space-y-4">
    {items.map(({ lead, text }) => (
      <li key={lead} className="flex gap-3.5">
        <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-[#16a34a] shrink-0" />
        <span className="text-[16px] md:text-[17px] leading-[1.7] text-slate-600">
          <B>{lead}</B>: {text}
        </span>
      </li>
    ))}
  </ul>
);

const BlockImage = ({ src, alt, caption }) => (
  <figure className="mt-8 border border-[#0F172A] bg-white p-3">
    <img src={src} alt={alt} className="w-full h-auto object-contain" loading="lazy" />
    {caption && (
      <figcaption className="mt-3 px-1 text-[13px] leading-snug text-slate-500">
        {caption}
      </figcaption>
    )}
  </figure>
);

const Callout = ({ children }) => (
  <div className="mt-7 border border-[#0F172A] bg-white/50 px-6 py-5">
    <p className="text-[15px] leading-relaxed text-slate-700">{children}</p>
  </div>
);

/* ─── PAGE ──────────────────────────────────────────────────────────────── */
const ReddPlus = () => {
  /* Stat strip */
  const heroStats = [
    { value: '5', label: 'activities recognised under the UNFCCC framework' },
    { value: '2013', label: 'Warsaw Framework agreed at COP 19' },
    { value: '~11%', label: 'of global emissions from deforestation' },
    { value: '3', label: 'phases: readiness, implementation, results-based finance' },
  ];

  /* Quick facts */
  const quickFacts = [
    {
      label: 'What it is',
      head: 'An emission avoided, not a tonne removed',
      text: 'REDD+ credits forest that stays standing when the counterfactual said it would not. That makes it an avoidance instrument, and buyers increasingly account for it on a separate line from removals rather than treating the two as interchangeable.',
    },
    {
      label: 'The hard part',
      head: 'The baseline is the entire argument',
      text: 'Nothing physical marks the difference between a protected forest and a forest that was never threatened. The credit exists only in the gap between observed loss and predicted loss, which is why baseline construction attracts more scrutiny here than anywhere else in the market.',
    },
    {
      label: 'Where it applies',
      head: 'Forests under real, demonstrable pressure',
      text: 'A credible project sits where deforestation drivers are active and documentable: an advancing agricultural frontier, a new road, a commodity price shift. Where the pressure cannot be evidenced from the landscape record, the additionality case does not survive contact with a rater.',
    },
  ];

  /* What has to be evidenced */
  const processSteps = [
    {
      n: '01',
      icon: MapPinned,
      title: 'At the boundary',
      text: 'Establish forest cover and its condition inside the project area from the satellite archive, so the starting stock is an observation rather than an inventory estimate.',
    },
    {
      n: '02',
      icon: LineChart,
      title: 'At the baseline',
      text: 'Build the counterfactual from comparable land facing the same drivers, and keep testing it against what that land actually does across the crediting period.',
    },
    {
      n: '03',
      icon: Satellite,
      title: 'At the frontier',
      text: 'Detect loss and degradation as it happens, across the project and the surrounding landscape, so both performance and leakage are caught in the period they occur.',
    },
    {
      n: '04',
      icon: FileCheck2,
      title: 'At the ledger',
      text: 'Convert avoided loss into CO₂e through documented carbon densities, then reconcile against safeguards reporting and national accounting to avoid double counting.',
    },
  ];

  /* Project archetypes */
  const projectModels = [
    {
      icon: Axe,
      tag: 'Frontier',
      title: 'Advancing deforestation frontier',
      text: 'Forest under active, visible pressure from an approaching agricultural or extractive frontier. The additionality case is the strongest available, but leakage risk is correspondingly high because the driver does not disappear when the boundary is drawn.',
      points: ['Clear, documentable driver', 'Strong additionality case', 'High leakage exposure', 'Needs landscape-wide monitoring'],
    },
    {
      icon: Users,
      tag: 'Community',
      title: 'Community-held and tenure-based',
      text: 'Forest managed by the communities living in it, where the project funds enforcement, alternative livelihoods and tenure security. Outcomes are durable when governance is real, and the safeguards reporting carries as much weight with buyers as the tonnage does.',
      points: ['Tenure and rights evidence', 'Benefit-sharing transparency', 'Slower, steadier avoided loss', 'Safeguards reporting central'],
    },
  ];

  /* Where Sylithe's dMRV layer plugs into a REDD+ project */
  const mrvLayers = [
    {
      icon: Layers,
      title: 'Dynamic control-area baselines',
      text: 'The counterfactual is built from land outside the boundary facing the same drivers, and re-tested every period, so the benchmark moves with the commodity cycle and the drought instead of freezing an assumption from the PDD.',
    },
    {
      icon: ShieldAlert,
      title: 'Loss and degradation detection',
      text: 'Optical and radar time series flag clearing and thinning as they appear, including under cloud and canopy, which turns monitoring into an alerting system rather than an annual retrospective.',
    },
    {
      icon: Ruler,
      title: 'Landscape-scale leakage view',
      text: 'Monitoring extends well beyond the project boundary, because activity displaced ten kilometres away is invisible to a narrow leakage belt and fatal to the claim when a rater finds it first.',
    },
  ];

  /* Crediting routes */
  const standards = [
    {
      abbr: 'VCS',
      logo: verraLogo,
      name: 'Verra VM0048',
      desc: 'The consolidated REDD methodology, which moved baseline setting away from project-developed projections toward jurisdictional allocations and independently produced risk maps.',
    },
    {
      abbr: 'IC-VCM',
      logo: icVcmLogo,
      name: 'Core Carbon Principles',
      desc: 'The integrity bar above the registries. CCP assessment of REDD+ methodologies has become the practical filter most corporate buyers apply before an avoidance credit enters a portfolio.',
    },
    {
      abbr: 'BEE',
      logo: beeLogo,
      name: 'Indian Carbon Market / CCTS',
      desc: 'India carries substantial forest under documented pressure alongside strong community tenure law. Sylithe structures evidence so it can travel into the domestic framework as it matures.',
    },
  ];

  /* FAQ — also emitted as FAQPage JSON-LD */
  const faqs = [
    {
      question: 'What does REDD+ actually stand for?',
      answer: 'REDD stands for reducing emissions from deforestation and forest degradation in developing countries. The plus covers three further forest-related activities recognised under the UNFCCC framework: sustainable management of forests, conservation of forest carbon stocks, and enhancement of forest carbon stocks. Together that gives five eligible activities. The framework was agreed as a set of decisions at COP 19 in Warsaw in 2013, and it sets out the basic rules covering national forest monitoring systems, forest reference emission levels, safeguards, measurement, reporting and verification, and results-based finance.',
    },
    {
      question: 'How is REDD+ different from an ARR project?',
      answer: 'They sit on opposite sides of the same ledger. ARR removes carbon from the atmosphere by growing new biomass, so the credit corresponds to a physical increase in stock that can be measured directly. REDD+ avoids an emission that would otherwise have happened, so the credit corresponds to a difference between observed forest loss and predicted forest loss. Nothing physical marks that difference, which is why the baseline carries the entire weight of the claim and why most serious buyers now hold avoidance and removals on separate lines.',
    },
    {
      question: 'Why did REDD+ credits face so much criticism?',
      answer: 'The core issue was baseline construction. Under earlier methodologies, project developers had significant latitude to select reference regions and project future deforestation rates, and independent analysis found that many projects had assumed far more forest loss than comparable land actually experienced. The result was over-crediting rather than fabrication, but the effect on buyer confidence was the same. The response has been structural: consolidated methodologies that move baseline setting to jurisdictional allocations and independently produced risk maps, and integrity assessment above the registry level.',
    },
    {
      question: 'What is leakage, and why is it so hard to catch?',
      answer: 'Leakage is deforestation that the project displaces rather than prevents. If the driver is an agricultural frontier and the project fences off one block, the clearing may simply move. Conventional monitoring watches a narrow belt around the boundary, typically a few kilometres wide, which catches displacement that moves a short distance and misses displacement that jumps. Landscape-scale monitoring across the whole driver catchment is the only way to see the second kind, and it is the kind that damages a credit most when a rater finds it first.',
    },
    {
      question: 'What are the safeguards and why do buyers ask about them?',
      answer: 'The UNFCCC framework requires that REDD+ activities be implemented consistently with a set of social and environmental safeguards, and that countries report on how those safeguards are being addressed and respected. In practice this covers respect for the rights and knowledge of Indigenous peoples and local communities, full and effective participation of stakeholders, transparent forest governance, and consistency with conservation of natural forests and biodiversity. For buyers, safeguards reporting has become part of due diligence rather than a compliance footnote, because reputational exposure on a forest credit is rarely about the tonnage.',
    },
    {
      question: 'What does credible REDD+ monitoring look like now?',
      answer: 'Continuous rather than periodic, and landscape-wide rather than boundary-bound. That means a satellite time series dense enough to detect clearing and degradation within the period they occur, radar alongside optical so cloud and canopy do not create blind spots, a control area that is re-tested every period rather than set once, and monitoring extended across the full driver catchment rather than a narrow leakage belt. The point is that every number a verifier is asked to accept should trace back to an observation, not to a projection made at project design.',
    },
  ];

  return (
    <div className="w-full bg-[#F1F1F1] font-sans text-[#0F172A] pt-20 overflow-x-clip">
      <SEOHead
        title="dMRV for REDD+ Carbon Projects"
        description="dMRV for REDD+ carbon projects: dynamic control-area baselines, satellite deforestation and degradation alerts, landscape-scale leakage monitoring."
        path="/project-types/redd"
        keywords="dMRV for REDD+, REDD+ dMRV, REDD+ MRV platform, best MRV platform for REDD+, best REDD+ carbon platform in India, REDD+ monitoring software, digital MRV for REDD+, deforestation monitoring platform, REDD+ carbon credits, REDD+ carbon credits India, avoided deforestation carbon credits, forest degradation carbon credits, how to sell REDD+ carbon credits, REDD+ project developer India, REDD+ MRV cost, avoidance vs removal credits, Verra VM0048, VM0048 consolidated REDD methodology, jurisdictional REDD+, allocated baseline REDD, deforestation risk map, forest reference emission level, Warsaw Framework for REDD+, UNFCCC REDD+ safeguards, ICVCM CCP REDD+, Indian Carbon Market REDD, CCTS forest carbon, REDD+ baseline, dynamic control area baseline, REDD+ over-crediting, REDD+ baseline criticism, REDD+ leakage monitoring, leakage belt monitoring, landscape-scale leakage detection, deforestation alerts satellite, SAR deforestation detection, forest degradation detection, forest carbon stock monitoring, community forest carbon India, forest rights act carbon credits"
        speakableSelectors={['h1', '.redd-hero-description']}
      />

      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          })}
        </script>
      </Helmet>

      {/* ════════════ 1. HERO — card left, deforestation frontier right ════════════ */}
      <section className="pt-10 pb-8 px-6 md:px-10 lg:px-12">
        <motion.div
          className="max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-5 items-stretch"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          <motion.div
            variants={slideInLeft}
            className="rounded-xl border border-[#0F172A] bg-[#F1F1F1] p-10 md:p-14 flex flex-col justify-between min-h-[480px] lg:min-h-[610px]"
          >
            <div>
              <span className="inline-flex items-center rounded-full bg-[#08292F] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                Avoided emissions
              </span>
              <h1 className="mt-10 text-5xl md:text-6xl lg:text-[46px] xl:text-[58px] 2xl:text-[72px] font-bold text-[#0F172A] leading-[1.05] tracking-tight">
                REDD+<br />Forest Protection
              </h1>
            </div>

            <p className="redd-hero-description mt-12 text-[28px] md:text-[36px] lg:text-[26px] xl:text-[32px] 2xl:text-[40px] font-normal text-[#0F172A] leading-[1.25] tracking-tight">
              The credit lives in the baseline. So does the scrutiny.
            </p>
          </motion.div>

          <motion.div variants={slideInRight} className="relative rounded-xl overflow-hidden min-h-[480px] lg:min-h-[610px]">
            <img
              src={heroImage}
              alt="Aerial view of cleared land meeting intact forest along a deforestation frontier"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ 2. OVERVIEW — image left, card right ════════════ */}
      <section className="py-8 px-6 md:px-10 lg:px-12">
        <motion.div
          className="max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-5 items-stretch"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          <motion.div
            variants={slideInLeft}
            className="group relative rounded-xl overflow-hidden min-h-[280px] lg:min-h-[370px] order-2 lg:order-1"
          >
            <img
              src={overviewImage}
              alt="Mechanised logging operation at the edge of standing forest"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <figcaption className="absolute bottom-4 left-4 w-fit max-w-[calc(100%-2rem)] rounded-lg bg-white px-4 py-2.5 text-[13px] md:text-[15px] leading-snug text-[#0F172A] shadow-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              Forest cover change detected from the satellite archive
            </figcaption>
          </motion.div>

          <motion.div
            variants={slideInRight}
            className="rounded-xl border border-[#0F172A] bg-[#F1F1F1] p-8 md:p-12 flex flex-col justify-center order-1 lg:order-2 min-h-[280px] lg:min-h-[370px]"
          >
            <span className="inline-flex self-start items-center rounded-full bg-[#08292F] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              Overview
            </span>
            <p className="mt-6 text-base md:text-[19px] leading-[1.5] text-slate-600">
              Deforestation accounts for roughly a tenth of global emissions, and REDD+ is
              the main instrument the world has for paying forests to stay standing. It is
              also the pathway the market has criticised most, almost entirely over how
              baselines were built. The forests are real. What had to change is{' '}
              <Link to="#the-science" className="text-[#16a34a] underline underline-offset-4 decoration-[#16a34a]/40 hover:decoration-[#16a34a]">
                how the counterfactual is evidenced
              </Link>.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ 3. HOW IT WORKS — routes into the related Insight ════════════ */}
      <section id="how-it-works" className="pt-16 pb-8 scroll-mt-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto border-t border-slate-400 pt-16">
          <motion.div
            className="text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <Link to="/insights/verra-icm-alignment" className="group inline-flex flex-col items-center">
              <span className="inline-flex items-center gap-4 text-4xl md:text-6xl font-normal text-[#0F172A] leading-tight transition-colors group-hover:text-[#16a34a]">
                How It Works
                <ArrowRight className="h-8 w-8 md:h-10 md:w-10 shrink-0 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
              <span className="mt-5 max-w-xl text-[15px] md:text-base text-slate-500">
                Read the method: Verra’s VM0048, and the end of project-level baselines in REDD+.
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════ 4. STAT STRIP ════════════ */}
      <section className="px-6 md:px-12 lg:px-24 pt-20 pb-14">
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#0F172A] overflow-hidden border border-[#0F172A]"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          {heroStats.map((s) => (
            <motion.div key={s.label} variants={itemFade} className="bg-[#F1F1F1] px-6 py-8 text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight leading-none">
                {s.value}
              </p>
              <p className="mt-3 text-[13px] leading-snug text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════ 5. QUICK FACTS ════════════ */}
      <section className="pb-20 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <motion.div
          className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          {quickFacts.map((c) => (
            <motion.div
              key={c.label}
              variants={itemFade}
              className="border border-[#0F172A] bg-white/40 p-8 flex flex-col"
            >
              <p className="text-xs tracking-widest text-slate-400 uppercase mb-3">{c.label}</p>
              <div className="h-px w-full bg-slate-200 mb-6" />
              <h3 className="text-xl font-semibold text-[#0F172A] mb-4 leading-snug">{c.head}</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed">{c.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════ 6. EVIDENCE CHECKPOINTS ════════════ */}
      <section className="pb-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <p className="text-xs tracking-widest text-slate-400 uppercase mb-2">
              What has to be evidenced
            </p>
            <h2 className="text-2xl md:text-4xl font-medium text-[#0F172A] mb-10">
              Four checkpoints turn avoided loss into a creditable tonne
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#0F172A] overflow-hidden border border-[#0F172A]"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            {processSteps.map(({ n, icon: Icon, title, text }) => (
              <motion.div key={n} variants={itemFade} className="bg-[#F1F1F1] p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center bg-[#16a34a]/10 text-[#08292F]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-slate-300">{n}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">{title}</h3>
                <p className="text-[14px] leading-relaxed text-slate-600">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════ 7. THE SCIENCE — editorial long-form ════════════ */}
      <section id="the-science" className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1] border-t border-slate-400 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="max-w-3xl mb-4"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <SectionLabel>The science</SectionLabel>
            <SectionHeading>Why the counterfactual is everything.</SectionHeading>
            <p className={bodyStyle}>
              A REDD+ credit is a subtraction between something observed and something that
              never happened. The observed half is now straightforward. The half that never
              happened is where every serious criticism of this pathway has landed, and
              where the methodology reform of the last few years has been aimed.
            </p>
          </motion.div>

          {/* ── Block 1 ── */}
          <Editorial eyebrow="The framework" title="What REDD+ covers, and who decided">
            <P>
              REDD+ is not a private-market invention. It sits inside the UNFCCC process,
              and its basic rules were agreed as a package of decisions at COP 19 in
              Warsaw in 2013, now generally referred to as the{' '}
              <B>Warsaw Framework for REDD+</B>.
            </P>
            <P>
              That framework recognises <B>five activities</B>: reducing emissions from
              deforestation, reducing emissions from forest degradation, sustainable
              management of forests, conservation of forest carbon stocks, and enhancement
              of forest carbon stocks. It also sets out what a country has to put in place
              to receive results-based finance, including a national forest monitoring
              system, a forest reference emission level to measure performance against,
              measurement and verification arrangements, and reporting on how the agreed
              social and environmental safeguards are being addressed.
            </P>
            <Callout>
              The framework describes three broad phases: readiness, implementation of
              policies and measures, and results-based payments for verified emission
              reductions. Most voluntary-market REDD+ projects operate alongside that
              national architecture rather than inside it, which is exactly where the
              double-counting and nesting questions come from.
            </Callout>
            <BlockImage
              src={reddFrameworkImage}
              alt="REDD+ forest cover mapping across a jurisdiction"
              caption="REDD+ sits inside a national accounting framework, which is where project-level nesting questions come from."
            />
          </Editorial>

          {/* ── Block 2 ── */}
          <Editorial eyebrow="The baseline" title="Where the criticism actually landed">
            <P>
              Under earlier methodologies, a project developer had considerable latitude
              to choose a reference region and project a future deforestation rate from
              it. Independent analysis of a large sample of projects found that many had
              assumed substantially more forest loss than comparable land went on to
              experience. The consequence was over-crediting rather than invention, but
              the effect on buyer confidence was the same.
            </P>
            <Bullets
              items={[
                {
                  lead: 'Reference region selection',
                  text: 'choosing which land the project is compared against was, in effect, choosing the answer. Two defensible-looking regions could produce baselines differing by a factor of several.',
                },
                {
                  lead: 'Static projections',
                  text: 'a rate fixed at project design cannot respond to a commodity price collapse, a change of government or a new road, all of which move real deforestation sharply.',
                },
                {
                  lead: 'Self-assessment',
                  text: 'when the party that benefits from a high baseline also builds it, the incentive problem is structural rather than a question of individual conduct.',
                },
              ]}
            />
            <P>
              The response has been to take baseline construction out of the developer&apos;s
              hands: jurisdictional allocations, independently produced deforestation risk
              maps, and periodic reassessment instead of a single projection carried for a
              decade.
            </P>
            <BlockImage
              src={controlAreaImage}
              alt="Control area selection and continuous monitoring for dynamic baselines"
              caption="A dynamic baseline selects comparable land outside the boundary and keeps re-testing it, rather than projecting once at design."
            />
          </Editorial>

          {/* ── Block 3 ── */}
          <Editorial eyebrow="Measurement" title="What can now be observed directly">
            <P>
              The observed half of the subtraction has become genuinely strong. Where a
              project once relied on periodic inventories and interpretation, the landscape
              record is now dense enough to treat forest change as a measurement.
            </P>
            <Bullets
              items={[
                {
                  lead: 'Optical time series',
                  text: 'open Sentinel and Landsat archives give a consistent, independently held record of cover change that predates the project and cannot be reconstructed after the fact.',
                },
                {
                  lead: 'Radar for the gaps',
                  text: 'SAR sees through cloud and, at the right wavelength, responds to structure rather than reflectance, which is what makes tropical monitoring workable in a wet season and degradation visible under an intact-looking canopy.',
                },
                {
                  lead: 'Structure, not just extent',
                  text: 'canopy height and biomass modelling distinguish a thinned forest from a cleared one. Degradation is the larger and more often missed share of forest emissions, and extent-only mapping is blind to it.',
                },
              ]}
            />
            <BlockImage
              src={detectionImage}
              alt="SAR and AI fusion pipeline producing deforestation alerts"
              caption="Radar structural change fused with optical imagery turns detection into an alerting system rather than an annual retrospective."
            />
          </Editorial>

          {/* ── Block 4 ── */}
          <Editorial eyebrow="Scale" title="Two very different project archetypes">
            <P>
              REDD+ projects fall into broadly two shapes, and the evidence a rater
              interrogates differs sharply between them.
            </P>
            <div className="grid sm:grid-cols-2 gap-5 my-8">
              {projectModels.map(({ icon: Icon, tag, title, text, points }) => (
                <div key={tag} className="border border-[#0F172A] bg-white/50 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="inline-flex h-9 w-9 items-center justify-center bg-[#16a34a]/10 text-[#08292F]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-[#08292F] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {tag}
                    </span>
                  </div>
                  <h4 className="text-[17px] font-semibold text-[#0F172A] mb-2.5">{title}</h4>
                  <p className="text-[14px] leading-relaxed text-slate-600 mb-5">{text}</p>
                  <ul className="space-y-2 pt-4 border-t border-slate-300">
                    {points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-[13px] text-slate-500">
                        <Check className="h-3.5 w-3.5 text-[#16a34a] mt-0.5 shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <P>
              A frontier project has the easier additionality argument and the harder
              leakage problem. A community project inverts both. Neither is a better bet in
              the abstract; what separates them is whether the specific weakness has been
              instrumented.
            </P>
            <BlockImage
              src={driversImage}
              alt="The drivers that create deforestation risk in a landscape"
              caption="Additionality rests on a documentable driver. Which driver dominates also decides which archetype a project belongs to."
            />
          </Editorial>

          {/* ── Block 5 ── */}
          <Editorial eyebrow="Leakage" title="Prevented, or simply moved?">
            <P>
              If the pressure on a forest is an advancing agricultural frontier, protecting
              one block does not remove the demand that drove it. Leakage is the share of
              avoided deforestation that reappears somewhere else, and it is the failure
              mode most likely to be found by someone other than the project.
            </P>
            <div className="grid sm:grid-cols-2 gap-5 my-8">
              <div className="border border-[#0F172A] bg-white/50 p-6">
                <p className="text-[11px] tracking-widest text-[#16a34a] uppercase font-bold mb-3">
                  Detected: landscape-scale view
                </p>
                <p className="text-[14px] leading-relaxed text-slate-600">
                  Monitoring the full driver catchment, not a belt around the boundary,
                  catches displacement that jumps rather than creeps, and lets the project
                  report it before a rater discovers it independently.
                </p>
              </div>
              <div className="border border-[#0F172A] bg-white/50 p-6">
                <p className="text-[11px] tracking-widest text-slate-400 uppercase font-bold mb-3">
                  Missed: the narrow leakage belt
                </p>
                <p className="text-[14px] leading-relaxed text-slate-500">
                  A five to ten kilometre monitoring belt is the conventional default. It
                  catches short-distance displacement and is structurally blind to activity
                  that relocates across a district, which is the pattern that actually
                  follows a road.
                </p>
              </div>
            </div>
            <P>
              A project that reports its own leakage with landscape evidence behind it is in
              a far stronger position than one that reports none and is later shown to have
              missed it. The credibility difference is a monitoring footprint, not a
              methodology clause.
            </P>
          </Editorial>
        </div>
      </section>

      {/* ════════════ 8. THE SYLITHE LAYER ════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-slate-50 border-y border-slate-400">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="max-w-3xl mb-14"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <SectionLabel className="!text-lg md:!text-xl tracking-[0.08em]">
              The Sylithe layer
            </SectionLabel>
            <SectionHeading>
              REDD+ credibility is a baseline problem.
            </SectionHeading>
            <p className={bodyStyle}>
              The forest can be measured. The counterfactual cannot, so it has to be
              constructed from evidence that is independent of the project and re-tested as
              conditions change. That is the specific thing Sylithe instruments.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            {mrvLayers.map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                variants={itemFade}
                className="border border-[#0F172A] bg-[#F1F1F1] p-8 flex flex-col"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center bg-[#16a34a]/10 text-[#08292F] mb-6">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-[#0F172A] mb-3 text-[17px]">{title}</h3>
                <p className="text-[15px] leading-relaxed text-slate-600 flex-grow">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════ 9. STANDARDS ════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F1F1F1]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-14"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <p className="text-xs tracking-widest text-slate-400 uppercase mb-3">
              Standards &amp; methodologies
            </p>
            <h2 className="text-3xl md:text-4xl font-medium text-[#0F172A] mb-6">
              One evidence set, multiple crediting routes
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Sylithe structures REDD+ project data so the same underlying records can serve
              whichever pathway your buyers require.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            {standards.map((s) => (
              <motion.div
                key={s.abbr}
                variants={itemFade}
                className="border border-[#0F172A] bg-white/40 p-7 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src={s.logo}
                    alt={`${s.name} logo`}
                    className="h-7 w-auto max-w-[92px] object-contain object-left shrink-0"
                    loading="lazy"
                  />
                  <span className="font-mono text-sm font-bold tracking-widest text-[#08292F]">
                    {s.abbr}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0F172A] mb-3 leading-snug">{s.name}</h3>
                <p className="text-[14px] leading-relaxed text-slate-600">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════ 10. CTA ════════════ */}
      <section className="px-6 md:px-12 lg:px-24 pb-24">
        <motion.div
          className="max-w-7xl mx-auto bg-[#08292F] px-8 py-16 md:px-16 md:py-20 relative overflow-hidden"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#a4fca1 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              WebkitMaskImage: 'radial-gradient(ellipse at 80% 0%, black 5%, transparent 65%)',
            }}
          />
          <div className="relative max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-normal text-white leading-tight mb-6">
              Developing a REDD+ project?
            </h2>
            <p className="text-lg text-white/55 leading-[1.7] mb-10">
              The baseline decides whether your tonnes survive a rating. Let&apos;s build it
              from independent landscape evidence, and keep testing it, rather than
              defending a projection made years ago.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="bg-[#a4fca1] text-[#08292F] px-8 py-4 rounded-full font-bold text-base hover:bg-white transition-all active:scale-95 inline-flex items-center gap-2"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:info@sylithe.com?subject=REDD%20Project%20Enquiry"
                className="border-2 border-white/25 text-white px-8 py-4 rounded-full font-medium text-base hover:bg-white/10 transition-all active:scale-95 inline-flex items-center gap-2"
              >
                Talk to our team
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════ 11. FAQ ════════════ */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#FAFAFA] border-t border-slate-400 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#16a34a 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
          }}
        />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 relative z-10">
          <div className="lg:col-span-4">
            <SectionHeading className="!text-[#0F172A] !mb-4">FAQs</SectionHeading>
            <p className="text-slate-500 leading-relaxed">
              Common questions from developers and buyers evaluating REDD+ projects.
            </p>
          </div>

          <div className="lg:col-span-8 flex flex-col">
            {faqs.map((item, i) => (
              <details key={i} className="group transition-all border-b border-slate-400/70 last:border-0">
                <summary className="flex items-center justify-between py-8 cursor-pointer list-none text-[#0F172A] font-bold text-lg md:text-xl hover:text-[#16a34a] transition-colors pr-4">
                  <span className="pr-8">{item.question}</span>
                  <span className="w-8 h-8 rounded-full border border-[#0F172A]/30 flex items-center justify-center text-[#0F172A]/70 group-hover:border-[#16a34a] group-hover:text-[#16a34a] group-open:rotate-45 transition-all duration-300 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
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

export default ReddPlus;
