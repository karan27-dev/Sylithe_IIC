import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, CheckCircle2, Lock, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import treeLogo from '../assets/treee13.png';

const CARDS = [
  {
    category: 'REPORT & VERIFICATION (dMRV)',
    title: 'Automated dMRV reporting for your projects.',
    desc: [
      'Get a full, audit-ready dMRV report of your project.',
      'Reduce your MRV cost by 60% with Sylithe AI.',
      'Includes 1m resolution LULC, CHM, and Biomass data.'
    ],
    theme: 'highlight',
  },
  {
    category: 'CONTINUOUS MONITORING',
    title: 'Monitor your plot with high-res satellite imagery.',
    desc: [
      'Access ultra high-resolution satellite imagery up to 30cm.',
      'Track changes with flexible frequencies: monthly, quarterly, or annually.',
      'Maintain continuous oversight over project health and progress.'
    ],
    theme: 'light',
  },
  {
    category: 'CARBON ENGINE',
    title: 'Dynamic baselines & carbon projections.',
    desc: [
      'Credible additionality proof with 2000–2024 dynamic baselines.',
      'Get certified 25-year carbon sequestration projections.',
      'Detailed carbon breakdowns per land-cover class.'
    ],
    theme: 'light',
  },
  {
    category: 'REGISTRY & COMPLIANCE',
    title: 'Ready for Verra, Gold Standard & CCTS.',
    desc: [
      'Generate ISO 14064-3 compliant dMRV audit reports.',
      'Complete third-party audit documentation package.',
      'Ready for verifier review and registry submission.'
    ],
    theme: 'light',
  },
  {
    category: 'FOREST INTELLIGENCE',
    title: 'Real-time deforestation & fire alerts.',
    desc: [
      'Keep your projects safe with 72-hour deforestation alerts.',
      'Monitor ecosystem health with biodiversity scoring.',
      'Perform detailed cross-border leakage analysis.'
    ],
    theme: 'light',
  }
];

export default function UpgradeModal({ open, onClose }) {
  const { token } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/request-access`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok && data.message !== 'Request already pending') {
        throw new Error(data.message || 'Request failed');
      }
      setSent(true);
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSent(false);
    setError('');
    onClose?.();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[1200px] max-h-[95vh] flex flex-col bg-[#FDFDFD] rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between px-8 py-6 shrink-0">
              <div className="flex items-center gap-3">
                <img src={treeLogo} alt="Sylithe" className="w-7 h-7 object-contain" />
                <span className="text-[14px] font-black text-[#0F172A] uppercase tracking-[0.25em]">
                  Sylithe Verified
                </span>
              </div>
              <button onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-12">
              {/* Header Text */}
              <div className="max-w-4xl mt-4 mb-12">
                <h1 className="text-[42px] font-bold text-[#0F172A] leading-[1.1] tracking-tight mb-4">
                  Everything you need to issue <span className="text-emerald-600">registry-grade carbon credits.</span><br />
                  Upgrade for full platform access.
                </h1>
              </div>

              {/* Success Message Overlay */}
              {sent && (
                <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 max-w-2xl">
                  <CheckCircle2 size={32} className="text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="text-[18px] font-bold text-emerald-900 mb-1">Request received!</h3>
                    <p className="text-[14px] text-emerald-700">
                      Our team will review your request and reach out within 24 hours to set up your full Sylithe Verified account.
                    </p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl max-w-2xl">
                  <p className="text-[14px] font-bold text-red-600">{error}</p>
                </div>
              )}

              {/* Cards Carousel Container */}
              <div className="flex items-stretch gap-6 overflow-x-auto pb-8 snap-x snap-mandatory custom-scrollbar" style={{ scrollPaddingLeft: '2rem' }}>
                {CARDS.map((card, i) => {
                  const isHighlight = card.theme === 'highlight';
                  return (
                    <div key={card.category}
                      className={`shrink-0 w-[360px] snap-start flex flex-col overflow-hidden border ${isHighlight
                        ? 'bg-gradient-to-br from-emerald-600/90 to-teal-700/90 backdrop-blur-xl text-white border-white/20 shadow-xl shadow-emerald-900/10'
                        : 'bg-[#FAFAF8] border-gray-200 text-[#0F172A]'
                        }`}
                    >
                      {/* Top Content */}
                      <div className="p-8 flex-1 flex flex-col">
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${isHighlight ? 'text-emerald-100' : 'text-emerald-600'}`}>
                            <span className="text-[12px]">■</span> {card.category}
                          </div>
                          <h2 className="text-[28px] font-bold leading-[1.2] tracking-tight mb-5">
                            {card.title}
                          </h2>
                          {Array.isArray(card.desc) ? (
                            <ul className={`text-[15px] leading-relaxed space-y-2 list-none ${isHighlight ? 'text-white/90' : 'text-gray-600'}`}>
                              {card.desc.map((point, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="opacity-70 mt-1 text-[10px]">●</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className={`text-[15px] leading-relaxed ${isHighlight ? 'text-white/90' : 'text-gray-600'}`}>
                              {card.desc}
                            </p>
                          )}
                        </div>

                        {/* Registries */}
                        <div className="mt-auto pt-10">
                          <div className={`text-[10px] font-black uppercase tracking-[0.15em] mb-3 ${isHighlight ? 'text-emerald-100/70' : 'text-gray-400'}`}>
                            SUPPORTED REGISTRIES
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[14px] font-bold ${isHighlight ? 'text-white' : 'text-gray-700'}`}>Verra VCS</span>
                            <span className={`text-[14px] font-bold ${isHighlight ? 'text-white' : 'text-gray-700'}`}>Gold Standard</span>
                            <span className={`text-[14px] font-bold ${isHighlight ? 'text-white' : 'text-gray-700'}`}>CCTS</span>
                          </div>
                        </div>
                      </div>

                      {/* Full-width Button */}
                      <button onClick={handleRequest} disabled={loading || sent}
                        className={`w-full py-4 px-8 flex items-center justify-between font-bold text-[15px] transition-colors ${
                          isHighlight
                            ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-t border-white/10'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        } ${loading || sent ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <span>
                          {loading ? 'Requesting...' : sent ? 'Requested' : 'Request Access'}
                        </span>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
