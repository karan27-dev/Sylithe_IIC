import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { TreePine, MapPin, Ruler, Circle, Heart, Calendar, Leaf, ArrowLeft, ExternalLink } from 'lucide-react';

/* ──────────────────────────────────────────────────
   PUBLIC TREE PROFILE PAGE
   URL: /tree?d=BASE64_JSON
   Shows all tree measurement data when a QR is scanned
────────────────────────────────────────────────── */

function InfoRow({ icon: Icon, label, value, accent }) {
  if (!value || value === '-') return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent || 'bg-emerald-50 text-emerald-600'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-[14px] font-semibold text-[#0F172A] truncate">{value}</p>
      </div>
    </div>
  );
}

export default function TreeProfile() {
  const [searchParams] = useSearchParams();

  const treeData = useMemo(() => {
    try {
      const encoded = searchParams.get('d');
      if (!encoded) return null;
      const decoded = atob(encoded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }, [searchParams]);

  if (!treeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TreePine size={36} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] mb-2">Invalid Tree Link</h1>
          <p className="text-gray-500 text-sm mb-6">This QR code may be expired or malformed. Please scan a valid Sylithe tree inventory QR code.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#08292F] text-white font-bold rounded-xl text-sm hover:bg-[#062125] transition-colors">
            <ArrowLeft size={16} /> Go to Sylithe
          </Link>
        </div>
      </div>
    );
  }

  const healthColors = {
    healthy: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    stressed: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    damaged: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    dead: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const hc = healthColors[treeData.health_status] || healthColors.healthy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-[#fafafa] to-[#ecfdf5]">

      {/* Top Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div className="max-w-lg mx-auto px-5 py-8">

        {/* Sylithe Branding */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#08292F] rounded-lg flex items-center justify-center">
              <TreePine size={16} className="text-emerald-400" />
            </div>
            <span className="text-[16px] font-black text-[#08292F] tracking-tight">Sylithe</span>
          </Link>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tree Registry</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Hero Section */}
          <div className="bg-gradient-to-br from-[#08292F] to-[#0d3a42] p-6 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest mb-1">Tree Record</p>
                  <h1 className="text-white text-[28px] font-black leading-tight">
                    Tree ID #{treeData.tree_id || '—'}
                  </h1>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${hc.bg} ${hc.text} flex items-center gap-1.5`}>
                  <span className={`w-2 h-2 rounded-full ${hc.dot}`} />
                  {(treeData.health_status || 'Unknown').charAt(0).toUpperCase() + (treeData.health_status || 'unknown').slice(1)}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                {treeData.height_m && (
                  <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Height</p>
                    <p className="text-white text-[18px] font-black">{treeData.height_m}<span className="text-[12px] font-medium text-white/60"> m</span></p>
                  </div>
                )}
                {treeData.dbh_cm && (
                  <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">DBH</p>
                    <p className="text-white text-[18px] font-black">{treeData.dbh_cm}<span className="text-[12px] font-medium text-white/60"> cm</span></p>
                  </div>
                )}
                {treeData.crown_diameter_m && (
                  <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Crown</p>
                    <p className="text-white text-[18px] font-black">{treeData.crown_diameter_m}<span className="text-[12px] font-medium text-white/60"> m</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Rows */}
          <div className="p-5 space-y-0">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tree Details</p>

            <InfoRow icon={Leaf} label="Common Name" value={treeData.species_common} accent="bg-green-50 text-green-600" />
            <InfoRow icon={Leaf} label="Scientific Name" value={treeData.species_scientific} accent="bg-teal-50 text-teal-600" />
            <InfoRow icon={Calendar} label="Age Class" value={treeData.age_class ? treeData.age_class.charAt(0).toUpperCase() + treeData.age_class.slice(1) : null} accent="bg-amber-50 text-amber-600" />
            <InfoRow icon={Calendar} label="Tree Age" value={treeData.tree_age ? `${treeData.tree_age} years` : null} accent="bg-orange-50 text-orange-600" />
            <InfoRow icon={Heart} label="Health Status" value={treeData.health_status ? treeData.health_status.charAt(0).toUpperCase() + treeData.health_status.slice(1) : null} accent={`${hc.bg} ${hc.text}`} />

            {(treeData.latitude && treeData.longitude) && (
              <>
                <InfoRow icon={MapPin} label="GPS Coordinates" value={`${treeData.latitude}, ${treeData.longitude}`} accent="bg-blue-50 text-blue-600" />
              </>
            )}

            {treeData.project_name && (
              <InfoRow icon={TreePine} label="Project" value={treeData.project_name} accent="bg-indigo-50 text-indigo-600" />
            )}
            {treeData.plot_number && (
              <InfoRow icon={MapPin} label="Plot" value={`Plot #${treeData.plot_number}`} accent="bg-purple-50 text-purple-600" />
            )}
          </div>

          {/* GPS Map Link */}
          {(treeData.latitude && treeData.longitude) && (
            <div className="px-5 pb-5">
              <a href={`https://www.google.com/maps?q=${treeData.latitude},${treeData.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-[13px] transition-colors border border-blue-100">
                <MapPin size={15} /> View on Google Maps <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[11px] text-gray-400">
            Verified tree record by{' '}
            <Link to="/" className="text-emerald-600 font-bold hover:underline">Sylithe</Link>
            {' '}— Carbon Intelligence Platform
          </p>
          <p className="text-[10px] text-gray-300 mt-1">sylithe.com · dMRV · Plot Inventory</p>
        </div>
      </div>
    </div>
  );
}
