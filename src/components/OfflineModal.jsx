import React, { useState } from 'react';
import { Download, X, FileText, CheckCircle, Smartphone } from 'lucide-react';

export default function OfflineModal({ isOpen, onClose, activeCity }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h4 className="text-base font-bold text-white">
              Download Mappe e Orari Offline
            </h4>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Scarica l'intera rete di trasporto di <strong>{activeCity.name} ({activeCity.country})</strong> per consultare orari e mappe senza connessione internet o in roaming all'estero.
          </p>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-200 font-semibold">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Mappa PDF Schema Rete {activeCity.name}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">2.4 MB</span>
            </div>
            <div className="flex items-center justify-between text-slate-200 font-semibold">
              <span className="flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Database Orari GTFS Offline</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1.1 MB</span>
            </div>
          </div>

          {downloaded ? (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 flex items-center space-x-2 font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Download Completato! Mappa salvata nella memoria offline dell'app.</span>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              {downloading ? (
                <span className="animate-pulse">Download pacchetto offline in corso...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Scarica Pacchetto Offline (3.5 MB)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
