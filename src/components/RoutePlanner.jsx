import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ArrowUpDown, 
  Clock, 
  DollarSign, 
  Leaf, 
  CloudRain, 
  Accessibility, 
  Zap, 
  Bus, 
  Train, 
  ChevronDown, 
  ChevronUp, 
  Ticket, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { translations } from '../data/translations';
import confetti from 'canvas-confetti';

export default function RoutePlanner({ 
  activeCity, 
  currentLang, 
  onBuyTicket, 
  onShowRouteOnMap 
}) {
  const t = translations[currentLang] || translations.it;

  // Pre-fill default origin and dest based on active city
  const defaultOrigin = activeCity.sampleStops[0]?.name || "Stazione FS";
  const defaultDest = activeCity.sampleStops[1]?.name || "Piazza Cavalli";

  const [origin, setOrigin] = useState(defaultOrigin);
  const [destination, setDestination] = useState(defaultDest);
  const [activeStrategy, setActiveStrategy] = useState('fastest');
  const [activeModeFilter, setActiveModeFilter] = useState('all');
  const [expandedRouteId, setExpandedRouteId] = useState(activeCity.sampleRoutes[0]?.id || null);
  const [searchLoading, setSearchLoading] = useState(false);

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setTimeout(() => {
      setSearchLoading(false);
    }, 400);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // Filter routes based on mode & strategy
  let displayRoutes = activeCity.sampleRoutes || [];

  if (activeStrategy === 'eco') {
    displayRoutes = [...displayRoutes].sort((a, b) => b.co2SavedKg - a.co2SavedKg);
  } else if (activeStrategy === 'cheapest') {
    displayRoutes = [...displayRoutes].sort((a, b) => parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, '')));
  } else if (activeStrategy === 'rainSafe') {
    displayRoutes = [...displayRoutes].sort((a, b) => b.rainSafeScore - a.rainSafeScore);
  }

  return (
    <div className="space-y-6">
      
      {/* Route Search Form Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl">
        <form onSubmit={handleSearch} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Origin Input */}
            <div className="md:col-span-5 relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Partenza
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-indigo-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={t.searchPlaceholderOrigin}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center pt-3 md:pt-0">
              <button
                type="button"
                onClick={swapLocations}
                title={t.swapLocations}
                className="p-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-indigo-400 hover:border-indigo-500 transition-all hover:rotate-180 duration-300"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Input */}
            <div className="md:col-span-5 relative">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Destinazione
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-emerald-400">
                  <Navigation className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t.searchPlaceholderDest}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                />
              </div>
            </div>

          </div>

          {/* Quick Preset Destination Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 text-xs">
            <span className="text-slate-400 text-[11px]">Consigliati a {activeCity.name}:</span>
            {activeCity.sampleStops.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => setDestination(stop.name)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:text-white transition-colors whitespace-nowrap"
              >
                {stop.type === 'train' ? '🚆' : stop.type === 'metro' ? '🚇' : '🚌'} {stop.name}
              </button>
            ))}
          </div>

          {/* Search CTA */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={searchLoading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              {searchLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{t.findRoutes}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Algorithmic Strategy Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveStrategy('fastest')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeStrategy === 'fastest'
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/80 glow-indigo'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t.filters.fastest}</span>
        </button>

        <button
          onClick={() => setActiveStrategy('cheapest')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeStrategy === 'cheapest'
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/80 glow-emerald'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.filters.cheapest}</span>
        </button>

        <button
          onClick={() => setActiveStrategy('eco')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeStrategy === 'eco'
              ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/80 glow-emerald'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.filters.eco}</span>
        </button>

        <button
          onClick={() => setActiveStrategy('rainSafe')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeStrategy === 'rainSafe'
              ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/80'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.filters.rainSafe}</span>
        </button>

        <button
          onClick={() => setActiveStrategy('accessible')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeStrategy === 'accessible'
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/80'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Accessibility className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t.filters.accessible}</span>
        </button>
      </div>

      {/* Route Cards Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{displayRoutes.length} {t.routes.resultsFound} per {activeCity.name}</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GTFS Live Verified</span>
          </span>
        </div>

        {displayRoutes.map((route) => {
          const isExpanded = expandedRouteId === route.id;
          return (
            <div
              key={route.id}
              className={`glass-panel rounded-2xl border transition-all duration-300 ${
                isExpanded ? 'border-indigo-500/60 bg-slate-900/90 shadow-xl' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Summary Bar */}
              <div 
                className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
              >
                
                {/* Left: Duration, Transfers & Operator */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-extrabold text-white font-heading">
                      {route.durationMinutes} min
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {route.transfers === 0 ? 'Diretto (0 cambi)' : `${route.transfers} ${t.routes.transfers}`}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      -{route.co2SavedKg} kg CO2
                    </span>
                  </div>

                  {/* Modes & Operator Badge */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span
                      className="px-2 py-0.5 rounded font-bold text-white text-[11px]"
                      style={{ backgroundColor: route.operatorColor }}
                    >
                      {route.operator}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-300 font-medium">
                      {route.origin} → {route.destination}
                    </span>
                  </div>
                </div>

                {/* Right: Price & Quick Action */}
                <div className="flex items-center justify-between md:justify-end space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400 font-heading">
                      {route.price}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Integrato {activeCity.name}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuyTicket(route);
                        triggerConfetti();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{t.routes.buyTicketBtn}</span>
                    </button>

                    <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Step-by-Step Accordion Content */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl space-y-4">
                  <h5 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{t.routes.stepByStep}</span>
                  </h5>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {route.steps.map((step, sIdx) => (
                      <div key={sIdx} className="relative flex items-start space-x-3 text-xs">
                        
                        {/* Mode Node Dot Icon */}
                        <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-[10px] text-indigo-300">
                          {step.mode === 'walk' ? '🚶' : step.mode === 'bus' ? '🚌' : step.mode === 'metro' ? '🚇' : '🚆'}
                        </div>

                        <div className="flex-1 bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">
                              {step.title}
                            </span>
                            {step.duration && (
                              <span className="text-slate-400 font-mono text-[11px]">
                                {step.duration}
                              </span>
                            )}
                          </div>

                          {step.line && (
                            <div className="inline-block px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold text-[10px] border border-indigo-500/30">
                              {step.line}
                            </div>
                          )}

                          {step.status && (
                            <p className="text-[11px] text-emerald-400 font-medium">
                              ● {step.status}
                            </p>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Show on Map CTA */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onShowRouteOnMap(route)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center space-x-1"
                    >
                      <span>Visualizza sulla Mappa Radar Live</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
