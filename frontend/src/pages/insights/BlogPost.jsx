import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiOutlineClock, HiOutlineCalendar, HiOutlineShare, HiDownload } from "react-icons/hi";
import { FaLinkedinIn, FaXTwitter, FaLink } from "react-icons/fa6";
import SEOHead from '../../components/SEOHead';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../../data/blogData';
import { downloadBlogPdf } from '../../services/blogPdfGenerator';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const SectionLabel = ({ children, className = "" }) => (
  <span className={`text-[#16a34a] font-bold tracking-[0.2em] uppercase text-xs mb-4 block ${className}`}>
    {children}
  </span>
);

// --- STANDARD TABLE ---
const InteractiveTable = ({ section }) => {
  const rows = section.rows || [];

  const renderCell = (cell, j) => {
    if (typeof cell === 'string' && cell.startsWith('badge:')) {
      const label = cell.replace('badge:', '');
      return <span>{label}</span>;
    }
    if (typeof cell === 'string' && cell.startsWith('highlight:')) {
      return <span className="font-bold text-[#0F172A]">{cell.replace('highlight:', '')}</span>;
    }
    return <span>{cell}</span>;
  };

  return (
    <div className="my-10">
      {section.title && (
        <h3 className="text-[14px] font-black text-[#16a34a] uppercase tracking-[0.15em] mb-3">{section.title}</h3>
      )}
      {section.description && (
        <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">{section.description}</p>
      )}

      <div className="overflow-x-auto border border-slate-200 shadow-sm rounded-lg">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-[#0F172A]">
              {section.headers.map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-4 text-[11px] font-black text-white uppercase tracking-widest select-none"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-slate-100 transition-colors hover:bg-[#F4F7F4] ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
              >
                {row.map((cell, j) => (
                  <td key={j} className={`px-5 py-4 text-[14px] text-slate-600 leading-snug ${j === 0 ? 'font-semibold text-[#0F172A]' : ''
                    }`}>
                    {renderCell(cell, j)}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={section.headers.length} className="px-5 py-8 text-center text-sm text-slate-400">No data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {section.footnote && (
        <p className="text-[11px] text-slate-400 mt-2 italic">{section.footnote}</p>
      )}
    </div>
  );
};

// --- INLINE RICH TEXT PARSER ---
// Support for stripping markdown from headings and TOC
const stripRichText = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1');
};

// Supports **bold** and [[linked term|slug]] syntax
const renderRichText = (text, navigate) => {
  if (!text || typeof text !== 'string') return text;

  // Split on **bold** and [[term|slug]] patterns
  const parts = [];
  const regex = /\*\*([^*]+)\*\*|\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      // **bold**
      // **bold** — recursively process inner content so [[links]] inside bold work
      const boldInner = renderRichText(match[1], navigate);
      parts.push(<strong key={match.index} className="font-bold">{boldInner}</strong>);
    } else if (match[2] !== undefined && match[3] !== undefined) {
      // [[term|slug]]
      parts.push(
        <Link
          key={match.index}
          to={`/insights/${match[3].trim()}`}
          className="font-bold text-[#16a34a] underline decoration-[#16a34a]/30 underline-offset-2 hover:decoration-[#16a34a] transition-all"
        >
          {match[2]}
        </Link>
      );
    }
    lastIndex = regex.lastIndex;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
};

// --- CONTENT RENDERERS ---
const renderContent = (section, idx, navigate) => {
  switch (section.type) {
    case 'paragraph':
      return <p key={idx} className="text-[15.5px] text-slate-600 leading-[1.9] mb-7 font-normal">{renderRichText(section.text, navigate)}</p>;

    case 'definition-box':
      return (
        <div key={idx} className="my-8 border border-[#16a34a]/40 bg-[#F0FAF4] shadow-sm rounded-none p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#16a34a] text-[11px] font-black uppercase tracking-[0.2em]">Definition</span>
          </div>
          {section.term && (
            <p className="text-[13px] font-black text-[#16a34a] uppercase tracking-[0.15em] mb-2">{section.term}</p>
          )}
          <p className="text-[15.5px] text-[#0F172A] leading-[1.9] font-medium">{renderRichText(section.text, navigate)}</p>
        </div>
      );

    case 'quick-answer':
      return (
        <div key={idx} className="my-8 border border-[#16a34a]/40 bg-[#EBF5EE] shadow-sm rounded-none p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#16a34a] text-[11px] font-black uppercase tracking-[0.2em]">{section.label || 'Quick Answer'}</span>
          </div>
          <p className="text-[15.5px] text-[#0F2A1A] leading-[1.9]">{renderRichText(section.text, navigate)}</p>
        </div>
      );

    case 'why-it-matters':
      return (
        <div key={idx} className="my-10 bg-[#EBF5EE] border border-[#16a34a]/40 rounded-none p-6 shadow-sm">
          <h4 className="text-[13px] font-black text-[#16a34a] uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
            {section.title || 'Why It Matters'}
          </h4>
          <ul className="space-y-3">
            {(section.items || []).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] text-[#0F172A] leading-snug font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-[0.45rem] shrink-0" />
                <span>{renderRichText(item, navigate)}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'did-you-know':
      return (
        <div key={idx} className="my-10 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1e3a2f] p-[1px] shadow-lg">
          <div className="rounded-2xl bg-[#0F172A] px-7 py-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-black text-[#4ade80] uppercase tracking-[0.25em]">Did You Know?</span>
            </div>
            <p className="text-[15px] text-slate-300 leading-[1.9]">{renderRichText(section.text, navigate)}</p>
          </div>
        </div>
      );

    case 'key-insight':
      return (
        <div key={idx} className="my-10 border border-[#16a34a]/40 bg-[#F0FAF4] shadow-sm rounded-none p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#16a34a] text-[11px] font-black uppercase tracking-[0.2em]">{section.title || 'Key Insight'}</span>
          </div>
          <p className="text-[15.5px] text-[#0F172A] leading-[1.9] font-medium">{renderRichText(section.text, navigate)}</p>
        </div>
      );

    case 'comparison-table':
      return (
        <div key={idx} className="my-10">
          {section.title && (
            <h4 className="text-[13px] font-black text-[#16a34a] uppercase tracking-[0.2em] mb-4">{section.title}</h4>
          )}
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr>
                  {(section.headers || []).map((h, i) => (
                    <th key={i} className={`px-6 py-4 text-[12px] font-black uppercase tracking-widest text-white ${
                      i === 0 ? 'bg-[#16a34a]' : 'bg-[#0F172A]'
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(section.rows || []).map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}>
                    {row.map((cell, j) => (
                      <td key={j} className={`px-6 py-4 text-[14px] leading-snug ${
                        j === 0
                          ? 'text-[#16a34a] font-bold'
                          : 'text-slate-600'
                      }`}>{renderRichText(cell, navigate)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'heading':
      if (section.level === 2) return (
        <h2 key={idx} id={section.id || `section-${idx}`} className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mt-16 mb-6 leading-tight tracking-tight scroll-mt-24 pb-4 border-b border-slate-200 relative after:absolute after:bottom-[-1px] after:left-0 after:w-20 after:h-[3px] after:bg-[#16a34a] after:rounded-r-full">
          {stripRichText(section.text)}
        </h2>
      );
      if (section.level === 3) return (
        <h3 key={idx} id={section.id || `section-${idx}`} className="text-lg md:text-xl font-bold text-[#0F172A] mt-12 mb-4 leading-snug scroll-mt-24 flex items-center gap-3 before:content-[''] before:block before:w-1.5 before:h-6 before:bg-gradient-to-b before:from-[#16a34a] before:to-green-300 before:rounded-full">
          {stripRichText(section.text)}
        </h3>
      );
      return <h4 key={idx} className="text-[13px] font-black text-[#16a34a] uppercase tracking-[0.2em] mt-10 mb-4">{stripRichText(section.text)}</h4>;

    case 'list':
      return (
        <ul key={idx} className="space-y-3 mb-7 ml-1">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] text-slate-600 leading-[1.9]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-[0.45rem] shrink-0" />
              <span>{renderRichText(typeof item === 'string' ? item : (item.desc || item.title || ''), navigate)}</span>
            </li>
          ))}
        </ul>
      );

    case 'numbered-list':
      return (
        <ol key={idx} className="space-y-3 mb-6 ml-1">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] text-slate-600 leading-relaxed">
              <span className="text-[#16a34a] font-bold shrink-0">{i + 1}.</span>
              <div>
                {item.title && <span className="font-bold text-[#0F172A] text-[15px] mb-0.5 block">{stripRichText(item.title)}</span>}
                <span className="opacity-90">{stripRichText(item.desc || (typeof item === 'string' ? item : ''))}</span>
              </div>
            </li>
          ))}
        </ol>
      );

    case 'image':
      return (
        <figure key={idx} className={`my-10 ${section.small ? 'max-w-md mx-auto' : ''}`}>
          <div className="overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50">
            <img
              src={section.src}
              alt={section.alt}
              loading="lazy"
              className="w-full object-contain"
              style={{ maxHeight: '65vh' }}
            />
          </div>
          {section.caption && (
            <figcaption className="text-[12px] text-slate-400 mt-3 text-center font-medium italic">{section.caption}</figcaption>
          )}
        </figure>
      );

    case 'quote':
      return (
        <blockquote key={idx} className="my-10 bg-[#F8FAF8] border-l-4 border-[#16a34a] pl-6 pr-5 py-5">
          <p className="text-base md:text-[1.05rem] text-[#1e3a2f] leading-[1.9] italic font-medium">&ldquo;{renderRichText(section.text, navigate)}&rdquo;</p>
          {section.cite && <cite className="text-xs text-slate-400 mt-3 block not-italic font-bold uppercase tracking-widest">— {section.cite}</cite>}
        </blockquote>
      );

    case 'callout':
      return (
        <div key={idx} className="my-10 bg-[#EBF5EE] border border-[#16a34a]/20 rounded-xl pl-6 pr-6 py-5">
          {section.title && <h4 className="text-[10px] font-black mb-2 text-[#16a34a] tracking-[0.25em] uppercase">{section.title}</h4>}
          <p className="text-[15px] leading-[1.9] text-[#0F2A1A] whitespace-pre-wrap">{renderRichText(section.text, navigate)}</p>
        </div>
      );

    case 'highlight':
      return (
        <div key={idx} className="my-8 bg-white border border-slate-200 rounded-xl shadow-sm px-6 py-5">
          {section.title && <h4 className="text-[11px] font-black text-[#16a34a] uppercase tracking-widest mb-2">{section.title}</h4>}
          <p className="text-[15px] text-slate-700 leading-[1.9]">{renderRichText(section.text, navigate)}</p>
        </div>
      );

    case 'divider':
      return <div key={idx} className="my-12 flex items-center justify-center gap-2">
        <span className="w-1 h-1 rounded-full bg-slate-100" />
        <span className="w-1 h-1 rounded-full bg-slate-100" />
        <span className="w-1 h-1 rounded-full bg-slate-100" />
      </div>;

    case 'bold-statement':
      return (
        <p key={idx} className="text-lg md:text-xl text-[#0F172A] font-bold leading-snug my-10">
          {renderRichText(section.text, navigate)}
        </p>
      );

    case 'faq':
      return (
        <div key={idx} className="my-16 space-y-8">
          {section.title && (
            <h3 className="text-2xl font-bold text-[#0F172A] mb-8 tracking-tight">{stripRichText(section.title)}</h3>
          )}
          {section.items.map((item, i) => (
            <div key={i} className="border-t border-slate-100 pt-6">
              <h4 className="text-[15px] font-bold text-[#0F172A] mb-3">{stripRichText(item.question)}</h4>
              <p className="text-[15px] text-slate-600 leading-relaxed">{stripRichText(item.answer)}</p>
            </div>
          ))}
        </div>
      );

    case 'related-link':
      return (
        <Link
          key={idx}
          to={`/insights/${section.slug}`}
          className="flex items-center gap-3 my-6 p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#16a34a] hover:shadow-md transition-all group"
        >
          <span className="w-10 h-10 rounded-full bg-[#16a34a]/5 flex items-center justify-center shrink-0 group-hover:bg-[#16a34a]/10 transition-colors">
            <HiArrowRight className="text-[#16a34a] text-lg" />
          </span>
          <span className="text-base font-bold text-[#0F172A] group-hover:text-[#16a34a] transition-colors leading-tight">
            {stripRichText(section.text)}
          </span>
        </Link>
      );

    case 'stats-grid':
      const isFour = section.items.length === 4;
      const gridCols = isFour ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';
      return (
        <div key={idx} className={`my-12 grid ${gridCols} gap-8 bg-[#F8F9F5] p-8 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm`}>
          {section.items.map((stat, i) => (
            <div key={i} className="text-center flex flex-col justify-center">
              <div className={`font-normal text-[#0F172A] mb-2 tracking-tight ${stat.value.length > 8 ? 'text-xl md:text-2xl' : 'text-3xl md:text-5xl'
                }`}>
                {stat.value}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      );

    case 'comparison-cards':
      return (
        <div key={idx} className="my-12 grid md:grid-cols-2 gap-6">
          {section.items.map((card, i) => (
            <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 rounded-full bg-[#F8F9F5] flex items-center justify-center group-hover:bg-[#EBF5EE] transition-colors">
                  {i === 0 ? (
                    <svg className="w-4 h-4 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 10 3 10 3 10L14 11l2.5 2.5a5 5 0 11-1.343 5.157z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.label}</span>
              </div>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      );

    case 'step-list':
      return (
        <div key={idx} className="my-12 space-y-12">
          {section.items.map((step, i) => (
            <div key={i} className="relative pl-12">
              {i !== section.items.length - 1 && (
                <div className="absolute left-[7.5px] top-4 bottom-[-48px] w-[1px] bg-slate-100" />
              )}
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-[#16a34a] bg-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{step.label}</div>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      );

    case 'numbered-list-rich':
      return (
        <div key={idx} className="my-12 space-y-6">
          {section.items.map((item, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-8 h-8 rounded-full bg-[#EBF5EE] text-[#16a34a] flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-[15px] text-slate-600 leading-relaxed pt-1">
                {item}
              </p>
            </div>
          ))}
        </div>
      );

    case 'impact-quote':
      return (
        <div key={idx} className="my-12 p-10 bg-[#F8F9F5] rounded-[2rem] border-l-4 border-[#16a34a]">
          <p className="text-lg md:text-xl text-[#0F172A] leading-relaxed italic font-medium">
            "{section.text}"
          </p>
          {section.cite && (
            <div className="text-xs text-slate-400 mt-6 font-bold uppercase tracking-widest">— {section.cite}</div>
          )}
        </div>
      );

    case 'sensor-specs':
      return (
        <div key={idx} className="my-12 space-y-4">
          {section.items.map((sensor, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all gap-6">
              <div className="flex items-start gap-6">
                <div className="px-3 py-1.5 rounded bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-1">
                  {sensor.badge}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] mb-1">{sensor.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{sensor.description}</p>
                </div>
              </div>
              <div className="text-2xl font-normal text-[#0F172A] shrink-0">
                {sensor.value}
              </div>
            </div>
          ))}
        </div>
      );

    case 'data-table':
    case 'interactive-table':
      return <InteractiveTable key={idx} section={section} />;

    case 'fusion-logic':
      return (
        <div key={idx} className="my-12 p-10 rounded-[2rem] bg-[#F8F9F5] border border-[#16a34a]/20">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-5 h-[1px] bg-[#16a34a]" />
            <span className="text-[10px] font-black text-[#16a34a] uppercase tracking-[0.3em]">{section.title}</span>
          </div>
          <div className="space-y-8">
            {section.items.map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                  {item.inputs.map((input, j) => (
                    <React.Fragment key={j}>
                      <span className="px-3 py-2 rounded-lg border border-slate-200 bg-white shadow-sm flex items-center gap-2 italic font-medium lowercase">
                        <span className="w-1 h-1 rounded-full bg-slate-300" /> {input}
                      </span>
                      {j < item.inputs.length - 1 && <span className="text-slate-300">+</span>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-base text-[#0F172A] font-medium pl-1">
                  <span className="text-[#16a34a] mr-2">→</span> {item.result}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed pl-6 opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'comparison-bars':
      return (
        <div key={idx} className="my-12 p-8 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4">{section.title}</div>
          <div className="space-y-6">
            {section.items.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-[#0F172A]">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${item.color === 'red' ? 'bg-red-400' : 'bg-[#16a34a]'}`}
                    style={{ width: item.percentage + '%' }}
                  />
                </div>
                {item.desc && <div className="text-[11px] text-slate-400 italic">{item.desc}</div>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'numbered-cards':
      return (
        <div key={idx} className="my-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.items.map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
              <div className="text-4xl font-normal text-slate-100 mb-4 font-serif">{(i + 1).toString().padStart(2, '0')}</div>
              <h4 className="text-lg font-bold text-[#0F172A] mb-3 leading-tight">{item.title}</h4>
              <p className="text-[14px] text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      );

    case 'error-cards':
      return (
        <div key={idx} className="my-12 space-y-6">
          {section.items.map((item, i) => (
            <div key={i} className="p-8 rounded-2xl border-2 border-red-50 bg-white flex gap-6 items-start">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-1">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0F172A] mb-2">{item.title}</h4>
                <p className="text-[14px] text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
};


// --- SHARE BUTTONS ---
const ShareButtons = ({ title, slug, hideLabel = false }) => {
  const url = `https://sylithe.com/insights/${slug}`;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2.5">
      {!hideLabel && <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Share</span>}
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all">
        <FaLinkedinIn className="text-sm" />
      </a>
      <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-[#0F172A] hover:text-white hover:border-[#0F172A] transition-all">
        <FaXTwitter className="text-sm" />
      </a>
      <button onClick={copyLink}
        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${copied ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'border-gray-200 text-slate-500 hover:bg-gray-100'}`}>
        <FaLink className="text-sm" />
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.id === slug);
  const [activeId, setActiveId] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Active Section Tracking
  useEffect(() => {
    if (!post) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    const headings = document.querySelectorAll('h2[id], h3[id]');
    headings.forEach((h) => observer.observe(h));

    return () => {
      headings.forEach((h) => observer.unobserve(h));
    };
  }, [post]);

  if (!post) {
    // A static host cannot return a 404 status here, so tell crawlers not to
    // index it. Without this Google logs the 200 as a soft 404 instead.
    return (
      <div className="w-full min-h-screen bg-[#F1F1F1] pt-40 text-center">
        <Helmet>
          <meta name="robots" content="noindex, follow" />
          <title>Article not found | Sylithe</title>
        </Helmet>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-4">Article not found</h1>
        <Link to="/insights" className="text-[#16a34a] font-bold hover:underline">← Back to Insights</Link>
      </div>
    );
  }

  // Table of contents from h2 and h3 headings
  const toc = post.content
    .map((s, i) => ({ ...s, idx: i }))
    .filter(s => s.type === 'heading' && (s.level === 2 || s.level === 3))
    .map(s => ({
      id: s.id || `section-${s.idx}`,
      text: s.text,
      level: s.level
    }));

  // Related posts priority: 1. Manual relatedLinks, 2. Same category
  let relatedPosts = [];
  if (post.relatedLinks && post.relatedLinks.length > 0) {
    relatedPosts = post.relatedLinks.map(link => BLOG_POSTS.find(p => p.id === link.slug)).filter(Boolean);
  }

  if (relatedPosts.length < 3) {
    const categoryRelated = BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category && !relatedPosts.find(r => r.id === p.id)).slice(0, 3 - relatedPosts.length);
    relatedPosts = [...relatedPosts, ...categoryRelated];
  }

  const relatedFallback = relatedPosts.slice(0, 3);

  // Build JSON-LD for this article
  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.heroImage || post.image,
    "datePublished": post.date,
    "dateModified": post.lastModified || post.date,
    "author": {
      "@type": "Organization",
      "name": post.author,
      "url": "https://sylithe.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sylithe",
      "url": "https://sylithe.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sylithe.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://sylithe.com/insights/${post.id}`
    },
    "keywords": post.tags?.join(', '),
    "articleSection": post.categoryLabel,
    "wordCount": post.wordCount || null
  } : null;

  return (
    <div className="w-full bg-[#FFFFFF] font-sans text-[#0F172A] pt-20">
      <SEOHead
        title={`${post.title} | Sylithe Insights`}
        description={post.metaDescription || post.excerpt}
        path={`/insights/${post.id}`}
        image={post.heroImage || post.image}
        imageAlt={post.title}
        type="article"
        publishedTime={post.date}
        author={post.author}
      />

      {/* JSON-LD Schema */}
      {articleSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(articleSchema)}
          </script>
        </Helmet>
      )}

      {/* FAQ Schema */}
      {post.faq && post.faq.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": post.faq.map(item => ({
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
      )}

      {/* --- FULL-VIEWPORT EDITORIAL HERO --- */}
      <section className="relative w-full bg-white border-b border-slate-100" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 80px)' }}>

          {/* Left: Image — flush to left edge, full image visible */}
          <motion.div
            className="w-full lg:w-[46%] relative bg-[#F2F5F2] flex items-center justify-center"
            style={{ minHeight: '360px' }}
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
          >
            <img
              src={post.heroImage || post.image}
              alt={post.title}
              loading="eager"
              className="w-full h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 80px)' }}
            />
          </motion.div>

          {/* Right: Title & Meta — with proper right padding */}
          <motion.div
            className="w-full lg:w-[54%] flex flex-col justify-center px-10 md:px-14 lg:px-20 pr-12 md:pr-16 lg:pr-24 py-14"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Link to="/insights" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#16a34a] text-[10px] font-black uppercase tracking-[0.25em] mb-8 transition-all group">
              <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Insights
            </Link>

            <div className="flex items-center gap-4 mb-5">
              <span className="bg-[#EBF1ED] text-[#16a34a] text-[10px] font-black uppercase tracking-widest px-4 py-2">
                {post.categoryLabel}
              </span>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <HiOutlineClock className="text-sm" /> {post.readTime}
              </span>
            </div>

            <h1 className="text-[1.9rem] md:text-[2.4rem] lg:text-[2.75rem] font-normal text-[#08292F] leading-[1.12] tracking-tight mb-5">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-base md:text-[1.05rem] text-slate-500 leading-relaxed font-light mb-6">
                {post.subtitle}
              </p>
            )}

            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-[11px] text-slate-400 font-medium uppercase tracking-widest">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.author}</span>
              </div>

              {['bm-t001-additionality-indian-carbon-market', 'bm-en01001-renewable-energy-carbon-credits'].includes(post.id) && (
                <button
                  onClick={async () => {
                    setIsGeneratingPdf(true);
                    await downloadBlogPdf(post);
                    setIsGeneratingPdf(false);
                  }}
                  disabled={isGeneratingPdf}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <HiDownload className="text-lg" />
                      Download Official Document
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- ESSENTIAL FINDINGS SECTION --- */}
      {(() => {
        // Build findings: use post.essentialFindings if present, otherwise auto-derive full sentences
        const findings = post.essentialFindings && post.essentialFindings.length > 0
          ? post.essentialFindings
          : post.content
            .filter(s => s.type === 'paragraph' && s.text && s.text.length > 60)
            .slice(0, 6)
            .map(s => {
              // Extract the first complete sentence
              const match = s.text.match(/^.*?[.?!](?:\s|$)/);
              return match ? match[0].trim() : s.text;
            });

        if (!findings || findings.length === 0) return null;

        return (
          <section className="px-6 md:px-10 lg:px-16 py-14 bg-[#F4F7F4] border-b border-slate-100">
            <div className="max-w-[1100px] mx-auto flex flex-col items-center">
              <div className="mb-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#16a34a] tracking-tight">Essential Findings</h2>
              </div>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-7 w-full">
                {findings.slice(0, 6).map((finding, i) => (
                  <li key={i} className="flex items-start gap-4 text-[15px] md:text-base leading-relaxed">
                    <span className="mt-[5px] text-[#16a34a] font-bold shrink-0 text-sm">{i + 1}.</span>
                    <span className="text-slate-700">
                      {typeof finding === 'object' && finding.label ? (
                        <>
                          <span className="font-bold text-[#16a34a]">{finding.label}</span>
                          {finding.text ? <span className="text-slate-600"> {finding.text}</span> : null}
                        </>
                      ) : (
                        finding
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })()}

      {/* --- ARTICLE BODY --- */}
      <section id="article-start" className="pl-4 md:pl-8 lg:pl-12 pr-8 md:pr-14 lg:pr-24 py-12 bg-white min-h-screen">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-stretch relative gap-10 lg:gap-14">

          {/* Persistent Sidebar (Desktop) */}
          <aside className="hidden lg:block w-[280px] shrink-0 relative border-r border-slate-50 pr-6">
            <div className="sticky top-32 space-y-6">

              {/* Navigation wrapped in a custom card box */}
              {toc.length > 0 && (
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                  <h3 className="text-xl font-normal text-[#0F172A] mb-4 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                    Contents
                  </h3>
                  <nav className="divide-y divide-slate-100">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(item.id);
                          if (el) {
                            const offset = 120;
                            const bodyRect = document.body.getBoundingClientRect().top;
                            const elementRect = el.getBoundingClientRect().top;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                          }
                        }}
                        className={`flex items-center justify-between py-2.5 px-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeId === item.id
                            ? 'bg-[#16a34a]/10 text-[#16a34a] font-bold'
                            : 'text-slate-600 hover:text-[#16a34a] hover:bg-slate-50'
                        }`}
                      >
                        <span className={`${item.level === 3 ? 'pl-4 text-[13px]' : 'text-sm'} leading-snug pr-2`}>
                          {stripRichText(item.text)}
                        </span>
                        <span className={`shrink-0 text-xs transition-all ${activeId === item.id ? 'translate-y-0.5 text-[#16a34a] font-bold' : 'text-slate-300'
                          }`}>
                          ↓
                        </span>
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Share buttons moved below the Contents box */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-6 mb-6">
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Share this page</span>
                <div className="flex items-center gap-2">
                  <ShareButtons title={post.title} slug={post.id} hideLabel />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0 pr-2 md:pr-4 lg:pr-8">
            <div className="lg:hidden mb-12 flex flex-col gap-4 py-6 border-y border-slate-100 px-2">
              <div className="flex items-center justify-end">
                <ShareButtons title={post.title} slug={post.id} />
              </div>
            </div>

            <div className="blog-prose">
              {post.content.map((section, idx) => (
                <div key={idx} className="blog-content-block">
                  {renderContent(section, idx, navigate)}
                </div>
              ))}
            </div>

            {/* Tags */}
            {post.tags && (
              <div className="mt-16 pt-8 border-t border-slate-50 flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* FAQ Section (visual) */}
            {post.faq && post.faq.length > 0 && (
              <section className="mt-24 pt-16 border-t border-slate-100">
                <h2 className="text-3xl font-bold text-[#0F172A] mb-10 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {post.faq.map((item, i) => (
                    <details key={i} className="bg-slate-50/50 border border-slate-100 rounded-2xl group transition-all">
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-[#0F172A] text-base hover:text-[#16a34a] transition-colors">
                        {stripRichText(item.question)}
                        <span className="text-[#16a34a] text-2xl font-light group-open:rotate-45 transition-transform duration-300 shrink-0 ml-6">+</span>
                      </summary>
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed text-base pt-2">
                        {stripRichText(item.answer)}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </section>

      {/* --- RELATED POSTS --- */}
      {relatedFallback.length > 0 && (
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F8FAFC] border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <SectionLabel>More Reading</SectionLabel>
                <h2 className="text-4xl md:text-5xl font-normal text-[#0F172A] tracking-tight">Further insights</h2>
              </div>
              <Link to="/insights" className="hidden md:flex items-center gap-2 text-[#16a34a] font-bold group">
                View all posts <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {relatedFallback.map((rp) => (
                <Link key={rp.id} to={`/insights/${rp.id}`} className="group bg-white border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="h-56 overflow-hidden relative">
                    <img src={rp.image} alt={rp.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-8">
                    <span className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">{rp.categoryLabel}</span>
                    <h3 className="text-xl font-bold text-[#0F172A] mt-3 leading-tight group-hover:text-[#16a34a] transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[#16a34a] font-bold text-sm mt-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                      Read full story <HiArrowRight />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- BOTTOM CTA --- */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-[#0F172A] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full border border-[#16a34a]/20 rounded-[100%] scale-[1.5] bg-[#16a34a]/5 pointer-events-none blur-3xl" />
        <motion.div className="max-w-3xl mx-auto relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-normal text-white mb-8 tracking-tight">
            Ready to verify your impact?
          </h2>
          <p className="text-slate-400 text-xl mb-12 leading-relaxed">
            Join enterprise leaders using Sylithe to build trust and transparency in the carbon economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/signup" className="bg-[#16a34a] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-[#0F172A] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group">
              Request a Demo <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/platform" className="border border-white/20 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center">
              Explore Platform
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default BlogPost;
