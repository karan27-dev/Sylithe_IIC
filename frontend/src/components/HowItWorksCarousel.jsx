import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineUpload, HiOutlineDatabase, HiOutlineGlobeAlt,
  HiOutlineChartBar, HiOutlineScale, HiOutlineDocumentReport,
} from "react-icons/hi";

import imgImport from "../assets/home1.png";
import imgIngest from "../assets/lulc7.png";
import imgLulc from "../assets/lulc10.png";
import imgBiomass from "../assets/chm22.png";
import imgBaseline from "../assets/DCAB30.png";
import imgReport from "../assets/dashboard.jpg";

const cn = (...c) => c.filter(Boolean).join(" ");

// The Sylithe dMRV pipeline, step by step.
const STEPS = [
  { id: "import", label: "Import Project Data", icon: HiOutlineUpload, image: imgImport, description: "Upload your project boundary as KML, GeoJSON or Shapefile. Sylithe validates the geometry, computes the geodesic area and prepares your AOI in minutes." },
  { id: "ingest", label: "Satellite Data Ingestion", icon: HiOutlineDatabase, image: imgIngest, description: "The engine automatically pulls every relevant satellite pass — from high-resolution imagery to multi-year archives — into one unified spatiotemporal stack." },
  { id: "eligibility", label: "Land Eligibility & LULC", icon: HiOutlineGlobeAlt, image: imgLulc, description: "Land-use / land-cover classification separates carbon-eligible from ineligible land and reconstructs a decade of land-cover change history." },
  { id: "biomass", label: "Canopy Height & Biomass", icon: HiOutlineChartBar, image: imgBiomass, description: "AI models estimate canopy height and above- and below-ground biomass to quantify carbon stock per hectare, aligned to IPCC Tier 2." },
  { id: "baseline", label: "Dynamic Baseline (DCAB)", icon: HiOutlineScale, image: imgBaseline, description: "Dynamic counterfactual baselines from matched control areas establish defensible, evidence-based additionality — no static assumptions." },
  { id: "report", label: "Audit-Ready Report", icon: HiOutlineDocumentReport, image: imgReport, description: "A Verra and Gold Standard-aligned dMRV report is generated and exported as a PDF, with all underlying data accessible via API." },
];

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 65;

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export default function HowItWorksCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex = ((step % STEPS.length) + STEPS.length) % STEPS.length;
  const nextStep = useCallback(() => setStep((p) => p + 1), []);

  const handleChipClick = (index) => {
    const diff = (index - currentIndex + STEPS.length) % STEPS.length;
    if (diff > 0) setStep((sVal) => sVal + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index) => {
    const diff = index - currentIndex;
    const len = STEPS.length;
    let d = diff;
    if (diff > len / 2) d -= len;
    if (diff < -len / 2) d += len;
    if (d === 0) return "active";
    if (d === -1) return "prev";
    if (d === 1) return "next";
    return "hidden";
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-[2rem] lg:rounded-[3rem] flex flex-col lg:flex-row min-h-[560px] lg:aspect-video border border-black/5 shadow-[0_30px_80px_rgba(8,41,47,0.15)]">
        {/* ── Left: rotating step chips ── */}
        <div className="w-full lg:w-[42%] min-h-[320px] md:min-h-[420px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 md:px-16 bg-[#08292F]">
          <div className="absolute inset-x-0 top-0 h-12 md:h-16 bg-gradient-to-b from-[#08292F] via-[#08292F]/80 to-transparent z-40" />
          <div className="absolute inset-x-0 bottom-0 h-12 md:h-16 bg-gradient-to-t from-[#08292F] via-[#08292F]/80 to-transparent z-40" />
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
            {STEPS.map((feature, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(-(STEPS.length / 2), STEPS.length / 2, distance);
              return (
                <motion.div
                  key={feature.id}
                  style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                  animate={{ y: wrappedDistance * ITEM_HEIGHT, opacity: 1 - Math.abs(wrappedDistance) * 0.28 }}
                  transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-3.5 px-6 md:px-8 py-3.5 md:py-4 rounded-full transition-all duration-700 text-left group border cursor-pointer",
                      isActive
                        ? "bg-white text-[#08292F] border-white z-10"
                        : "bg-transparent text-white/55 border-white/20 hover:border-white/40 hover:text-white"
                    )}
                  >
                    <span className={cn("flex items-center justify-center transition-colors duration-500", isActive ? "text-[#16a34a]" : "text-white/40")}>
                      <feature.icon size={18} />
                    </span>
                    <span className="font-medium text-sm md:text-[15px] tracking-tight whitespace-nowrap uppercase">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Right: stacked image cards ── */}
        <div className="flex-1 min-h-[440px] md:min-h-[560px] lg:h-full relative bg-[#F1F1F1] flex items-center justify-center py-14 md:py-20 lg:py-16 px-6 md:px-12 overflow-hidden border-t lg:border-t-0 lg:border-l border-black/5">
          <div className="relative w-full max-w-[400px] aspect-[4/5] flex items-center justify-center">
            {STEPS.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";
              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                  className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-4 md:border-8 border-white bg-white origin-center shadow-xl"
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    className={cn("w-full h-full object-cover transition-all duration-700", isActive ? "grayscale-0 blur-0" : "grayscale blur-[2px] brightness-75")}
                  />
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-8 md:p-10 pt-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-white text-[#08292F] px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] w-fit shadow-lg mb-3">
                          Step {index + 1} • {feature.label}
                        </div>
                        <p className="text-white font-medium text-lg md:text-xl leading-tight drop-shadow-md tracking-tight">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className={cn("absolute top-6 left-6 flex items-center gap-2.5 transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")}>
                    <span className="w-2 h-2 rounded-full bg-[#a4fca1] shadow-[0_0_10px_#a4fca1]" />
                    <span className="text-white/80 text-[10px] font-medium uppercase tracking-[0.25em]">Sylithe pipeline</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
