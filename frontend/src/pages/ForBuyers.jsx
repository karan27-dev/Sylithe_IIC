import React from 'react';
import SEOHead from '../components/SEOHead';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiCheck, HiThumbDown, HiArrowRight, HiShieldCheck, HiChartBar, HiEye,
  HiLightningBolt, HiOutlineDocumentSearch, HiOutlineGlobeAlt,
} from 'react-icons/hi';

import satelliteImg from '../assets/chm22.png';
import graphImg from '../assets/DCAB30.png';
import dashboardImg from '../assets/dashboard.jpg';
import logo from '../assets/treee13.png';

/* Brand palette only — dark green #08292F/#06140F · emerald #16a34a
   · lime #a4fca1 · light #F1F1F1/#FFF · ink #0F172A · body slate-600 */

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const Kicker = ({ children, on = 'light' }) => (
  <motion.span variants={fadeUp}
    className={`mb-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] ${on === 'dark' ? 'text-[#a4fca1]' : 'text-[#16a34a]'}`}>
    {children}
  </motion.span>
);

const STANDARDS = ['Verra VCS', 'Gold Standard', 'ICM / CCTS', 'IC-VCM CCP', 'IPCC Tier 2'];

const CAPABILITIES = [
  {
    title: 'Satellite carbon-stock',
    desc: 'Quantify above- and below-ground biomass across the whole project — wall-to-wall, at high resolution, not a 5–15% field sample.',
    img: satelliteImg,
  },
  {
    title: 'Dynamic baselines (DCAB)',
    desc: 'Our counterfactual model compares each project against matched control areas, so you see real additionality instead of static assumptions.',
    img: graphImg,
  },
  {
    title: 'Continuous risk scoring',
    desc: 'A live, multi-dimensional risk score across permanence, leakage, baseline deviation and land-use change — updated as new imagery arrives.',
    img: dashboardImg,
  },
];

const ForBuyers = () => (
  <div className="w-full bg-[#F1F1F1] font-sans text-[#0F172A] overflow-hidden">
    <SEOHead
      title="Buy Carbon Credits in India | Verified Carbon Offset Platform | Sylithe"
      description="Buy high-integrity carbon credits in India with satellite-verified due diligence. Detect over-crediting, evaluate project quality & de-risk your portfolio with Sylithe's dMRV intelligence."
      keywords="buy carbon credits India, verified carbon credits India, carbon offset India, corporate carbon offset India, carbon credit due diligence, high-integrity carbon credits, voluntary carbon market India"
      path="/for-buyers"
    />

    {/* ===== HERO ===== */}
    <section className="relative flex min-h-[84vh] items-center px-6 py-28 md:px-12 lg:px-24">
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#16a34a]/10 blur-[120px]" />
      <motion.div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2" initial="hidden" animate="visible" variants={stagger}>
        <div>
          <Kicker>For Corporate Buyers &amp; Investors</Kicker>
          <motion.h1 variants={fadeUp} className="mb-6 text-4xl font-semibold leading-[1.08] tracking-tight text-[#08292F] md:text-5xl lg:text-[3.4rem]">
            Buy carbon credits with <span className="text-[#16a34a]">verified confidence</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mb-9 max-w-lg text-lg leading-relaxed text-slate-600">
            Sylithe gives you pre-issuance, satellite-grade MRV intelligence, so you can evaluate project quality, performance and reversal risk before you commit capital.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
            <Link to="/platform" className="group inline-flex items-center gap-2 rounded-full bg-[#08292F] px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#06140F]">
              Explore the platform
              <HiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/methodology/dcab" className="rounded-full border border-[#0F172A]/15 px-8 py-3.5 text-sm font-semibold text-[#0F172A] transition-colors duration-200 hover:border-[#08292F] hover:bg-[#08292F] hover:text-white">
              View methodology
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} className="mt-10 border-t border-black/10 pt-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Aligned with</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {STANDARDS.map((s) => <span key={s} className="text-[13px] font-medium text-slate-500">{s}</span>)}
            </div>
          </motion.div>
        </div>

        {/* transparent floating visual (no box) */}
        <motion.div variants={fadeUp} className="relative flex justify-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 -m-10 rounded-full bg-[#16a34a]/10 blur-[90px]" />
          <img src={satelliteImg} alt="Satellite-based carbon verification" loading="eager" className="relative max-h-[500px] w-full object-contain" />
        </motion.div>
      </motion.div>
    </section>

    {/* ===== THE PROBLEM ===== */}
    <section className="bg-[#08292F] px-6 py-24 text-white md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14">
          <Kicker on="dark">The Problem</Kicker>
          <motion.h2 variants={fadeUp} className="max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
            The carbon market has a trust deficit
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/60">
            Buyers face growing scrutiny, yet most credits are still purchased on paper documentation and self-reported data. The result is real financial and reputational exposure.
          </motion.p>
        </motion.div>
        <motion.div className="grid gap-6 md:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {[
            { stat: '40%+', label: 'of credits may be over-credited, according to recent independent studies' },
            { stat: '$1.3B', label: 'in credit value at risk from reversal and non-permanence events' },
            { stat: '6–18 mo', label: 'typical lag between project activity and third-party verification' },
          ].map((item) => (
            <motion.div key={item.stat} variants={fadeUp} className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition-colors duration-200 hover:border-[#a4fca1]/30">
              <p className="mb-3 text-4xl font-semibold text-[#a4fca1]">{item.stat}</p>
              <p className="text-sm leading-relaxed text-white/70">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ===== WHAT YOU GET (Sylvera-style feature cards) ===== */}
    <section className="bg-[#FAFBFA] px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14 max-w-2xl">
          <Kicker>What You Get</Kicker>
          <motion.h2 variants={fadeUp} className="text-3xl font-semibold leading-tight text-[#08292F] md:text-[2.6rem]">
            Independent forest data, delivered on demand
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg leading-relaxed text-slate-600">
            Accurate carbon stock with independent evidence. Verify claims before you commit, with the coverage and accuracy that field campaigns can't deliver.
          </motion.p>
        </motion.div>
        <motion.div className="grid gap-6 md:grid-cols-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {CAPABILITIES.map((c) => (
            <motion.div key={c.title} variants={fadeUp} className="group flex flex-col rounded-3xl border border-black/5 bg-white p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(8,41,47,0.1)]">
              <h3 className="text-xl font-semibold text-[#08292F]">{c.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{c.desc}</p>
              <div className="mt-8">
                <img src={c.img} alt={c.title} loading="lazy" className="mx-auto h-44 w-full object-contain transition-transform duration-500 group-hover:scale-105" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ===== HOW IT WORKS ===== */}
    <section className="bg-[#F1F1F1] px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14 flex flex-col items-center text-center">
          <Kicker>How It Works</Kicker>
          <motion.h2 variants={fadeUp} className="mx-auto max-w-2xl text-3xl font-semibold leading-tight text-[#08292F] md:text-4xl">
            From project discovery to confident purchase
          </motion.h2>
        </motion.div>
        <motion.div className="relative grid gap-8 md:grid-cols-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-[#16a34a]/30 to-transparent md:block" />
          {[
            { step: '01', icon: HiOutlineGlobeAlt, title: 'Upload or select project', desc: 'Import a KML boundary or browse indexed nature-based projects across India.' },
            { step: '02', icon: HiLightningBolt, title: 'Automated MRV analysis', desc: 'Sylithe runs CHM, LULC, AGB and DCAB models on the project area.' },
            { step: '03', icon: HiOutlineDocumentSearch, title: 'Review risk report', desc: 'Get a full risk score with permanence, leakage and baseline metrics.' },
            { step: '04', icon: HiShieldCheck, title: 'Buy with evidence', desc: 'Commit to credits backed by satellite evidence, not just paper documentation.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <motion.div key={step} variants={fadeUp} className="relative">
              <div className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#16a34a]/20 bg-white text-xl text-[#16a34a] shadow-sm">
                <Icon />
              </div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#16a34a]">Step {step}</span>
              <h3 className="mb-2 text-lg font-semibold text-[#08292F]">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ===== COMPARISON (Sylvera-style) ===== */}
    <section className="bg-[#FAFBF8] px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14 text-center">
          <motion.h2 variants={fadeUp} className="text-3xl font-semibold leading-tight text-[#08292F] md:text-[2.6rem]">
            What sets Sylithe apart
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            Our verification is built on high-resolution satellite data and dynamic baselines, delivering market-leading accuracy at a fraction of field-survey cost and time.
          </motion.p>
        </motion.div>

        <motion.div className="grid gap-6 md:grid-cols-2" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {/* Typical */}
          <motion.div variants={fadeUp} className="rounded-3xl border border-black/5 bg-[#F5F6F2] p-8">
            <h3 className="pb-5 text-center text-xl font-semibold text-slate-500">Conventional diligence</h3>
            <div className="-mx-8 mb-6 border-b border-black/10" />
            <div className="space-y-5">
              {['Field campaigns cover only 5–15% of the project area', 'Months to collect and process data', 'A single point-in-time snapshot', 'Generic allometric models with hidden uncertainty', 'Expensive to repeat or update', 'Reversal risk discovered after purchase'].map((t) => (
                <div key={t} className="flex items-start gap-3.5">
                  <HiThumbDown className="mt-0.5 shrink-0 text-lg text-slate-400" />
                  <p className="text-[15px] leading-snug text-slate-600">{t}</p>
                </div>
              ))}
            </div>
          </motion.div>
          {/* Sylithe */}
          <motion.div variants={fadeUp} className="rounded-3xl border-2 border-[#16a34a]/50 bg-white p-8 shadow-[0_20px_60px_rgba(8,41,47,0.08)]">
            <div className="flex items-center justify-center gap-2 pb-5">
              <img src={logo} alt="" className="h-6 w-6 object-contain" />
              <span className="text-xl font-semibold text-[#08292F]">Sylithe</span>
            </div>
            <div className="-mx-8 mb-6 border-b border-[#16a34a]/30" />
            <div className="space-y-5">
              {['Wall-to-wall coverage at high resolution (≤30 cm)', 'Results in hours, not months', 'Continuous, near real-time monitoring', 'Dynamic counterfactual baselines (DCAB)', 'Explicit, quantified uncertainty', 'Independent, science-backed and auditable'].map((t) => (
                <div key={t} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#08292F] text-white"><HiCheck className="text-sm" /></span>
                  <p className="text-[15px] leading-snug text-[#0F172A]">{t}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-12 flex justify-center">
          <Link to="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#a4fca1] px-8 py-3.5 text-sm font-semibold text-[#08292F] transition-colors duration-200 hover:bg-[#16a34a] hover:text-white">
            Request data access
            <HiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ===== PLATFORM PREVIEW ===== */}
    <section className="bg-[#F1F1F1] px-6 py-24 md:px-12 lg:px-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <Kicker>The Platform</Kicker>
          <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-semibold leading-tight text-[#08292F] md:text-4xl">
            See the evidence for yourself
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600">
            The Sylithe dashboard lets you visualise canopy-height models, run biomass estimates and assess project-level risk, all from your browser.
          </motion.p>
          <motion.ul variants={stagger} className="mb-9 space-y-3.5">
            {['Interactive map with pixel-level CHM data', 'KML upload for custom project boundaries', 'Exportable, audit-ready risk reports'].map((t) => (
              <motion.li key={t} variants={fadeUp} className="flex items-center gap-3 text-base font-medium text-[#0F172A]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#16a34a]/10 text-[#16a34a]"><HiCheck className="text-sm" /></span>{t}
              </motion.li>
            ))}
          </motion.ul>
          <motion.div variants={fadeUp}>
            <Link to="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#08292F] px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#06140F]">
              Try the dashboard
              <HiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative">
          <div aria-hidden className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-[#16a34a]/15 to-transparent" />
          <img src={dashboardImg} alt="Sylithe verification dashboard" loading="lazy" className="relative max-h-[420px] w-full rounded-2xl object-cover shadow-[0_24px_70px_rgba(8,41,47,0.2)] ring-1 ring-black/5" />
        </motion.div>
      </div>
    </section>

    {/* ===== CTA ===== */}
    <section className="relative overflow-hidden bg-[#06140F] px-6 py-28 text-center text-white md:px-12 lg:px-24">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#16a34a]/15 blur-[120px]" />
      <motion.div className="relative mx-auto max-w-3xl" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
        <motion.h2 variants={fadeUp} className="mb-6 text-3xl font-semibold leading-tight md:text-4xl">
          Ready to buy carbon with confidence?
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mb-10 max-w-xl text-lg text-white/70">
          Join the corporates and investors using satellite intelligence to de-risk their carbon portfolios.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="rounded-full bg-[#a4fca1] px-8 py-3.5 text-sm font-semibold text-[#08292F] transition-colors duration-200 hover:bg-white">
            Get started
          </Link>
          <Link to="/about" className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:border-white/50 hover:bg-white/10">
            Talk to us
          </Link>
        </motion.div>
      </motion.div>
    </section>
  </div>
);

export default ForBuyers;
