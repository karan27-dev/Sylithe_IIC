import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiOutlineClock, HiOutlineCalendar, HiOutlineTag, HiSearch } from "react-icons/hi";
import SEOHead from '../components/SEOHead';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { BLOG_POSTS } from '../data/blogData';

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

// --- CATEGORY CONFIG ---
const CATEGORIES = [
  { id: 'all', label: 'All Posts' },
  { id: 'carbon-markets', label: 'Carbon Markets' },
  { id: 'technology', label: 'Technology' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'policy', label: 'Policy & Regulation' },
  { id: 'case-study', label: 'Case Studies' },
];

// --- BLOG CARD COMPONENT ---
const BlogCard = ({ post }) => (
  <motion.article variants={fadeInUp} className="h-full">
    <Link
      to={`/insights/${post.id}`}
      className="group flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#16a34a] hover:shadow-lg transition-all duration-300"
    >
      <div className="mb-8">
        <BrandedImage
          src={post.image}
          alt={post.title}
          aspect="aspect-video"
          id={post.id}
          position={['carbon-credit-price-discovery-india', 'additionality-carbon-credits-explained', 'verra-icm-alignment', 'scope-3-emissions-tracking', 'india-green-taxonomy-explained-2026'].includes(post.id) ? 'object-center' : 'object-center'}
        />
      </div>
      <div className="space-y-5 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          <span className="bg-[#EBF1ED] text-[#16a34a] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{post.categoryLabel}</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span>{post.readTime}</span>
        </div>
        <h3 className="text-2xl font-bold text-[#0F172A] leading-tight group-hover:text-[#16a34a] transition-colors duration-300 line-clamp-2 tracking-tight">
          {post.title}
        </h3>
        <p className="text-base text-slate-500 leading-relaxed line-clamp-3 font-light opacity-80">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between pt-6 mt-auto border-t border-slate-100">
          <span className="inline-flex items-center gap-2 text-[#16a34a] font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
            Read Insight <HiArrowRight />
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

import tree13 from '../assets/tree13.png';
import tree10 from '../assets/tree10.jpeg';
import lulc10 from '../assets/lulc10.png';
import lulc12 from '../assets/lulc12.png';
import chm10 from '../assets/CHM10.png';
import dcab20 from '../assets/DCAB20.png';

// --- BRAND MARK ---
const SylitheMark = () => (
  <img src={tree13} alt="Sylithe" className="w-5 h-5 object-contain opacity-60" />
);

// --- BRANDED IMAGE COMPONENT ---
const BrandedImage = ({ src, alt, aspect = "aspect-video", className = "", position = "object-center", id = "" }) => {
  const isInfographic = [
    'carbon-credit-price-discovery-india',
    'additionality-carbon-credits-explained',
    'high-integrity-carbon-credits-icvcm-ccps',
    'voluntary-vs-compliance-carbon-markets',
    'brsr-core-what-companies-must-know',
    'verra-icm-alignment',
    'scope-3-emissions-tracking',
    'india-green-taxonomy-explained-2026'
  ].includes(id);

  return (
    <div className={`relative ${aspect} overflow-hidden rounded-lg bg-[#F8FAFC] group ${className}`}>
      {/* Image with subtle zoom effect - disabled zoom for infographics */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full ${isInfographic ? 'object-contain p-2' : 'object-cover'} ${position} ${!isInfographic ? 'group-hover:scale-105' : ''} transition-transform duration-700 ease-out`}
      />
    </div>
  );
};

// --- PRIMARY FEATURED CARD (Latest Article style) ---
const PrimaryFeaturedCard = ({ post }) => (
  <motion.article
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={fadeInUp}
    className="group"
  >
    <Link to={`/insights/${post.id}`} className="block">
      <div className="relative mb-6">
        <BrandedImage
          src={post.image}
          alt={post.title}
          aspect="aspect-[16/9]"
          className="max-h-[260px] md:max-h-[320px]"
          id={post.id}
          position="object-center"
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-5">
          <span className="bg-[#EBF1ED] text-[#16a34a] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{post.categoryLabel}</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span className="flex items-center gap-2"><HiOutlineCalendar className="text-sm" /> {post.date}</span>
          <span className="flex items-center gap-2"><HiOutlineClock className="text-sm" /> {post.readTime}</span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-normal text-[#0F172A] leading-tight tracking-tight mb-4 group-hover:text-[#16a34a] transition-colors duration-500">
          {post.title}
        </h2>
        
        <p className="text-base text-slate-500 leading-relaxed font-light mb-5 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center gap-2 text-[#16a34a] font-bold text-sm group-hover:gap-4 transition-all duration-500">
          Read article <HiArrowRight />
        </div>
      </div>
    </Link>
  </motion.article>
);

// --- SECONDARY FEATURED CARD (Market Intelligence style) ---
const SecondaryFeaturedCard = ({ post, isLast }) => (
  <motion.article
    variants={fadeInUp}
    className={`group pb-10 ${!isLast ? 'border-b border-slate-100 mb-10' : ''}`}
  >
    <Link to={`/insights/${post.id}`} className="flex gap-8 items-start">
      <div className="w-40 h-28 flex-shrink-0 relative">
        <BrandedImage
          src={post.image}
          alt={post.title}
          aspect="h-full"
          className="h-full"
          id={post.id}
          position={['carbon-credit-price-discovery-india', 'additionality-carbon-credits-explained', 'verra-icm-alignment', 'scope-3-emissions-tracking', 'india-green-taxonomy-explained-2026'].includes(post.id) ? 'object-center' : 'object-center'}
        />
      </div>

      <div className="flex flex-col gap-3 py-1">
        <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          <span className="bg-[#EBF1ED] text-[#16a34a] text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{post.categoryLabel}</span>
          <span>{post.readTime}</span>
        </div>
        <h3 className="text-xl font-bold text-[#0F172A] leading-tight group-hover:text-[#16a34a] transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>
        <span className="inline-flex items-center gap-2 text-[#16a34a] font-bold text-sm group-hover:gap-4 transition-all duration-300 mt-2">
          Read article <HiArrowRight />
        </span>
      </div>
    </Link>
  </motion.article>
);


// --- MAIN COMPONENT ---
const Insights = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    // Simulate API call
    console.log(`Subscribing ${email} to newsletter...`);
    setSubscribed(true);
    setEmail('');
  };

  // Pinned editorial picks
  const PINNED_PRIMARY_ID = 'digital-mrv-carbon-projects-complete-guide';
  const PINNED_SECONDARY_IDS = [
    'indian-carbon-market-ccts-guide',
    'bm-en01001-renewable-energy-carbon-credits',
    'bm-t001-additionality-indian-carbon-market',
  ];

  const primaryPost = BLOG_POSTS.find(p => p.id === PINNED_PRIMARY_ID);
  const secondaryFeatured = PINNED_SECONDARY_IDS.map(id => BLOG_POSTS.find(p => p.id === id)).filter(Boolean);
  const editorialQueue = [primaryPost, ...secondaryFeatured].filter(Boolean);

  const isFiltering = activeCategory !== 'all' || searchQuery.trim() !== '';

  const filteredPosts = BLOG_POSTS.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-[#FFFFFF] font-sans text-[#0F172A] pt-20 overflow-hidden">
      <SEOHead
        title="Carbon Market & Compliance Insights | dMRV Research | Sylithe"
        description="Expert analysis on carbon credits in India, carbon compliance, ICM regulations, dMRV technology & BRSR reporting. Stay ahead with Sylithe's carbon market research."
        keywords="carbon market India insights, carbon credits India, carbon compliance India, ICM carbon market, BRSR reporting, carbon credit news India, dMRV research, carbon offset India, voluntary carbon market, CCTS India"
        path="/insights"
      />

      {/* ========== HERO ========== */}
      <section className="pt-20 pb-16 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#E2F1E7] to-[#FFFFFF] border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center flex flex-col items-center"
          >
            <SectionLabel>Insights & Research</SectionLabel>
            <H1 className="text-4xl md:text-6xl font-normal leading-tight mb-6">
              Research for the <br />
              <span className="text-[#16a34a]">evolving carbon economy.</span>
            </H1>
            <Body large className="max-w-2xl text-slate-500">
              Insights and analysis on carbon markets, verification systems, climate data, and carbon infrastructure.
            </Body>
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURED INSIGHTS SECTION (Sylvera Style) ========== */}
      {!isFiltering && editorialQueue.length > 0 && (
        <section className="pb-24 px-6 md:px-12 lg:px-24 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-12">
              <h2 className="text-3xl font-normal text-[#08292F]" style={{ fontFamily: s.heading }}>Featured insights</h2>
            </div>
            <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">

              {/* Primary Article (Left) */}
              <div className="lg:col-span-7">
                {primaryPost && <PrimaryFeaturedCard post={primaryPost} />}
              </div>

              {/* Featured List (Right) */}
              <div className="lg:col-span-5 pt-2">
                <div className="flex flex-col">
                  {secondaryFeatured.map((post, idx) => (
                    <SecondaryFeaturedCard
                      key={post.id}
                      post={post}
                      isLast={idx === secondaryFeatured.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== CATEGORY FILTERS ========== */}
      <section className="px-6 md:px-12 lg:px-24 py-8 bg-[#FFFFFF] sticky top-20 z-30 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeCategory === cat.id
                    ? 'bg-[#EBF1ED] text-[#16a34a]'
                    : 'bg-[#F4F7F5] text-slate-600 hover:bg-[#EBF1ED] hover:text-[#16a34a]'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-slate-100 bg-[#F4F7F5] focus:bg-white focus:border-[#16a34a]/30 outline-none text-sm w-64 transition-all"
            />
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          </div>
        </div>
      </section>

      {/* ========== BLOG GRID ========== */}
      <section className="py-12 px-6 md:px-12 lg:px-24 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredPosts.length === 0 && (isFiltering || editorialQueue.length === 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
              <p className="text-slate-400 text-lg font-light">No research papers found in this category.</p>
              <button onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="mt-4 text-[#16a34a] font-bold hover:underline uppercase tracking-widest text-xs">View all intelligence</button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ========== NEWSLETTER CTA ========== */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#0F172A] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full border border-white/5 rounded-[100%] scale-[2] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full border border-[#16a34a]/20 rounded-[100%] scale-[1.5] bg-[#16a34a]/5 pointer-events-none blur-3xl" />
        <motion.div className="max-w-3xl mx-auto relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <SectionLabel className="text-[#16a34a]">Stay informed</SectionLabel>
          <H1 className="text-white mb-8">Never miss an <br />insight.</H1>
          <Body large className="text-slate-300 mb-10">
            Join carbon market professionals, project developers, and climate leaders who rely on Sylithe's research to stay ahead of the curve.
          </Body>

          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.form
                key="form"
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto"
                exit={{ opacity: 0, y: -20 }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent text-base"
                />
                <button type="submit" className="bg-[#16a34a] text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white hover:text-[#0F172A] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                  Subscribe <HiArrowRight />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#16a34a]/20 border border-[#16a34a]/30 p-8 rounded-3xl max-w-lg mx-auto"
              >
                <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                <p className="text-slate-300">Thanks for subscribing. We'll send you our latest research soon.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-slate-500 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </motion.div>
      </section>
    </div>
  );
};

export default Insights;
