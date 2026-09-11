'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldCheck, CloudRain, Bell, Navigation, Loader2 } from 'lucide-react';

export default function GoogleLoginScreen() {
  const { loginWithGoogle } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (name?: string, email?: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(name, email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white font-sans overflow-hidden">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
        {/* HYDRA Logo & Branding */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-xl shadow-blue-500/20 border-2 border-blue-500/30 p-2 bg-slate-800/80">
            <Image
              src="/logo.png"
              alt="HYDRA Logo"
              width={80}
              height={80}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-white">HYDRA</h1>
              <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md tracking-wider">
                2.0
              </span>
            </div>
            <p className="text-xs font-bold text-blue-400 mt-1 uppercase tracking-wider">
              Hydrological Intelligence &amp; Disaster Response Analytics
            </p>
          </div>
        </div>

        {/* Mandated Slogan & Mission Statement */}
        <div className="py-2 border-y border-slate-800/80 space-y-1.5">
          <p className="text-sm font-semibold text-slate-200 tracking-wide">
            &ldquo;Stay informed. Stay prepared.&rdquo;
          </p>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            AI-assisted urban flood nowcasting, street-level inundation warnings, and safe evacuation intelligence.
          </p>
        </div>

        {/* Key Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 text-left text-[11px] py-1">
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/40 space-y-1">
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-200 block text-[10px]">Doppler Nowcast</span>
            <span className="text-[9px] text-slate-400 block leading-tight">30–120 min lead time</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/40 space-y-1">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200 block text-[10px]">SMS &amp; App Alerts</span>
            <span className="text-[9px] text-slate-400 block leading-tight">Two-channel alerts</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/40 space-y-1">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200 block text-[10px]">Safe Routing</span>
            <span className="text-[9px] text-slate-400 block leading-tight">Avoids flood roads</span>
          </div>
        </div>

        {/* Google Authentication Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleLogin()}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-white/10 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Quick SIH Evaluator Profile Login Button */}
          <button
            onClick={() => handleLogin('Dr. Pradeep Roy', 'evaluator@sih.gov.in')}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>SIH Evaluator Demo Access</span>
          </button>
        </div>

        {/* Security & Privacy Notice */}
        <p className="text-[10px] text-slate-500 font-mono">
          OAuth 2.0 OpenID Connect • No sensitive tokens stored on device
        </p>
      </div>
    </div>
  );
}
