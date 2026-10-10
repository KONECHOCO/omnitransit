import React, { useState } from 'react';
import { PhoneCall, Navigation, Clock, ShieldCheck, MapPin, CheckCircle, Zap } from 'lucide-react';
import { translations } from '../data/translations';
import confetti from 'canvas-confetti';

export default function TaxiHub({ activeCity, currentLang }) {
  const t = translations[currentLang] || translations.it;

  const [bookingStatus, setBookingStatus] = useState(null);
  const [selectedFleet, setSelectedFleet] = useState(null);

  const taxiFleets = [
    {
      id: 'fleet-1',
      name: activeCity.name === 'Piacenza' ? 'RadioTaxi Piacenza 0523.591919' : activeCity.name === 'Parigi' ? 'Taxi G7 Paris' : 'Official City Taxi',
      type: 'Taxi Ufficiale',
      eta: '3 min',
      priceEstimate: '€ 8,50 - € 11,00',
      drivers: 8,
      rating: '4.9 ★',
      logo: '🚕'
    },
    {
      id: 'fleet-2',
      name: 'FreeNow / Uber Mobility',
      type: 'Ride-Hailing Premium',
      eta: '5 min',
      priceEstimate: '€ 10,20',
      drivers: 12,
      rating: '4.8 ★',
      logo: '🚘'
    },
    {
      id: 'fleet-3',
      name: 'E-Scooter / Bici Elettrica Dott',
      type: 'Micro-Mobilità Verde',
      eta: '1 min a piedi',
      priceEstimate: '€ 1,00 + € 0,25/min',
      drivers: 15,
      rating: '4.9 ★',
      logo: '🛴'
    }
  ];

  const handleBook = (fleet) => {
    setSelectedFleet(fleet);
    setBookingStatus('requesting');
    setTimeout(() => {
      setBookingStatus('confirmed');
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-2xl">
            🚕
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">
              {t.taxi.title} ({activeCity.name})
            </h3>
            <p className="text-xs text-slate-300">
              {t.taxi.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Box */}
      {bookingStatus === 'requesting' && (
        <div className="glass-panel rounded-2xl p-6 text-center space-y-3 border border-amber-500/50 animate-pulse">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-amber-300">
            Ricerca taxi nelle vicinanze a {activeCity.name}...
          </p>
        </div>
      )}

      {bookingStatus === 'confirmed' && selectedFleet && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/80 bg-emerald-950/30 space-y-4">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle className="w-6 h-6" />
            <h4 className="text-base font-bold text-white">
              {t.taxi.confirmBooking}
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl">
            <div>
              <span className="text-slate-500 block">Servizio</span>
              <strong className="text-white">{selectedFleet.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Tempo Arrivo</span>
              <strong className="text-emerald-400">{selectedFleet.eta}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Tariffa Stimata</span>
              <strong className="text-amber-400">{selectedFleet.priceEstimate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Codice Corsa</span>
              <strong className="text-indigo-400 font-mono">TX-9912</strong>
            </div>
          </div>

          <button
            onClick={() => setBookingStatus(null)}
            className="text-xs text-slate-400 underline hover:text-white"
          >
            Annulla o Richiedi Altra Corsa
          </button>
        </div>
      )}

      {/* Fleets List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {taxiFleets.map((fleet) => (
          <div
            key={fleet.id}
            className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{fleet.logo}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {fleet.rating}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  {fleet.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {fleet.type}
                </p>
              </div>

              <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Tempo d'arrivo:</span>
                  <strong className="text-emerald-400">{fleet.eta}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Prezzo stimato:</span>
                  <strong className="text-amber-400">{fleet.priceEstimate}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Autisti vicini:</span>
                  <span>{fleet.drivers} disponibili</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleBook(fleet)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Zap className="w-4 h-4" />
              <span>{t.taxi.bookNow}</span>
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
