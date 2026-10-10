import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CitySelectorModal from './components/CitySelectorModal';
import RoutePlanner from './components/RoutePlanner';
import LiveMap from './components/LiveMap';
import DepartureBoard from './components/DepartureBoard';
import TicketWallet from './components/TicketWallet';
import TaxiHub from './components/TaxiHub';
import DisruptionReporter from './components/DisruptionReporter';
import EcoDashboard from './components/EcoDashboard';
import OfflineModal from './components/OfflineModal';

import { citiesData, mockTickets } from './data/transitData';
import { translations } from './data/translations';
import { Bus, MapPin, Globe, Sparkles } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState('it');
  const [activeCity, setActiveCity] = useState(citiesData[0]); // Default: Piacenza
  const [activeTab, setActiveTab] = useState('planner');
  
  const [tickets, setTickets] = useState(mockTickets);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [activeRouteOnMap, setActiveRouteOnMap] = useState(null);

  const t = translations[currentLang] || translations.it;

  const handleBuyTicketFromRoute = (route) => {
    const newTicket = {
      id: `tck-${Date.now().toString().slice(-4)}`,
      cityName: activeCity.name,
      countryFlag: activeCity.flag,
      operator: route.operator,
      type: `Biglietto Integrato Multimodale`,
      price: route.price,
      purchaseDate: new Date().toLocaleString(),
      expiresAt: 'Valido 90 Minuti',
      status: 'Active',
      qrCodeData: `OMNI-${activeCity.name.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      remainingMinutes: 90,
      zone: `Zona Integrata ${activeCity.name}`
    };

    setTickets([newTicket, ...tickets]);
    setActiveTab('wallet');
  };

  const handleBuyNewTicket = (ticketObj) => {
    setTickets([ticketObj, ...tickets]);
  };

  const handleShowRouteOnMap = (route) => {
    setActiveRouteOnMap(route);
    setActiveTab('radar');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Main Navbar */}
      <Navbar
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        activeCity={activeCity}
        openCityModal={() => setCityModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ticketCount={tickets.filter(t => t.status === 'Active').length}
        openWalletModal={() => setActiveTab('wallet')}
        openOfflineModal={() => setOfflineModalOpen(true)}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* City Greeting Banner */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center space-x-3">
            <span className="text-3xl sm:text-4xl">{activeCity.flag}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-heading">
                  Rete Mobilità Integrata {activeCity.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  {activeCity.country}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeCity.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setCityModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1.5 transition-all self-start sm:self-center"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Cambia Paese / Città</span>
          </button>
        </div>

        {/* Dynamic Tab Content View */}
        {activeTab === 'planner' && (
          <RoutePlanner
            activeCity={activeCity}
            currentLang={currentLang}
            onBuyTicket={handleBuyTicketFromRoute}
            onShowRouteOnMap={handleShowRouteOnMap}
          />
        )}

        {activeTab === 'radar' && (
          <LiveMap
            activeCity={activeCity}
            currentLang={currentLang}
            activeRoute={activeRouteOnMap}
          />
        )}

        {activeTab === 'board' && (
          <DepartureBoard
            activeCity={activeCity}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'wallet' && (
          <TicketWallet
            tickets={tickets}
            onBuyNewTicket={handleBuyNewTicket}
            currentLang={currentLang}
            activeCity={activeCity}
          />
        )}

        {activeTab === 'taxi' && (
          <TaxiHub
            activeCity={activeCity}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'disruptions' && (
          <DisruptionReporter
            activeCity={activeCity}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'eco' && (
          <EcoDashboard
            currentLang={currentLang}
          />
        )}

      </main>

      {/* City Selector Modal */}
      <CitySelectorModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        activeCity={activeCity}
        onSelectCity={(city) => {
          setActiveCity(city);
          setActiveRouteOnMap(null);
        }}
        currentLang={currentLang}
      />

      {/* Offline Downloader Modal */}
      <OfflineModal
        isOpen={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
        activeCity={activeCity}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-2 text-slate-400 font-semibold">
            <Bus className="w-4 h-4 text-indigo-400" />
            <span>OmniTransit Global mobility super app</span>
          </div>
          <p>
            Riconciliazione e aggregazione unificata per Bus SETA Piacenza, RATP Parigi, TfL Londra, ATM Milano, MTA New York, Trenitalia e Taxi locali.
          </p>
          <p className="text-[11px] text-slate-600">
            Powered by GTFS-Realtime API Standard & Dynamic Multi-Language i18n Engine.
          </p>
        </div>
      </footer>

    </div>
  );
}
