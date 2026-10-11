import React, { useRef, useState } from 'react';
import { Globe, ChevronDown, Compass, Clock, Map as MapIcon, Ticket, Crown } from 'lucide-react';
import { LANGUAGES } from '../data/translations';
import { useMonetization } from '../services/monetization';

export default function Header({ t, lang, setLang, cityLabel, cityFlag, openCityModal, activeTab, setActiveTab, onOpenPro, onSecretTap }) {
  const [langOpen, setLangOpen] = useState(false);
  const taps = useRef({ n: 0, at: 0 });
  const logoTap = () => {
    const now = Date.now();
    taps.current = now - taps.current.at < 1500 ? { n: taps.current.n + 1, at: now } : { n: 1, at: now };
    if (taps.current.n >= 7) {
      taps.current = { n: 0, at: 0 };
      onSecretTap?.();
    }
    setActiveTab('planner');
  };
  const { isPro } = useMonetization();

  const tabs = [
    ['planner', Compass, t.tabs.planner],
    ['departures', Clock, t.tabs.departures],
    ['map', MapIcon, t.tabs.map],
    ['tickets', Ticket, t.tabs.tickets],
    ['taxi', null, t.tabs.taxi]
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 pt-[env(safe-area-inset-top)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between gap-2 h-14">
          <button onClick={logoTap} className="flex items-center gap-2 min-w-0">
            <img src="/icon.svg" alt="" className="w-9 h-9 rounded-xl shrink-0" />
            <span className="hidden sm:block text-lg font-bold tracking-tight text-white font-heading">
              Omni<span className="text-indigo-400">Transit</span>
            </span>
          </button>

          <button
            onClick={openCityModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-white hover:border-indigo-500/60 min-w-0"
          >
            <span className="text-lg leading-none">{cityFlag}</span>
            <span className="text-sm font-semibold truncate max-w-[130px]">{cityLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Language"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className="uppercase">{lang}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-800 ${lang === l.code ? 'text-indigo-300 font-semibold' : 'text-slate-200'}`}
                    >
                      <span>{l.flag}</span>{l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onOpenPro}
              aria-label="Pro"
              className={`p-2 rounded-xl border ${isPro ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-gradient-to-r from-amber-400 to-amber-500 border-amber-400 text-slate-950'}`}
            >
              <Crown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <nav className="border-t border-slate-800/80 overflow-x-auto scrollbar-none">
        <div className="max-w-5xl mx-auto px-2 flex items-center gap-1 py-1.5 text-xs font-medium">
          {tabs.map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap ${activeTab === key ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
            >
              {Icon ? <Icon className="w-4 h-4" /> : <span className="text-sm leading-none">🚕</span>}
              {/* Su schermi stretti solo la scheda attiva mostra il nome: le altre restano icone */}
              <span className={activeTab === key ? 'inline' : 'hidden sm:inline'}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
