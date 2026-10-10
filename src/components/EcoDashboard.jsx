import React from 'react';
import { Leaf, Award, TrendingUp, ShieldCheck, TreePine, Flame } from 'lucide-react';
import { translations } from '../data/translations';

export default function EcoDashboard({ currentLang }) {
  const t = translations[currentLang] || translations.it;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">
              {t.eco.title}
            </h3>
            <p className="text-xs text-slate-300">
              Statistiche di sostenibilità ottenute scegliendo il trasporto pubblico anziché l'auto privata.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex justify-between text-slate-400 text-xs">
            <span>{t.eco.totalSaved}</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-heading">
            42.8 kg
          </div>
          <p className="text-[11px] text-slate-400">
            +3.2 kg CO2 risparmiati questa settimana
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex justify-between text-slate-400 text-xs">
            <span>{t.eco.treesEquivalent}</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-heading">
            2.1 Alberi
          </div>
          <p className="text-[11px] text-slate-400">
            Assorbimento CO2 equivalente annuo
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex justify-between text-slate-400 text-xs">
            <span>{t.eco.rank}</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 font-heading">
            Livello 4
          </div>
          <p className="text-[11px] text-slate-400">
            Esploratore Verde Globale
          </p>
        </div>

      </div>

      {/* Eco Badges */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white font-heading">
          Badge e Traguardi Raggiunti
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-center space-y-1">
            <span className="text-2xl">🌱</span>
            <div className="font-bold text-white">Primo Bus</div>
            <div className="text-[10px] text-emerald-400">Sbloccato</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-center space-y-1">
            <span className="text-2xl">🚆</span>
            <div className="font-bold text-white">Pendolare AV</div>
            <div className="text-[10px] text-emerald-400">Sbloccato</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-center space-y-1">
            <span className="text-2xl">🌍</span>
            <div className="font-bold text-white">Multi-Città</div>
            <div className="text-[10px] text-indigo-400">3 Paesi Visitati</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 opacity-60 text-center space-y-1">
            <span className="text-2xl">⚡</span>
            <div className="font-bold text-slate-400">Zero Emissioni 100km</div>
            <div className="text-[10px] text-slate-500">In Corso (64/100km)</div>
          </div>
        </div>
      </div>

    </div>
  );
}
