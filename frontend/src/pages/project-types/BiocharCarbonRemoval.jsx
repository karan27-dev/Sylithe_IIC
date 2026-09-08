import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Flame, Leaf, Sprout,
  LineChart, FileCheck2, Layers, Factory, QrCode, Satellite,
  FlaskConical,
} from 'lucide-react';

import SEOHead from '../../components/SEOHead';
import heroImage from '../../assets/biochar-hero-charcoal.jpg';
import overviewImage from '../../assets/biochar-overview.jpg';
import BiocharProcessVideo from '../../components/biochar/BiocharProcessVideo';
import puroLogo from '../../assets/std-puro.png';
import rainbowLogo from '../../assets/std-rainbow.png';
import isometricLogo from '../../assets/std-isometric.png';
import verraLogo from '../../assets/verra logo.png';
import { Helmet } from 'react-helmet-async';

/* ─── ANIMATION VARIANTS (matched to the methodology pages) ─────────────── */
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
   column, with a rule between blocks. Used through the science half of the
   page, where the argument needs room to breathe rather than another card grid.
--------------------------------------------------------------------------- */
const Editorial = ({ eyebrow, title, children }) => (
  <motion.div
    className="grid lg:grid-cols-12 gap-y-8 gap-x-8 lg:gap-x-16 py-14 md:py-16 border-t border-slate-400"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={stagger}
  >
    {/* Sticky heading: `self-start` keeps the grid item at content height (a
        stretched item has no room to travel), and no transform is applied here
        because a transformed ancestor would become the containing block and
        pin the heading to the row instead of the viewport. It rides down with
        the prose, then the next block's row scrolls it up behind the navbar. */}
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

const Callout = ({ children }) => (
  <div className="mt-7 border border-[#0F172A] bg-white/50 px-6 py-5">
    <p className="text-[15px] leading-relaxed text-slate-700">{children}</p>
  </div>
);

/* ─── PAGE ──────────────────────────────────────────────────────────────── */
const BiocharCarbonRemoval = () => {
  /* Hero stat strip */
  const heroStats = [
    { value: '86%', label: 'of 2024 durable CDR deliveries' },
    { value: '0.5–2 Gt', label: 'CO₂ / year potential by 2050' },
    { value: '500–700°C', label: 'pyrolysis conversion window' },
    { value: '100+ yrs', label: 'carbon permanence horizon' },
  ];

  /* Quick facts — the three-column grid under the overview */
  const quickFacts = [
    {
      label: 'Market position',
      head: 'The pathway that actually delivers',
      text: 'Biochar accounted for the overwhelming majority of durable carbon removal delivered in 2024. While other engineered pathways are still commissioning first plants, BCR is shipping tonnes today, which is why it dominates buyer procurement.',
    },
    {
      label: 'Removal potential',
      head: '0.5–2 gigatonnes a year',
      text: 'Current assessments of globally available sustainable residue feedstock put biochar\'s annual removal ceiling in the gigatonne range by 2050, without competing for land that food or forests need.',
    },
    {
      label: 'End uses',
      head: 'Soil, feed, and the built environment',
      text: 'Credited biochar is worked into agricultural soil, blended into animal feed and bedding, or bound into concrete and asphalt. Each route keeps the carbon out of the atmosphere on a different timescale.',
    },
  ];

  /* The film explains the physical process and carries its own step labels.
     These cards deliberately do not repeat it — they say what has to be
     evidenced at each stage for the resulting tonnes to be creditable. */
  const processSteps = [
    {
      n: '01',
      icon: Leaf,
      title: 'At the feedstock',
      text: 'Prove the biomass is genuinely residue. Satellite land-cover history over the sourcing area shows no standing forest was cleared to feed the kiln.',
    },
    {
      n: '02',
      icon: Flame,
      title: 'At the reactor',
      text: 'Log every run: input mass and moisture, peak temperature, residence time, output yield. A single spot reading will not satisfy a verifier.',
    },
    {
      n: '03',
      icon: FlaskConical,
      title: 'At the laboratory',
      text: 'Tie each batch to its certificate (carbon content and H:Corg molar ratio) so the durable fraction is measured rather than assumed.',
    },
    {
      n: '04',
      icon: Sprout,
      title: 'At the field',
      text: 'Record where the material actually went, with coordinates and quantities. Credits attach to durable end use, not to production alone.',
    },
  ];

  /* Production models — decentralised vs industrial */
  const productionModels = [
    {
      icon: Flame,
      tag: 'Decentralised',
      title: 'Kon-Tiki and artisan kilns',
      text: 'Low-cost, open-flame-curtain kilns that a farmer cooperative can operate at village scale. They put biochar production within reach of the smallholders who generate the residue in the first place, but they make evidence collection the hard part, because there is no plant SCADA to read from.',
      points: ['Low capital cost', 'Village-scale deployment', 'Manual batch logging', 'Global Artisan C-Sink route'],
    },
    {
      icon: Factory,
      tag: 'Industrial',
      title: 'Continuous pyrolysis plants',
      text: 'High-throughput reactors with heat and syngas recovery, running continuously against a steady feedstock supply. Instrumentation is far richer, so the MRV challenge shifts from data capture to reconciling plant telemetry with feedstock provenance and downstream application.',
      points: ['High throughput', 'Heat & syngas recovery', 'Continuous telemetry', 'Puro.earth CORC route'],
    },
  ];

  /* Where Sylithe's dMRV layer plugs into a BCR project */
  const mrvLayers = [
    {
      icon: Satellite,
      title: 'Feedstock sourcing & eligibility',
      text: 'Satellite LULC screening proves biomass came from residue streams or sustainably managed land, not from clearing standing forest to feed a kiln.',
    },
    {
      icon: Factory,
      title: 'Production batch records',
      text: 'Every pyrolysis run is logged against mass balance, peak temperature and moisture, then reconciled with lab certificates for H:Corg and carbon content.',
    },
    {
      icon: QrCode,
      title: 'Chain of custody to application',
      text: 'Each batch carries a traceable identity from kiln to field. The same QR-linked profile Sylithe uses for tree inventory extends to biochar application plots.',
    },
    {
      icon: FileCheck2,
      title: 'Audit-ready evidence pack',
      text: 'Sampling records, transport logs, application coordinates and lab results assemble into the document set a validation and verification body asks for.',
    },
    {
      icon: LineChart,
      title: 'Continuous monitoring',
      text: 'Applied-plot performance and soil condition are tracked over time, so co-benefit claims are backed by measurement rather than a single baseline survey.',
    },
    {
      icon: Layers,
      title: 'Registry-aligned reporting',
      text: 'Outputs are structured for Puro.earth CORC issuance and mapped to Verra and ICM reporting formats, so the same dataset serves multiple pathways.',
    },
  ];

  /* Standards a BCR project in India can credibly target */
  const standards = [
    {
      abbr: 'PURO',
      logo: puroLogo,
      name: 'Puro.earth Biochar Methodology',
      desc: 'The dominant route for durable BCR credits (CORCs). Edition 2025 tightens feedstock sustainability, H:Corg evidence and application tracking.',
    },
    {
      abbr: 'RAINBOW',
      logo: rainbowLogo,
      name: 'Rainbow Standard',
      desc: 'Europe\'s registry for engineered removals, ICVCM CCP-eligible. Its BiCRS methodology covers pyrolysis and biochar application to agricultural soils.',
    },
    {
      abbr: 'VCS',
      logo: verraLogo,
      name: 'Verra VM0044',
      desc: 'Methodology for biochar utilisation in soil and non-soil applications, the VCS pathway for projects already inside a Verra portfolio.',
    },
    {
      abbr: 'ISOMETRIC',
      logo: isometricLogo,
      name: 'Isometric',
      desc: 'A science-led registry whose biochar protocol leans hard on laboratory evidence and independent verification before any credit is issued.',
    },
  ];

  /* FAQ — also emitted as FAQPage JSON-LD */
  const faqs = [
    {
      question: 'What is biochar carbon removal (BCR)?',
      answer: 'Biochar carbon removal is a durable carbon dioxide removal method. Waste biomass (crop residue, forestry offcuts, invasive species) is heated to 500–700°C in a low-oxygen environment through a process called pyrolysis. Rather than decomposing or burning and releasing its carbon back to the atmosphere, the biomass is converted into a stable, carbon-rich solid whose aromatic structure resists microbial breakdown for centuries. Applying that biochar to soil or embedding it in construction materials locks the carbon away, creating a measurable, durable removal.',
    },
    {
      question: 'How long does carbon stay locked in biochar?',
      answer: 'Durability depends on how completely the biomass was carbonised. Standards use the H:Corg molar ratio as the primary indicator, generally requiring it below 0.7 for credited material. Well-produced biochar is widely credited on a permanence horizon of 100 years or more, and petrographic analysis of the inert fraction supports far longer stability. Long-term field studies tracking applied biochar over fifteen years have found the inertinite and semi-inertinite shares virtually unchanged.',
    },
    {
      question: 'Why is biochar considered a durable removal rather than an avoidance credit?',
      answer: 'Avoidance credits stop an emission that would otherwise occur. Biochar physically takes CO₂ out of the atmosphere (through the plant growth that produced the feedstock) and then prevents that carbon from returning by converting it into a form biology cannot easily degrade. Because the removal is completed at the moment of pyrolysis and the resulting carbon has no standing asset that can burn down or be cut, buyers classify it alongside engineered removals such as DACCS and BECCS rather than alongside nature-based avoidance.',
    },
    {
      question: 'Which standards certify biochar carbon credits?',
      answer: 'The dominant route is the Puro.earth Biochar Methodology, which issues CO₂ Removal Certificates (CORCs); its 2025 edition tightened requirements on feedstock sustainability, H:Corg evidence and application tracking. Verra\'s VM0044 covers biochar utilisation under the VCS programme. The European Biochar Certificate (including EBC-Agro and the Global Artisan C-Sink standard) covers both industrial plants and decentralised kilns. Sylithe structures project evidence to serve these pathways from a single dataset.',
    },
    {
      question: 'What does dMRV add to a biochar project?',
      answer: 'Biochar credibility rests on a chain of evidence rather than a single satellite measurement: where the feedstock came from, how each batch was produced, what the laboratory found, and where the material was ultimately applied. Digital MRV makes that chain continuous and tamper-evident. Sylithe combines satellite LULC screening of feedstock sourcing, batch-level production records, QR-traceable chain of custody through to the application plot, and an assembled evidence pack ready for a validation and verification body.',
    },
    {
      question: 'Is biochar viable at scale in India?',
      answer: 'India is one of the strongest biochar opportunities globally. The country generates several hundred million tonnes of agricultural residue each year, a large share of which is burned in the open, creating both a severe air quality problem and a wasted carbon resource. Converting that residue into biochar addresses residue management, soil degradation and durable carbon removal simultaneously. The constraint is not feedstock availability but verifiable evidence, which is precisely the gap dMRV closes.',
    },
    {
      question: 'How does biochar compare with ARR carbon projects?',
      answer: 'They are complementary rather than competing. ARR removes carbon gradually as trees grow across a 20–40 year crediting period, and carries reversal risk from fire, drought and harvest. Biochar completes its removal instantly at pyrolysis and has effectively no reversal exposure once applied. Their measurement stacks differ too: ARR relies on canopy height, above-ground biomass and dynamic baselines, while biochar relies on mass balance, laboratory carbon analysis and chain of custody. Most corporate buyers now hold both: nature-based removals and durable removals sit on separate lines in a credible net-zero portfolio.',
    },
    {
      question: 'What feedstocks can be used for biochar production?',
      answer: 'Sustainable biochar uses waste and residue streams: crop residue such as rice husk, straw and bagasse; forestry and sawmill offcuts; prunings from orchards and plantations; and invasive biomass cleared for ecological management. Woody feedstocks generally carbonise to a higher fixed-carbon fraction and greater stability, while agricultural residues are more nutrient-rich but yield lower structural durability at the same temperature. What standards will not accept is biomass sourced by clearing standing forest, which is why satellite verification of feedstock origin matters.',
    },
    {
      question: 'Does biochar have non-durable uses too?',
      answer: 'Yes, and the distinction matters for crediting. Biochar used as a soil amendment or bound into construction materials keeps its carbon locked away and can be credited as durable removal. Biochar used in wastewater filtration, plastics, paper, textiles or metallurgy may deliver real industrial value, but the carbon can re-enter the atmosphere at end of life. Standards credit the durable applications, which is why tracking where each batch actually ends up is part of the MRV requirement rather than an optional extra.',
    },
  ];

  // overflow-x-clip, not overflow-hidden: clip contains the slide-in animations
  // horizontally WITHOUT creating a scroll container, so the sticky editorial
  // headings further down the page still work.
  return (
    <div className="w-full bg-[#F1F1F1] font-sans text-[#0F172A] pt-20 overflow-x-clip">
      <SEOHead
        title="dMRV for Biochar Carbon Projects"
        description="dMRV for biochar carbon projects: satellite feedstock verification, batch-level pyrolysis records, chain of custody and Puro.earth-aligned evidence packs."
        path="/project-types/biochar"
        keywords="dMRV for biochar, biochar dMRV, biochar MRV platform, best MRV platform for biochar, best biochar carbon platform in India, biochar dMRV software, digital MRV for biochar, biochar carbon removal MRV, biochar monitoring reporting verification, biochar carbon credits, biochar carbon credits India, BCR carbon credits, biochar carbon removal, durable carbon dioxide removal, engineered carbon removal India, pyrolysis carbon removal, how to sell biochar carbon credits, biochar carbon credit price, biochar project developer India, Puro.earth biochar methodology, CORC carbon removal certificate, CORCCHAR index, Verra VM0044, European Biochar Certificate, EBC-Agro, Global Artisan C-Sink, Rainbow Standard biochar, Isometric biochar protocol, ICVCM CCP durable removals, Indian Carbon Market biochar, CCTS biochar, H:Corg molar ratio, biochar permanence, random reflectance biochar, recalcitrant carbon fraction, biochar feedstock verification, satellite LULC feedstock screening, biochar chain of custody, pyrolysis batch records, biochar application tracking, biochar evidence pack, Kon-Tiki kiln carbon credits, continuous pyrolysis plant MRV, crop residue biochar India, stubble burning alternative, agricultural residue carbon removal"
        speakableSelectors={['h1', '.biochar-hero-description']}
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

      {/* ════════════ 1. HERO — card left, biochar image right ════════════ */}
      {/* Wider container + tighter gutters than the rest of the page: the two
          columns need the extra width to carry the 72px headline on one line. */}
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
                Carbon Removal Technology
              </span>
              {/* Steps DOWN at lg: that is where the grid splits into two
                  columns, so the headline suddenly has half the width. It only
                  reaches the reference 72px at 2xl, where "Biochar Carbon"
                  still fits on one line. */}
              <h1 className="mt-10 text-5xl md:text-6xl lg:text-[46px] xl:text-[58px] 2xl:text-[72px] font-bold text-[#0F172A] leading-[1.05] tracking-tight">
                Biochar Carbon<br />Removal
              </h1>
            </div>

            <p className="biochar-hero-description mt-12 text-[28px] md:text-[36px] lg:text-[26px] xl:text-[32px] 2xl:text-[40px] font-normal text-[#0F172A] leading-[1.25] tracking-tight">
              Durable carbon, measured and traced from residue to soil.
            </p>
          </motion.div>

          <motion.div variants={slideInRight} className="relative rounded-xl overflow-hidden min-h-[480px] lg:min-h-[610px]">
            <img
              src={heroImage}
              alt="Close-up of charcoal-black biochar fragments layered over dark soil"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ 2. OVERVIEW — image left, card right ════════════ */}
      {/* Same container/gutters as the hero so both blocks share an edge. */}
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
              alt="Biomass feedstock moving along conveyors inside a biochar production facility"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            {/* Photo credit — revealed on hover, as on the reference page */}
            {/* w-fit + a max-width guard: the box hugs the credit on one line
                and only wraps once the column is too narrow to hold it. */}
            <figcaption className="absolute bottom-4 left-4 w-fit max-w-[calc(100%-2rem)] rounded-lg bg-white px-4 py-2.5 text-[13px] md:text-[15px] leading-snug text-[#0F172A] shadow-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              <a
                href="https://www.exomadgreen.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563eb] hover:underline underline-offset-4"
              >
                Exomad Green
              </a>
              &apos;s biochar facility in Bolivia (photo: Exomad Green)
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
              Biochar Carbon Removal (BCR) is among the most immediately scalable and
              cost-competitive durable carbon dioxide removal pathways available today.
              In 2024,{' '}
              <a
                href="https://www.cdr.fyi/blog/2024-year-in-review"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563eb] underline underline-offset-4 decoration-[#2563eb]/50 hover:decoration-[#2563eb]"
              >
                86% of all durable CDR deliveries
              </a>{' '}
              came from biochar, making it the leading durable method actually in the
              ground rather than on a roadmap. For India, sitting on hundreds of millions
              of tonnes of annual crop residue, the constraint has never been feedstock.
              It has been{' '}
              <Link to="#the-science" className="text-[#16a34a] underline underline-offset-4 decoration-[#16a34a]/40 hover:decoration-[#16a34a]">
                verifiable evidence
              </Link>.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════ 3. HOW IT WORKS — full-bleed process film ════════════ */}
      <section id="how-it-works" className="pt-16 scroll-mt-24">
        <div className="px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto border-t border-slate-400 pt-14">
            <motion.h2
              className="text-4xl md:text-6xl font-normal text-[#0F172A] leading-tight mb-12"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            >
              How It Works
            </motion.h2>
          </div>
        </div>

        {/* Breaks the container: the film runs the full width of the tab. */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <BiocharProcessVideo fullBleed />
        </motion.div>
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
              Four checkpoints turn that process into a creditable tonne
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
            <SectionHeading>Why the carbon stays put.</SectionHeading>
            <p className={bodyStyle}>
              Durability is the whole argument for biochar. Everything a buyer pays a
              premium for (and everything a verifier will interrogate) comes back to
              whether the carbon in a given batch is genuinely resistant to decay.
            </p>
          </motion.div>

          {/* ── Block 1 ── */}
          <Editorial eyebrow="The mechanism" title="What pyrolysis actually changes">
            <P>
              Left alone, crop residue rots or burns, and within a season or two the carbon
              it holds is back in the atmosphere. Pyrolysis interrupts that cycle at exactly
              the point of release. Heating biomass to <B>500–700°C in a low-oxygen
              environment</B> drives off water and volatile compounds without letting the
              carbon combust.
            </P>
            <P>
              What remains is not simply burnt plant matter. The carbon reorganises into
              sheets of <B>fused aromatic rings</B>, a dense, highly ordered structure that
              offers very few of the chemical footholds soil microbes rely on to break
              organic matter down. That structural change is the removal. Everything
              afterwards is a question of proving it happened and keeping the material
              somewhere it will stay.
            </P>
            <Callout>
              The practice itself is not new. The <em>terra preta</em> soils of the Amazon
              basin, deliberately enriched with charred biomass over 2,000 years ago,
              remain measurably carbon-rich and fertile today. What is new is the ability to
              prove it, batch by batch, at commercial scale.
            </Callout>
          </Editorial>

          {/* ── Block 2 ── */}
          <Editorial eyebrow="Quality" title="What decides whether biochar actually lasts">
            <P>
              Not every tonne of biochar is equivalent. The feedstock it came from, how wet
              that feedstock was, and how hot and how long the reactor ran all shape the
              final product, and therefore how much of it counts as durable carbon.
            </P>
            <Bullets
              items={[
                {
                  lead: 'H:Corg molar ratio',
                  text: 'the primary proxy for how thoroughly biomass has carbonised. Below 0.7 is the threshold most standards require; below 0.4 indicates highly recalcitrant carbon.',
                },
                {
                  lead: 'Random reflectance (Ro%)',
                  text: 'a petrographic measurement borrowed from coal science. Carbon above the inertinite threshold is treated as geologically stable, not merely slow to decay.',
                },
                {
                  lead: 'Feedstock character',
                  text: 'woody and hardwood inputs carbonise to higher fixed-carbon fractions. Agricultural residues are more nutrient-rich but yield lower structural stability at the same temperature.',
                },
                {
                  lead: 'Process temperature',
                  text: 'a higher peak drives a greater recalcitrant fraction, which is why continuous kiln telemetry, rather than a single spot reading, is what a verifier needs to see.',
                },
              ]}
            />
            <P>
              Which of these a standard treats as decisive varies. That is why Sylithe
              records all of them against every batch rather than optimising for one
              registry&apos;s current preference.
            </P>
          </Editorial>

          {/* ── Block 3 ── */}
          <Editorial eyebrow="Evidence" title="Three independent lines of evidence">
            <P>
              The permanence case does not rest on a single study. Three separate strands of
              published work converge on the same conclusion, each closing a different gap
              an auditor might otherwise push on.
            </P>
            <Bullets
              items={[
                {
                  lead: 'A measurable threshold',
                  text: 'reflectance-based benchmarking separates the genuinely inert fraction from carbon that will eventually cycle, giving verifiers a physical measurement to qualify against instead of a modelled assumption.',
                },
                {
                  lead: 'Fifteen years in the ground',
                  text: 'long-term field trials tracking applied biochar found the inertinite and semi-inertinite fractions essentially unchanged over that period, observational support rather than extrapolation from lab conditions.',
                },
                {
                  lead: 'A mechanism, not a correlation',
                  text: 'structural studies link degree of aromaticity directly to observed durability, explaining why the lattice resists microbial attack rather than simply reporting that it does.',
                },
              ]}
            />
          </Editorial>

          {/* ── Block 4 ── */}
          <Editorial eyebrow="Scale" title="One pathway, two very different builds">
            <P>
              Biochar is unusual among durable removal pathways in that it works at both
              ends of the capital spectrum. A farmer cooperative and a commissioned
              industrial plant are running the same chemistry, but almost nothing else
              about the two projects looks alike.
            </P>
            <div className="grid sm:grid-cols-2 gap-5 my-8">
              {productionModels.map(({ icon: Icon, tag, title, text, points }) => (
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
              The MRV burden inverts between them. Artisan kilns are cheap to run and hard
              to instrument; industrial plants generate telemetry by default but have to
              reconcile it against feedstock provenance across a much larger supply
              catchment. Sylithe adapts to the production model rather than forcing the
              project to adapt to the software.
            </P>
          </Editorial>

          {/* ── Block 5 ── */}
          <Editorial eyebrow="End use" title="Where the carbon ends up decides if it counts">
            <P>
              Producing biochar is only half of a carbon removal. The material has to go
              somewhere it will stay, and standards draw a hard line between end uses that
              hold the carbon and end uses that eventually release it.
            </P>
            <div className="grid sm:grid-cols-2 gap-5 my-8">
              <div className="border border-[#0F172A] bg-white/50 p-6">
                <p className="text-[11px] tracking-widest text-[#16a34a] uppercase font-bold mb-3">
                  Creditable: durable storage
                </p>
                <p className="text-[14px] leading-relaxed text-slate-600">
                  Worked into agricultural soil, or bound into concrete, asphalt and other
                  building materials. The carbon stays fixed, and the application point can
                  be recorded, sampled and revisited.
                </p>
              </div>
              <div className="border border-[#0F172A] bg-white/50 p-6">
                <p className="text-[11px] tracking-widest text-slate-400 uppercase font-bold mb-3">
                  Not creditable: transient use
                </p>
                <p className="text-[14px] leading-relaxed text-slate-500">
                  Wastewater filtration, plastics, paper, textiles and metallurgy are genuine
                  industrial markets for biochar, but the carbon can return to the
                  atmosphere at end of life, so standards do not credit them as removals.
                </p>
              </div>
            </div>
            <P>
              This is precisely why chain of custody is not administrative overhead. A tonne
              that leaves the kiln and cannot be traced to a durable application is a tonne
              that cannot be credited, however good the laboratory certificate looks.
            </P>
          </Editorial>
        </div>
      </section>
      {/* ════════════ 10. THE SYLITHE LAYER ════════════ */}
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
              Biochar credibility is a chain of custody problem.
            </SectionHeading>
            <p className={bodyStyle}>
              A forest project can be measured from orbit. A biochar project cannot: its
              integrity lives in the links between feedstock, kiln, laboratory and field.
              Break any one link and the credit is unverifiable. Sylithe instruments the
              whole chain.
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

      {/* ════════════ 12. STANDARDS ════════════ */}
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
              Sylithe structures BCR project data so the same underlying records can serve
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


      {/* ════════════ 13. CTA ════════════ */}
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
              Developing a biochar project?
            </h2>
            <p className="text-lg text-white/55 leading-[1.7] mb-10">
              Whether you are running a single Kon-Tiki kiln or commissioning an industrial
              pyrolysis plant, the evidence requirements are the same. Let&apos;s build the
              MRV layer before the first batch, not after the auditor asks.
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
                href="mailto:info@sylithe.com?subject=Biochar%20Carbon%20Removal%20Project%20Enquiry"
                className="border-2 border-white/25 text-white px-8 py-4 rounded-full font-medium text-base hover:bg-white/10 transition-all active:scale-95 inline-flex items-center gap-2"
              >
                Talk to our team
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════ 14. FAQ ════════════ */}
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
              Common questions from developers and buyers evaluating biochar carbon removal.
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

export default BiocharCarbonRemoval;
