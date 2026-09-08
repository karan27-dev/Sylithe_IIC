import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, MapPin, Plus, TreePine, Navigation, Trash2, Edit2, X, Check, Save, Loader2, Info, Layers, Download, QrCode, Menu } from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import QRCode from 'qrcode';
import * as api from '../../services/devProjectsApi';

// Helpers for bounding boxes
function getBounds(geojson) {
  if (!geojson) return null;
  const layer = L.geoJSON(geojson);
  return layer.getBounds();
}

function FitBounds({ geojson }) {
  const map = useMap();
  const geojsonString = JSON.stringify(geojson);

  useEffect(() => {
    if (geojsonString) {
      try {
        const parsed = JSON.parse(geojsonString);
        const bounds = getBounds(parsed);
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, [geojsonString, map]);
  return null;
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Ensure Leaflet icons work in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


export default function FreeTreeInventory({ savedProjects = [], onSectionChange }) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [fullProject, setFullProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [selectedPlotIndex, setSelectedPlotIndex] = useState(null);

  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    species_common: '',
    species_scientific: '',
    height_m: '',
    dbh_cm: '',
    crown_diameter_m: '',
    latitude: '',
    longitude: '',
    health_status: 'healthy',
    age_class: 'mature',
    tree_age: '',
    notes: ''
  });

  const [gettingLocation, setGettingLocation] = useState(false);
  const [showTreeOverlay, setShowTreeOverlay] = useState(true);
  const token = localStorage.getItem('sylithe_token');

  const selectedProject = useMemo(() =>
    fullProject || savedProjects.find(p => p._id === selectedProjectId),
    [savedProjects, selectedProjectId, fullProject]);

  const plots = useMemo(() => {
    if (!fullProject?.geojson) return [];
    if (fullProject.geojson.type === 'FeatureCollection') {
      return fullProject.geojson.features;
    }
    return [fullProject.geojson];
  }, [fullProject]);

  // Fetch full project data when selected
  useEffect(() => {
    if (!selectedProjectId || !token) {
      setFullProject(null);
      return;
    }
    let cancelled = false;
    setProjectLoading(true);
    api.getProject(token, selectedProjectId)
      .then(res => {
        if (cancelled) return;
        if (res.status === 'success') setFullProject(res.project);
      })
      .catch(err => console.error('Failed to load project:', err))
      .finally(() => { if (!cancelled) setProjectLoading(false); });
    return () => { cancelled = true; };
  }, [selectedProjectId, token]);

  useEffect(() => {
    if (!selectedProjectId || selectedPlotIndex === null || !token) {
      setTrees([]);
      return;
    }

    const fetchTrees = async () => {
      setLoading(true);
      try {
        const res = await api.getTreeInventory(token, selectedProjectId, selectedPlotIndex);
        if (res.status === 'success') {
          setTrees(res.trees);
        }
      } catch (err) {
        console.error("Failed to load trees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, [selectedProjectId, selectedPlotIndex, token]);


  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);

    const successCallback = (position) => {
      setFormData(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }));
      setGettingLocation(false);
    };

    const errorCallback = (error) => {
      console.warn(`High accuracy GPS failed (${error.message}), falling back to standard accuracy...`);
      // Fallback to standard accuracy
      navigator.geolocation.getCurrentPosition(
        successCallback,
        (fallbackError) => {
          alert(`Failed to get location: ${fallbackError.message}. Please ensure location permissions are granted.`);
          setGettingLocation(false);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
      );
    };

    // Try high accuracy first (10s timeout)
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTree = async () => {
    if (!token) return;
    try {
      const res = await api.addTree(token, selectedProjectId, selectedPlotIndex, formData);
      if (res.status === 'success') {
        setTrees(prev => [...prev, res.tree]);

        // Reset form for continuous flow, but keep some defaults if needed
        setFormData({
          species_common: '',
          species_scientific: '',
          height_m: '',
          dbh_cm: '',
          crown_diameter_m: '',
          latitude: '',
          longitude: '',
          health_status: 'healthy',
          age_class: 'mature',
          tree_age: '',
          notes: ''
        });

        // Optional: wait to close
        // setIsAdding(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save tree.");
    }
  };

  const handleDelete = async (treeOid) => {
    if (!window.confirm("Delete this tree record?")) return;
    try {
      const res = await api.deleteTree(token, treeOid);
      if (res.status === 'success') {
        setTrees(prev => prev.filter(t => t._id !== treeOid));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate QR code and download as PNG — QR encodes a URL to the public tree profile page
  const handleQrDownload = async (tree) => {
    const payload = {
      tree_id: tree.tree_id,
      species_common: tree.species_common || '',
      species_scientific: tree.species_scientific || '',
      height_m: tree.height_m || '',
      dbh_cm: tree.dbh_cm || '',
      crown_diameter_m: tree.crown_diameter_m || '',
      latitude: tree.latitude || '',
      longitude: tree.longitude || '',
      health_status: tree.health_status || '',
      age_class: tree.age_class || '',
      tree_age: tree.tree_age || '',
      project_name: selectedProject?.name || '',
      plot_number: (selectedPlotIndex ?? 0) + 1,
    };
    const encoded = btoa(JSON.stringify(payload));
    const profileUrl = `https://sylithe.com/tree?d=${encoded}`;

    try {
      const dataUrl = await QRCode.toDataURL(profileUrl, { width: 400, margin: 2, color: { dark: '#08292F', light: '#FFFFFF' } });
      const link = document.createElement('a');
      link.download = `tree_${tree.tree_id}_qr.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('QR generation failed:', err);
      alert('Failed to generate QR code.');
    }
  };

  // Export all trees as CSV
  const handleExportCSV = () => {
    if (!trees.length) return;
    const headers = ['Tree ID', 'Common Name', 'Scientific Name', 'Height (m)', 'DBH (cm)', 'Crown (m)', 'Latitude', 'Longitude', 'Health Status', 'Age Class', 'Tree Age', 'Notes'];
    const rows = trees.map(t => [
      t.tree_id, t.species_common || '', t.species_scientific || '',
      t.height_m || '', t.dbh_cm || '', t.crown_diameter_m || '',
      t.latitude || '', t.longitude || '', t.health_status || '',
      t.age_class || '', t.tree_age || '', (t.notes || '').replace(/,/g, ';')
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${selectedProject?.name || 'plot'}_plot${(selectedPlotIndex ?? 0) + 1}_trees.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Views
  if (!selectedProjectId) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-[24px] font-heading font-black text-[#0F172A] mb-1 tracking-tight">Plot Inventory</h2>
          <p className="text-[14px] text-gray-500">Select a project to record individual tree data for its plots.</p>
        </div>

        {savedProjects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">No Projects Found</h3>
            <p className="text-[14px] text-gray-500 mb-6">Create a project in the Project Hub to start taking plot inventories.</p>
            <button onClick={() => window.location.href = '/dashboard/project-hub'}
              className="px-6 py-2.5 bg-[#08292F] text-white font-bold rounded-xl shadow-sm text-[13px] hover:bg-[#062125]">
              Go to Project Hub
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedProjects.map(p => (
              <div key={p._id} onClick={() => setSelectedProjectId(p._id)}
                className="group bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col">
                <div className="w-full aspect-square relative pointer-events-none z-0">
                  {p.geojson ? (
                    <MapContainer zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} className="w-full h-full z-0">
                      <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
                      <GeoJSON data={p.geojson} style={{ color: '#16a34a', weight: 2, fillOpacity: 0.2 }} />
                      <FitBounds geojson={p.geojson} />
                      <MapInvalidator />
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                      <TreePine className="w-12 h-12 text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-[400]" />
                  <div className="absolute bottom-4 left-4 right-4 z-[400]">
                    <span className="px-3 py-1 bg-[#08292F] text-white text-[11px] font-bold rounded-full uppercase tracking-wide shadow-md">
                      {p.status || 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h4 className="text-[20px] font-heading font-bold text-[#0F172A] mb-2 group-hover:text-emerald-600 transition-colors">{p.name}</h4>
                  <p className="text-[14px] text-gray-500 mb-6">{p.type} · {p.country}</p>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
                      <MapPin size={14} className="text-emerald-500" />
                      {p.polygon_count || 0} Polygons
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedPlotIndex === null) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => { setSelectedProjectId(''); setSelectedPlotIndex(null); setFullProject(null); }} className="text-[13px] font-bold text-gray-500 hover:text-[#08292F]">← Back to Projects</button>
        </div>
        <div>
          <h2 className="text-[24px] font-heading font-black text-[#0F172A] mb-1 tracking-tight">{selectedProject.name} — Select Plot</h2>
          <p className="text-[14px] text-gray-500">Choose a polygon to record tree measurements.</p>
        </div>

        {projectLoading && plots.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-500 text-[14px]">
            <div className="w-7 h-7 border-[3px] border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
            Loading plot boundaries…
          </div>
        ) : plots.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 text-[14px]">
            No spatial boundaries found for this project.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plots.map((plot, idx) => {
              // Minimal GeoJSON for display
              const plotGeojson = { type: 'FeatureCollection', features: [plot] };
              return (
                <div key={idx} onClick={() => setSelectedPlotIndex(idx)}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                  <div className="h-48 bg-gray-100 relative pointer-events-none">
                    <MapContainer zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} className="w-full h-full">
                      <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
                      <GeoJSON data={plotGeojson} style={{ color: '#16a34a', weight: 2, fillOpacity: 0.2 }} />
                      <FitBounds geojson={plotGeojson} />
                    </MapContainer>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-[400]" />
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h4 className="text-[16px] font-bold text-[#0F172A]">Plot #{idx + 1}</h4>
                      <p className="text-[13px] text-gray-500">Click to open inventory</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Inventory View
  const avgHeight = trees.length ? (trees.reduce((sum, t) => sum + (parseFloat(t.height_m) || 0), 0) / trees.length).toFixed(1) : 0;
  const avgDbh = trees.length ? (trees.reduce((sum, t) => sum + (parseFloat(t.dbh_cm) || 0), 0) / trees.length).toFixed(1) : 0;

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setFormData(prev => ({
          ...prev,
          latitude: e.latlng.lat.toFixed(6),
          longitude: e.latlng.lng.toFixed(6)
        }));
      }
    });
    return null;
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* BACKGROUND MAP */}
      <div className="absolute inset-0 z-0 bg-[#0A0A0A]">
        <MapContainer zoomControl={false} zoom={18} className="w-full h-full z-0">
          <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" maxNativeZoom={20} maxZoom={26} noWrap />
          {plots[selectedPlotIndex] && (
            <>
              <GeoJSON data={{ type: 'FeatureCollection', features: [plots[selectedPlotIndex]] }} style={{ color: '#ffffff', weight: 2, fillOpacity: 0.1 }} />
              <FitBounds geojson={{ type: 'FeatureCollection', features: [plots[selectedPlotIndex]] }} />
            </>
          )}
          {showTreeOverlay && trees.filter(t => t.latitude && t.longitude).map(t => (
            <Marker key={t._id} position={[t.latitude, t.longitude]}>
              <Popup>
                <div className="text-center font-sans">
                  <p className="font-bold text-[#0F172A] text-[13px] m-0 leading-none mb-1">Tree #{t.tree_id}</p>
                  <p className="text-[11px] text-gray-500 m-0">{t.species_common || 'Unknown'}</p>
                  <p className="text-[11px] text-gray-400 mt-1">H: {t.height_m || '?'}m | DBH: {t.dbh_cm || '?'}cm</p>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapClickHandler />
        </MapContainer>
      </div>

      {/* OVERLAYS ON TOP OF MAP */}

      {/* Mobile Sidebar Toggle Button */}
      <div className="absolute top-5 left-5 z-[2000] md:hidden">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center justify-center p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-[#0F172A] shadow-lg border border-black/10 transition-colors hover:bg-white">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* GLASSMORPHIC LEFT SIDEBAR */}
      <div className={`absolute top-0 left-0 bottom-0 w-full sm:w-[400px] z-[1500] md:z-10 flex flex-col bg-white/75 backdrop-blur-xl border-r border-white/40 shadow-[12px_0_40px_rgba(0,0,0,0.1)] overflow-hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

        {/* Header */}
        <div className="p-5 border-b border-white/40 flex items-center justify-between bg-white/30 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedPlotIndex(null)} className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600">
              <X size={18} />
            </button>
            <div>
              <h2 className="text-[16px] font-bold text-[#0F172A] leading-tight flex items-center gap-2">
                <TreePine size={16} className="text-emerald-600" /> Plot #{selectedPlotIndex + 1}
              </h2>
              <p className="text-[12px] text-gray-600 font-medium">Tree Inventory</p>
            </div>
          </div>
          {trees.length > 0 && (
            <button onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-sm transition-colors">
              <Download size={12} /> Export Data
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* Stats Summary */}
          <div className="grid grid-cols-2">
            <div className="p-5 border-b border-r border-white/40 flex flex-col justify-center bg-white/20">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Trees</p>
              <p className="text-[20px] font-black text-[#0F172A]">{trees.length}</p>
            </div>
            <div className="p-5 border-b border-white/40 flex flex-col justify-center bg-white/20">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Health Status</p>
              <p className="text-[14px] font-bold text-emerald-700">{trees.filter(t => t.health_status === 'healthy').length} Healthy</p>
            </div>
          </div>

          {/* Add Form */}
          <div className="p-6">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Add Tree Measurement</p>
            <div className="space-y-4">
              {/* GPS Coordinates */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-[12px] font-bold text-gray-800">
                  Coordinates (Lat/Lng)
                  <button type="button" onClick={handleLocationClick} disabled={gettingLocation}
                    className="flex items-center gap-1.5 text-[10px] text-blue-700 bg-blue-50/80 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors shadow-sm">
                    {gettingLocation ? <Loader2 size={10} className="animate-spin" /> : <Navigation size={10} />}
                    Live GPS
                  </button>
                </label>
                <div className="flex gap-2">
                  <input type="number" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="Lat" className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all placeholder-gray-400" />
                  <input type="number" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="Lng" className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all placeholder-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-800">Common Name</label>
                  <input type="text" name="species_common" value={formData.species_common} onChange={handleInputChange} className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-800">Scientific Name</label>
                  <input type="text" name="species_scientific" value={formData.species_scientific} onChange={handleInputChange} className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-800">Height (m)</label>
                  <input type="number" name="height_m" value={formData.height_m} onChange={handleInputChange} className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-800">DBH (cm)</label>
                  <input type="number" name="dbh_cm" value={formData.dbh_cm} onChange={handleInputChange} className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-800">Crown (m)</label>
                  <input type="number" name="crown_diameter_m" value={formData.crown_diameter_m} onChange={handleInputChange} className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-800">Health Status</label>
                  <select name="health_status" value={formData.health_status} onChange={handleInputChange} className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all">
                    <option value="healthy">Healthy</option>
                    <option value="stressed">Stressed</option>
                    <option value="damaged">Damaged</option>
                    <option value="dead">Dead</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-800">Age Class</label>
                  <select name="age_class" value={formData.age_class} onChange={handleInputChange} className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all">
                    <option value="seedling">Seedling</option>
                    <option value="sapling">Sapling</option>
                    <option value="pole">Pole</option>
                    <option value="mature">Mature</option>
                    <option value="over-mature">Over-Mature</option>
                  </select>
                </div>
              </div>

              {/* Tree Age */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-800">Tree Age (years)</label>
                <input type="number" name="tree_age" value={formData.tree_age} onChange={handleInputChange} placeholder="e.g. 12" className="w-full h-9 px-3 border border-gray-300/50 rounded-lg text-[12px] focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/60 focus:bg-white transition-all placeholder-gray-400" />
              </div>

              <div className="pt-4">
                <button onClick={handleSaveTree} className="w-full flex items-center justify-center gap-2 py-3 bg-[#08292F] hover:bg-[#062125] text-white font-bold rounded-xl text-[13px] shadow-lg transition-all active:scale-[0.98]">
                  <Save size={15} />
                  Save Tree
                </button>
              </div>

              {/* Saved Trees List */}
              {trees.length > 0 && (
                <div className="pt-4 border-t border-gray-200/60 mt-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Saved Trees ({trees.length})</p>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                    {trees.map((t, idx) => (
                      <div key={t._id || idx} className="flex items-center justify-between bg-white/70 border border-gray-200/60 rounded-lg px-3 py-2.5 group hover:bg-white transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[11px] font-black shrink-0">
                            {t.tree_id || idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-[#0F172A] truncate">Tree ID {t.tree_id || idx + 1}</p>
                            <p className="text-[10px] text-gray-500 truncate">{t.species_common || 'Unknown'} · H {t.height_m || '?'}m</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleQrDownload(t)} title="Download QR"
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors">
                            <QrCode size={15} />
                          </button>
                          <button onClick={() => handleDelete(t._id)} title="Delete tree"
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* OVERLAYS ON TOP OF MAP */}

      {/* Top Right Tree Overlay Toggle */}
      <div className="absolute top-5 right-5 z-[1000]">
        <button onClick={() => setShowTreeOverlay(!showTreeOverlay)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-bold shadow-lg transition-all border ${showTreeOverlay ? 'bg-[#0F172A]/90 text-white border-white/10' : 'bg-white/90 text-[#0F172A] border-black/10'}`}>
          <Layers size={14} className={showTreeOverlay ? 'text-emerald-400' : 'text-gray-500'} />
          Tree Overlay {showTreeOverlay ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Bottom Legend Pill - Offset by 420px to sit next to the glass sidebar on desktop! */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-[432px] z-[1000] bg-[#1C1C1C]/70 backdrop-blur-lg rounded-[20px] shadow-2xl border border-white/10 py-3.5 px-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-[90%] sm:w-auto text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#82B366]" />
          <div>
            <span className="text-white text-[14px] font-medium mr-2 tracking-wide">Avg DBH</span>
            <span className="text-gray-400 text-[13px]">{avgDbh} cm</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#E5B553]" />
          <div>
            <span className="text-white text-[14px] font-medium mr-2 tracking-wide">Avg Height</span>
            <span className="text-gray-400 text-[13px]">{avgHeight} m</span>
          </div>
        </div>
      </div>

    </div>
  );
}
