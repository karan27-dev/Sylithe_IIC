import { jsPDF } from 'jspdf';
import coverTop from '../assets/chm12.png';
import logoImg from '../assets/treee13.png';
import { getReportAnalysis } from './freeScanApi';

/* ════════════════════════════════════════════════════════════════
   Sylithe — Forest Carbon Diligence Report
   Clean, light, Verra-aligned report. Section lining follows the VCS
   Monitoring Report Template v4.4 (Project Details · Land Cover &
   Implementation · Satellite Monitoring · Quantification · Sources).
   UNLOCKED: project data, LULC + land-cover change, satellite history
   (NDVI / deforestation / fire / rainfall), executive summary — each
   enriched by Sylithe AI (DeepSeek) in-depth analysis.
   LOCKED (Request Access): carbon stock / AGB, GHG quantification,
   additionality, CHM, monitoring & safeguards.
   ════════════════════════════════════════════════════════════════ */

let LOGO = null;

// ── Light palette (matches in-app Site report UI) ────────────────
const GREEN = [22, 163, 74];      // #16a34a primary
const GREEN_D = [21, 128, 61];    // #15803d
const COVER = [9, 26, 20];        // deep forest green
const DARKINK = [15, 23, 42];     // titles
const INK = [30, 41, 59];         // body
const SLATE = [100, 116, 139];    // muted
const MUTE = [148, 163, 184];
const LINE = [226, 232, 240];
const ROW = [248, 250, 252];
const WHITE = [255, 255, 255];
const GRID = [237, 242, 247];
// callout / pill variants  { soft, tx, bd }
const V_GREEN = { soft: [236, 253, 245], tx: GREEN_D, bd: [134, 239, 172] };
const V_AMBER = { soft: [254, 252, 232], tx: [161, 98, 7], bd: [253, 224, 71] };
const V_BLUE = { soft: [239, 246, 255], tx: [30, 64, 175], bd: [147, 197, 253] };
const V_RED = { soft: [254, 242, 242], tx: [185, 28, 28], bd: [252, 165, 165] };

const PAGE_W = 210, PAGE_H = 297, MX = 16, CW = PAGE_W - 2 * MX;
const TOTAL = 24;

const LULC_COLORS = {
  Trees: '#397D49', Crops: '#E49635', Grass: '#88B053', 'Shrub & Scrub': '#DFC35A',
  'Bare Ground': '#A59B8F', 'Flooded Vegetation': '#7A87C6', Water: '#419BDF',
  'Built Area': '#C4281B', 'Snow & Ice': '#B39FE1',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const hexRGB = (h) => { h = (h || '#999').replace('#', ''); return [parseInt(h.slice(0, 2), 16) || 150, parseInt(h.slice(2, 4), 16) || 150, parseInt(h.slice(4, 6), 16) || 150]; };
const setF = (d, c) => d.setFillColor(c[0], c[1], c[2]);
const setT = (d, c) => d.setTextColor(c[0], c[1], c[2]);
const setD = (d, c) => d.setDrawColor(c[0], c[1], c[2]);
const RGB = (c) => (Array.isArray(c) ? c : hexRGB(c));

function geoStats(geojson) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90, count = 0;
  const walk = (c) => { if (typeof c?.[0] === 'number') { const [x, y] = c; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; } else if (Array.isArray(c)) c.forEach(walk); };
  const proc = (g) => { if (g?.coordinates) { count++; walk(g.coordinates); } };
  if (geojson?.type === 'FeatureCollection') (geojson.features || []).forEach((f) => proc(f.geometry));
  else if (geojson?.type === 'Feature') proc(geojson.geometry); else proc(geojson);
  const v = maxX >= minX;
  return { featureCount: count, centroid: v ? [(minX + maxX) / 2, (minY + maxY) / 2] : null, bbox: v ? [minX, minY, maxX, maxY] : null };
}
const dms = (v, p, n) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? p : n}`;

function methodologies(type, eligibleTypes = []) {
  const t = (type || '').toUpperCase(); const set = new Set(eligibleTypes.map((e) => e.toUpperCase())); const out = [];
  if (t.includes('REDD') || set.has('REDD+')) out.push('VM0048 — Reducing Emissions from Deforestation & Forest Degradation');
  if (t.includes('ARR') || set.has('ARR') || set.has('AGROFORESTRY') || t.includes('AFFOREST') || t.includes('REFOREST')) out.push('VM0047 — Afforestation, Reforestation and Revegetation (ARR)');
  if (set.has('IFM')) out.push('VM0045 — Improved Forest Management');
  if (!out.length) out.push('VM0047 — Afforestation, Reforestation and Revegetation (ARR)');
  return out;
}

async function urlToDataURL(url) {
  const resp = await fetch(url); const blob = await resp.blob();
  return new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(blob); });
}
const hasSignal = (data, key) => (data || []).some((d) => (d[key] || 0) > 0.01);

/* ── Brand mark ─────────────────────────────────────────────────── */
function logoMark(doc, x, y, r) {
  if (LOGO) { try { doc.addImage(LOGO, 'PNG', x - r, y - r, r * 2, r * 2); return; } catch { /* */ } }
  setD(doc, GREEN); doc.setLineWidth(r * 0.32); doc.circle(x, y, r * 0.8, 'S'); doc.setLineWidth(0.2);
}

/* ── Page chrome ───────────────────────────────────────────────── */
function header(doc, right1, right2) {
  logoMark(doc, MX + 3.2, 14, 3.4);
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('SYLITHE', MX + 8.5, 15.4);
  setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2);
  doc.text(right1 || 'Forest Carbon Diligence Report', PAGE_W - MX, 12.6, { align: 'right' });
  setT(doc, MUTE); doc.text(right2 || '', PAGE_W - MX, 16.2, { align: 'right' });
  setD(doc, GREEN); doc.setLineWidth(0.8); doc.line(MX, 20, PAGE_W - MX, 20);
}
function footer(doc, n) {
  setD(doc, LINE); doc.setLineWidth(0.3); doc.line(MX, PAGE_H - 12, PAGE_W - MX, PAGE_H - 12);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); setT(doc, MUTE);
  doc.text('Sylithe dMRV Platform · Forest Carbon Diligence', MX, PAGE_H - 7.5);
  doc.text(`Page ${n} of ${TOTAL}`, PAGE_W / 2, PAGE_H - 7.5, { align: 'center' });
  doc.text('Confidential', PAGE_W - MX, PAGE_H - 7.5, { align: 'right' });
}
function sectionHead(doc, y, kicker, title, subtitle) {
  setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
  doc.text('—  ' + (kicker || '').toUpperCase(), MX, y);
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(21); doc.text(title, MX, y + 9);
  let yy = y + 9;
  if (subtitle) { setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(subtitle, MX, y + 15); yy = y + 15; }
  return yy + 7;
}
function subHead(doc, y, text) {
  setF(doc, GREEN); doc.rect(MX, y - 3.2, 1.4, 4.2, 'F');
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.text(text, MX + 3.5, y);
  return y + 6;
}

/* ── Content primitives ────────────────────────────────────────── */
function para(doc, y, text, w = CW, x = MX, size = 8.8, color = INK) {
  if (!text) return y;
  setT(doc, color); doc.setFont('helvetica', 'normal'); doc.setFontSize(size);
  const lines = doc.splitTextToSize(text, w); doc.text(lines, x, y);
  return y + lines.length * (size * 0.46) + 4;
}
function kpiTile(doc, x, y, w, h, label, value, sub, opts = {}) {
  setF(doc, WHITE); setD(doc, LINE); doc.setLineWidth(0.3); doc.rect(x, y, w, h, 'FD');
  setT(doc, SLATE); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.2); doc.text(String(label).toUpperCase(), x + 4, y + 6.5);
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(opts.vs || 16); doc.text(String(value), x + 4, y + 14.5);
  if (sub) { setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.4); doc.text(doc.splitTextToSize(sub, w - 7), x + 4, y + 19.5); }
}
function pill(doc, x, y, text, variant) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.4);
  const w = doc.getTextWidth(text.toUpperCase()) + 5;
  setF(doc, variant.soft); doc.roundedRect(x, y - 3, w, 4.6, 2.3, 2.3, 'F');
  setT(doc, variant.tx); doc.text(text.toUpperCase(), x + 2.5, y);
  return w;
}
// Generic table. cols:[{key,label,w,align,pill}] (w in mm). rows: array of objects.
function table(doc, y, cols, rows, opts = {}) {
  const x0 = MX; const totalW = cols.reduce((s, c) => s + c.w, 0);
  // header
  const hh = 8.5;
  setF(doc, opts.headerColor || GREEN); doc.rect(x0, y, totalW, hh, 'F');
  setT(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4);
  let cx = x0;
  cols.forEach((c) => { doc.text(c.label, c.align === 'right' ? cx + c.w - 3 : cx + 3, y + 5.6, { align: c.align === 'right' ? 'right' : 'left' }); cx += c.w; });
  let yy = y + hh;
  rows.forEach((r, ri) => {
    // measure height
    let lines = 1;
    cols.forEach((c) => { doc.setFontSize(7.6); const t = String(r[c.key] ?? ''); lines = Math.max(lines, doc.splitTextToSize(t, c.w - 6).length); });
    const rh = Math.max(8, lines * 3.5 + 4.5);
    if (ri % 2) { setF(doc, ROW); doc.rect(x0, yy, totalW, rh, 'F'); }
    setD(doc, GRID); doc.setLineWidth(0.2); doc.line(x0, yy + rh, x0 + totalW, yy + rh);
    cx = x0;
    cols.forEach((c) => {
      const val = r[c.key];
      if (c.pill && r[c.pillVar || c.key + '_v']) {
        pill(doc, cx + 3, yy + rh / 2 + 1.4, String(val), r[c.pillVar || c.key + '_v']);
      } else {
        setT(doc, c.bold ? DARKINK : INK); doc.setFont('helvetica', c.bold ? 'bold' : 'normal'); doc.setFontSize(7.6);
        const t = doc.splitTextToSize(String(val ?? ''), c.w - 6);
        doc.text(t, c.align === 'right' ? cx + c.w - 3 : cx + 3, yy + (rh - t.length * 3.5) / 2 + 3, { align: c.align === 'right' ? 'right' : 'left' });
      }
      cx += c.w;
    });
    yy += rh;
  });
  setD(doc, LINE); doc.setLineWidth(0.3); doc.rect(x0, y, totalW, yy - y, 'S');
  return yy + 5;
}
// Neutral, professional note card — white fill, thin rule, no colour fills.
function noteCard(doc, y, title, body, w = CW, x = MX) {
  doc.setFontSize(7.8); const lines = doc.splitTextToSize(body, w - 12);
  const h = Math.max(15, 12 + lines.length * 3.6);
  setF(doc, WHITE); setD(doc, LINE); doc.setLineWidth(0.3); doc.rect(x, y, w, h, 'FD');
  setF(doc, GREEN); doc.rect(x, y, 1.2, h, 'F');
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.4); doc.text(title, x + 6, y + 6.5);
  setT(doc, INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.8); doc.text(lines, x + 6, y + 12);
  return y + h + 5;
}
function imageBox(doc, x, y, w, h, dataUrl, caption) {
  setF(doc, [17, 24, 21]); doc.roundedRect(x, y, w, h, 1.4, 1.4, 'F');
  if (dataUrl) { try { const p = doc.getImageProperties(dataUrl); const ar = p.width / p.height; let iw = w - 4, ih = iw / ar; if (ih > h - 4) { ih = h - 4; iw = ih * ar; } doc.addImage(dataUrl, 'PNG', x + (w - iw) / 2, y + (h - ih) / 2, iw, ih); } catch { /* */ } }
  if (caption) { setT(doc, MUTE); doc.setFont('helvetica', 'italic'); doc.setFontSize(6.8); doc.text(doc.splitTextToSize(caption, w), x, y + h + 4); doc.setFont('helvetica', 'normal'); }
}

/* ── Charts (light) ─────────────────────────────────────────────── */
function vbars(doc, x, y, w, h, data, valKey, labelKey, color, unit) {
  if (!data || !data.length) { setT(doc, MUTE); doc.setFontSize(8); doc.text('No data available', x + w / 2, y + h / 2, { align: 'center' }); return; }
  const max = Math.max(...data.map((d) => d[valKey] || 0), 0.0001);
  const n = data.length; const gap = 1.6; const bw = (w - (n - 1) * gap) / n;
  setD(doc, GRID); doc.setLineWidth(0.2);
  for (let i = 0; i <= 3; i++) { const gy = y + h - (h * i) / 3; doc.line(x, gy, x + w, gy); setT(doc, MUTE); doc.setFontSize(5.4); doc.text(`${((max * i) / 3).toFixed(max < 5 ? 1 : 0)}`, x - 1.5, gy + 1, { align: 'right' }); }
  const rgb = RGB(color);
  data.forEach((d, i) => {
    const v = d[valKey] || 0; const bh = (v / max) * (h - 3); const bx = x + i * (bw + gap);
    setF(doc, rgb); doc.roundedRect(bx, y + h - bh, bw, bh, 0.5, 0.5, 'F');
    setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.4);
    const lbl = String(d[labelKey]); doc.text(lbl.length > 4 ? "'" + lbl.slice(2) : lbl, bx + bw / 2, y + h + 3.2, { align: 'center' });
  });
  setT(doc, MUTE); doc.setFontSize(6); doc.text(`max ${max.toFixed(max < 5 ? 2 : 0)} ${unit || ''}`, x + w, y - 1.5, { align: 'right' });
}
function distList(doc, x, y, w, rows) {
  const max = Math.max(...rows.map((r) => r.value || 0), 0.0001); let yy = y;
  rows.forEach((r) => {
    setT(doc, INK); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.6); doc.text(r.label, x, yy);
    setT(doc, DARKINK); doc.text(`${fmt(r.value)}${r.unit || ''}`, x + w, yy, { align: 'right' });
    yy += 2.4;
    setF(doc, [241, 245, 249]); doc.roundedRect(x, yy, w, 2.4, 1.2, 1.2, 'F');
    setF(doc, RGB(r.color)); doc.roundedRect(x, yy, Math.max(0.8, (r.value / max) * w), 2.4, 1.2, 1.2, 'F');
    setT(doc, MUTE); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.2); if (r.pct != null) doc.text(`${r.pct}%`, x + w, yy + 5.2, { align: 'right' });
    yy += 8.4;
  });
  return yy;
}
function donut(doc, cx, cy, rOut, rIn, segs) {
  const total = segs.reduce((s, g) => s + g.value, 0) || 1; let a0 = -Math.PI / 2;
  segs.forEach((g) => {
    const a1 = a0 + (g.value / total) * Math.PI * 2; const steps = Math.max(2, Math.round((a1 - a0) / 0.1));
    setF(doc, RGB(g.color));
    for (let i = 0; i < steps; i++) { const s = a0 + (a1 - a0) * (i / steps), e = a0 + (a1 - a0) * ((i + 1) / steps); doc.triangle(cx + Math.cos(s) * rOut, cy + Math.sin(s) * rOut, cx + Math.cos(e) * rOut, cy + Math.sin(e) * rOut, cx, cy, 'F'); }
    a0 = a1;
  });
  setF(doc, WHITE); doc.circle(cx, cy, rIn, 'F');
}

/* ── Locked page (Request Access) ──────────────────────────────── */
function lockedPage(doc, n, kicker, title, subtitle, blurb, bullets) {
  header(doc, 'Forest Carbon Diligence Report', kicker);
  let y = sectionHead(doc, 30, kicker, title, subtitle);
  const bx = MX, by = y, bw = CW, bh = 150;
  setF(doc, [250, 251, 252]); setD(doc, LINE); doc.setLineWidth(0.3); doc.roundedRect(bx, by, bw, bh, 2, 2, 'FD');
  // faux blurred chart
  setF(doc, [226, 235, 230]);
  for (let i = 0; i < 8; i++) doc.roundedRect(bx + 18 + i * 20, by + bh - 24 - (i % 5) * 9, 13, 24 + (i % 5) * 9, 1, 1, 'F');
  // lock badge
  const cx = PAGE_W / 2, ly = by + 40;
  setF(doc, GREEN); doc.circle(cx, ly, 9, 'F');
  setF(doc, WHITE); doc.roundedRect(cx - 3.4, ly - 0.6, 6.8, 5.4, 0.8, 0.8, 'F');
  setD(doc, WHITE); doc.setLineWidth(1.1); doc.ellipse(cx, ly - 1.2, 2.2, 2.4, 'S'); doc.setLineWidth(0.2);
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text('Premium Section — Locked', cx, ly + 20, { align: 'center' });
  setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); doc.text(doc.splitTextToSize(blurb, 150), cx, ly + 28, { align: 'center' });
  // included bullets
  let yy = ly + 48;
  setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.text('INCLUDED WITH SYLITHE VERIFIED', cx, yy, { align: 'center' }); yy += 7;
  (bullets || []).forEach((b) => { setF(doc, GREEN); doc.circle(cx - 52, yy - 1.2, 0.8, 'F'); setT(doc, INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(b, cx - 48, yy); yy += 6.5; });
  // CTA
  const cta = 'Request Access  ·  info@sylithe.com';
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.6); const cwd = doc.getTextWidth(cta) + 14;
  setF(doc, GREEN); doc.roundedRect(cx - cwd / 2, by + bh - 16, cwd, 9, 4.5, 4.5, 'F');
  setT(doc, WHITE); doc.text(cta, cx, by + bh - 10, { align: 'center' });
  footer(doc, n);
}

/* ════════════════════════════════════════════════════════════════ */
export async function generateLulcReportPdf({ project = {}, scan, geojson, images = {}, history = null }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }); doc.setFont('helvetica', 'normal');
  const [topImg, logo, ai] = await Promise.all([
    urlToDataURL(coverTop).catch(() => null),
    urlToDataURL(logoImg).catch(() => null),
    getReportAnalysis({ history, scan, project }).catch(() => null),
  ]);
  LOGO = logo;
  const A = ai || {};

  const gs = geoStats(geojson);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const reportId = `SYL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const ptype = project.type || 'ARR';
  const elig = scan.eligibility || {};
  const methods = methodologies(ptype, elig.eligible_types);
  const sp = history?.site_profile || {};
  const rightTag = [project.name, dateStr].filter(Boolean).join(' · ');
  let page = 0; const next = () => { doc.addPage(); page += 1; };

  // shared computed land-cover rows
  const rows = Object.entries(scan.lulc || {}).filter(([, v]) => v.pct > 0.3).sort(([, a], [, b]) => b.pct - a.pct);
  const ELIG = new Set(['Crops', 'Grass', 'Shrub & Scrub', 'Bare Ground', 'Trees']);
  const eligRows = rows.filter(([n]) => ELIG.has(n)).map(([n, v]) => ({ label: n, value: v.ha, unit: ' ha', pct: v.pct, color: LULC_COLORS[n] || '#999' }));
  const inRows = rows.filter(([n]) => !ELIG.has(n)).map(([n, v]) => ({ label: n, value: v.ha, unit: ' ha', pct: v.pct, color: LULC_COLORS[n] || '#999' }));
  const eligTotal = eligRows.reduce((s, r) => s + r.value, 0), inTotal = inRows.reduce((s, r) => s + r.value, 0);

  /* ── 1 · COVER ───────────────────────────────────────────────── */
  page = 1;
  setF(doc, COVER); doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  setF(doc, GREEN); doc.rect(0, 0, PAGE_W, 3, 'F');
  logoMark(doc, MX + 4, 22, 4.4);
  setT(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text('SYLITHE', MX + 11, 24);
  setT(doc, [180, 230, 200]); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); doc.text('CONFIDENTIAL MRV REPORT', PAGE_W - MX, 22, { align: 'right' });
  if (topImg) { try { doc.addImage(topImg, 'PNG', MX, 36, CW, 96); } catch { /* */ } }
  setD(doc, [40, 70, 55]); doc.setLineWidth(0.4); doc.rect(MX, 36, CW, 96, 'S');
  setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('FOREST INTELLIGENCE REPORT · CARBON DILIGENCE', MX, 148);
  setT(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(27);
  doc.text(project.name || 'Land Eligibility', MX, 162);
  setT(doc, GREEN); doc.text('& Carbon Diligence', MX, 175);
  setT(doc, [200, 218, 208]); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(doc.splitTextToSize('Satellite + AI land-use / land-cover analysis, multi-year change history, vegetation, deforestation, fire & climate context, and Verra VCS eligibility assessment.', CW), MX, 184);
  // KPI tiles row
  const kt = (PAGE_W - 2 * MX - 3 * 4) / 4, kty = 204;
  const ktile = (i, lab, val, sub) => { const x = MX + i * (kt + 4); setF(doc, [16, 38, 28]); doc.roundedRect(x, kty, kt, 24, 1.6, 1.6, 'F'); setT(doc, [150, 190, 168]); doc.setFont('helvetica', 'bold'); doc.setFontSize(5.8); doc.text(lab.toUpperCase(), x + 3.5, kty + 6); setT(doc, WHITE); doc.setFontSize(14); doc.text(String(val), x + 3.5, kty + 14); setT(doc, [150, 190, 168]); doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.text(doc.splitTextToSize(sub, kt - 6), x + 3.5, kty + 19); };
  ktile(0, 'Total Area', `${fmt(scan.area_ha)} ha`, `${gs.featureCount} polygon(s)`);
  ktile(1, 'Eligibility', `${elig.score ?? 0}/100`, (elig.verdict || 'potential').replace(/_/g, ' '));
  ktile(2, 'Tree Cover', `${scan.forest?.cover_pct ?? 0}%`, `Defor. risk ${String(scan.forest?.deforestation_risk || 'low')}`);
  ktile(3, 'Restorable', `${fmt(Math.round(eligTotal - (scan.lulc?.Trees?.ha || 0)))} ha`, 'ARR / agroforestry');
  // meta footer
  setD(doc, [40, 70, 55]); doc.setLineWidth(0.4); doc.line(MX, 252, PAGE_W - MX, 252);
  const cm = [['Project Type', ptype], ['Standard', project.creditingStandard || 'Verra VCS'], ['Location', [project.district, project.state, project.country].filter(Boolean).join(', ') || '—'], ['Date', dateStr], ['Report ID', reportId], ['Prepared by', 'Sylithe MRV Platform']];
  let cy = 260; cm.forEach(([k, v], i) => { const x = i % 2 ? PAGE_W / 2 + 2 : MX; if (i % 2 === 0 && i) cy += 7; setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.6); doc.text(k, x, cy); setT(doc, WHITE); doc.setFont('helvetica', 'normal'); doc.text(String(v), x + 28, cy); });
  setT(doc, [120, 150, 132]); doc.setFontSize(7); doc.text(`© SYLITHE ${today.getFullYear()} · Confidential · info@sylithe.com`, MX, PAGE_H - 10);

  /* ── 2 · TABLE OF CONTENTS ───────────────────────────────────── */
  next(); header(doc, 'Forest Carbon Diligence Report', 'Table of Contents');
  let y = sectionHead(doc, 30, 'Navigation', 'Table of Contents', `${project.name || 'Project'} · Full diligence report · ${TOTAL} pages`);
  const tocCol = (items, x) => {
    let ty = y;
    items.forEach(([grp, rowsT]) => {
      setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); doc.text(grp.toUpperCase(), x, ty); ty += 1.5;
      setD(doc, LINE); doc.setLineWidth(0.3); doc.line(x, ty, x + 80, ty); ty += 5.5;
      rowsT.forEach(([no, t, pg]) => {
        setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text(no, x, ty);
        setT(doc, INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.6); doc.text(doc.splitTextToSize(t, 60), x + 11, ty);
        setT(doc, MUTE); doc.text(pg, x + 80, ty, { align: 'right' });
        ty += t.length > 30 ? 11 : 8;
      });
      ty += 4;
    });
  };
  tocCol([
    ['Front Matter', [['—', 'Cover Page', '1'], ['—', 'Table of Contents', '2'], ['—', 'Executive Summary', '3']]],
    ['Project Details', [['§1', 'Project Information & Methodology', '4'], ['§2', 'Project Area & Boundary', '5']]],
    ['Land Cover & Implementation', [['§3', 'Land Cover Classification (LULC)', '6'], ['§4', 'Land Cover Breakdown', '7'], ['§5', 'Eligible vs Ineligible Land', '8'], ['§6', 'Land Cover Change 2016–Present', '9']]],
  ], MX);
  tocCol([
    ['Satellite Monitoring', [['§7', 'Vegetation Health — NDVI', '10'], ['§8', 'Deforestation History', '11'], ['§9', 'Fire History', '12'], ['§10', 'Climate Context — Rainfall', '13'], ['§11', 'Site Profile & Baseline Summary', '14'], ['§12', 'Eligibility Outlook & Methodology', '15']]],
    ['Quantification & Carbon (Locked)', [['§13', 'Carbon Stock & Biomass (AGB)', '16'], ['§14', 'Canopy Height Model (CHM)', '17'], ['§15', 'Canopy Height Change Analysis', '18'], ['§16', 'Dynamic Carbon Baseline (DCAB)', '19'], ['§17', 'GHG Emission Reductions', '20'], ['§18', 'Additionality & Baseline', '21'], ['§19', 'Permanence & Reversal Risk', '22'], ['§20', 'Monitoring & Safeguards', '23']]],
    ['Appendix', [['§21', 'Data Sources & Disclaimer', '24']]],
  ], PAGE_W / 2 + 4);
  // how to read
  noteCard(doc, 250, 'How to read this report', 'This diligence report follows the Verra VCS Monitoring Report structure. Land-cover, satellite-history and project sections are unlocked and enriched with Sylithe AI expert analysis. Carbon quantification, biomass (AGB), CHM, dynamic baseline, permanence and monitoring sections are premium — available with Sylithe Verified.');
  footer(doc, page);

  /* ── 3 · EXECUTIVE SUMMARY (unlocked) ────────────────────────── */
  next(); header(doc, rightTag, 'Executive Summary');
  y = sectionHead(doc, 30, 'Overview', 'Executive Summary', `${ptype} · ${[project.district, project.state, project.country].filter(Boolean).join(', ') || 'Location TBD'}`);
  const et = (PAGE_W - 2 * MX - 3 * 4) / 4;
  kpiTile(doc, MX, y, et, 24, 'Total Area', `${fmt(scan.area_ha)} ha`, `${gs.featureCount} polygon(s)`, { accent: GREEN, vc: GREEN_D });
  kpiTile(doc, MX + (et + 4), y, et, 24, 'Eligibility', `${elig.score ?? 0}/100`, (elig.verdict || 'potential').replace(/_/g, ' '), { accent: GREEN });
  kpiTile(doc, MX + 2 * (et + 4), y, et, 24, 'Tree Cover', `${scan.forest?.cover_pct ?? 0}%`, `Defor. risk ${String(scan.forest?.deforestation_risk || 'low')}`, { accent: '#E49635' });
  kpiTile(doc, MX + 3 * (et + 4), y, et, 24, 'Restorable Land', `${fmt(Math.round(eligTotal - (scan.lulc?.Trees?.ha || 0)))} ha`, 'ARR / agroforestry', { accent: '#3b82f6' });
  y += 30;
  if (A.executive) { y = subHead(doc, y, 'Sylithe AI — Diligence Read'); y = para(doc, y, A.executive); y += 2; }
  // strengths / watch-points — plain two-column lists, no colour fills
  const colW = (CW - 8) / 2;
  const sList = (A.strengths && A.strengths.length) ? A.strengths : ['Boundary successfully classified from multi-spectral satellite imagery.'];
  const cList = (A.concerns && A.concerns.length) ? A.concerns : ['Field verification required before validation.'];
  const bulletCol = (x, head, items) => {
    setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.text(head.toUpperCase(), x, y);
    setD(doc, LINE); doc.setLineWidth(0.3); doc.line(x, y + 1.8, x + colW, y + 1.8);
    let yy = y + 7;
    items.forEach((it) => { setF(doc, SLATE); doc.circle(x + 1, yy - 1.1, 0.6, 'F'); setT(doc, INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); const t = doc.splitTextToSize(it, colW - 5); doc.text(t, x + 4, yy); yy += t.length * 3.7 + 2.4; });
    return yy;
  };
  const yA = bulletCol(MX, 'Strengths', sList);
  const yB = bulletCol(MX + colW + 8, 'Watch-points', cList);
  y = Math.max(yA, yB) + 3;
  // verdict — clean bordered box, no colour fill
  setF(doc, WHITE); setD(doc, LINE); doc.setLineWidth(0.4); doc.rect(MX, y, CW, 18, 'FD');
  setF(doc, GREEN); doc.rect(MX, y, 1.6, 18, 'F');
  setT(doc, SLATE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.text('OVERALL ELIGIBILITY VERDICT', MX + 6, y + 7);
  setT(doc, DARKINK); doc.setFontSize(13); doc.text((elig.verdict || 'potentially eligible').replace(/_/g, ' ').toUpperCase(), MX + 6, y + 14);
  setT(doc, GREEN); doc.setFontSize(19); doc.text(`${elig.score ?? 0}`, PAGE_W - MX - 16, y + 12, { align: 'right' }); setT(doc, SLATE); doc.setFontSize(8); doc.text('/100', PAGE_W - MX - 4, y + 12, { align: 'right' });
  footer(doc, page);

  /* ── 4 · §1 PROJECT INFORMATION & METHODOLOGY (unlocked) ─────── */
  next(); header(doc, rightTag, '§1 · Project Details');
  y = sectionHead(doc, 30, 'Section 1', 'Project Information & Methodology', 'Project identity, crediting framework and applicable Verra methodology');
  y = subHead(doc, y, '1.1 Project Details');
  const kv = [
    { p: 'Project Name', v: project.name || 'Untitled Project' }, { p: 'Proponent', v: project.proponent || '—' },
    { p: 'Project Type / Activity', v: ptype }, { p: 'Crediting Standard', v: project.creditingStandard || 'Verra VCS' },
    { p: 'Crediting Period', v: `${project.projectLength || '40'} years` }, { p: 'Country', v: project.country || '—' },
    { p: 'State / Region', v: project.state || '—' }, { p: 'District', v: project.district || '—' },
    { p: 'Centroid', v: gs.centroid ? `${dms(gs.centroid[1], 'N', 'S')}, ${dms(gs.centroid[0], 'E', 'W')}` : '—' },
    { p: 'Boundaries', v: `${gs.featureCount} polygon(s) · ${fmt(scan.area_ha)} ha` },
  ];
  y = table(doc, y, [{ key: 'p', label: 'Parameter', w: CW * 0.42, bold: true }, { key: 'v', label: 'Value', w: CW * 0.58 }], kv);
  y = subHead(doc, y + 1, '1.2 Applicable Verra Methodology');
  const applic = {
    VM0047: 'Applies to afforestation, reforestation & revegetation on land that has been non-forest. Requires demonstration of the pre-project non-forest baseline and additionality.',
    VM0048: 'Applies to reducing emissions from deforestation/degradation of existing forest. Requires a credible deforestation baseline and leakage assessment.',
    VM0045: 'Applies to improved forest management on land remaining forest, increasing carbon stocks relative to a documented baseline practice.',
  };
  methods.forEach((m) => {
    const code = m.split(' — ')[0];
    setF(doc, ROW); setD(doc, LINE); doc.setLineWidth(0.3);
    const txt = doc.splitTextToSize(applic[code] || 'Applicability confirmed per the selected project activity.', CW - 14);
    const bh2 = 9 + txt.length * 3.4; doc.roundedRect(MX, y, CW, bh2, 1.4, 1.4, 'FD');
    setF(doc, GREEN); doc.circle(MX + 5, y + 5.5, 1.5, 'F');
    setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.6); doc.text(m, MX + 9, y + 6.5);
    setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.text(txt, MX + 9, y + 11.5);
    y += bh2 + 4;
  });
  if (project.description) { y = subHead(doc, y + 1, '1.3 Project Description'); y = para(doc, y, project.description); }
  footer(doc, page);

  /* ── 5 · §2 PROJECT AREA & BOUNDARY (unlocked) ───────────────── */
  next(); header(doc, rightTag, '§2 · Project Details');
  y = sectionHead(doc, 30, 'Section 2', 'Project Area & Boundary', 'Geographic extent, boundary geometry and site context');
  imageBox(doc, MX, y, CW, 96, images.satellite, 'Sentinel-2 true-colour composite (10 m), clipped to the submitted project boundary.');
  y += 104;
  y = subHead(doc, y, '2.1 Geographic Details');
  const aw = (CW - 8) / 3;
  kpiTile(doc, MX, y, aw, 22, 'Total Area', `${fmt(scan.area_ha)} ha`, 'Geodesic boundary', { accent: GREEN });
  kpiTile(doc, MX + aw + 4, y, aw, 22, 'Polygons', `${gs.featureCount}`, 'Submitted features');
  kpiTile(doc, MX + 2 * (aw + 4), y, aw, 22, 'Centroid', gs.centroid ? `${gs.centroid[1].toFixed(3)},${gs.centroid[0].toFixed(3)}` : '—', 'Lat, Lon', { vs: 11 });
  y += 28;
  const terr = sp.terrain || {};
  const geoRows = [
    { p: 'Centroid Latitude', v: gs.centroid ? dms(gs.centroid[1], 'N', 'S') : '—' },
    { p: 'Centroid Longitude', v: gs.centroid ? dms(gs.centroid[0], 'E', 'W') : '—' },
    { p: 'Elevation', v: terr.elevation_m != null ? `${terr.elevation_m} m a.s.l. (${terr.source || 'GLO-30 DEM'})` : '—' },
    { p: 'Mean Slope', v: terr.slope_deg != null ? `${terr.slope_deg}°` : '—' },
    { p: 'Mean Annual Rainfall', v: (history?.rainfall || []).length ? `~${Math.round((history.rainfall.reduce((s, d) => s + (d.mm || 0), 0)) / history.rainfall.length)} mm/yr (CHIRPS)` : '—' },
    { p: 'Protected Area (WDPA)', v: sp.protected_area != null ? (sp.protected_area ? 'Overlap detected' : 'No overlap') : '—' },
  ];
  y = table(doc, y, [{ key: 'p', label: 'Parameter', w: CW * 0.42, bold: true }, { key: 'v', label: 'Value', w: CW * 0.58 }], geoRows);
  y = subHead(doc, y + 1, '2.2 Site Context Analysis');
  y = para(doc, y, A.boundary || 'The site’s terrain, rainfall envelope and location set the growth potential, accessibility and risk profile that frame the restoration or protection activity.');
  footer(doc, page);

  /* ── 6 · §3 LAND COVER CLASSIFICATION (unlocked, AI) ─────────── */
  next(); header(doc, rightTag, '§3 · Land Cover');
  y = sectionHead(doc, 30, 'Section 3', 'Land Cover Classification (LULC)', 'Multi-spectral land-use / land-cover classification of the project boundary');
  const half = (CW - 6) / 2;
  imageBox(doc, MX, y, half, 74, images.satellite, 'Satellite · Sentinel-2 (10 m)');
  imageBox(doc, MX + half + 6, y, half, 74, images.lulc, 'Classified LULC · Dynamic World / ESA WorldCover');
  y += 82;
  y = subHead(doc, y, '3.1 Classification Interpretation');
  y = para(doc, y, A.lulc || 'Land Use / Land Cover classification separates the project boundary into discrete cover classes from multi-spectral satellite imagery. Eligible classes (cropland, grassland, shrub, bare) drive ARR / agroforestry potential, while existing forest supports REDD+ and IFM activities.');
  footer(doc, page);

  /* ── 7 · §4 LAND COVER BREAKDOWN (unlocked) ──────────────────── */
  next(); header(doc, rightTag, '§4 · Land Cover');
  y = sectionHead(doc, 30, 'Section 4', 'Land Cover Breakdown', 'Composition of cover classes within the project boundary');
  const segs = rows.map(([n, v]) => ({ value: v.pct, color: LULC_COLORS[n] || '#999' }));
  const cw = (CW - 6) / 2;
  setF(doc, [250, 251, 252]); setD(doc, LINE); doc.setLineWidth(0.3); doc.roundedRect(MX, y, cw, 116, 2, 2, 'FD');
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text('Land Cover Composition', MX + 5, y + 8);
  donut(doc, MX + cw / 2, y + 48, 30, 17, segs);
  let ly = y + 78; rows.slice(0, 6).forEach(([n, v]) => { setF(doc, RGB(LULC_COLORS[n] || '#999')); doc.roundedRect(MX + 6, ly - 2.4, 3, 3, 0.5, 0.5, 'F'); setT(doc, INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); doc.text(`${n}`, MX + 11, ly); setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.text(`${v.pct}%`, MX + cw - 6, ly, { align: 'right' }); ly += 5.4; });
  setF(doc, [250, 251, 252]); setD(doc, LINE); doc.roundedRect(MX + cw + 6, y, cw, 116, 2, 2, 'FD');
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text(`Land Cover by Class`, MX + cw + 11, y + 8);
  setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.text(`${fmt(scan.area_ha)} ha total`, MX + 2 * cw + 1, y + 8, { align: 'right' });
  distList(doc, MX + cw + 11, y + 18, cw - 10, rows.slice(0, 8).map(([n, v]) => ({ label: n, value: v.ha, unit: ' ha', pct: v.pct, color: LULC_COLORS[n] || '#999' })));
  y += 122;
  y = subHead(doc, y, '4.1 Composition Analysis');
  y = para(doc, y, A.breakdown || 'The land-cover mix determines which carbon activity the plot can support — a forest-dominant boundary favours protection-based crediting, while crop/grass/shrub-dominant land favours planting-based restoration.');
  footer(doc, page);

  /* ── 8 · §5 ELIGIBLE VS INELIGIBLE (unlocked) ────────────────── */
  next(); header(doc, rightTag, '§5 · Land Cover');
  y = sectionHead(doc, 30, 'Section 5', 'Eligible vs Ineligible Land', 'Carbon-eligible classes versus land that cannot be credited');
  const cw2 = (CW - 6) / 2;
  const ch = Math.max(50, 24 + Math.max(eligRows.length, inRows.length) * 10.5);
  setF(doc, WHITE); setD(doc, LINE); doc.setLineWidth(0.3); doc.rect(MX, y, cw2, ch, 'FD'); setF(doc, GREEN); doc.rect(MX, y, 1.4, ch, 'F');
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2); doc.text('Eligible / Carbon Land', MX + 6, y + 8);
  setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.text('REDD+ · ARR · Agroforestry', MX + 6, y + 12.5);
  distList(doc, MX + 6, y + 21, cw2 - 12, eligRows.length ? eligRows : [{ label: 'None', value: 0, color: '#ccc' }]);
  setF(doc, WHITE); setD(doc, LINE); doc.rect(MX + cw2 + 6, y, cw2, ch, 'FD'); setF(doc, [148, 163, 184]); doc.rect(MX + cw2 + 6, y, 1.4, ch, 'F');
  setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2); doc.text('Ineligible Land', MX + cw2 + 12, y + 8);
  setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.text('Cannot be credited', MX + cw2 + 12, y + 12.5);
  distList(doc, MX + cw2 + 12, y + 21, cw2 - 12, inRows.length ? inRows : [{ label: 'None', value: 0, color: '#ccc' }]);
  y += ch + 6;
  y = subHead(doc, y, '5.1 Classification Rationale');
  y = para(doc, y, `Of the ${fmt(scan.area_ha)} ha assessed, approximately ${fmt(Math.round(eligTotal))} ha falls in carbon-eligible classes (forest, cropland, grassland, shrub and bare land) and ${fmt(Math.round(inTotal))} ha in non-eligible classes (built-up, water, snow/ice). Existing tree cover — ${fmt(Math.round(scan.lulc?.Trees?.ha || 0))} ha (${scan.lulc?.Trees?.pct || 0}%) — is eligible for protection-based methodologies (REDD+/IFM) rather than planting-based ARR.`);
  if (A.eligibility_split) { y = subHead(doc, y + 1, '5.2 Sylithe AI Analysis'); y = para(doc, y, A.eligibility_split); }
  footer(doc, page);

  /* ── 9 · §6 LAND COVER CHANGE (unlocked, AI) ─────────────────── */
  next(); header(doc, rightTag, '§6 · Implementation Status');
  y = sectionHead(doc, 30, 'Section 6', 'Land Cover Change · 2016–Present', 'Multi-year land-cover trajectory and baseline implications (Dynamic World)');
  const lc = history?.lulc_timeseries || [];
  if (lc.length) {
    const first = lc[0], last = lc[lc.length - 1];
    setF(doc, [250, 251, 252]); setD(doc, LINE); doc.setLineWidth(0.3); doc.roundedRect(MX, y, CW, 78, 2, 2, 'FD');
    setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text('Tree Cover Trend', MX + 5, y + 8);
    setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.text('Forest area by year (ha) · Dynamic World', MX + 5, y + 12.5);
    vbars(doc, MX + 12, y + 22, CW - 22, 48, lc, 'trees', 'year', '#16a34a', 'ha');
    y += 84;
    const cls = [['trees', 'Trees', '#16a34a'], ['crops', 'Cropland', '#E49635'], ['shrub', 'Shrub', '#DFC35A'], ['built', 'Built-up', '#C4281B'], ['water', 'Water', '#419BDF']];
    const cwn = (CW - 4 * 4) / 5;
    cls.forEach((c, i) => { const d = (last[c[0]] || 0) - (first[c[0]] || 0); kpiTile(doc, MX + i * (cwn + 4), y, cwn, 22, c[1], `${d >= 0 ? '+' : ''}${d.toFixed(0)} ha`, `${first.year}–${last.year}`, { vs: 12, vc: d >= 0 ? GREEN_D : V_RED.tx, accent: c[2] }); });
    y += 28;
  }
  y = subHead(doc, y, '6.1 Change Analysis');
  y = para(doc, y, A.change || 'The multi-year Dynamic World record establishes the plot’s baseline land-use trajectory used for Verra additionality and leakage assessment.');
  footer(doc, page);

  // helper for satellite-history pages — plain professional note
  const noteBox = (yy, title, body) => noteCard(doc, yy, title, body);

  // stat-tile row helper (4 tiles across the content width)
  const statRow = (yy, tiles) => { const tw = (CW - (tiles.length - 1) * 4) / tiles.length; tiles.forEach((t, i) => kpiTile(doc, MX + i * (tw + 4), yy, tw, 22, t[0], t[1], t[2], { vs: 13 })); return yy + 28; };
  const chartCard = (yy, h, title, sub, data, vk, color, unit) => { setF(doc, [250, 251, 252]); setD(doc, LINE); doc.setLineWidth(0.3); doc.roundedRect(MX, yy, CW, h, 2, 2, 'FD'); setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text(title, MX + 5, yy + 8); setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.text(sub, MX + 5, yy + 12.5); vbars(doc, MX + 12, yy + 22, CW - 22, h - 30, data, vk, 'year', color, unit); return yy + h + 6; };

  /* ── 10 · §7 NDVI (unlocked, AI + GEE layer) ─────────────────── */
  next(); header(doc, rightTag, '§7 · Satellite Monitoring');
  y = sectionHead(doc, 30, 'Section 7', 'Vegetation Health — NDVI', 'Sentinel-2 vegetation-vigour trajectory across the project boundary');
  const ndvi = history?.ndvi || [];
  if (hasSignal(ndvi, 'ndvi')) {
    y = chartCard(y, 56, 'Yearly Mean NDVI', 'Sentinel-2 · vegetation health (0–1)', ndvi, 'ndvi', '#06b6d4', 'NDVI');
    const vals = ndvi.map((d) => d.ndvi).filter((v) => v != null);
    const peak = Math.max(...vals), lo = Math.min(...vals), latest = ndvi[ndvi.length - 1].ndvi, d0 = ndvi[0].ndvi, delta = latest - d0;
    y = statRow(y, [['Peak NDVI', peak.toFixed(2), `${ndvi[vals.indexOf(peak)]?.year || ''}`], ['Latest', Number(latest).toFixed(2), `${ndvi[ndvi.length - 1].year}`], ['Minimum', lo.toFixed(2), 'over record'], ['Trend Δ', `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`, `${ndvi[0].year}–${ndvi[ndvi.length - 1].year}`]]);
  } else { y = noteBox(y, 'No NDVI signal available', 'Sentinel-2 NDVI could not be computed for this boundary (cloud cover or limited imagery).'); }
  if (images.ndvi) { imageBox(doc, MX, y, CW, 64, images.ndvi, 'Sentinel-2 NDVI layer — red/orange = bare or stressed, green = dense vegetation, clipped to the project boundary.'); y += 72; }
  y = subHead(doc, y, '7.1 Interpretation');
  y = para(doc, y, A.ndvi || 'NDVI quantifies live, photosynthesising vegetation. A rising trajectory indicates regrowth and successful restoration; a flat or declining trajectory indicates stress or land-use conversion that must be reflected in the baseline.');
  footer(doc, page);

  /* ── 11 · §8 DEFORESTATION (unlocked, AI + GEE layer) ────────── */
  next(); header(doc, rightTag, '§8 · Satellite Monitoring');
  y = sectionHead(doc, 30, 'Section 8', 'Deforestation History', 'UMD / Hansen Global Forest Change tree-cover loss record');
  const defor = (history?.deforestation || []).filter((d) => d.year >= 2008);
  const totLoss = defor.reduce((s, d) => s + (d.loss_ha || 0), 0);
  if (hasSignal(defor, 'loss_ha')) {
    y = chartCard(y, 56, 'Annual Tree-Cover Loss', 'UMD / Hansen GFC (ha)', defor, 'loss_ha', '#ef4444', 'ha');
    const peakD = defor.reduce((m, d) => (d.loss_ha > (m.loss_ha || 0) ? d : m), {});
    const lossYears = defor.filter((d) => (d.loss_ha || 0) > 0.01).length;
    y = statRow(y, [['Total Loss', `${totLoss.toFixed(1)} ha`, 'since 2008'], ['Peak Year', `${peakD.year || '—'}`, `${(peakD.loss_ha || 0).toFixed(1)} ha`], ['Loss Years', `${lossYears}`, 'with measurable loss'], ['Baseline', totLoss > 0.5 ? 'Active' : 'Stable', 'deforestation signal']]);
  } else { y = noteBox(y, 'No tree-cover loss detected', 'The Hansen record shows no measurable deforestation on this boundary (2008–present) — a strong baseline and permanence signal.'); }
  if (images.deforestation) { imageBox(doc, MX, y, CW, 64, images.deforestation, 'Hansen tree-cover loss (red) over the Sentinel-2 base — highlights where canopy was lost within the boundary.'); y += 72; }
  y = subHead(doc, y, '8.1 Interpretation');
  y = para(doc, y, A.deforestation || 'Deforestation history is the foundation of the REDD+ (VM0048) baseline scenario and a key input to additionality, leakage and the non-permanence risk assessment.');
  footer(doc, page);

  /* ── 12 · §9 FIRE (unlocked, AI + GEE layer) ─────────────────── */
  next(); header(doc, rightTag, '§9 · Satellite Monitoring');
  y = sectionHead(doc, 30, 'Section 9', 'Fire History', 'NASA MODIS burned-area disturbance record');
  const fire = (history?.fire || []).filter((d) => d.year >= 2008);
  const totFire = fire.reduce((s, d) => s + (d.burn_ha || 0), 0);
  if (hasSignal(fire, 'burn_ha')) {
    y = chartCard(y, 56, 'Annual Burned Area', 'MODIS MCD64A1 (ha)', fire, 'burn_ha', '#f97316', 'ha');
    const peakF = fire.reduce((m, d) => (d.burn_ha > (m.burn_ha || 0) ? d : m), {});
    const fireYears = fire.filter((d) => (d.burn_ha || 0) > 0.01).length;
    y = statRow(y, [['Total Burned', `${totFire.toFixed(1)} ha`, 'since 2008'], ['Peak Year', `${peakF.year || '—'}`, `${(peakF.burn_ha || 0).toFixed(1)} ha`], ['Fire Years', `${fireYears}`, 'with detected fire'], ['Reversal Risk', totFire > 0.5 ? 'Elevated' : 'Low', 'permanence signal']]);
  } else { y = noteBox(y, 'No fire detected', 'MODIS burned-area shows no fire on this boundary (2008–present) — a favourable permanence and reversal-risk signal.'); }
  if (images.fire) { imageBox(doc, MX, y, CW, 64, images.fire, 'MODIS burned area (orange) over the Sentinel-2 base — shows fire-affected zones within the boundary, if any.'); y += 72; }
  y = subHead(doc, y, '9.1 Interpretation');
  y = para(doc, y, A.fire || 'Fire history feeds directly into the Verra VCS non-permanence risk tool, which sets the percentage of credits withheld in the pooled buffer account.');
  footer(doc, page);

  /* ── 13 · §10 CLIMATE (unlocked, AI) ─────────────────────────── */
  next(); header(doc, rightTag, '§10 · Satellite Monitoring');
  y = sectionHead(doc, 30, 'Section 10', 'Climate Context — Rainfall', 'CHIRPS precipitation envelope for growth and drought-risk modelling');
  const rain = history?.rainfall || [];
  if (hasSignal(rain, 'mm')) { setF(doc, [250, 251, 252]); setD(doc, LINE); doc.setLineWidth(0.3); doc.roundedRect(MX, y, CW, 66, 2, 2, 'FD'); setT(doc, DARKINK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.text('Annual Rainfall', MX + 5, y + 8); setT(doc, SLATE); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.text('CHIRPS · total precipitation (mm/yr)', MX + 5, y + 12.5); vbars(doc, MX + 12, y + 22, CW - 22, 36, rain, 'mm', 'year', '#3b82f6', 'mm'); y += 72; }
  else { y = noteBox(y, 'Rainfall data unavailable', 'CHIRPS precipitation could not be retrieved for this boundary.'); }
  y = subHead(doc, y, '10.1 Interpretation');
  y = para(doc, y, A.climate || 'Rainfall sets the achievable growth rate and, where variable, the drought-mortality risk that the planting and species plan must mitigate. Sequestration projections under VM0047 are calibrated against precipitation and species-specific growth curves.');
  footer(doc, page);

  /* ── 14 · §11 SITE PROFILE & BASELINE SUMMARY (unlocked, Land History) */
  next(); header(doc, rightTag, '§11 · Land History');
  y = sectionHead(doc, 30, 'Section 11', 'Site Profile & Baseline Summary', 'Consolidated environmental site profile and project baseline from the open-data record');
  y = subHead(doc, y, '11.1 Environmental Site Profile');
  const avgRain = (history?.rainfall || []).length ? Math.round((history.rainfall.reduce((s, d) => s + (d.mm || 0), 0)) / history.rainfall.length) : null;
  const profTiles = [
    ['Elevation', sp.terrain?.elevation_m != null ? `${sp.terrain.elevation_m} m` : '—', 'a.s.l. · GLO-30'],
    ['Mean Slope', sp.terrain?.slope_deg != null ? `${sp.terrain.slope_deg}°` : '—', 'terrain gradient'],
    ['Soil Carbon', sp.soil_organic_carbon_gkg != null ? `${sp.soil_organic_carbon_gkg}` : '—', 'g/kg · OpenLandMap'],
    ['Rainfall', avgRain != null ? `${fmt(avgRain)}` : '—', 'mm/yr · CHIRPS'],
    ['Population', sp.population != null ? fmt(sp.population) : '—', 'in boundary · GHSL'],
    ['Surface Water', sp.water_occurrence_pct != null ? `${sp.water_occurrence_pct}%` : '—', 'occurrence · JRC'],
    ['Night Lights', sp.nighttime_lights != null ? `${sp.nighttime_lights}` : '—', 'dev. proxy · VIIRS'],
    ['Protected Area', sp.protected_area != null ? (sp.protected_area ? 'Yes' : 'No') : '—', 'WDPA overlap'],
  ];
  { const tw = (CW - 3 * 4) / 4; profTiles.forEach((t, i) => { const col = i % 4, r = Math.floor(i / 4); kpiTile(doc, MX + col * (tw + 4), y + r * 26, tw, 22, t[0], t[1], t[2], { vs: 13 }); }); y += Math.ceil(profTiles.length / 4) * 26 + 4; }
  y = subHead(doc, y, '11.2 Project Baseline Summary');
  const forestHa = scan.lulc?.Trees?.ha || 0;
  const sumRows = [
    { p: 'Eligibility score', v: `${elig.score ?? 0} / 100 · ${(elig.verdict || 'potential').replace(/_/g, ' ')}` },
    { p: 'Total project area', v: `${fmt(scan.area_ha)} ha` },
    { p: 'Existing forest (REDD+ / IFM)', v: `${fmt(Math.round(forestHa))} ha` },
    { p: 'Restorable land (ARR / agroforestry)', v: `${fmt(Math.round(eligTotal - forestHa))} ha` },
    { p: '10-yr deforestation', v: `${(history?.deforestation || []).filter((d) => d.year >= 2015).reduce((s, d) => s + (d.loss_ha || 0), 0).toFixed(1)} ha` },
    { p: 'Fire (since 2008)', v: `${(history?.fire || []).reduce((s, d) => s + (d.burn_ha || 0), 0).toFixed(1)} ha` },
    { p: 'Deforestation risk', v: String(scan.forest?.deforestation_risk || 'low').toUpperCase() },
    { p: 'Applicable methodology', v: methods[0].split(' — ')[0] },
  ];
  y = table(doc, y, [{ key: 'p', label: 'Baseline Parameter', w: CW * 0.55, bold: true }, { key: 'v', label: 'Value', w: CW * 0.45 }], sumRows);
  footer(doc, page);

  /* ── 15 · §12 ELIGIBILITY OUTLOOK & METHODOLOGY (unlocked, AI) ─ */
  next(); header(doc, rightTag, '§12 · Satellite Monitoring');
  y = sectionHead(doc, 30, 'Section 12', 'Eligibility Outlook & Methodology', 'Best-fit Verra methodology and evidence-based eligibility outlook');
  y = subHead(doc, y, '12.1 Outlook');
  y = para(doc, y, A.eligibility_outlook || elig.reason || 'Eligibility outlook is derived from the land-cover, change and satellite-history evidence and must be confirmed through the applicable Verra methodology and field measurement.');
  y = subHead(doc, y + 1, '12.2 Applicable Methodologies');
  methods.forEach((m) => { setF(doc, ROW); setD(doc, LINE); doc.setLineWidth(0.2); doc.roundedRect(MX, y, CW, 9, 1.2, 1.2, 'FD'); setF(doc, GREEN); doc.circle(MX + 5, y + 4.7, 1.4, 'F'); setT(doc, INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4); doc.text(m, MX + 9, y + 5.8); y += 11; });
  if (A.next_steps && A.next_steps.length) { y = subHead(doc, y + 1, '12.3 Recommended Next Steps'); A.next_steps.forEach((s, i) => { setT(doc, GREEN); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.4); doc.text(`${i + 1}`, MX, y); setT(doc, INK); doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(s, CW - 8), MX + 6, y); y += Math.max(6, doc.splitTextToSize(s, CW - 8).length * 4); }); }
  footer(doc, page);

  /* ── 16–23 · LOCKED (Request Access) ─────────────────────────── */
  next(); lockedPage(doc, page, '§13 · Quantification & Carbon', 'Carbon Stock & Above-Ground Biomass', 'Per-pixel AGB and standing carbon-stock estimation', 'Quantified above-ground & below-ground biomass, standing carbon stock (tCO₂e), and per-hectare density with uncertainty bands, aligned to IPCC Tier 2 and Verra requirements.', ['ESA CCI + allometric AGB modelling', 'tCO₂e standing stock & per-ha density', 'IPCC Tier 2 uncertainty quantification']);
  next(); lockedPage(doc, page, '§14 · Quantification & Carbon', 'Canopy Height Model (CHM)', 'High-resolution 3D forest-structure analysis', 'Drone / high-resolution canopy height mapping with crown segmentation, stand height, vertical structure and tree-level metrics for biomass modelling.', ['Per-pixel canopy height model', 'Crown segmentation & tree count', 'Vertical structure & stand metrics']);
  next(); lockedPage(doc, page, '§15 · Quantification & Carbon', 'Canopy Height Change Analysis', 'Temporal canopy-height growth & loss detection', 'Multi-epoch canopy-height differencing that tracks vertical forest growth, gap formation and disturbance over time — the structural evidence base for biomass-change and crediting.', ['Epoch-to-epoch height change maps', 'Growth vs disturbance detection', 'Structure-based biomass-change signal']);
  next(); lockedPage(doc, page, '§16 · Quantification & Carbon', 'Dynamic Carbon & Activity Baseline (DCAB)', 'Continuously-updated satellite reference level', 'A continuously-updated, satellite-derived carbon & activity baseline that benchmarks the project against a dynamic reference region for additionality and crediting under jurisdictional / dynamic-baseline approaches.', ['Dynamic reference-region baseline', 'Activity-shifting & leakage tracking', 'Crediting against a live reference level']);
  next(); lockedPage(doc, page, '§17 · Quantification & Carbon', 'GHG Emission Reductions & Removals', 'Baseline, project & leakage emissions and net crediting', 'Quantification of baseline emissions, project emissions, leakage and net GHG emission reductions / removals over the crediting period, with annual issuance projections.', ['Baseline vs project emissions', 'Leakage & net ER/removals', 'Annual crediting projection & buffer']);
  next(); lockedPage(doc, page, '§18 · Quantification & Carbon', 'Additionality & Baseline Assessment', 'Formal additionality test and baseline scenario', 'Formal additionality demonstration (regulatory, barrier and common-practice tests) and the quantified baseline scenario underpinning crediting under the applicable methodology.', ['Additionality test pathway', 'Quantified baseline scenario', 'Common-practice benchmarking']);
  next(); lockedPage(doc, page, '§19 · Quantification & Carbon', 'Permanence & Reversal Risk', 'Non-permanence risk rating and buffer contribution', 'The Verra VCS non-permanence risk assessment — internal, external and natural reversal risk factors — that sets the project rating and the percentage of credits withheld in the pooled buffer account.', ['Internal / external / natural risk factors', 'Non-permanence risk rating', 'Buffer-pool contribution %']);
  next(); lockedPage(doc, page, '§20 · Monitoring', 'Monitoring Plan & Safeguards', 'MRV plan, parameters monitored and safeguards', 'The full monitoring plan (data & parameters monitored, frequency, QA/QC), stakeholder safeguards and risk management required for VCS validation & verification.', ['Data & parameters monitored', 'Stakeholder & environmental safeguards', 'QA/QC & verification readiness']);

  /* ── 24 · §21 SOURCES & DISCLAIMER (unlocked) ────────────────── */
  next(); header(doc, rightTag, '§21 · Appendix');
  y = sectionHead(doc, 30, 'Appendix', 'Data Sources & Disclaimer', 'Open-data provenance and report limitations');
  const src = [
    { p: 'Land Cover', v: 'Google Dynamic World · ESA WorldCover v200 (10 m)' },
    { p: 'Satellite Imagery', v: 'Copernicus Sentinel-2 SR Harmonized' },
    { p: 'Deforestation', v: 'UMD / Hansen Global Forest Change' },
    { p: 'Fire', v: 'NASA MODIS MCD64A1 burned area' },
    { p: 'Vegetation (NDVI)', v: 'Sentinel-2 (Bands 8 & 4)' },
    { p: 'Rainfall', v: 'UCSB CHIRPS' },
    { p: 'Terrain', v: 'Copernicus GLO-30 DEM' },
    { p: 'Soil', v: 'OpenLandMap SOC' },
    { p: 'Protected Areas', v: 'WDPA' },
    { p: 'AI Analysis', v: 'Sylithe AI — land-use interpretation' },
  ];
  y = table(doc, y, [{ key: 'p', label: 'Data Layer', w: CW * 0.34, bold: true }, { key: 'v', label: 'Source', w: CW * 0.66 }], src);
  y = subHead(doc, y + 1, 'Disclaimer');
  y = para(doc, y, 'This report is an automated pre-feasibility screening generated by Sylithe. It is NOT a validation or verification statement under any carbon standard. Eligibility verdicts and land-cover figures are indicative and based on remote-sensing classification; final eligibility, carbon quantification and additionality must be confirmed through the applicable Verra VCS methodology, field measurement and a VVB validation/verification process. Premium analyses (carbon stock / AGB, GHG quantification, additionality, CHM, monitoring) are available with Sylithe Verified — contact info@sylithe.com. AI-generated analysis is provided as analytical guidance and should be independently reviewed.', CW, MX, 8);
  setT(doc, MUTE); doc.setFontSize(7.5); doc.text(`Report ID: ${reportId} · Generated ${dateStr} · © ${today.getFullYear()} Sylithe`, MX, y + 2);
  footer(doc, page);

  const safe = (project.name || 'project').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`Sylithe-Diligence-Report-${safe}.pdf`);
  return reportId;
}
