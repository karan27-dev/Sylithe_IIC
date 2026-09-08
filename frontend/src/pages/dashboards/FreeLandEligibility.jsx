import React, { useState, useCallback, useEffect } from 'react';
import LandEligibilityPage from './VerificationLandEligibility';
import DmrvPlansModal from '../../components/DmrvPlansModal';
import { useAuth } from '../../context/AuthContext';
import { getLulcReportQuota, requestLulcReport } from '../../services/freeScanApi';
import { generateLulcReportPdf } from '../../services/lulcReportPdf';

/* ─────────────────────────────────────────────────────────
   Convert Sylithe LandScan AI result → freeScanResult
   shape consumed by FreeLulcSnapshot + FreeCarbonEstimate
   ───────────────────────────────────────────────────────── */
function chmToFreeScan(chmResult) {
  const d   = chmResult?.results;
  if (!d) return null;

  const total = d.total_area_ha || 1;
  const lulcRaw = d.lulc || {};

  // Map Sylithe LandScan AI classes to standard names + colours
  const mapping = [
    ['Trees',              lulcRaw.trees     || 0, '#397D49'],
    ['Crops',              lulcRaw.cropland  || 0, '#E49635'],
    ['Grass',              lulcRaw.grass     || 0, '#88B053'],
    ['Flooded Vegetation', lulcRaw.mangroves || 0, '#7A87C6'],
    ['Water',              lulcRaw.water     || 0, '#419BDF'],
    ['Built Area',         lulcRaw.urban     || 0, '#C4281B'],
    ['Bare Ground',        lulcRaw.bare      || 0, '#A59B8F'],
    ['Snow & Ice',         lulcRaw.ice_snow  || 0, '#B39FE1'],
  ];

  const lulc = {};
  for (const [name, ha, color] of mapping) {
    lulc[name] = {
      ha:    Math.round(ha * 10) / 10,
      pct:   Math.round(ha / total * 1000) / 10,
      color,
    };
  }

  // Forest stats from CHM
  const treePct  = Math.round((lulcRaw.trees || 0) / total * 100 * 10) / 10;
  const deforHa  = lulcRaw.defor || 0;
  const deforPct = Math.round(deforHa / total * 100 * 10) / 10;
  const deforRisk = deforPct > 10 ? 'high' : deforPct > 3 ? 'medium' : 'low';

  // Sylithe Carbon Protocol SCP-1 emission factors
  // Forest canopy: 80 tCO₂e/ha, Grass/Shrubland: 15, Cropland: 8
  const carbonMid = Math.round(
    (lulcRaw.trees    || 0) * 80 +
    (lulcRaw.grass    || 0) * 15 +
    (lulcRaw.cropland || 0) * 8  +
    (lulcRaw.bare     || 0) * 3
  );

  // Restorable land drives sequestration rate
  const restorablePct =
    ((lulcRaw.cropland || 0) + (lulcRaw.grass || 0) + (lulcRaw.bare || 0)) / total * 100;
  const seqLow  = Math.round(total * (restorablePct > 40 ? 3.5 : 2.0));
  const seqHigh = Math.round(total * (restorablePct > 40 ? 9.0 : 5.5));

  // Eligibility from CHM percentage
  const eligPct = d.eligibility?.percentage || 0;
  const eligibleTypes = [];
  if (treePct >= 30) { eligibleTypes.push('REDD+'); eligibleTypes.push('IFM'); }
  if (restorablePct >= 25) { eligibleTypes.push('ARR'); eligibleTypes.push('Agroforestry'); }
  if ((lulcRaw.mangroves || 0) / total > 0.05) eligibleTypes.push('Blue Carbon');

  let verdict, score, reason;
  const urbanPct = (lulcRaw.urban || 0) / total * 100;

  if (urbanPct > 50) {
    verdict = 'not_eligible'; score = 0;
    reason  = 'Predominantly built-up land. Carbon projects require natural or agricultural land.';
  } else if (eligPct >= 50 && eligibleTypes.length) {
    verdict = 'eligible'; score = Math.min(Math.round(eligPct), 95);
    reason  = `Land is well-suited for ${eligibleTypes.slice(0, 2).join(' & ')}.`;
  } else if (eligPct >= 20 || eligibleTypes.length) {
    verdict = 'potentially_eligible'; score = Math.round(eligPct * 0.8);
    reason  = `${eligPct}% of land shows potential for carbon project development.`;
  } else {
    verdict = 'low_potential'; score = Math.round(eligPct);
    reason  = 'Limited carbon project potential based on current land classification.';
  }

  // Build one map overlay per land-cover class (the backend returns a
  // separate single-colour tile for each class). Only include classes that
  // are actually present so the map shows every layer, not just one.
  const t = d.tiles || {};
  const lulcLayers = [
    { name: 'Trees',              url: t.trees,     ha: lulcRaw.trees },
    { name: 'Crops',              url: t.cropland,  ha: lulcRaw.cropland },
    { name: 'Grass',              url: t.grass,     ha: lulcRaw.grass },
    { name: 'Flooded Vegetation', url: t.mangroves, ha: lulcRaw.mangroves },
    { name: 'Water',              url: t.water,     ha: lulcRaw.water },
    { name: 'Built Area',         url: t.urban,     ha: lulcRaw.urban },
    { name: 'Bare Ground',        url: t.bare,      ha: lulcRaw.bare },
    { name: 'Snow & Ice',         url: t.ice_snow,  ha: lulcRaw.ice_snow },
  ].filter((l) => l.url && (l.ha || 0) > 0);

  // Tree layers (CHM canopy + official forest) are toggled separately from the
  // LULC class overlay so the user can show/hide them independently on the map.
  const treeLayers = [
    { name: 'Registered Forest (JRC 2020)', url: t.official_forest,   ha: d.official_forest_ha,           color: '#0b3d2e' },
    { name: 'Tree Canopy (>1m)',            url: t.tree_canopy_1m,    ha: d.model_prediction?.tree_chm_ha, color: '#14532d' },
  ].filter((l) => l.url);

  return {
    area_ha:      Math.round(total * 10) / 10,
    lulc,
    lulc_tile_url: d.tiles?.trees || null,
    lulc_layers:  lulcLayers,
    tree_layers:  treeLayers,
    forest: {
      cover_pct:           treePct,
      loss_ha_10yr:        Math.round(deforHa * 10) / 10,
      loss_pct_10yr:       deforPct,
      deforestation_risk:  deforRisk,
    },
    carbon: {
      co2_per_ha:      Math.round(carbonMid / total),
      total_co2_low:   Math.round(carbonMid * 0.7),
      total_co2_mid:   carbonMid,
      total_co2_high:  Math.round(carbonMid * 1.35),
      annual_seq_low:  seqLow,
      annual_seq_high: seqHigh,
    },
    eligibility: {
      verdict,
      score,
      reason,
      eligible_types: eligibleTypes,
      defor_risk:     deforRisk,
    },
  };
}

/* ═══════════════════════════════════════════════════════ */
export default function FreeLandEligibility({
  projectData, geojsonData, activeAoiIndex, onAoiChange,
  onSectionChange, onScanComplete,
  savedProjects, onProjectSelect, onToggleNav, navCollapsed,
}) {
  const [showNav, setShowNav] = useState(false);
  const { token } = useAuth();

  // Keep the last converted scan + polygon for the report export.
  const lastScanRef = React.useRef({ scan: null, polygon: null });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [reportRemaining, setReportRemaining] = useState(null);
  const [reportUnlimited, setReportUnlimited] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    getLulcReportQuota(token).then((q) => { if (alive) { setReportRemaining(q.remaining); setReportUnlimited(!!q.unlimited); } }).catch(() => {});
    return () => { alive = false; };
  }, [token]);

  const handleResult = useCallback((chmResult, polygon) => {
    const converted = chmToFreeScan(chmResult);
    if (converted) {
      onScanComplete?.(converted, polygon);
      lastScanRef.current = { scan: converted, polygon };
    }
    setShowNav(true);
  }, [onScanComplete]);

  const handleExportReport = useCallback(async () => {
    const { scan, polygon } = lastScanRef.current;
    if (!scan || reportBusy) return;
    setReportBusy(true);
    try {
      // Fetch report images (+ quota) and the full open-data land history in
      // parallel — the report embeds both. Land history is best-effort.
      const histPromise = fetch(`${import.meta.env.VITE_API_URL}/api/chm/land-history`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geojson: polygon }),
      }).then((r) => r.json()).then((d) => d.history || null).catch(() => null);

      const out = await requestLulcReport(token, {
        geojson: polygon,
        project_name: projectData?.name || 'Untitled Project',
        area_ha: scan.area_ha,
      });
      const history = await histPromise;
      await generateLulcReportPdf({ project: projectData, scan, geojson: polygon, images: out.images || {}, history });
      setReportRemaining(out.remaining);
      setReportUnlimited(!!out.unlimited);
    } catch (err) {
      if (err.status === 429) { setReportRemaining(0); alert('You have used all 3 free LULC report exports. Upgrade for unlimited reports.'); }
      else if (err.status === 503) alert('Report engine is warming up — please try again in a moment.');
      else alert(err.message || 'Could not generate the report. Please try again.');
    } finally {
      setReportBusy(false);
    }
  }, [token, projectData, reportBusy]);

  const nextSteps = showNav ? {
    scanning: false,
    onCarbon: () => onSectionChange?.('carbon_estimate'),
  } : undefined;

  return (
    <>
      <LandEligibilityPage
        projectData={projectData}
        geojsonData={geojsonData}
        activeAoiIndex={activeAoiIndex}
        onAoiChange={onAoiChange}
        onReturn={() => onSectionChange?.('project_details')}
        onResult={handleResult}
        onNextSteps={nextSteps}
        onSaveNext={() => onSectionChange?.('project_details')}
        savedProjects={savedProjects}
        onProjectSelect={onProjectSelect}
        onExportReport={handleExportReport}
        reportRemaining={reportRemaining}
        reportUnlimited={reportUnlimited}
        reportBusy={reportBusy}
        onGetFullAccess={() => setShowUpgrade(true)}
        onToggleNav={onToggleNav}
        navCollapsed={navCollapsed}
      />
      <DmrvPlansModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
