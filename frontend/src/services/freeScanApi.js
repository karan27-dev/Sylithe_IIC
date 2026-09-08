const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export async function runFreeScan(geojson, email = '') {
  const resp = await fetch(`${API_BASE}/free/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geojson, email }),
  });
  const data = await resp.json();
  if (!resp.ok) {
    const err = new Error(data.message || 'Scan failed');
    err.status = resp.status;
    err.data   = data;
    throw err;
  }
  return data;
}

// ── LULC report (authenticated, lifetime quota of 3) ──────────────
const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// AI land analysis (DeepSeek). Returns { rating, points } where points are
// { text, type: 'strength'|'risk'|'neutral' }.
export async function getLandSummary(history, projectStartYear) {
  const resp = await fetch(`${API_BASE}/chm/land-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, project_start_year: projectStartYear || null }),
  });
  const d = await resp.json();
  if (!resp.ok) { const e = new Error(d.message || 'Summary failed'); e.status = resp.status; throw e; }
  return { rating: d.rating || null, points: d.points || [] };
}

// In-depth AI carbon-expert analysis for the PDF report. Returns { analysis }
// with multi-paragraph prose per unlocked section, or null on failure.
export async function getReportAnalysis({ history, scan, project }) {
  try {
    const resp = await fetch(`${API_BASE}/chm/report-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, scan, project }),
    });
    const d = await resp.json();
    if (!resp.ok || d.status !== 'success') return null;
    return d.analysis || null;
  } catch { return null; }
}

// ── Free-tier feature quotas (lifetime 3/3 per action) ──────────────
const usageAuth = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('sylithe_token')}` });

export async function getFeatureUsage() {
  try {
    const resp = await fetch(`${API_BASE}/free/usage`, { headers: usageAuth() });
    const d = await resp.json();
    return resp.ok ? d : null;
  } catch { return null; }
}

// Consume one unit of an action. Returns { ok, limitReached, used, remaining }.
export async function consumeFeature(action) {
  try {
    const resp = await fetch(`${API_BASE}/free/usage/consume`, {
      method: 'POST', headers: usageAuth(), body: JSON.stringify({ action }),
    });
    const d = await resp.json();
    if (resp.status === 429) return { ok: false, limitReached: true, used: d.used, remaining: 0 };
    if (!resp.ok) return { ok: true, limitReached: false }; // fail-open on transient errors
    return { ok: true, limitReached: false, used: d.used, remaining: d.remaining };
  } catch { return { ok: true, limitReached: false }; } // fail-open if offline
}

export async function getLulcReportQuota(token) {
  const resp = await fetch(`${API_BASE}/free/lulc-report/quota`, {
    headers: authHeaders(token),
  });
  const data = await resp.json();
  if (!resp.ok) { const e = new Error(data.message || 'Quota check failed'); e.status = resp.status; e.data = data; throw e; }
  return data;
}

export async function requestLulcReport(token, { geojson, project_name, area_ha }) {
  const resp = await fetch(`${API_BASE}/free/lulc-report`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ geojson, project_name, area_ha }),
  });
  const data = await resp.json();
  if (!resp.ok) { const e = new Error(data.message || 'Report failed'); e.status = resp.status; e.data = data; throw e; }
  return data;
}
