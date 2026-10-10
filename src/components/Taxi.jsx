import React from 'react';
import { Phone, ExternalLink } from 'lucide-react';

export default function Taxi({ city, cityLabel, t }) {
  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-2xl leading-none">🚕</div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">{t.taxi.title} · {cityLabel}</h3>
            <p className="text-xs text-slate-300">{t.taxi.subtitle}</p>
          </div>
        </div>
      </div>

      {city.taxis.length === 0 ? (
        <p className="glass-panel rounded-2xl p-6 border border-slate-800 text-sm text-slate-300 text-center">{t.taxi.none}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {city.taxis.map((tx, i) => (
            <div key={`${tx.name}${i}`} className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{tx.name}</div>
                {tx.note && <div className="text-xs text-slate-400">{t.taxi.notes[tx.note]}</div>}
                {tx.display && <div className="text-xs font-mono text-amber-300 mt-0.5">{tx.display}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                {tx.phone && (
                  <a href={`tel:${tx.phone}`} className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />{t.common.call}
                  </a>
                )}
                {tx.url && (
                  <a href={tx.url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs inline-flex items-center gap-1.5">
                    {t.common.open}<ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[11px] text-slate-500">{t.taxi.disclaimer}</p>
    </div>
  );
}
