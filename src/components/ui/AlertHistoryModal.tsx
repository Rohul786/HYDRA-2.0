'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  History,
  X,
  Bell,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Filter,
} from 'lucide-react';
import { UserAlertHistoryItem } from '@/types';

export default function AlertHistoryModal() {
  const { isAlertHistoryOpen, closeAlertHistory, alertHistory } = useAuthStore();
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'PRE_ALERT' | 'WATCH'>('ALL');

  if (!isAlertHistoryOpen) return null;

  const filteredItems = alertHistory.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return item.severity === filterSeverity;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-xl w-full overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  Audit Log
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  {alertHistory.length} Recorded Warnings
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight mt-0.5">
                Citizen Alert History
              </h2>
            </div>
          </div>
          <button
            onClick={closeAlertHistory}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="px-6 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
          {[
            { id: 'ALL', label: 'All Alerts' },
            { id: 'CRITICAL', label: '🔴 Critical' },
            { id: 'PRE_ALERT', label: '🟠 Pre-Alert' },
            { id: 'WATCH', label: '🟡 Watch' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id as any)}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer text-[11px] shrink-0 ${
                filterSeverity === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-3.5 text-xs text-gray-700">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <History className="w-8 h-8 mx-auto text-gray-300" />
              <p className="font-bold text-xs">No alerts recorded in this filter</p>
              <p className="text-[11px]">Warnings delivered to your device will be chronicled here.</p>
            </div>
          ) : (
            filteredItems.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              const isPreAlert = alert.severity === 'PRE_ALERT';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCritical
                      ? 'bg-rose-50/40 border-rose-200'
                      : isPreAlert
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-gray-50/60 border-gray-200/80'
                  }`}
                >
                  {/* Top Bar: Severity, Event ID, Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : isPreAlert
                            ? 'bg-amber-500 text-white'
                            : 'bg-yellow-400 text-yellow-950'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="font-mono text-[10px] text-gray-500 font-bold">
                        {alert.eventId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  {/* Alert Title & Location */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {alert.alertType}
                    </h4>
                    <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{alert.location}</span>
                    </div>
                  </div>

                  {/* Probabilistic estimate caveat */}
                  <div className="mt-2.5 p-2 rounded-xl bg-white/80 border border-gray-200/60 flex items-center justify-between text-[11px]">
                    <div className="text-gray-700 font-medium">
                      Estimated Occurrence Probability:
                    </div>
                    <div className="font-mono font-black text-blue-700">
                      {alert.probabilityPct}%
                    </div>
                  </div>

                  {/* Channels & Delivery Status */}
                  <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">Delivered via:</span>
                      <div className="flex items-center gap-1.5">
                        {alert.channels.map((ch) => (
                          <span
                            key={ch}
                            className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-gray-200 font-bold text-gray-700"
                          >
                            {ch.includes('SMS') ? (
                              <Smartphone className="w-2.5 h-2.5 text-amber-600" />
                            ) : (
                              <Bell className="w-2.5 h-2.5 text-blue-600" />
                            )}
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{alert.deliveryStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>Deduplicated by Event ID window</span>
          <span>HYDRA Early Warning Protocol</span>
        </div>
      </div>
    </div>
  );
}
