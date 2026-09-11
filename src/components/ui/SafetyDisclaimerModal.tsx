'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, CheckCircle2, Info, ChevronDown, ChevronUp, AlertTriangle, X } from 'lucide-react';
import Image from 'next/image';

export default function SafetyDisclaimerModal() {
  const { isDisclaimerOpen, closeDisclaimer } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isDisclaimerOpen) return null;

  const handleAccept = () => {
    localStorage.setItem('hydra_disclaimer_accepted', 'true');
    closeDisclaimer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-white shrink-0">
              <Image
                src="/logo.png"
                alt="HYDRA Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  Official Advisory
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  Decision-Support v2.0
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight mt-0.5">
                HYDRA Early Warning Disclaimer
              </h2>
            </div>
          </div>
          <button
            onClick={closeDisclaimer}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-gray-700">
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px] font-bold">
              Notice: AI-assisted hydrological nowcasts are probabilistic decision-support estimates and not guaranteed forecasts.
            </span>
          </div>

          <p className="font-semibold text-gray-800">
            HYDRA provides AI-assisted weather, rainfall, flood and waterlogging risk assessments intended for early awareness and disaster-response planning.
          </p>

          <p>
            These assessments are <strong className="font-black text-gray-900">NOT guaranteed predictions</strong> and should <strong className="font-black text-gray-900">NOT be treated as 100% certain</strong>. Weather conditions can change rapidly, and actual rainfall, cloudburst occurrence, flooding and waterlogging may differ from the estimated conditions.
          </p>

          <p>
            HYDRA should be used as a decision-support and early-warning system alongside official alerts and instructions from authorized government and disaster-management agencies.
          </p>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 font-bold text-blue-950 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <span>In an emergency, follow official instructions from the relevant authorities.</span>
          </div>

          {/* Optional Expandable Safety Information */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowSafetyGuide(!showSafetyGuide)}
              className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold flex items-center justify-between transition-colors cursor-pointer text-xs"
            >
              <span className="flex items-center gap-1.5 text-blue-700">
                <Info className="w-3.5 h-3.5" />
                <span>View Urban Flood Safety Information</span>
              </span>
              {showSafetyGuide ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showSafetyGuide && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2 text-[11px] text-gray-600 animate-in fade-in duration-150">
                <div className="font-bold text-gray-900 flex items-center gap-1">
                  <span>🚨 Essential Urban Flood Precautions:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>Never enter flooded underpasses</strong>: Water depth in subways can exceed 1.5 meters within minutes.</li>
                  <li><strong>Stay away from electric poles &amp; substations</strong> to prevent electrocution hazards in submerged corridors.</li>
                  <li><strong>Keep verified emergency helplines accessible</strong>: National Disaster Helpline <strong>112 / 1070</strong>, BMC <strong>1916</strong>, MCD <strong>155305</strong>, GCC <strong>1913</strong>.</li>
                  <li><strong>Heed evacuation notices</strong> issued by municipal corporations (BMC, MCD, GCC, NDRF).</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-[10px] text-gray-500 font-mono">
            Smart India Hackathon 2024–2026 Prototype
          </div>

          <button
            onClick={handleAccept}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Understand &amp; Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
