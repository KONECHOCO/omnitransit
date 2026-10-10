import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Train, RefreshCw, Navigation, Eye, Users, AlertTriangle } from 'lucide-react';
import { translations } from '../data/translations';

// Helper component to recenter map when city changes
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function LiveMap({ activeCity, currentLang, activeRoute }) {
  const t = translations[currentLang] || translations.it;

  const [modeFilter, setModeFilter] = useState('all');
  const [vehicles, setVehicles] = useState(activeCity.vehicles || []);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update vehicles when activeCity changes
  useEffect(() => {
    setVehicles(activeCity.vehicles || []);
  }, [activeCity]);

  // Simulate live vehicle movement animation every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles =>
        prevVehicles.map(v => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.0008,
          lng: v.lng + (Math.random() - 0.5) * 0.0008
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filter vehicles
  const filteredVehicles = modeFilter === 'all'
    ? vehicles
    : vehicles.filter(v => v.type === modeFilter);

  // Custom HTML Marker creation function
  const createVehicleIcon = (type, number, color) => {
    const iconChar = type === 'bus' ? '🚌' : type === 'metro' ? '🚇' : type === 'train' ? '🚆' : '🚕';
    const bg = type === 'bus' ? '#e11d48' : type === 'metro' ? '#059669' : type === 'train' ? '#7c3aed' : '#eab308';
    
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${bg};
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          border: 2px solid white;
          cursor: pointer;
        ">
          ${iconChar}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const stationIcon = L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        background: #1e293b;
        border: 2px solid #6366f1;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #818cf8;
        font-size: 11px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        🚏
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
      
      {/* Top Floating Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Mode Filter Pills */}
        <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl pointer-events-auto text-xs">
          <button
            onClick={() => setModeFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              modeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutti i Mezzi ({vehicles.length})
          </button>
          <button
            onClick={() => setModeFilter('bus')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
              modeFilter === 'bus' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚌 Bus</span>
          </button>
          <button
            onClick={() => setModeFilter('metro')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
              modeFilter === 'metro' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚇 Metro</span>
          </button>
          <button
            onClick={() => setModeFilter('train')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
              modeFilter === 'train' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚆 Treni</span>
          </button>
          <button
            onClick={() => setModeFilter('taxi')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1 ${
              modeFilter === 'taxi' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚕 Taxi</span>
          </button>
        </div>

        {/* Refresh Radar Button */}
        <div className="pointer-events-auto">
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-200 hover:border-indigo-500 text-xs font-semibold shadow-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Aggiorna Radar Live</span>
          </button>
        </div>

      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={activeCity.coords}
        zoom={activeCity.zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <RecenterMap center={activeCity.coords} zoom={activeCity.zoom} />

        {/* Free OpenStreetMap Tile Layer (No API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Station Markers */}
        {activeCity.sampleStops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stationIcon}>
            <Popup>
              <div className="p-1 space-y-1 text-slate-100">
                <div className="font-bold text-sm text-indigo-300">
                  {stop.name}
                </div>
                <div className="text-xs text-slate-400">
                  Fermata Ufficiale · {activeCity.name}
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                  ● Prossima partenza tra 4 min
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Vehicle Markers */}
        {filteredVehicles.map((v) => (
          <Marker
            key={v.id}
            position={[v.lat, v.lng]}
            icon={createVehicleIcon(v.type, v.number, '#6366f1')}
          >
            <Popup>
              <div className="p-2 space-y-2 text-slate-100 min-w-[180px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-sm text-white">{v.line}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {v.status}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Mezzo:</span>
                    <span className="font-mono">{v.number}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Prossima fermata:</span>
                    <span className="font-medium text-indigo-300">{v.nextStop}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Affollamento:</span>
                    <span className="text-emerald-400 font-semibold">{v.crowding}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Bottom Live Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-3 shadow-xl">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-dot"></span>
          <span className="font-medium">Posizione Mezzi GTFS in Tempo Reale</span>
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">{filteredVehicles.length} veicoli attivi su mappa</span>
      </div>

    </div>
  );
}
