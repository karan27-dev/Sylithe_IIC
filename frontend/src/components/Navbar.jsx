import React, { useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlineArrowRight } from "react-icons/hi";
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

// --- 1. IMPORT YOUR PNG LOGO HERE ---
// Make sure your file is named 'sylithe-logo.png' and is in the 'src/assets' folder
import sylitheLogo from '../assets/treee13.png';

// Icons for the menu items
import { RiMapPin2Line, RiBarChartGroupedLine, RiGlobalLine, RiFileList3Line } from "react-icons/ri";
import { TbTrees, TbSatellite, TbMathFunction, TbBrandCarbon } from "react-icons/tb";

// --- Solutions menu data (shared by the desktop dropdown and the mobile sheet) ---
// "Methodology" = how Sylithe measures. "Project Types" = what Sylithe certifies.
const METHODOLOGY_LINKS = [
  { to: '/methodology/lulc', title: 'LULC Classification', desc: 'Land Use & Land Cover suitability and analysis.' },
  { to: '/methodology/chm',  title: 'CHM Model',           desc: 'Canopy Height Model using comprehensive Lidar data.' },
  { to: '/methodology/dcab', title: 'DCAB Model',          desc: 'Dynamic Control Area Baseline for accurate reporting.' },
  { to: '/methodology/agb',  title: 'AGB Calculation',     desc: 'Above Ground Biomass conversion equations and verified stock.' },
];

// `to: null` renders as a non-clickable "Soon" item until the page ships.
const PROJECT_TYPE_LINKS = [
  { to: '/project-types/biochar', title: 'Biochar Carbon Removal', desc: 'Durable CDR from pyrolysis, feedstock to field.', isNew: true },
  { to: '/project-types/arr',     title: 'ARR',   desc: 'Afforestation, Reforestation & Revegetation.' },
  { to: '/project-types/redd',    title: 'REDD+', desc: 'Avoided deforestation and forest degradation.' },
];

// --- Reusable Dropdown Link Item ---
const DropdownLinkItem = ({ title, description, to, icon: Icon }) => {
  const content = (
    <div className="flex gap-4 items-start">
      {Icon && (
        <div className="mt-1 p-2 bg-sylitheGreen/10 rounded-lg text-sylitheDark shrink-0">
          <Icon className="text-xl" />
        </div>
      )}
      <div>
        <h3 className="font-bold text-[#0F172A] group-hover/item:text-sylitheGreen transition-colors text-base">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed text-left">
          {description}
        </p>
      </div>
    </div>
  );

  const classes = "block group/item p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors text-left";

  if (to) return <Link to={to} className={classes}>{content}</Link>;
  return <a href="#" className={classes}>{content}</a>;
};

// --- Main Nav Item Logic ---
const NavItem = ({ title, id, hasDropdown, children, to, hoveredNav, setHoveredNav }) => {
  const isHovered = hoveredNav === id;

  const navContent = (
    <div className={`cursor-pointer flex items-center gap-1 font-medium transition-colors px-4 py-3
        ${isHovered ? 'text-[#0F172A]' : 'text-gray-600'}`}>
      {title}
      {hasDropdown && (
        <IoIosArrowDown className={`text-sm transition-transform duration-300 ${isHovered ? '-rotate-180 text-[#0F172A]' : 'text-gray-400'}`} />
      )}
    </div>
  );

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={() => setHoveredNav(id)}
      onMouseLeave={() => setHoveredNav(null)}
    >
      {to ? (
        <Link to={to} className="h-full flex items-center">
          {navContent}
        </Link>
      ) : (
        navContent
      )}
      <AnimatePresence>
        {hasDropdown && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 pt-4 z-50 w-max"
            // The solutions panel is now two columns wide, so it needs a deeper
            // left pull to stay centred under the trigger.
            style={{ left: id === 'solutions' ? '-300px' : '-100px' }}
          >
            <div className="absolute -top-4 left-0 w-full h-8 bg-transparent"></div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = ({ topOffset = 0 } = {}) => {
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // Hide if scrolling down and we aren't at the absolute top
    if (latest > previous && latest > 50) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });


  // --- PLATFORM MENU CONTENT ---
  // eslint-disable-next-line no-unused-vars
  const platformDropdownContent = (
    <div className="w-[900px] bg-[#F1F1F1] rounded-2xl shadow-xl border border-gray-200 overflow-hidden grid grid-cols-5">
      <div className="col-span-3 p-8 flex flex-col justify-between">
        <div className="space-y-6">
          <DropdownLinkItem
            title="The Sylithe Platform"
            description="Carbon management software for achievable climate action."
            to="/platform"
          />
          <DropdownLinkItem
            title="Request a custom demo"
            description="Meet one-on-one with an expert to explore the full Sylithe Platform."
          />
          <DropdownLinkItem
            title="Take a self-guided tour"
            description="Experience the Platform's Carbon Measurement solution."
          />
        </div>
        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-6 text-sm font-bold text-sylitheGreen">
          <Link to="/contact" className="hover:underline">Contact us</Link>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <Link to="/purchase" className="hover:underline">Purchase carbon credits</Link>
        </div>
      </div>
      <div className="col-span-2 bg-gray-50 p-8 border-l border-gray-100">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-left">Featured Insight</h4>
        <Link to="/insights/carbon-accounting" className="block bg-[#F1F1F1] rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group/card text-left">
          <div className="h-40 bg-gray-200">
            {/* You can replace this image later */}
            <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1000&auto=format&fit=crop" alt="Blog" className="w-full h-full object-cover" />
          </div>
          <div className="p-5">
            <span className="text-xs font-bold text-sylitheGreen uppercase tracking-wider">Carbon Accounting</span>
            <h3 className="font-bold text-[#0F172A] mt-2 leading-tight group-hover/card:text-sylitheGreen transition-colors">
              Carbon footprint data collection: Common challenges
            </h3>
            <div className="flex items-center gap-2 text-sylitheGreen font-bold text-sm mt-4 group/link">
              Read the blog <HiOutlineArrowRight />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );

  // --- SOLUTIONS DROP DOWN CONTENT ---
  // Two columns: how we measure (methodology) | what we certify (project types).
  const solutionsDropdownContent = (
    <div className="w-[760px] bg-[#F1F1F1] rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-left">
      <div className="grid grid-cols-2">

        {/* ── Column 1: measurement methodology ── */}
        <div className="p-6 pb-8">
          <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-100 pb-3">Our Methodology</h4>
          <div className="space-y-5">
            {METHODOLOGY_LINKS.map((m) => (
              <Link key={m.to} to={m.to} className="block group cursor-pointer">
                <h5 className="font-bold text-[#0F172A] group-hover:text-sylitheGreen transition-colors mb-1">{m.title}</h5>
                <p className="text-sm text-gray-500 leading-snug">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Column 2: project types ── */}
        <div className="p-6 pb-8 bg-gray-50 border-l border-gray-100">
          <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-200 pb-3">Project Types</h4>
          <div className="space-y-5">
            {PROJECT_TYPE_LINKS.map((p) => (
              p.to ? (
                <Link key={p.title} to={p.to} className="block group cursor-pointer">
                  <h5 className="font-bold text-[#0F172A] group-hover:text-sylitheGreen transition-colors mb-1 flex items-center gap-2">
                    {p.title}
                    {p.isNew && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#0fa958] via-[#34d399] to-[#a4fca1] text-[#08292f] text-[9px] font-extrabold tracking-[0.12em] uppercase px-2 py-0.5">
                        New
                      </span>
                    )}
                  </h5>
                  <p className="text-sm text-gray-500 leading-snug">{p.desc}</p>
                </Link>
              ) : (
                <div key={p.title} className="block cursor-default opacity-55">
                  <h5 className="font-bold text-[#0F172A] mb-1 flex items-center gap-2">
                    {p.title}
                    <span className="inline-flex items-center rounded-full border border-gray-300 text-gray-400 text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5">
                      Soon
                    </span>
                  </h5>
                  <p className="text-sm text-gray-400 leading-snug">{p.desc}</p>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-gray-50 border-t border-gray-100 py-4 px-6 flex items-center gap-6 text-sm font-bold text-sylitheGreen">
        <Link to="/contact" className="hover:underline">Contact us</Link>
        <div className="h-4 w-[1px] bg-gray-300" />
        <Link to="/platform" className="hover:underline">Explore the platform</Link>
      </div>
    </div>
  );




  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      style={{ top: topOffset }}
      className="w-full h-20 px-6 md:px-12 lg:px-24 flex items-center justify-between bg-[#F1F1F1]/95 backdrop-blur-md fixed z-50 border-b border-gray-100"
    >

      {/* --- LOGO SECTION --- */}
      <Link to="/" className="flex-shrink-0 cursor-pointer flex items-center gap-3 group">
        <img
          src={sylitheLogo}
          alt="Sylithe Logo"
          className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
        />

        <span className="text-[28px] font-heading font-black text-[#08292F] mt-1 tracking-wide">
          Sylithe
        </span>
      </Link>

      <div className="hidden lg:flex items-center relative h-full">
        <NavItem title="Home" id="home" hasDropdown={false} to="/" hoveredNav={hoveredNav} setHoveredNav={setHoveredNav} />
        <NavItem title="Solutions" id="solutions" hasDropdown={true} hoveredNav={hoveredNav} setHoveredNav={setHoveredNav}>
          {solutionsDropdownContent}
        </NavItem>
        <NavItem title="What We Offer" id="offer" hasDropdown={false} to="/what-we-offer" hoveredNav={hoveredNav} setHoveredNav={setHoveredNav} />
        <NavItem title="About Us" id="about" hasDropdown={false} to="/about" hoveredNav={hoveredNav} setHoveredNav={setHoveredNav} />
        <NavItem title="Platform" id="platform" hasDropdown={false} to="/platform" hoveredNav={hoveredNav} setHoveredNav={setHoveredNav} />
        <NavItem title="Insights" id="insights" hasDropdown={false} to="/insights" hoveredNav={hoveredNav} setHoveredNav={setHoveredNav} />
      </div>

      <div className="flex items-center gap-4 font-medium flex-shrink-0">
        <Link to="/login">
          <button className="hidden md:block text-gray-700 hover:text-black transition-colors">Login</button>
        </Link>
        <Link to="/signup">
          <button className="hidden sm:flex bg-[#08292f] text-white px-6 py-2.5 rounded-full items-center gap-2 hover:bg-[#062125] transition-all shadow-sm hover:shadow-md active:scale-95 font-bold">
            Get started<HiOutlineArrowRight className="text-lg" />
          </button>
        </Link>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-6 h-[2px] bg-[#08292F]" />
          <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-[2px] bg-[#08292F]" />
          <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-6 h-[2px] bg-[#08292F]" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-20 left-0 w-full bg-[#F1F1F1] border-b border-gray-200 shadow-lg lg:hidden overflow-hidden z-50"
          >
            <div className="flex flex-col px-6 py-6 gap-1">
              {[
                { title: "Home", to: "/" },
                { title: "What We Offer", to: "/what-we-offer" },
                { title: "About Us", to: "/about" },
                { title: "Platform", to: "/platform" },
                { title: "Insights", to: "/insights" },
                { title: "For Buyers", to: "/for-buyers" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-3 text-[#0F172A] font-semibold text-lg hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.title}
                </Link>
              ))}

              <div className="border-t border-gray-200 mt-3 pt-3">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Methodology</p>
                {METHODOLOGY_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 px-3 text-gray-600 font-medium text-base hover:bg-gray-100 rounded-lg transition-colors block"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-3 pt-3">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Types</p>
                {PROJECT_TYPE_LINKS.map((item) => (
                  item.to ? (
                    <Link
                      key={item.title}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 px-3 text-gray-600 font-medium text-base hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {item.title}
                      {item.isNew && (
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#0fa958] via-[#34d399] to-[#a4fca1] text-[#08292f] text-[9px] font-extrabold tracking-[0.12em] uppercase px-2 py-0.5">
                          New
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div
                      key={item.title}
                      className="py-2.5 px-3 text-gray-400 font-medium text-base flex items-center gap-2"
                    >
                      {item.title}
                      <span className="inline-flex items-center rounded-full border border-gray-300 text-gray-400 text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5">
                        Soon
                      </span>
                    </div>
                  )
                ))}
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 rounded-full border-2 border-[#08292F] text-[#08292F] font-bold">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-3 rounded-full bg-[#08292F] text-white font-bold">
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;