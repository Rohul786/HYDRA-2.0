'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import FloodMap from '@/components/map/FloodMap';
import LiveOperationsDock from '@/components/ui/LiveOperationsDock';
import InspectorModal from '@/components/ui/InspectorModal';
import SafetyDisclaimerModal from '@/components/ui/SafetyDisclaimerModal';
import AlertSettingsModal from '@/components/ui/AlertSettingsModal';
import AlertHistoryModal from '@/components/ui/AlertHistoryModal';
import PhoneVerificationModal from '@/components/ui/PhoneVerificationModal';

export default function Home() {
  const { autoSyncGoogleSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Automatically detect and sync Google session if available in environment
    autoSyncGoogleSession();
  }, [autoSyncGoogleSession]);

  if (!mounted) {
    // Initial server/client hydration placeholder
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      {/* 1. Large Interactive Full-Screen Map (Primary Central Component) */}
      <FloodMap />

      {/* 2. Left Sidebar: Mission Control HUD (Branding, User Profile, GPS, Nowcasting, Runoff & Drainage, Municipal Dispatch, Rescue) */}
      <LiveOperationsDock />

      {/* 3. Coupled ML Inundation & Drainage Surcharge Feature Inspector */}
      <InspectorModal />

      {/* 4. On-Demand Citizen Safety & Modals */}
      <SafetyDisclaimerModal />
      <AlertSettingsModal />
      <AlertHistoryModal />
      <PhoneVerificationModal />
    </main>
  );
}
