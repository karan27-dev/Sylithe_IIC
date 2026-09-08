// Auto-generate public/sitemap.xml from static routes + the blog registry
// (src/data/blogData.js). Runs before `vite build`, so every live blog post is
// always in the sitemap → gets prerendered → gets indexed by Google/Bing.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const BASE = 'https://sylithe.com';
const today = new Date().toISOString().slice(0, 10);

// Static, always-present routes (must match the app's real routes).
const STATIC_ROUTES = [
  '/', '/about', '/what-we-offer', '/for-buyers', '/platform',
  '/methodology/lulc', '/methodology/chm', '/methodology/dcab', '/methodology/agb',
  '/project-types/biochar',
  '/project-types/arr',
  '/project-types/redd',
  '/insights', '/terms-of-service', '/privacy-policy',
];

// Read the blog registry and pull each post's slug (its `id`).
const blogData = readFileSync(join(ROOT, 'src/data/blogData.js'), 'utf8');
const importPaths = [...blogData.matchAll(/from\s+['"]\.\/blog\/([^'"]+)['"]/g)].map((m) => m[1]);

const slugs = [];
for (const p of importPaths) {
  try {
    const file = readFileSync(join(ROOT, 'src/data/blog', `${p}.js`), 'utf8');
    const m = file.match(/id:\s*['"]([^'"]+)['"]/);
    if (m && !slugs.includes(m[1])) slugs.push(m[1]);
  } catch { /* skip a post file that can't be read */ }
}

const urls = [
  ...STATIC_ROUTES,
  ...slugs.map((s) => `/insights/${s}`),
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url>\n    <loc>${BASE}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n') +
  `\n</urlset>\n`;

writeFileSync(join(ROOT, 'public/sitemap.xml'), xml);
console.log(`[sitemap] Wrote ${urls.length} URLs (${STATIC_ROUTES.length} static + ${slugs.length} blog posts) to public/sitemap.xml`);
