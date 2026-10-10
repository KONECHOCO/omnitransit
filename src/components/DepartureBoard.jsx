import React, { useState } from 'react';
import { Bus, Train, Clock, Search, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { translations } from '../data/translations';

export default function DepartureBoard({ activeCity, currentLang }) {
  const t = translations[currentLang] || translations.it;

  const [selectedStopId, setSelectedStopId] = useState(activeCity.sampleStops[0]?.id || '');
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const currentStop = activeCity.sampleStops.find(s => s.id === selectedStopId) || activeCity.sampleStops[0];

  // Dynamic departure feed simulation based on active city
  const departures = [
    { id: 'd1', line: 'Linea 2', operator: activeCity.name === 'Piacenza' ? 'SETA' : 'RATP', type: 'bus', destination: 'Ospedale Saliceto / Centro', etaMinutes: 2, platform: 'Fermata 1', status: 'On Time', crowding: 'Basso', co2: '0.8 kg' },
    { id: 'd2', line: activeCity.name === 'Piacenza' ? 'RV 2078' : 'RER A', operator: activeCity.name === 'Piacenza' ? 'Trenitalia' : 'SNCF', type: 'train', destination: activeCity.name === 'Piacenza' ? 'Milano Centrale' : 'Châtelet - Les Halles', etaMinutes: 5, platform: 'Binario 2', status: '+2 min', crowding: 'Medio', co2: '4.2 kg' },
    { id: 'd3', line: 'Linea 5', operator: activeCity.name === 'Piacenza' ? 'SETA' : 'RATP', type: 'bus', destination: 'Stadio Garilli / Barriera Genova', etaMinutes: 9, platform: 'Fermata 3', status: 'On Time', crowding: 'Basso', co2: '0.9 kg' },
    { id: 'd4', line: activeCity.name === 'Piacenza' ? 'Frecciarossa 9516' : 'TGV INOUI', operator: 'Trenitalia / FS', type: 'train', destination: activeCity.name === 'Piacenza' ? 'Bologna Centrale / Roma Termini' : 'Lyon Part-Dieu', etaMinutes: 14, platform: 'Binario 4', status: 'On Time', crowding: 'Medio', co2: '6.5 kg' },
    { id: 'd5', line: 'Linea 3/7', operator: activeCity.name === 'Piacenza' ? 'SETA' : 'RATP', type: 'bus', destination: 'Barriera Torino', etaMinutes: 18, platform: 'Fermata 2', status: 'On Time', crowding: 'Basso', co2: '0.7 kg' }
  ];

  const filteredDepartures = departures.filter(d => {
    const matchMode = filterMode === 'all' || d.type === filterMode;
    const matchSearch = d.line.toLowerCase().includes(searchTerm.toLowerCase()) || d.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchMode && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Selector Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Tabellone Partenze in Tempo Reale
              </h3>
              <p className="text-xs text-slate-400">
                Orari, binari e fermate live a {activeCity.name}
              </p>
            </div>
          </div>

          {/* Station Selector Dropdown */}
          <div className="w-full md:w-72">
            <select
              value={selectedStopId}
              onChange={(e) => setSelectedStopId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
            >
              {activeCity.sampleStops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.type === 'train' ? '🚆' : stop.type === 'metro' ? '🚇' : '🚌'} {stop.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              Tutti i Mezzi
            </button>
            <button
              onClick={() => setFilterMode('bus')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'bus' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              🚌 Bus
            </button>
            <button
              onClick={() => setFilterMode('train')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'train' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              🚆 Treni
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtra linea o destinazione..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>
      </div>

      {/* Live Board Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 live-dot"></span>
            <h4 className="text-sm font-bold text-white font-heading">
              Partenze da: <span className="text-indigo-400">{currentStop?.name}</span>
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Aggiornato ora (GTFS Live Feed)
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredDepartures.map((dep) => (
            <div
              key={dep.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
            >
              
              {/* Line & Operator */}
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shadow-md ${
                  dep.type === 'train' ? 'bg-purple-600' : 'bg-rose-600'
                }`}>
                  {dep.line}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white">
                      {dep.destination}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span>{dep.operator}</span>
                    <span>•</span>
                    <span className="text-indigo-300 font-medium">{dep.platform}</span>
                  </div>
                </div>
              </div>

              {/* Status & ETA */}
              <div className="flex items-center justify-between sm:justify-end space-x-6">
                
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold text-slate-400">
                    Affollamento: <span className="text-emerald-400">{dep.crowding}</span>
                  </div>
                  <div className={`text-xs font-bold ${
                    dep.status.includes('+') ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    ● {dep.status}
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-right min-w-[90px]">
                  <div className="text-xs text-slate-400 leading-none">tra</div>
                  <div className="text-lg font-extrabold text-indigo-400 font-mono leading-tight">
                    {dep.etaMinutes} min
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
