'use client';

import { Waves } from 'lucide-react';

export default function HeaderBranding() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-3.5 max-w-sm w-80 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Waves className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold tracking-wider text-gray-900 leading-none">
              HYDRA
            </h1>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-200">
              2.0
            </span>
          </div>
          <p className="text-[10px] font-semibold text-gray-500 leading-tight mt-1">
            Hydrological Intelligence &amp; Disaster Response Analytics
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 pl-1" title="Real-time Nowcasting Active">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      </div>
    </div>
  );
}
