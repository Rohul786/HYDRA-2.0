'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Bell,
  Smartphone,
  CloudRain,
  Waves,
  Wind,
  Megaphone,
  Volume2,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { UserAlertPreferences } from '@/types';

export default function AlertSettingsModal() {
  const {
    isAlertSettingsOpen,
    closeAlertSettings,
    alertPreferences,
    updateAlertPreferences,
    user,
    openPhoneModal,
  } = useAuthStore();

  const [prefs, setPrefs] = useState<UserAlertPreferences>(alertPreferences);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isAlertSettingsOpen) return null;

  const handleToggle = (key: keyof UserAlertPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      updateAlertPreferences(prefs);
      // Also notify backend if reachable
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          push_enabled: prefs.pushEnabled,
          sms_enabled: prefs.smsEnabled,
          severe_rainfall: prefs.severeRainfall,
          flood_risk: prefs.floodRisk,
          waterlogging: prefs.waterlogging,
          cyclone: prefs.cyclone,
          extreme_weather: prefs.extremeWeather,
          nearby_disaster: prefs.nearbyDisaster,
          municipal_alerts: prefs.municipalAlerts,
        }),
      }).catch(() => {});

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        closeAlertSettings();
      }, 700);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  HYDRA 2.0
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  Two-Channel Alerts
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight mt-0.5">
                Citizen Alert Preferences
              </h2>
            </div>
          </div>
          <button
            onClick={closeAlertSettings}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700">
          {/* Channel Settings */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
              Delivery Channels
            </h3>
            <div className="space-y-3">
              {/* Push Notification Toggle */}
              <div className="p-3.5 rounded-2xl border border-gray-200/80 bg-gray-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">Browser Push Notifications</div>
                    <div className="text-[10px] text-gray-500">Real-time alerts while browser/app is active</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('pushEnabled')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    prefs.pushEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      prefs.pushEnabled ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* SMS Alerts Toggle */}
              <div className="p-3.5 rounded-2xl border border-gray-200/80 bg-gray-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs">Emergency SMS Broadcasts</span>
                      {user?.phoneVerified ? (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Unverified
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {user?.phone ? user.phone : 'Critical cloudburst & evacuation warnings'}
                    </div>
                  </div>
                </div>

                {user?.phoneVerified ? (
                  <button
                    type="button"
                    onClick={() => handleToggle('smsEnabled')}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      prefs.smsEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        prefs.smsEnabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeAlertSettings();
                      openPhoneModal();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Verify Phone
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Alert Categories */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
              Monitored Hazards
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  key: 'severeRainfall',
                  label: 'Severe Rainfall & Cloudbursts',
                  desc: 'High-intensity convective cells exceeding 30mm/hr',
                  icon: CloudRain,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                },
                {
                  key: 'floodRisk',
                  label: 'Street Inundation (>0.3m depth)',
                  desc: 'Water levels hazardous to vehicles and pedestrians',
                  icon: Waves,
                  color: 'text-cyan-600',
                  bg: 'bg-cyan-50',
                },
                {
                  key: 'waterlogging',
                  label: 'Micro-Topographic Waterlogging Hotspots',
                  desc: 'Subways, railway underpasses, and arterial bottlenecks',
                  icon: AlertTriangle,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                },
                {
                  key: 'cyclone',
                  label: 'Cyclonic Storms & High Tidal Surcharges',
                  desc: 'Coastal high-tide gating closures preventing gravity discharge',
                  icon: Wind,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
                },
                {
                  key: 'municipalAlerts',
                  label: 'Municipal Pre-Alerts & Siren Notifications',
                  desc: 'Official dewatering pump deployments and ward disaster advisories',
                  icon: Megaphone,
                  color: 'text-rose-600',
                  bg: 'bg-rose-50',
                },
              ].map((item) => {
                const IconComponent = item.icon;
                const active = prefs[item.key as keyof UserAlertPreferences];
                return (
                  <div
                    key={item.key}
                    className="p-3 rounded-2xl border border-gray-200/70 hover:border-gray-300 bg-white flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{item.label}</div>
                        <div className="text-[10px] text-gray-500 leading-tight">{item.desc}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.key as keyof UserAlertPreferences)}
                      className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        active ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform ${
                          active ? 'translate-x-4.5' : ''
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-[10px] font-mono text-gray-500">
            Priority Tiering: Green (Quiet) • Yellow (Push) • Red (Push + SMS)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeAlertSettings}
              className="px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
