import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Sprout, TreePine, Ruler,
  LineChart, FileCheck2, Layers, Satellite, MapPinned,
} from 'lucide-react';

import SEOHead from '../../components/SEOHead';
import agbBgbImage from '../../assets/AGBvsBGB.png';
import pipelineImage from '../../assets/SylithePipelineDiagram.png';
import heroImage from '../../assets/deccan-plateau.png';
import overviewImage from '../../assets/agroforestry.png';
import verraLogo from '../../assets/verra logo.png';
import goldStandardLogo from '../../assets/Gold standard logo.png';
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
const ArrCarbonProjects = () => {
  /* Stat strip */
  const heroStats = [
    { value: '3', label: 'activities: afforestation, reforestation, revegetation' },
    { value: '20–40 yrs', label: 'typical crediting period' },
    { value: '7.6 Gt', label: 'CO₂ forests absorb each year, globally' },
    { value: '10 m', label: 'Sentinel-2 resolution behind eligibility screening' },
  ];

  /* Quick facts — the three-column grid under the overview */
  const quickFacts = [
    {
      label: 'Market position',
      head: 'The most scaled removal category',
      text: 'ARR is the largest and usually the least expensive removal option on the voluntary market, and the one most corporate buyers already hold. That scale is also why scrutiny of ARR baselines and growth claims has sharpened faster than for any other pathway.',
    },
    {
      label: 'Removal profile',
      head: 'Gradual, and reversible',
      text: 'Carbon accrues year on year as biomass grows rather than arriving at a single moment. That makes ARR a long-duration asset with genuine reversal exposure to fire, drought, harvest and encroachment, which is exactly what monitoring has to stay ahead of.',
    },
    {
      label: 'Land',
      head: 'Degraded land, not standing forest',
      text: 'Eligibility turns on what the land was before the project began. Standards require evidence that the area was not forest at the start date, which makes historical land cover the first thing a verifier asks for and the first thing Sylithe establishes.',
    },
  ];

  /* What has to be evidenced, stage by stage */
  const processSteps = [
    {
      n: '01',
      icon: MapPinned,
      title: 'At the land',
      text: 'Establish that the project area was genuinely non-forest at the start date. Historical satellite land cover, not a site visit, is what settles eligibility for a verifier.',
    },
    {
      n: '02',
      icon: LineChart,
      title: 'At the baseline',
      text: 'Show what the land would have done without the project. A dynamic control-area baseline moves with real regional conditions instead of freezing an assumption made on day one.',
    },
    {
      n: '03',
      icon: Ruler,
      title: 'At the canopy',
      text: 'Track structure as it changes. Canopy height across the whole area, resurveyed on a fixed cadence, is the physical record that growth actually happened.',
    },
    {
      n: '04',
      icon: FileCheck2,
      title: 'At the carbon',
      text: 'Convert structure into biomass and biomass into CO₂e through documented allometry, with the uncertainty of each step carried through rather than discarded.',
    },
  ];

  /* Project archetypes — smallholder mosaic vs contiguous block */
  const projectModels = [
    {
      icon: Sprout,
      tag: 'Mosaic',
      title: 'Smallholder and community planting',
      text: 'Thousands of small, non-contiguous parcels held by individual farmers or a community institution. Ecologically diverse and socially strong, but the parcel geometry is what makes conventional field-based MRV financially impossible at scale.',
      points: ['High co-benefit density', 'Fragmented parcel boundaries', 'Per-plot ownership evidence', 'Sub-hectare mapping required'],
    },
    {
      icon: TreePine,
      tag: 'Contiguous',
      title: 'Block plantation and landscape restoration',
      text: 'A single large area under one management regime, often on degraded revenue land or a corporate estate. Simpler to measure and to audit, but the additionality and species-mix arguments carry more weight because the counterfactual is harder to dismiss.',
      points: ['Single management regime', 'Simpler boundary evidence', 'Higher monoculture scrutiny', 'Larger leakage catchment'],
    },
  ];

  /* Where Sylithe's dMRV layer plugs into an ARR project */
  const mrvLayers = [
    {
      icon: Satellite,
      title: 'Eligibility and land history',
      text: 'Multi-year LULC classification reconstructs what the project area actually was before the start date, so the non-forest condition is demonstrated from the archive rather than asserted.',
    },
    {
      icon: Layers,
      title: 'Baseline that moves',
      text: 'A dynamic control area tracks comparable land outside the project boundary, so the counterfactual reflects the drought, the policy change and the market shift that the project also lived through.',
    },
    {
      icon: Ruler,
      title: 'Canopy and biomass over time',
      text: 'Canopy height modelling and above-ground biomass estimation turn each monitoring period into a measured stock change, with the uncertainty stated instead of buried.',
    },
  ];

  /* Crediting routes */
  const standards = [
    {
      abbr: 'VCS',
      logo: verraLogo,
      name: 'Verra VM0047',
      desc: 'The consolidated ARR methodology, built around dynamic performance benchmarks and remote-sensing evidence rather than the static baselines its predecessors allowed.',
    },
    {
      abbr: 'GOLD STANDARD',
      logo: goldStandardLogo,
      name: 'Afforestation / Reforestation',
      desc: 'A route that weights community outcomes and SDG contribution alongside tonnes, widely used by buyers procuring for co-benefits as much as for carbon.',
    },
    {
      abbr: 'IC-VCM',
      logo: icVcmLogo,
      name: 'Core Carbon Principles',
      desc: 'Not a registry but the integrity bar above them. CCP labelling has become the practical filter corporate buyers apply before a nature-based credit enters a portfolio.',
    },
    {
      abbr: 'BEE',
      logo: beeLogo,
      name: 'Indian Carbon Market / CCTS',
      desc: 'India has both the degraded land base and the policy architecture for ARR at scale. Sylithe structures project evidence so it can travel into the domestic framework as it matures.',
    },
  ];

  /* FAQ — also emitted as FAQPage JSON-LD */
  const faqs = [
    {
      question: 'What does ARR actually stand for?',
      answer: 'Afforestation, Reforestation and Revegetation. Afforestation establishes tree cover on land that has not carried forest in the recent past. Reforestation restores cover to land that was forest until recently. Revegetation re-establishes woody vegetation on degraded ground where a closed-canopy forest is not the realistic or ecologically appropriate outcome. Crediting standards treat the three separately because the eligibility evidence differs, but they share one measurement stack: prove what the land was, prove what it became, and prove the difference is attributable to the project.',
    },
    {
      question: 'How is carbon actually measured in an ARR project?',
      answer: 'Through stock change rather than direct measurement of gas. The project measures the carbon held in biomass at the start and at each monitoring period, and the increase becomes the removal. In practice that means resolving canopy structure across the area, converting structure to above-ground biomass through allometric relationships appropriate to the species and region, adding below-ground and other pools where the methodology allows, and converting carbon to CO₂e. Satellite and lidar-derived canopy height models let this be done across an entire project area on a repeatable cadence, instead of extrapolating from a handful of field plots.',
    },
    {
      question: 'Why do ARR baselines attract so much scrutiny?',
      answer: 'Because the baseline decides how many tonnes the project can claim, and a static baseline set at the start date cannot account for anything that happens afterwards. If regional conditions improve on their own, a frozen baseline credits the project for growth it did not cause. Newer methodologies address this with dynamic performance benchmarks measured against comparable land outside the project boundary. Sylithe builds that control area from the same satellite record used for the project itself, so both sides of the comparison come from one consistent source.',
    },
    {
      question: 'How is permanence handled when trees can burn or be cut?',
      answer: 'ARR carries genuine reversal risk, and standards manage it rather than pretend it away. Projects contribute a share of every issuance to a buffer pool that is drawn down if a reversal occurs, with the contribution set by a risk assessment covering fire, drought, pests, harvest and encroachment. That mechanism only works if reversals are actually detected, which is why continuous satellite monitoring across the crediting period matters more than the risk score assigned on day one.',
    },
    {
      question: 'What makes ARR additional?',
      answer: 'In most cases the argument is straightforward: the vegetation would not have established without the intervention, because the land was degraded and the barriers to natural recovery were real. It gets harder where the planting has independent commercial logic, such as timber rotations, or where a government programme would have funded the same activity anyway. The honest test is whether the carbon revenue changed the decision, and the evidence for that is financial and historical as much as it is satellite-derived.',
    },
    {
      question: 'Is ARR viable at scale in India?',
      answer: 'India has one of the largest restorable land bases in the world, and national commitments that put an additional carbon sink squarely in policy. The binding constraint has rarely been land or intent. It has been the cost and credibility of measurement across fragmented smallholder parcels, where conventional plot-based MRV consumes a large share of project revenue before a single credit is issued. Satellite-first dMRV changes that arithmetic, which is the specific problem Sylithe was built to solve.',
    },
  ];

  return (
    <div className="w-full bg-[#F1F1F1] font-sans text-[#0F172A] pt-20 overflow-x-clip">
      <SEOHead
        title="dMRV for ARR Carbon Projects"
        description="dMRV for ARR carbon projects: land eligibility from satellite history, VM0047-style dynamic baselines, canopy height and above-ground biomass monitoring."
        path="/project-types/arr"
        keywords="dMRV for ARR, ARR dMRV, ARR MRV platform, best MRV platform for ARR, best ARR carbon platform in India, afforestation reforestation MRV software, digital MRV for reforestation, reforestation monitoring platform, afforestation reforestation revegetation, ARR carbon credits, ARR carbon credits India, reforestation carbon credits, afforestation carbon credits, restoration carbon credits India, tree plantation carbon credits India, nature-based removals, how to sell ARR carbon credits, ARR project developer India, ARR MRV cost, Verra VM0047, VM0047 performance benchmark, dynamic performance benchmark ARR, stocking index remote sensing, Gold Standard afforestation reforestation, Plan Vivo, ICVCM CCP nature-based, Indian Carbon Market ARR, CCTS afforestation, ARR baseline, dynamic baseline ARR, control area baseline, matched control plots, land eligibility non-forest evidence, LULC land use history, canopy height model, above ground biomass estimation, AGB allometric equations, biomass stock change, ARR permanence, buffer pool reversal risk, forest carbon monitoring satellite, smallholder ARR monitoring, agroforestry carbon MRV"
        speakableSelectors={['h1', '.arr-hero-description']}
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

      {/* ════════════ 1. HERO — card left, restoration landscape right ════════════ */}
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
                Nature-based removal
              </span>
              <h1 className="mt-10 text-5xl md:text-6xl lg:text-[46px] xl:text-[58px] 2xl:text-[72px] font-bold text-[#0F172A] leading-[1.05] tracking-tight">
                Afforestation &amp;<br />Reforestation
              </h1>
            </div>

            <p className="arr-hero-description mt-12 text-[28px] md:text-[36px] lg:text-[26px] xl:text-[32px] 2xl:text-[40px] font-normal text-[#0F172A] leading-[1.25] tracking-tight">
              Carbon that accrues as the forest grows, measured from orbit.
            </p>
          </motion.div>

          <motion.div variants={slideInRight} className="relative rounded-xl overflow-hidden min-h-[480px] lg:min-h-[610px]">
            <img
              src={heroImage}
              alt="Open degraded plateau landscape of the kind ARR projects restore"
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
              alt="Trees established across a working landscape under restoration"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <figcaption className="absolute bottom-4 left-4 w-fit max-w-[calc(100%-2rem)] rounded-lg bg-white px-4 py-2.5 text-[13px] md:text-[15px] leading-snug text-[#0F172A] shadow-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              Tree cover re-established across a working landscape
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
              ARR is the most scaled removal pathway in the voluntary market and, for most
              buyers, the first one they ever bought. It is also the pathway where the
              market has learned the hardest lessons about baselines and over-crediting.
              The tonnes are real; what has to be rebuilt is the evidence around them,
              and that starts with{' '}
              <Link to="#the-science" className="text-[#16a34a] underline underline-offset-4 decoration-[#16a34a]/40 hover:decoration-[#16a34a]">
                measuring growth instead of modelling it
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
            <Link to="/insights/digital-mrv-carbon-projects-complete-guide" className="group inline-flex flex-col items-center">
              <span className="inline-flex items-center gap-4 text-4xl md:text-6xl font-normal text-[#0F172A] leading-tight transition-colors group-hover:text-[#16a34a]">
                How It Works
                <ArrowRight className="h-8 w-8 md:h-10 md:w-10 shrink-0 transition-transform duration-300 group-hover:translate-x-2" />
              </span>
              <span className="mt-5 max-w-xl text-[15px] md:text-base text-slate-500">
                Read the method: Digital MRV for Carbon Projects, the complete guide to AI-powered monitoring.
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
              Four checkpoints turn growth into a creditable tonne
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
            <SectionHeading>Why the growth has to be measured.</SectionHeading>
            <p className={bodyStyle}>
              An ARR credit is a claim about a difference: what the carbon stock became,
              against what it would otherwise have been. Both halves of that subtraction
              are estimates, and the credibility of the tonne rests entirely on how each
              one was produced.
            </p>
          </motion.div>

          {/* ── Block 1 ── */}
          <Editorial eyebrow="The mechanism" title="What a growing forest actually stores">
            <P>
              Trees build their mass out of the atmosphere. Photosynthesis fixes CO₂ into
              cellulose and lignin, and the resulting structure holds carbon for as long as
              the tree stands. Roughly <B>half the dry weight of woody biomass is
              carbon</B>, which is why measuring structure is a legitimate proxy for
              measuring the removal.
            </P>
            <P>
              The stock sits in several pools. Above-ground biomass is the trunk, branches
              and foliage. Below-ground biomass is the root system, conventionally estimated
              as a ratio of the above-ground figure. Deadwood, litter and soil organic carbon
              accumulate more slowly and are treated conservatively or excluded entirely by
              most methodologies. What a project can credit is the measured change in the
              pools its methodology actually admits.
            </P>
            <Callout>
              This is why ARR behaves so differently from an engineered removal. Nothing is
              fixed at a single moment. The asset accrues across decades, and every year of
              that accrual has to be evidenced rather than assumed from a planting record.
            </Callout>
            <BlockImage
              src={agbBgbImage}
              alt="Above-ground and below-ground biomass pools in a growing tree"
              caption="Carbon accumulates in several pools. Most methodologies credit above-ground biomass and estimate the root fraction from it."
            />
          </Editorial>

          {/* ── Block 2 ── */}
          <Editorial eyebrow="Quality" title="What decides whether ARR credits hold up">
            <P>
              Two projects can plant the same number of stems on the same area and produce
              tonnes of very different quality. The variables that separate them are known,
              and every one of them is auditable.
            </P>
            <Bullets
              items={[
                {
                  lead: 'Survival, not planting',
                  text: 'the number of seedlings put in the ground is a spend record, not a carbon record. What matters is how many are still alive and growing at each monitoring period, which only area-wide remote sensing can economically confirm.',
                },
                {
                  lead: 'Species and structure',
                  text: 'native mixed-species planting builds slower but more resilient stock and far stronger biodiversity outcomes. Fast-growing monocultures accrue quickly and attract proportionally more scrutiny from raters and buyers.',
                },
                {
                  lead: 'Baseline realism',
                  text: 'the counterfactual has to reflect what comparable land actually did over the same period, including the drought years. A benchmark that cannot move cannot be right for long.',
                },
                {
                  lead: 'Monitoring cadence',
                  text: 'a stock estimate is only as current as its last observation. Annual or better resurvey turns the crediting record into a time series rather than a pair of endpoints with a line drawn between them.',
                },
              ]}
            />
            <P>
              Sylithe records all four against every monitoring period, because which one a
              given rater treats as decisive changes faster than a crediting period lasts.
            </P>
          </Editorial>

          {/* ── Block 3 ── */}
          <Editorial eyebrow="Evidence" title="Three independent lines of evidence">
            <P>
              A defensible ARR claim does not rest on one dataset. Three separate strands
              converge, each closing a different gap an auditor would otherwise push on.
            </P>
            <Bullets
              items={[
                {
                  lead: 'The land was not forest',
                  text: 'multi-year land cover classification from the satellite archive establishes the pre-project condition from an independent record that predates the project and cannot be reconstructed after the fact.',
                },
                {
                  lead: 'The canopy actually changed',
                  text: 'canopy height modelling across the full project area, resurveyed on a fixed cadence, shows structural change as a measurement rather than a growth curve fitted from planting records.',
                },
                {
                  lead: 'The change converts defensibly',
                  text: 'published allometric relationships appropriate to species and region turn structure into biomass, with propagated uncertainty stated openly so a verifier can qualify against the number rather than argue about it.',
                },
              ]}
            />
            <BlockImage
              src={pipelineImage}
              alt="Sylithe end-to-end MRV pipeline from satellite data to reports"
              caption="The three evidence lines run through one pipeline: sensor fusion, then LULC, CHM and dynamic baselines, then carbon accounting."
            />
          </Editorial>

          {/* ── Block 4 ── */}
          <Editorial eyebrow="Scale" title="One pathway, two very different builds">
            <P>
              ARR runs from a few hundred farmers with a hectare each to a single
              contiguous block of restored landscape. The ecology and the economics both
              differ, and so does where the MRV difficulty sits.
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
              The cost problem inverts between them. A block plantation is cheap to survey
              and expensive to argue for; a smallholder mosaic is easy to justify and, under
              plot-based MRV, ruinously expensive to measure. Satellite-first monitoring is
              what makes the second archetype financially viable at all.
            </P>
          </Editorial>

          {/* ── Block 5 ── */}
          <Editorial eyebrow="Permanence" title="A standing asset can be lost">
            <P>
              Every tonne an ARR project claims stays claimable only while the biomass
              holding it stays standing. Fire, drought, pest outbreak, illegal harvest and
              conversion back to agriculture are all live risks across a forty-year
              crediting period, and standards price them rather than ignore them.
            </P>
            <div className="grid sm:grid-cols-2 gap-5 my-8">
              <div className="border border-[#0F172A] bg-white/50 p-6">
                <p className="text-[11px] tracking-widest text-[#16a34a] uppercase font-bold mb-3">
                  Managed: buffer and monitoring
                </p>
                <p className="text-[14px] leading-relaxed text-slate-600">
                  A share of every issuance is withheld into a pooled buffer that is drawn
                  down if a reversal occurs. The mechanism only functions when reversals are
                  actually detected, which makes continuous monitoring part of the insurance
                  rather than a reporting chore.
                </p>
              </div>
              <div className="border border-[#0F172A] bg-white/50 p-6">
                <p className="text-[11px] tracking-widest text-slate-400 uppercase font-bold mb-3">
                  Unmanaged: the silent reversal
                </p>
                <p className="text-[14px] leading-relaxed text-slate-500">
                  The damaging case is not a fire that makes the news. It is gradual
                  degradation inside the boundary that nobody reports, credited for years
                  before the next site visit finds it. That gap is a monitoring failure, not
                  a forest failure.
                </p>
              </div>
            </div>
            <P>
              This is why the monitoring cadence, not the risk score, is the number worth
              interrogating. A project that resurveys its whole area every season can
              evidence a reversal in the period it happened. A project that visits plots
              every five years cannot.
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
              ARR credibility is a measurement problem.
            </SectionHeading>
            <p className={bodyStyle}>
              Unlike a biochar batch, an ARR project can be measured from orbit, and that
              is precisely the standard it should be held to. Sylithe replaces the sampled
              plot and the fitted growth curve with an area-wide, repeatable record of what
              the land actually did.
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
              Sylithe structures ARR project data so the same underlying records can serve
              whichever pathway your buyers require.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
              Developing an ARR project?
            </h2>
            <p className="text-lg text-white/55 leading-[1.7] mb-10">
              Whether it is a thousand smallholder parcels or a single restored landscape,
              the evidence requirements are the same. Let&apos;s establish the baseline and
              the land history before the first monitoring period, not after the auditor
              asks.
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
                href="mailto:info@sylithe.com?subject=ARR%20Project%20Enquiry"
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
              Common questions from developers and buyers evaluating ARR carbon projects.
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

export default ArrCarbonProjects;
