import React, { useState } from 'react';
import { X, Search, MapPin, CheckCircle, Bus, Train } from 'lucide-react';
import { citiesData } from '../data/transitData';
import { translations } from '../data/translations';

export default function CitySelectorModal({ 
  isOpen, 
  onClose, 
  activeCity, 
  onSelectCity, 
  currentLang 
}) {
  const t = translations[currentLang] || translations.it;
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCities = citiesData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.operators.some(op => op.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                {t.citySelector.title}
              </h3>
              <p className="text-xs text-slate-400">
                Seleziona una rete di trasporto o cerca qualsiasi città del mondo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.citySelector.searchCity}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* City Options List */}
        <div className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredCities.map((city) => {
            const isSelected = activeCity.id === city.id;
            return (
              <div
                key={city.id}
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'glass-card-selected border-indigo-500/80 bg-indigo-950/40'
                    : 'glass-panel border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{city.flag}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-bold text-white">
                          {city.name}
                        </h4>
                        <span className="text-xs text-slate-400">({city.country})</span>
                        {isSelected && (
                          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            <span>Attiva</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {city.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operator Logos Pill Badges */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                  {city.operators.map((op, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-200"
                    >
                      <span>{op.logo}</span>
                      <span>{op.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nessuna città trovata per "{searchTerm}". OmniTransit si adatta dinamicamente a qualsiasi rete GTFS globale.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
