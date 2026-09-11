'use client';

import React, { useState } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import {
  Building2,
  Phone,
  Send,
  MapPin,
  ExternalLink,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Radio,
  Search,
} from 'lucide-react';

export default function NearestMunicipalityCard() {
  const {
    nearestMunicipality,
    alertLevel,
    municipalAlerts,
    triggerMunicipalAlert,
    acknowledgeMunicipalAlert,
    setMapCenterTarget,
    userLocation,
  } = useFloodStore();

  const [isDispatching, setIsDispatching] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<
    Array<'dashboard' | 'push' | 'sms' | 'email' | 'webhook'>
  >(['dashboard', 'push', 'sms']);

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

  const handleViewOnMap = () => {
    if (nearestMunicipality.officeCoords) {
      setMapCenterTarget(nearestMunicipality.officeCoords);
    }
  };

  const getDirectionsUrl = () => {
    if (!nearestMunicipality.officeCoords) return '#';
    const [destLat, destLng] = nearestMunicipality.officeCoords;
    const originLat = userLocation.latitude;
    const originLng = userLocation.longitude;
    if (originLat && originLng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
  };

  const isVerified = nearestMunicipality.verificationStatus === 'verified' && Boolean(nearestMunicipality.officeAddress);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-3.5 space-y-3">
      {/* 1. SECTION: MUNICIPAL AUTHORITY */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏛️</span>
            <h3 className="font-black text-xs text-gray-900 tracking-tight uppercase">
              Municipal Authority
            </h3>
          </div>
          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Dispatch: READY
          </span>
        </div>

        {/* Authority Info Box */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/70 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-xs text-gray-900 leading-tight">
                {nearestMunicipality.name} {nearestMunicipality.shortCode ? `(${nearestMunicipality.shortCode})` : ''}
              </h4>
              <div className="text-[10px] text-gray-500 mt-0.5 font-medium">
                {nearestMunicipality.controlRoomName}
              </div>
            </div>
            <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
              ~{nearestMunicipality.distanceKm} km
            </span>
          </div>

          <div className="text-[10px] text-gray-500">
            Jurisdiction: <span className="font-semibold text-gray-700">{nearestMunicipality.coverageZone || nearestMunicipality.jurisdiction}</span>
          </div>
        </div>
      </div>

      {/* 2. SECTION: NEAREST MUNICIPAL OFFICE */}
      <div className="space-y-2 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏢</span>
            <h4 className="font-black text-xs text-gray-900 tracking-tight uppercase">
              Nearest Municipal Office
            </h4>
          </div>
          {isVerified ? (
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Verified Address</span>
            </span>
          ) : (
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Unverified
            </span>
          )}
        </div>

        {isVerified ? (
          <div className="bg-gradient-to-r from-blue-50/40 to-slate-50 p-3 rounded-2xl border border-blue-100/80 space-y-2.5">
            <div>
              <div className="font-extrabold text-xs text-gray-900">
                {nearestMunicipality.officeName}
              </div>
              <div className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                {nearestMunicipality.officeAddress}
              </div>
              {nearestMunicipality.source && (
                <div className="text-[9px] text-gray-400 mt-1">
                  Source: {nearestMunicipality.source}
                </div>
              )}
            </div>

            {/* Actions: View on Map, Get Directions, Contact */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-blue-100/70">
              <button
                onClick={handleViewOnMap}
                className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                title="Focus map on this municipal ward office"
              >
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>View on Map</span>
              </button>

              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                title="Get turn-by-turn driving or transit directions"
              >
                <Navigation className="w-3 h-3 text-emerald-600" />
                <span>Get Directions</span>
              </a>

              {nearestMunicipality.emergencyPhone && (
                <a
                  href={`tel:${nearestMunicipality.emergencyPhone.replace(/[^0-9+]/g, '')}`}
                  className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  title={`Call Municipal Control Room (${nearestMunicipality.emergencyPhone})`}
                >
                  <Phone className="w-3 h-3" />
                  <span>Contact</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Verified municipal address unavailable.</span>
            </div>
            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
              No direct ward office address has been confirmed in official government directories for these exact coordinates.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://www.google.com/maps/search/municipal+corporation+office/@${userLocation.latitude ?? 19.0626},${userLocation.longitude ?? 72.8626},14z`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 bg-white hover:bg-amber-100 text-amber-900 font-bold text-[10px] rounded-xl border border-amber-200 text-center flex items-center justify-center gap-1"
              >
                <Search className="w-3 h-3" />
                <span>Search Nearby</span>
              </a>
              <a
                href={`https://www.google.com/maps/@${userLocation.latitude ?? 19.0626},${userLocation.longitude ?? 72.8626},14z`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 bg-white hover:bg-amber-100 text-amber-900 font-bold text-[10px] rounded-xl border border-amber-200 text-center flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open Map</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 3. SECTION: MUNICIPAL DISPATCH & PRE-ALERT WORKFLOW */}
      <div className="space-y-2 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700">
            Municipal Dispatch Status:
          </span>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            READY • {nearestMunicipality.shortCode || 'HQ'}
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
              <span>Transmitting Secure Alert (Sending...)...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Municipal Pre-Alert Package</span>
            </>
          )}
        </button>
      </div>

      {/* 4. DISPATCHED ALERTS LOG WITH EVENT ID & STRICT DELIVERY PROGRESSION */}
      {municipalAlerts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
            <span>Dispatched Alerts Log ({municipalAlerts.length})</span>
            <span className="text-[9px] text-gray-500 font-mono">Deduplicated</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {municipalAlerts.map((alert) => (
              <div
                key={alert.alertId}
                className="p-2.5 rounded-xl border border-gray-200/80 bg-gray-50/70 text-[11px] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-blue-900 text-xs">
                      {alert.alertId}
                    </span>
                    {alert.eventId && (
                      <span className="text-[9px] font-mono text-gray-500 bg-gray-200/70 px-1 py-0.2 rounded">
                        {alert.eventId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        alert.deliveryStatus === 'delivered'
                          ? 'text-emerald-700 bg-emerald-100/80'
                          : alert.deliveryStatus === 'sending'
                          ? 'text-blue-700 bg-blue-100/80 animate-pulse'
                          : 'text-gray-700 bg-gray-100'
                      }`}
                    >
                      {alert.deliveryStatus === 'delivered'
                        ? '✓ DELIVERED'
                        : alert.deliveryStatus === 'sending'
                        ? 'SENDING...'
                        : alert.deliveryStatus.toUpperCase()}
                    </span>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        alert.acknowledgementStatus === 'acknowledged'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.acknowledgementStatus === 'acknowledged'
                        ? 'ACKNOWLEDGED'
                        : 'PENDING ACK'}
                    </span>
                  </div>
                </div>

                <div className="text-gray-600">
                  Recipient: <strong>{alert.responsibleAuthorityName || nearestMunicipality.name}</strong>
                  {alert.nearestOfficeName && (
                    <span className="text-gray-500 text-[10px] block">
                      Office: {alert.nearestOfficeName}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5 border-t border-gray-200/60">
                  <span>Stress: {alert.drainageStressPct}% • Lead: {alert.estimatedLeadTimeMins}m</span>
                  {alert.acknowledgementStatus === 'pending' ? (
                    <button
                      onClick={() => acknowledgeMunicipalAlert(alert.alertId)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                    >
                      Acknowledge Receipt
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      Ack: {alert.acknowledgedAt || 'Confirmed'}
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
