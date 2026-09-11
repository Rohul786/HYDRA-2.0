'use client';

import React, { useState } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import {
  Building2,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Loader2,
  Radio,
  AlertTriangle,
} from 'lucide-react';

export default function NearestMunicipalityCard() {
  const {
    nearestMunicipality,
    alertLevel,
    municipalAlerts,
    triggerMunicipalAlert,
    acknowledgeMunicipalAlert,
    isDemoMode,
  } = useFloodStore();

  const [isDispatching, setIsDispatching] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<Array<'dashboard' | 'push' | 'sms' | 'email' | 'webhook'>>([
    'dashboard',
    'push',
    'sms',
  ]);

  const toggleChannel = (ch: 'dashboard' | 'push' | 'sms' | 'email' | 'webhook') => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSendAlert = async () => {
    setIsDispatching(true);
    try {
      await triggerMunicipalAlert(selectedChannels);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-3">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="font-black text-xs text-gray-900 tracking-tight">
            Nearest Municipal Authority
          </h3>
        </div>
        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
          ~{nearestMunicipality.distanceKm} km away
        </span>
      </div>

      {/* 2. Authority Profile Card */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-3 rounded-2xl border border-gray-200/80 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-black text-xs text-gray-900 leading-tight">
              {nearestMunicipality.name}
            </h4>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {nearestMunicipality.controlRoomName}
            </div>
          </div>
          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
            {nearestMunicipality.status}
          </span>
        </div>

        {/* Verified Contact Details or Official Directory Notice */}
        {nearestMunicipality.hasVerifiedContact ? (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
            <div className="flex-1 bg-white p-2 rounded-xl border border-gray-100 text-center">
              <span className="text-[9px] font-bold text-gray-400 block uppercase">
                Emergency Control Room
              </span>
              <a
                href={`tel:${nearestMunicipality.emergencyPhone}`}
                className="text-xs font-black text-blue-700 hover:underline flex items-center justify-center gap-1 mt-0.5"
              >
                <Phone className="w-3 h-3 text-red-600" />
                <span>{nearestMunicipality.emergencyPhone}</span>
              </a>
            </div>

            <div className="flex-1 bg-white p-2 rounded-xl border border-gray-100 text-center">
              <span className="text-[9px] font-bold text-gray-400 block uppercase">
                Direct Helpline
              </span>
              <a
                href={`tel:${nearestMunicipality.contact}`}
                className="text-xs font-black text-gray-800 hover:underline block mt-0.5"
              >
                {nearestMunicipality.contact}
              </a>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-semibold leading-relaxed">
            {nearestMunicipality.directoryGuidance}
          </div>
        )}
      </div>

      {/* 3. Municipal Pre-Alert Workflow Trigger */}
      <div className="space-y-2 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700">
            Municipal Pre-Alert Protocol:
          </span>
          <span
            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
              alertLevel === 'CRITICAL'
                ? 'bg-red-100 text-red-800'
                : alertLevel === 'PRE_ALERT'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            System Status: {alertLevel}
          </span>
        </div>

        {/* Channel Toggles */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
          {[
            { id: 'dashboard' as const, label: 'Dashboard' },
            { id: 'push' as const, label: 'Push' },
            { id: 'sms' as const, label: 'SMS Gateway' },
            { id: 'email' as const, label: 'Email' },
            { id: 'webhook' as const, label: 'SCADA Webhook' },
          ].map((ch) => {
            const active = selectedChannels.includes(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => toggleChannel(ch.id)}
                className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>

        {/* Dispatch Action Button */}
        <button
          onClick={handleSendAlert}
          disabled={isDispatching}
          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isDispatching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Transmitting Secure Municipal Alert...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Municipal Pre-Alert Package</span>
            </>
          )}
        </button>
      </div>

      {/* 4. Active Dispatched Alerts Log (Generated vs Delivered vs Acknowledged) */}
      {municipalAlerts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Active Dispatched Municipal Alerts ({municipalAlerts.length})
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {municipalAlerts.map((alert) => (
              <div
                key={alert.alertId}
                className="p-2.5 rounded-xl border border-gray-200/80 bg-gray-50/70 text-[11px] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-blue-900 text-xs">
                    {alert.alertId}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      ✓ {alert.deliveryStatus.toUpperCase()}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        alert.acknowledgementStatus === 'acknowledged'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.acknowledgementStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-gray-600">
                  Location: <strong>{alert.location}</strong> • Expected: <strong>{alert.expectedRainfallRange}</strong>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                  <span>Stress: {alert.drainageStressPct}%</span>
                  {alert.acknowledgementStatus === 'pending' ? (
                    <button
                      onClick={() => acknowledgeMunicipalAlert(alert.alertId)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                    >
                      Acknowledge Receipt
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      Ack: {alert.acknowledgedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
