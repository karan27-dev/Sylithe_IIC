import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import shpjs, { parseShp, parseDbf, combine } from 'shpjs';
import { kml as kmlToGeoJSON } from '@tmcw/togeojson';
import {
  HiChevronRight, HiOutlineUpload, HiOutlineCheckCircle,
  HiOutlineExclamationCircle, HiOutlineLocationMarker,
} from 'react-icons/hi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import * as api from '../../services/devProjectsApi';

const CROPS = ['Rice / Paddy', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Pulses', 'Other'];
const CROP_KEY = { 'Rice / Paddy': 'rice', Wheat: 'wheat', Maize: 'maize',
                   Cotton: 'cotton', Sugarcane: 'sugarcane', Pulses: 'other', Other: 'other' };

const RESIDUE_OPTIONS = [
  { value: 'burn', label: 'I burn it in the field', hint: 'Strongest biochar baseline' },
  { value: 'sell', label: 'I sell or give it away', hint: '' },
  { value: 'plough_back', label: 'I plough it back into the soil', hint: '' },
  { value: 'fodder', label: 'I use it as cattle fodder', hint: '' },
];

const TENURE = ['I own this land', 'I lease this land', 'Shared / joint family land', 'Other'];

const Field = ({ label, hint, children }) => (
  <div className="space-y-2">
    <Label className="font-medium text-gray-700">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
  </div>
);

const selectCls =
  'w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-[#0F172A] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#08292F] focus:border-transparent';

/* ── Eligibility result ─────────────────────────────────────────── */
const ScreenResult = ({ r }) => {
  const ok = r.verdict.eligible;
  const p = r.parcel, pl = r.planting, ex = r.existing_trees, b = r.burn_history;
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-start gap-3">
          {ok ? <HiOutlineCheckCircle className="mt-0.5 shrink-0 text-emerald-600" size={22} />
              : <HiOutlineExclamationCircle className="mt-0.5 shrink-0 text-red-600" size={22} />}
          <div>
            <p className={`text-[15px] font-bold ${ok ? 'text-emerald-800' : 'text-red-800'}`}>
              {ok ? 'This land is eligible' : 'This land is not eligible'}
            </p>
            <ul className={`mt-1 space-y-0.5 text-[13px] ${ok ? 'text-emerald-700' : 'text-red-700'}`}>
              {r.verdict.reasons.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-70">
              {r.verdict.approach} · screened in {r.elapsed_s}s
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Land area', `${p.area_ha} ha`, `${p.eligible_land_pct}% croppable`],
          ['Boundary (bund)', `${p.bund_length_m} m`, 'available for planting'],
          ['Trees you can plant', `${pl.max_trees}`, `limited by ${pl.binding_constraint}`],
          ['Burning detected', `${b.seasons_burned} of ${b.of_seasons}`, 'past seasons'],
        ].map(([k, v, s]) => (
          <div key={k} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{k}</p>
            <p className="mt-1 text-[20px] font-bold leading-none text-[#0F172A]">{v}</p>
            <p className="mt-1 text-[11px] text-gray-500">{s}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-[13px] font-bold text-[#0F172A]">Trees already on your land</p>
        <p className="mt-1 text-[13px] text-gray-600">
          About <strong>{ex.estimated_trees}</strong> trees, average {ex.mean_height_m} m tall,
          covering {ex.canopy_pct}% of the parcel.{' '}
          <span className="font-semibold text-amber-700">
            These do not earn credits — only trees planted under the project do.
          </span>
        </p>
      </div>

      {r.estimates && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[13px] font-bold text-[#0F172A]">Indicative yearly potential</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[#F1F1F1] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#92400E]">Biochar — from season one</p>
              <p className="mt-0.5 text-[13px] text-gray-700">
                {r.estimates.biochar.residue_t_per_season} t residue → {r.estimates.biochar.biochar_t} t biochar
                → <strong>{r.estimates.biochar.tco2e_per_year} tCO₂e/yr</strong>
              </p>
              <p className="mt-1 text-[11px] text-gray-500">{r.estimates.biochar.note}</p>
            </div>
            <div className="rounded-lg bg-[#F1F1F1] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#166534]">Trees — from about year five</p>
              <p className="mt-0.5 text-[13px] text-gray-700">
                {r.estimates.trees.plantable_trees} trees →{' '}
                <strong>{r.estimates.trees.tco2e_per_year_at_maturity} tCO₂e/yr</strong> at maturity
              </p>
              <p className="mt-1 text-[11px] text-gray-500">{r.estimates.trees.note}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] italic text-gray-500">{r.estimates.basis}</p>
        </div>
      )}
    </div>
  );
};

/* ── Farmer enrolment ───────────────────────────────────────────── */
export default function FarmerEnrolSection({ token, projects, onSuccess, onBack }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    farmerName: '', mobile: '', village: '', district: '', state: '',
    landRecordId: '', tenure: '', crop: '', residueToday: '', projectId: '',
  });
  const [geojson, setGeojson] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileErr, setFileErr] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [screening, setScreening] = useState(false);
  const [screen, setScreen] = useState(null);
  const [screenErr, setScreenErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const step1Valid = form.farmerName.trim() && form.mobile.trim() && form.village.trim();

  /* Same parser the developer wizard uses, so KML/SHP/GeoJSON behave identically. */
  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setIsParsing(true); setGeojson(null); setFileErr(''); setScreen(null); setScreenErr('');
    try {
      if (files.length > 1) {
        const parts = {}; let prj = null;
        for (const f of files) {
          const ext = f.name.split('.').pop().toLowerCase();
          if (ext === 'shp') parts.shp = await f.arrayBuffer();
          else if (ext === 'dbf') parts.dbf = await f.arrayBuffer();
          else if (ext === 'prj') prj = await f.text();
        }
        if (!parts.shp) throw new Error('No .shp file found');
        setGeojson(combine([parseShp(parts.shp, prj || false), parts.dbf ? parseDbf(parts.dbf) : undefined]));
        setFileName(`${files.length} shapefile parts`);
      } else {
        const f = files[0];
        const ext = f.name.split('.').pop().toLowerCase();
        if (ext === 'kml') setGeojson(kmlToGeoJSON(new DOMParser().parseFromString(await f.text(), 'text/xml')));
        else if (ext === 'geojson' || ext === 'json') setGeojson(JSON.parse(await f.text()));
        else if (ext === 'zip') setGeojson(await shpjs(await f.arrayBuffer()));
        else if (ext === 'shp') setGeojson(combine([parseShp(await f.arrayBuffer(), false), undefined]));
        else throw new Error(`Unsupported file type .${ext}`);
        setFileName(f.name);
      }
    } catch (err) {
      setFileErr(err.message || 'Could not read that file');
    } finally {
      setIsParsing(false);
    }
  };

  /* Screen the parcel against the census-based rules before enrolling. */
  const runScreen = async () => {
    if (!geojson) return;
    setScreening(true); setScreen(null); setScreenErr('');
    try {
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/api/agri/screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geojson,
          crop: CROP_KEY[form.crop] || 'other',
          residue_today: form.residueToday || null,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') { setScreen(data); setStep(3); }
      else setScreenErr(data.message || 'Could not screen this land.');
    } catch (err) {
      console.error('[agri/screen] failed:', err);
      setScreenErr('Could not reach the server. Check your connection and try again.');
    } finally {
      setScreening(false);
    }
  };

  /* An eligible parcel is stored as a project record tagged as a farmer parcel. */
  const enrol = async () => {
    if (!screen?.verdict?.eligible) return;
    setSaving(true); setSaveErr('');
    try {
      const parent = projects?.find((p) => p._id === form.projectId);
      const res = await api.createProject(token, {
        name: `${form.farmerName} — ${form.village}`,
        type: 'agroforestry',
        country: 'India',
        state: form.state,
        description:
          `Farmer parcel enrolled under ${parent ? parent.name : 'no pool'}. ` +
          `Mobile ${form.mobile}. Land record ${form.landRecordId || 'not given'}. ` +
          `Tenure: ${form.tenure || 'not given'}. Crop: ${form.crop || 'not given'}. ` +
          `Residue today: ${form.residueToday || 'not given'}. ` +
          `Screened eligible: ${screen.planting.max_trees} trees plantable on ` +
          `${screen.parcel.bund_length_m} m of bund; burning detected in ` +
          `${screen.burn_history.seasons_burned} of ${screen.burn_history.of_seasons} seasons.`,
        area_ha: screen.parcel.area_ha,
        estimated_carbon:
          (screen.estimates?.biochar?.tco2e_per_year || 0) +
          (screen.estimates?.trees?.tco2e_per_year_at_maturity || 0),
        geojson,
      });
      if (res?.status === 'success') onSuccess?.();
      else setSaveErr(res?.message || 'Could not enrol this farmer. Please try again.');
    } catch (err) {
      console.error('[enrol farmer] failed:', err);
      setSaveErr('Could not reach the server. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <button
        onClick={onBack}
        className="mb-4 cursor-pointer text-[12px] font-bold text-gray-500 transition-colors hover:text-[#0F172A]"
      >
        ← Back
      </button>

      {/* Step rail */}
      <div className="mb-6 flex items-center gap-2">
        {['Farmer & land', 'Land boundary', 'Eligibility'].map((label, i) => {
          const n = i + 1;
          return (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 ${step >= n ? 'text-[#08292F]' : 'text-gray-400'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold
                  ${step >= n ? 'bg-[#08292F] text-white' : 'bg-gray-200 text-gray-500'}`}>{n}</span>
                <span className="text-[12px] font-bold">{label}</span>
              </div>
              {n < 3 && <div className="h-px flex-1 bg-gray-200" />}
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1 — who and what ── */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-semibold text-[#0F172A]">About you and your land</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              A few details so we can match your land to a project and check what it can earn.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Your name">
                <Input name="farmerName" value={form.farmerName} onChange={set} placeholder="Ramesh Patil" />
              </Field>
              <Field label="Mobile number">
                <Input name="mobile" value={form.mobile} onChange={set} placeholder="98765 43210" inputMode="tel" />
              </Field>
              <Field label="Village">
                <Input name="village" value={form.village} onChange={set} placeholder="Sinnar" />
              </Field>
              <Field label="District">
                <Input name="district" value={form.district} onChange={set} placeholder="Nashik" />
              </Field>
              <Field label="State">
                <Input name="state" value={form.state} onChange={set} placeholder="Maharashtra" />
              </Field>
              <Field label="Land record number" hint="Khasra / survey / khata number, if you have it">
                <Input name="landRecordId" value={form.landRecordId} onChange={set} placeholder="Survey No. 142/2" />
              </Field>
              <Field label="Who owns this land?">
                <select name="tenure" value={form.tenure} onChange={set} className={selectCls}>
                  <option value="">Select one</option>
                  {TENURE.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="What do you grow now?">
                <select name="crop" value={form.crop} onChange={set} className={selectCls}>
                  <option value="">Select one</option>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Label className="font-medium text-gray-700">
                After harvest, what do you do with the leftover stalks?
              </Label>
              <p className="mb-2 text-[11px] text-gray-500">
                This decides whether your residue can become biochar — and how much it is worth.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {RESIDUE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, residueToday: o.value }))}
                    className={`cursor-pointer rounded-lg border p-3 text-left transition-colors
                      ${form.residueToday === o.value
                        ? 'border-[#08292F] bg-[#08292F]/5 ring-1 ring-[#08292F]'
                        : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <p className="text-[13px] font-semibold text-[#0F172A]">{o.label}</p>
                    {o.hint && <p className="mt-0.5 text-[11px] font-medium text-emerald-700">{o.hint}</p>}
                  </button>
                ))}
              </div>
            </div>

            {projects?.length > 0 && (
              <div className="mt-5">
                <Field label="Join which project pool?" hint="Your land becomes part of this project once it passes the check.">
                  <select name="projectId" value={form.projectId} onChange={set} className={selectCls}>
                    <option value="">Not now — screen my land first</option>
                    {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </Field>
              </div>
            )}

            <div className="flex justify-end pt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="rounded-xl bg-[#08292F] px-8 font-bold text-white shadow-lg hover:bg-[#062125]"
              >
                Next <HiChevronRight strokeWidth={2} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2 — boundary ── */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-semibold text-[#0F172A]">Your land boundary</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Upload the boundary file for your plot. KML from any GPS app works.
            </p>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 transition-colors hover:border-[#08292F] hover:bg-gray-50">
              <HiOutlineUpload size={30} className="mb-2 text-gray-400" />
              <span className="text-[14px] font-bold text-[#0F172A]">
                {isParsing ? 'Reading file…' : 'Choose your boundary file'}
              </span>
              <span className="mt-1 text-[12px] text-gray-500">KML · GeoJSON · Shapefile (.zip or .shp + .dbf)</span>
              <input type="file" multiple accept=".kml,.geojson,.json,.zip,.shp,.dbf,.prj" className="hidden" onChange={handleFile} />
            </label>

            {fileErr && <p role="alert" className="mt-3 text-[12px] font-semibold text-red-600">{fileErr}</p>}

            {geojson && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <HiOutlineLocationMarker className="shrink-0 text-emerald-600" size={18} />
                <p className="text-[13px] text-emerald-800">
                  Boundary loaded from <strong>{fileName}</strong>
                </p>
              </div>
            )}

            {screenErr && <p role="alert" className="mt-3 text-[12px] font-semibold text-red-600">{screenErr}</p>}

            <div className="flex items-center justify-between pt-6">
              <Button variant="ghost" onClick={() => setStep(1)} className="font-bold text-gray-500">Back</Button>
              <Button
                onClick={runScreen}
                disabled={!geojson || screening}
                className="rounded-xl bg-[#08292F] px-8 font-bold text-white shadow-lg hover:bg-[#062125]"
              >
                {screening ? 'Checking your land…' : 'Check eligibility'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3 — verdict ── */}
        {step === 3 && screen && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-xl font-semibold text-[#0F172A]">What your land can do</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Checked against Verra VM0047 census-based rules using satellite data.
            </p>

            <ScreenResult r={screen} />

            {saveErr && <p role="alert" className="mt-4 text-[12px] font-semibold text-red-600">{saveErr}</p>}

            <div className="flex items-center justify-between pt-6">
              <Button variant="ghost" onClick={() => setStep(2)} className="font-bold text-gray-500">
                Use a different boundary
              </Button>
              <Button
                onClick={enrol}
                disabled={!screen.verdict.eligible || saving}
                className="rounded-xl bg-[#08292F] px-8 font-bold text-white shadow-lg hover:bg-[#062125] disabled:opacity-50"
              >
                {saving ? 'Enrolling…' : 'Enrol this land'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
