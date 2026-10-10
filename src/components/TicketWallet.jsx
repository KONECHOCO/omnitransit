import React, { useState } from 'react';
import { Ticket, QrCode, Zap, CheckCircle2, ShieldCheck, Clock, Plus, Smartphone, Sparkles } from 'lucide-react';
import { translations } from '../data/translations';
import confetti from 'canvas-confetti';

export default function TicketWallet({ 
  tickets, 
  onBuyNewTicket, 
  currentLang, 
  activeCity 
}) {
  const t = translations[currentLang] || translations.it;

  const [activeQrModal, setActiveQrModal] = useState(null);
  const [nfcValidating, setNfcValidating] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleSimulateNfc = (ticket) => {
    setNfcValidating(true);
    setNfcSuccess(false);

    setTimeout(() => {
      setNfcValidating(false);
      setNfcSuccess(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => setNfcSuccess(false), 3500);
    }, 1200);
  };

  const handlePurchase = (passType) => {
    const newTicket = {
      id: `tck-${Date.now().toString().slice(-4)}`,
      cityName: activeCity.name,
      countryFlag: activeCity.flag,
      operator: activeCity.operators[0]?.name || 'Trasporto Urbano',
      type: passType.name,
      price: passType.price,
      purchaseDate: new Date().toLocaleString(),
      expiresAt: 'Valido 90 Minuti da ora',
      status: 'Active',
      qrCodeData: `OMNI-${activeCity.name.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      remainingMinutes: passType.durationMinutes || 90,
      zone: `Zona Integrata ${activeCity.name}`
    };

    onBuyNewTicket(newTicket);
    setShowBuyModal(false);
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
  };

  const passOptions = [
    { name: `Corsa Semplice (${activeCity.name})`, price: '€ 1,50', durationMinutes: 75, desc: 'Valido 75 minuti su tutta la rete urbana e bus' },
    { name: `Pass Giornaliero 24h (${activeCity.name})`, price: '€ 4,50', durationMinutes: 1440, desc: 'Corse illimitate su bus, tram e metro per 24 ore' },
    { name: `Carnet 10 Corse Integrato`, price: '€ 12,00', durationMinutes: 75, desc: '10 biglietti digitali con sconto del 20%' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Wallet Banner Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">
                {t.wallet.title}
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-lg">
              {t.wallet.subtitle}
            </p>
          </div>

          <button
            onClick={() => setShowBuyModal(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.wallet.buyNew}</span>
          </button>

        </div>
      </div>

      {/* Active Tickets List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-300 font-heading flex items-center space-x-2">
          <span>{t.wallet.activePasses}</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
            {tickets.length}
          </span>
        </h4>

        {tickets.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-3 border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-400">
              {t.wallet.emptyWallet}
            </p>
            <button
              onClick={() => setShowBuyModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Acquista ora per {activeCity.name}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-4 relative overflow-hidden group"
              >
                
                {/* Operator Header */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{ticket.countryFlag}</span>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {ticket.operator}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        {ticket.cityName} · {ticket.zone}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    ● Attivo
                  </span>
                </div>

                {/* Ticket Details */}
                <div className="space-y-1">
                  <div className="text-base font-bold text-white font-heading">
                    {ticket.type}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-300">
                    <span>Prezzo: <strong className="text-emerald-400">{ticket.price}</strong></span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-indigo-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ticket.remainingMinutes} min rimanenti</span>
                    </span>
                  </div>
                </div>

                {/* Actions: NFC Tap & Show QR */}
                <div className="pt-2 flex items-center space-x-2">
                  
                  <button
                    onClick={() => handleSimulateNfc(ticket)}
                    disabled={nfcValidating}
                    className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>{t.wallet.scanNFC}</span>
                  </button>

                  <button
                    onClick={() => setActiveQrModal(ticket)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1 shadow-md shadow-indigo-600/30"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mostra QR</span>
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* NFC Validation Toast Alert */}
      {nfcSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 shadow-2xl flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <div>
            <div className="font-bold text-sm text-white">
              {t.wallet.nfcSuccess}
            </div>
            <div className="text-xs text-emerald-300">
              Validatrice {activeCity.name}: Convalidato su Linea 2
            </div>
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel rounded-2xl p-6 border border-slate-800 text-center space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white">{activeQrModal.operator}</span>
              <button
                onClick={() => setActiveQrModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Chiudi ✕
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl inline-block shadow-xl">
              {/* Simulated QR Code Canvas */}
              <div className="w-48 h-48 bg-slate-900 rounded-lg flex items-center justify-center p-2 text-white relative">
                <QrCode className="w-40 h-40 text-slate-100" />
                <div className="absolute inset-0 bg-indigo-500/10 rounded-lg animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono text-indigo-400 font-bold">
                {activeQrModal.qrCodeData}
              </div>
              <p className="text-[11px] text-slate-400">
                Mostra questo codice ai controllori o scannerizza al tornello della metro.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Pass Purchase Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{activeCity.flag}</span>
                <h4 className="text-base font-bold text-white">
                  Acquista Biglietto Integrato ({activeCity.name})
                </h4>
              </div>
              <button onClick={() => setShowBuyModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {passOptions.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePurchase(opt)}
                  className="p-4 rounded-xl glass-panel border border-slate-800 hover:border-indigo-500/60 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white group-hover:text-indigo-300">
                      {opt.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {opt.desc}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-400">
                      {opt.price}
                    </div>
                    <span className="text-[10px] text-indigo-400 underline">Seleziona</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
