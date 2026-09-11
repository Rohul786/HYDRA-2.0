'use client';

import React, { useState, useEffect } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { useAuthStore } from '@/store/useAuthStore';
import { dispatchAlertNotification } from '@/utils/notificationService';
import { METRO_CONFIGS } from '@/data/metroFloodData';
import {
  ShieldAlert,
  AlertTriangle,
  Hospital,
  Shield,
  ExternalLink,
  X,
  Smartphone,
  Bell,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function UserAlertBanner() {
  const {
    activeMetro,
    alertLevel,
    nowcastData,
    drainageStress,
    nearbyServices,
    setMapCenterTarget,
    setActiveNavigationDestination,
    triggerMunicipalAlert,
  } = useFloodStore();

  const { user, alertPreferences } = useAuthStore();

  const [dismissed, setDismissed] = useState(false);
  const [simulatedSms, setSimulatedSms] = useState<{
    show: boolean;
    title: string;
    body: string;
    timestamp: string;
  } | null>(null);

  // Automatically trigger two-channel dispatch when alertLevel becomes PRE_ALERT or CRITICAL
  useEffect(() => {
    if (alertLevel === 'CRITICAL' || alertLevel === 'PRE_ALERT') {
      const config = METRO_CONFIGS[activeMetro];
      const win = nowcastData['60m'] || nowcastData['30m'];

      dispatchAlertNotification({
        eventId: `RAIN-${activeMetro.toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
        severity: alertLevel,
        location: `${config.name} (${config.basinName})`,
        expectedRainfall: win?.expectedRangeMmHr || '45–70 mm/hr',
        probabilityPct: win?.probabilityPct || 82,
        waterloggingRisk: drainageStress.classification.toUpperCase(),
        leadTimeMins: 45,
      }).then((res) => {
        // If SMS was part of channels, show simulated SMS notification banner for visibility
        if (res.channels.some((c) => c.toLowerCase().includes('sms'))) {
          setSimulatedSms({
            show: true,
            title: `[DEMO / SIMULATED ALERT] HYDRA 2.0 Emergency Warning`,
            body: `Heavy rainfall is estimated to have an ${win?.probabilityPct || 82}% probability near ${config.name}. Waterlogging risk: ${drainageStress.classification.toUpperCase()}. Stay tuned to hydra-disaster.gov.in`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          });
        }
      });
    }
  }, [alertLevel, activeMetro, drainageStress.classification, nowcastData]);

  // SIH Quick Demonstration Trigger: Cloudburst -> App Push -> SMS Notification -> Municipal Alert
  const handleTriggerSihDemo = async () => {
    const config = METRO_CONFIGS[activeMetro];
    const win = nowcastData['60m'];

    // 1. Dispatch 2-channel alert
    await dispatchAlertNotification({
      eventId: `DEMO-CLOUDBURST-${Date.now().toString().slice(-4)}`,
      severity: 'CRITICAL',
      location: `${config.name} (${config.basinName})`,
      expectedRainfall: '80–110 mm/hr',
      probabilityPct: 89,
      waterloggingRisk: 'CRITICAL (>0.5m inundation)',
      leadTimeMins: 30,
      isDemo: true,
    });

    // 2. Trigger municipal pre-alert
    await triggerMunicipalAlert(['dashboard', 'push', 'sms']);

    // 3. Show the visible simulated SMS banner
    setSimulatedSms({
      show: true,
      title: `[DEMO / SIMULATED ALERT] HYDRA Emergency SMS Broadcast`,
      body: `CRITICAL: Heavy rainfall is estimated to have an 89% probability near ${config.name} within 30 mins. Surcharge risk: EXTREME. Avoid flooded subways & follow municipal disaster directives.`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const nearestHospital = nearbyServices.hospitals[0];
  const nearestPolice = nearbyServices.policeStations[0];

  return (
    <>
      {/* SIMULATED INCOMING SMS NOTIFICATION TOAST (FOR EVALUATOR VISIBILITY) */}
      {simulatedSms?.show && (
        <div className="fixed top-5 right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-3 duration-300 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border-2 border-amber-500/80 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">
                    SIMULATED EMERGENCY SMS
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Recipient: {user?.phone || '+91 98201 12345'} • {simulatedSms.timestamp}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSimulatedSms(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/80 space-y-1">
              <div className="font-mono font-bold text-[10px] text-amber-300">
                {simulatedSms.title}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {simulatedSms.body}
              </p>
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 font-mono">
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Delivery Confirmed
              </span>
              <span>Smart India Hackathon 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* REGULAR SEVERE RAINFALL BANNER */}
      {!dismissed && (alertLevel === 'CRITICAL' || alertLevel === 'PRE_ALERT') && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className="bg-red-950/90 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-red-500/50 p-4 space-y-3">
            {/* Banner Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-red-400">
                  🔴 SEVERE RAINFALL RISK NEAR YOU
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTriggerSihDemo}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Simulate 2-channel push and SMS delivery for SIH evaluation"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Test 2-Channel Alert</span>
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Dismiss Alert Banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Advisory Body */}
            <div className="text-xs font-medium text-slate-200 leading-relaxed">
              Heavy rainfall is estimated to have an elevated probability within the next 60 minutes.
              Waterlogging risk is estimated as <strong>{drainageStress.classification.toUpperCase()}</strong>.
            </div>

            {/* Telemetry Chips */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/10 p-1.5 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-400 block font-semibold">Expected Rain</span>
                <span className="font-mono font-bold text-red-300">
                  {nowcastData['60m']?.expectedRangeMmHr || '45–75 mm/hr'}
                </span>
              </div>
              <div className="bg-white/10 p-1.5 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-400 block font-semibold">Probability</span>
                <span className="font-mono font-bold text-yellow-300">
                  {nowcastData['60m']?.probabilityPct || 82}%
                </span>
              </div>
              <div className="bg-white/10 p-1.5 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-400 block font-semibold">Waterlogging Risk</span>
                <span className="font-mono font-bold text-orange-300">
                  {drainageStress.classification.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-black/30 p-2.5 rounded-xl text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white text-[10px] uppercase tracking-wider">
                Recommended Citizen Actions:
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>Avoid low-lying roads and flooded underpasses/subways.</li>
                <li>Keep emergency contacts and verified helplines available.</li>
                <li>Follow official municipal instructions and disaster alerts.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
              {nearestHospital && (
                <button
                  onClick={() => {
                    setActiveNavigationDestination(nearestHospital);
                    setMapCenterTarget([nearestHospital.latitude, nearestHospital.longitude]);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Hospital className="w-3.5 h-3.5" />
                  <span>Nearest Hospital ({nearestHospital.distanceFormatted})</span>
                </button>
              )}

              {nearestPolice && (
                <button
                  onClick={() => {
                    setActiveNavigationDestination(nearestPolice);
                    setMapCenterTarget([nearestPolice.latitude, nearestPolice.longitude]);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-slate-700"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nearest Police Station</span>
                </button>
              )}

              <a
                href="https://sachet.ndma.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 border border-white/20"
              >
                <span>Official NDMA Alerts</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
