import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  Ticket, 
  ChevronDown, 
  Compass, 
  ShieldAlert, 
  Zap, 
  Bus, 
  Leaf, 
  CloudSun,
  Download
} from 'lucide-react';
import { translations } from '../data/translations';

export default function Navbar({ 
  currentLang, 
  setCurrentLang, 
  activeCity, 
  openCityModal, 
  activeTab, 
  setActiveTab, 
  ticketCount, 
  openWalletModal,
  openOfflineModal
}) {
  const t = translations[currentLang] || translations.it;
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('planner')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 glow-indigo">
              <Bus className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-heading">
                  Omni<span className="text-indigo-400">Transit</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Global 2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[240px]">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Active City & Operator Selector Button */}
          <button
            onClick={openCityModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/90 transition-all duration-200 group"
          >
            <span className="text-lg">{activeCity.flag}</span>
            <div className="text-left">
              <div className="text-xs text-slate-400 leading-none group-hover:text-indigo-300">
                {t.citySelector.current}
              </div>
              <div className="text-sm font-semibold text-white leading-tight flex items-center space-x-1">
                <span>{activeCity.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
          </button>

          {/* Right Action Controls: Language Switcher, Offline Maps & Wallet */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Live Weather Widget */}
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span>18°C · Sereno</span>
            </div>

            {/* Offline Timetables Download */}
            <button
              onClick={openOfflineModal}
              title="Download Mappe e Orari Offline"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{languages.find(l => l.code === currentLang)?.flag}</span>
                <span className="hidden md:inline uppercase">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1 z-50 divide-y divide-slate-800/50">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Lingua App / Language
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800/90 transition-colors ${
                        currentLang === lang.code ? 'text-indigo-400 font-semibold bg-indigo-500/10' : 'text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                      {currentLang === lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Universal Ticket Wallet Pill */}
            <button
              onClick={() => {
                setActiveTab('wallet');
              }}
              className="relative flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-indigo-600/30 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition-all shadow-md shadow-emerald-950/40"
            >
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline text-xs font-semibold">Wallet</span>
              {ticketCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold live-dot">
                  {ticketCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Navigation Sub-Header Tabs */}
      <div className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 sm:space-x-2 py-1.5 text-xs font-medium">
          
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.tabs.planner}</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="relative">
              <Zap className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <span>{t.tabs.radar}</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'board'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>{t.tabs.board}</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>{t.tabs.wallet}</span>
          </button>

          <button
            onClick={() => setActiveTab('taxi')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'taxi'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span className="text-sm">🚕</span>
            <span>{t.tabs.taxi}</span>
          </button>

          <button
            onClick={() => setActiveTab('disruptions')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'disruptions'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>{t.tabs.disruptions}</span>
          </button>

          <button
            onClick={() => setActiveTab('eco')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'eco'
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>{t.tabs.eco}</span>
          </button>

        </div>
      </div>
    </header>
  );
}
