'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import FloodMap from '@/components/map/FloodMap';
import LiveOperationsDock from '@/components/ui/LiveOperationsDock';
import RouteInspector from '@/components/ui/RouteInspector';
import InspectorModal from '@/components/ui/InspectorModal';
import MetroRadarBar from '@/components/ui/MetroRadarBar';
import SafetyDisclaimerModal from '@/components/ui/SafetyDisclaimerModal';
import UserAlertBanner from '@/components/ui/UserAlertBanner';
import GoogleLoginScreen from '@/components/auth/GoogleLoginScreen';
import OnboardingWizardModal from '@/components/auth/OnboardingWizardModal';
import AlertSettingsModal from '@/components/ui/AlertSettingsModal';
import AlertHistoryModal from '@/components/ui/AlertHistoryModal';
import PhoneVerificationModal from '@/components/ui/PhoneVerificationModal';

export default function Home() {
  const { isAuthenticated, onboardingStep } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Initial server/client hydration placeholder
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-slate-950 font-sans flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </main>
    );
  }

  // 1. Mandatory Google Authentication Gate
  if (!isAuthenticated) {
    return <GoogleLoginScreen />;
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      {/* Interactive Map (Coupled ML Inundation, Drainage Network Graph, Evacuation Routing, Hotspots) */}
      <FloodMap />

      {/* Top Center: Indian Metro Basins & Live Doppler Radar Nowcast Controller */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-4xl px-4 flex justify-center pointer-events-auto">
        <MetroRadarBar />
      </div>

      {/* High-Risk Citizen Inundation Warning Banner (Two-Channel SMS + Push Simulation) */}
      <UserAlertBanner />

      {/* Left Mission Control: Collapsible Live Operations Dock (Nowcasting, Runoff/Drainage, Municipal Alerts, Emergency Facilities) */}
      <LiveOperationsDock />

      {/* Predictive Nowcast Horizon, Hydraulic Layers & Flood-Safe Navigation */}
      <RouteInspector />

      {/* Coupled ML Inundation & Drainage Surcharge Inspector */}
      <InspectorModal />

      {/* Post-Login Onboarding Wizard (Location -> Phone SMS -> Push -> Disclaimer) */}
      {onboardingStep !== 'completed' && <OnboardingWizardModal />}

      {/* First-Open / On-Demand Safety Advisory Disclaimer Modal */}
      <SafetyDisclaimerModal />

      {/* Citizen Alert Channel & Hazard Preferences Modal */}
      <AlertSettingsModal />

      {/* Delivered Citizen Warnings History & Audit Log Modal */}
      <AlertHistoryModal />

      {/* On-Demand Emergency Phone Verification Modal */}
      <PhoneVerificationModal />
    </main>
  );
}
