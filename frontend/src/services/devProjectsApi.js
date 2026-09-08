const BASE = `${import.meta.env.VITE_API_URL || ''}/api/dev`;
const h = (token) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

// Fetch wrapper: aborts after `timeout` ms and retries once on timeout/network error.
// This prevents the UI from spinning forever when the backend is cold-starting —
// the first attempt may time out while the server wakes, the retry hits a warm server.
const req = async (url, opts = {}, { timeout = 20000, retries = 1 } = {}) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const r = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(timer);
      return await r.json();
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err; // give up after final attempt
      // brief backoff before retry (gives a cold server a moment to finish waking)
      await new Promise((res) => setTimeout(res, 1500));
    }
  }
};

export const getProjects   = (token)       => req(`${BASE}/projects`,          { headers: h(token) });
export const getProject    = (token, id)   => req(`${BASE}/projects/${id}`,    { headers: h(token) });
export const createProject = (token, data) => req(`${BASE}/projects`,          { method: 'POST',   headers: h(token), body: JSON.stringify(data) }, { retries: 0 });
export const updateProject = (token, id, data) => req(`${BASE}/projects/${id}`, { method: 'PATCH', headers: h(token), body: JSON.stringify(data) }, { retries: 0 });
export const deleteProject = (token, id)   => req(`${BASE}/projects/${id}`,    { method: 'DELETE', headers: h(token) }, { retries: 0 });
export const getStats      = (token)       => req(`${BASE}/stats`,             { headers: h(token) });
export const getActivity   = (token)       => req(`${BASE}/activity`,          { headers: h(token) });
export const addDocument   = (token, id, data) => req(`${BASE}/projects/${id}/documents`, { method: 'POST',   headers: h(token), body: JSON.stringify(data) }, { retries: 0 });
export const deleteDocument = (token, id, docId) => req(`${BASE}/projects/${id}/documents/${docId}`, { method: 'DELETE', headers: h(token) }, { retries: 0 });

// ── Tree Inventory ───────────────────────────────────────
export const getTreeInventory    = (token, projectId, plotIndex) => req(`${BASE}/tree-inventory/${projectId}/${plotIndex}`, { headers: h(token) });
export const addTree             = (token, projectId, plotIndex, data) => req(`${BASE}/tree-inventory/${projectId}/${plotIndex}`, { method: 'POST', headers: h(token), body: JSON.stringify(data) }, { retries: 0 });
export const updateTree          = (token, treeOid, data) => req(`${BASE}/tree-inventory/${treeOid}`, { method: 'PATCH', headers: h(token), body: JSON.stringify(data) }, { retries: 0 });
export const deleteTree          = (token, treeOid) => req(`${BASE}/tree-inventory/${treeOid}`, { method: 'DELETE', headers: h(token) }, { retries: 0 });
export const getTreeSummary      = (token, projectId) => req(`${BASE}/tree-inventory/summary/${projectId}`, { headers: h(token) });
