import React, { useState } from 'react';
import { ShieldAlert, Plus, MessageSquare, AlertTriangle, CheckCircle, Clock, ThumbsUp } from 'lucide-react';
import { mockDisruptions } from '../data/transitData';
import { translations } from '../data/translations';

export default function DisruptionReporter({ activeCity, currentLang }) {
  const t = translations[currentLang] || translations.it;

  const [alerts, setAlerts] = useState(mockDisruptions);
  const [showModal, setShowModal] = useState(false);

  const [lineInput, setLineInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [detailsInput, setDetailsInput] = useState('');
  const [severityInput, setSeverityInput] = useState('warning');

  const cityAlerts = alerts.filter(a => a.city.toLowerCase() === activeCity.name.toLowerCase() || a.city === 'Global');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      id: `alert-${Date.now()}`,
      city: activeCity.name,
      line: lineInput || 'Trasporto Urbano',
      title: titleInput || 'Segnalazione Passeggero',
      severity: severityInput,
      time: 'Adesso',
      reporter: 'Tu (Passeggero Verificato)',
      details: detailsInput || 'Aggiornamento inviato via OmniTransit Live Community.'
    };

    setAlerts([newReport, ...alerts]);
    setShowModal(false);
    setLineInput('');
    setTitleInput('');
    setDetailsInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading">
                {t.disruptions.title} ({activeCity.name})
              </h3>
              <p className="text-xs text-slate-300">
                {t.disruptions.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.disruptions.reportBtn}</span>
          </button>

        </div>
      </div>

      {/* Disruption Feed Cards */}
      <div className="space-y-4">
        {cityAlerts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-2 border border-slate-800 text-slate-400 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-white">Nessuna interruzione segnalata a {activeCity.name}</p>
            <p className="text-xs">Tutti i mezzi bus, metro e treni stanno circolando regolarmente.</p>
          </div>
        ) : (
          cityAlerts.map((item) => (
            <div
              key={item.id}
              className={`glass-panel rounded-2xl p-5 border transition-all space-y-3 ${
                item.severity === 'warning' ? 'border-amber-500/40 bg-amber-950/10' :
                item.severity === 'danger' ? 'border-rose-500/40 bg-rose-950/10' :
                'border-emerald-500/40 bg-emerald-950/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {item.severity === 'warning' ? '⚠️' : item.severity === 'danger' ? '🚨' : '✅'}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-amber-300">{item.line}</span>
                      <span>•</span>
                      <span>{item.reporter}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{item.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 pl-10">
                {item.details}
              </p>

              <div className="pl-10 pt-2 flex items-center space-x-3 text-[11px] text-slate-400">
                <button className="flex items-center space-x-1 hover:text-indigo-400">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Utile (14)</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">
                Segnala un Problema a {activeCity.name}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Linea o Stazione Interessata</label>
                <input
                  type="text"
                  value={lineInput}
                  onChange={(e) => setLineInput(e.target.value)}
                  placeholder="es. Linea 2 SETA, Metro M1, Binario 3"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Titolo Segnalazione</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="es. Ritardo di 10 min, Bus molto affollato, Ascensore guasto"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Dettagli Aggiuntivi</label>
                <textarea
                  value={detailsInput}
                  onChange={(e) => setDetailsInput(e.target.value)}
                  placeholder="Descrivi brevemente cosa sta succedendo per aiutare gli altri viaggiatori..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                >
                  {t.disruptions.submit}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
