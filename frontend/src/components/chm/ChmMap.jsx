import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, useMap, Marker, Circle, CircleMarker, Popup } from "react-leaflet";
import L from "leaflet";
import { EditControl } from "react-leaflet-draw";
import { FileUp } from "lucide-react";
import shp, { parseShp, parseDbf, combine } from 'shpjs';
import { kml } from '@tmcw/togeojson';
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

/* Fix for Leaflet maps inside display:none containers.
   When the parent section is hidden via display:none the map can't
   calculate tile positions. This component watches for visibility
   changes and forces a tile refresh when the map becomes visible. */
const MapResizeHandler = ({ currentPolygon }) => {
  const map = useMap();
  const containerRef = useRef(map.getContainer());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fixMap = () => {
      if (container.offsetParent !== null) {
        map.invalidateSize({ animate: false });
        if (currentPolygon) {
          try {
            const bounds = L.geoJSON(currentPolygon).getBounds();
            if (bounds && bounds.isValid()) map.fitBounds(bounds, { maxZoom: 16, animate: false });
          } catch (e) { }
        }
      }
    };

    const observer = new ResizeObserver(() => { fixMap(); });
    observer.observe(container);

    const timers = [100, 300, 500, 1000, 2000].map(ms => setTimeout(fixMap, ms));
    return () => { observer.disconnect(); timers.forEach(clearTimeout); };
  }, [map, currentPolygon]);

  return null;
};

const LiveLocation = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const handlePosition = (pos) => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      setPosition(latlng);

      if (!hasFlown.current) {
        map.setView(latlng, 15); // Instant jump instead of slow animation
        hasFlown.current = true;
      }
    };

    // Fast initial fetch using cached position (up to 1 minute old)
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      () => { },
      { maximumAge: 60000, timeout: 2000, enableHighAccuracy: false }
    );

    // Watch for high-accuracy updates
    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => console.log(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map]);

  return position ? (
    <>
      <Marker position={position} />
      <Circle center={position} radius={50} pathOptions={{ color: "blue", fillOpacity: 0.1 }} />
    </>
  ) : null;
};

const getChmColor = (height) => {
  if (height < 10) return "#a4fca1";
  if (height < 20) return "#70e4f3";
  if (height < 30) return "#4b98fa";
  return "#8a2be2";
};

const PolygonFitter = ({ geojsonData }) => {
  const map = useMap();
  useEffect(() => {
    if (geojsonData) {
      try {
        const layer = L.geoJSON(geojsonData);
        const bounds = layer.getBounds();
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5, maxZoom: 16 });
        }
      } catch (e) {
        console.error("Map layer fit error:", e);
      }
    }
  }, [geojsonData, map]);
  return geojsonData ? (
    <GeoJSON key={JSON.stringify(geojsonData)} data={geojsonData} style={{ color: '#10b981', weight: 3, fillOpacity: 0.05, dashArray: "4 4" }} />
  ) : null;
};

function detectTrees(points, radiusMeters = 4, minHeight = 2) {
  if (!points) return null;
  if (points.length === 0) return [];
  
  const validPoints = points.filter(p => p[2] >= minHeight).map((p, idx) => ({
    id: idx,
    lat: p[0],
    lng: p[1],
    height: p[2]
  }));

  if (validPoints.length === 0) return [];

  const R = 6371000;
  const deg2rad = Math.PI / 180;
  
  // Spatial Grid for O(N) lookup
  const cellSizeDegLat = radiusMeters / 111320;
  const avgLat = validPoints[0].lat;
  const cellSizeDegLng = (radiusMeters / 111320) / Math.max(0.1, Math.abs(Math.cos(avgLat * deg2rad)));

  const grid = new Map();
  validPoints.forEach(p => {
    const r = Math.floor(p.lat / cellSizeDegLat);
    const c = Math.floor(p.lng / cellSizeDegLng);
    const key = `${r},${c}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(p);
    p.cellR = r;
    p.cellC = c;
  });

  const trees = [];
  
  // Local Maximum Filter: A point is a tree if it's the highest point within radiusMeters
  for (let i = 0; i < validPoints.length; i++) {
    const current = validPoints[i];
    let isLocalMax = true;

    const cosLat = Math.cos(current.lat * deg2rad);
    const r = current.cellR;
    const c = current.cellC;

    // Check adjacent cells for any higher pixel
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const key = `${r + dr},${c + dc}`;
        const cellPoints = grid.get(key);
        if (!cellPoints) continue;

        for (let k = 0; k < cellPoints.length; k++) {
          const neighbor = cellPoints[k];
          if (neighbor === current) continue;

          const dLat = (neighbor.lat - current.lat) * deg2rad;
          const dLng = (neighbor.lng - current.lng) * deg2rad;

          const x = dLng * cosLat;
          const y = dLat;
          const distance = R * Math.sqrt(x * x + y * y);

          if (distance <= radiusMeters) {
            if (neighbor.height > current.height) {
              isLocalMax = false;
              break;
            } else if (neighbor.height === current.height && neighbor.id > current.id) {
              // Tie breaker to avoid counting flat plateaus as multiple trees
              isLocalMax = false;
              break;
            }
          }
        }
        if (!isLocalMax) break;
      }
      if (!isLocalMax) break;
    }

    if (isLocalMax) {
      trees.push({
        id: trees.length + 1,
        lat: current.lat,
        lng: current.lng,
        height: current.height,
        crownPixels: 1
      });
    }
  }

  return trees.sort((a, b) => b.height - a.height).map((t, idx) => ({ ...t, id: idx + 1 }));
}

const ChmMap = ({ onPolygonComplete, result, activeLayers = new Set(), currentPolygon, onTreesDetected, showTreeCount }) => {
  const [importedGeoJson, setImportedGeoJson] = useState(null);
  const tileUrls = result?.status === "success" ? result.results?.tiles : {};
  const chmPoints = result?.status === "success" ? result.results?.model_prediction?.points : null;

  const detectedTrees = React.useMemo(() => {
    return detectTrees(chmPoints, 4, 2);
  }, [chmPoints]);

  useEffect(() => {
    if (onTreesDetected) {
      onTreesDetected(detectedTrees);
    }
  }, [detectedTrees, onTreesDetected]);

  const handleCreated = (e) => {
    const geojson = e.layer.toGeoJSON();
    onPolygonComplete(geojson);
  };

  const handleImport = async (e) => {
    const filesList = Array.from(e.target.files);
    if (!filesList.length) return;

    try {
      if (filesList.length > 1) {
        // Multi-file Shapefile handling (.shp, .dbf, .prj)
        const shpParts = {};
        let prjText = null;
        for (const f of filesList) {
          const ext = f.name.split('.').pop().toLowerCase();
          if (ext === 'shp') shpParts.shp = await f.arrayBuffer();
          else if (ext === 'dbf') shpParts.dbf = await f.arrayBuffer();
          else if (ext === 'prj') prjText = await f.text();
        }
        if (shpParts.shp) {
          const shapes = parseShp(shpParts.shp, prjText || false);
          const dbfRows = shpParts.dbf ? parseDbf(shpParts.dbf) : undefined;
          const geojson = combine([shapes, dbfRows]);
          setImportedGeoJson(geojson);
          onPolygonComplete(geojson);
        }
      } else {
        const file = filesList[0];
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'zip') {
          const geojson = await shp(await file.arrayBuffer());
          setImportedGeoJson(geojson);
          onPolygonComplete(geojson);
        } else if (ext === 'shp') {
          const geojson = combine([parseShp(await file.arrayBuffer(), false), undefined]);
          setImportedGeoJson(geojson);
          onPolygonComplete(geojson);
        } else if (ext === 'kml') {
          const doc = new DOMParser().parseFromString(await file.text(), 'text/xml');
          const geojson = kml(doc);
          setImportedGeoJson(geojson);
          onPolygonComplete(geojson);
        } else if (ext === 'geojson' || ext === 'json') {
          const geojson = JSON.parse(await file.text());
          setImportedGeoJson(geojson);
          onPolygonComplete(geojson);
        }
      }
    } catch (err) {
      console.error("Import error:", err);
      alert("Error parsing AOI file. Please check the format.");
    }
  };

  return (
    <div className="absolute inset-0 z-10">
      <div className="absolute top-4 right-14 z-[1000]">
        <label className="flex items-center gap-2 bg-[#F1F1F1] px-4 py-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 border border-gray-100 transition-all group">
          <FileUp size={16} className="text-gray-500 group-hover:text-black" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Import AOI</span>
          <input type="file" accept=".geojson,.json,.kml,.zip,.shp,.dbf,.prj" className="hidden" multiple onChange={handleImport} />
        </label>
      </div>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full bg-[#0d0f0d]" maxBounds={[[-90, -180], [90, 180]]} maxBoundsViscosity={1.0}>
        <MapResizeHandler currentPolygon={currentPolygon} />
        <TileLayer 
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" 
          attribution="&copy; Google" 
          maxNativeZoom={20}
          maxZoom={26}
          noWrap={true}
        />

        {/* --- DYNAMIC GEE LAYERS (FIXED) --- */}
        {tileUrls && Object.entries(tileUrls).map(([id, url]) => {
          if (!url) return null;

          if (id.startsWith('burn_layer_') || id === 'defor_layer') return null;
          if (!activeLayers.has(id)) return null;

          const isTree  = id === 'tree_chm';

          return (
            <TileLayer
              key={`${id}-${url}`}
              url={url}
              opacity={isTree ? 1.0 : 0.7}
              zIndex={isTree ? 500 : 100}
              maxNativeZoom={20}
              maxZoom={26}
            />
          );
        })}

        {/* --- DETECTED TREES LAYER --- */}
        {showTreeCount && detectedTrees && detectedTrees.map((tree) => (
          <CircleMarker
            key={`tree-${tree.id}`}
            center={[tree.lat, tree.lng]}
            radius={6}
            pathOptions={{
              color: getChmColor(tree.height),
              fillColor: getChmColor(tree.height),
              fillOpacity: 0.9,
              weight: 2,
              opacity: 1
            }}
          >
            <Popup className="font-sans text-[13px]" closeButton={false}>
              <div className="text-center font-bold text-[#0d0f0d]">
                Tree #{tree.id} = {tree.height}m
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* --- CHM POINTS LAYER --- */}
        {activeLayers.has('chm_points') && chmPoints && chmPoints.map((pt, idx) => (
          <CircleMarker
            key={idx}
            center={[pt[0], pt[1]]}
            radius={4}
            pathOptions={{
              color: getChmColor(pt[2]),
              fillColor: getChmColor(pt[2]),
              fillOpacity: 0.8,
              weight: 0
            }}
          >
            <Popup className="font-sans text-[13px]">
              <div className="text-center font-bold">
                Height: <span style={{ color: getChmColor(pt[2]) }}>{pt[2]}m</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <LiveLocation />

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              rectangle: true, circle: false, marker: false, polyline: false, circlemarker: false,
              polygon: { shapeOptions: { color: '#ffffff', weight: 4, fillOpacity: 0.05, className: 'drop-shadow-lg' } }
            }}
          />
          {importedGeoJson && <GeoJSON key={JSON.stringify(importedGeoJson)} data={importedGeoJson} style={{ color: '#ffffff', weight: 4, fillOpacity: 0.05, className: 'drop-shadow-lg' }} />}
          {currentPolygon && <PolygonFitter geojsonData={currentPolygon} />}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default ChmMap;