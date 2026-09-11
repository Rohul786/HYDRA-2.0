'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuthStore, OnboardingStep } from '@/store/useAuthStore';
import { useFloodStore } from '@/store/useFloodStore';
import {
  MapPin,
  Smartphone,
  Bell,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MetroCity } from '@/types';

export default function OnboardingWizardModal() {
  const {
    isAuthenticated,
    onboardingStep,
    setLocationPermission,
    sendPhoneOtp,
    verifyPhoneOtp,
    skipPhoneVerification,
    setNotificationPermission,
    completeOnboarding,
  } = useAuthStore();

  const { setActiveMetro } = useFloodStore();

  // Step 2: Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [smsConsent, setSmsConsent] = useState(true);

  // Step 4: Safety guide toggle
  const [showSafetyGuide, setShowSafetyGuide] = useState(false);

  // Manual city picker state for step 1
  const [manualCity, setManualCity] = useState<MetroCity>('mumbai');

  if (!isAuthenticated || onboardingStep === 'completed' || onboardingStep === 'login') {
    return null;
  }

  // STEP 1: LOCATION PERMISSION
  const handleAllowLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission('granted');
        },
        () => {
          // Fallback to manual if user denied in browser prompt
          setLocationPermission('manual');
        },
        { timeout: 8000 }
      );
    } else {
      setLocationPermission('manual');
    }
  };

  const handleManualLocation = () => {
    setActiveMetro(manualCity);
    setLocationPermission('manual');
  };

  // STEP 2: PHONE & SMS VERIFICATION
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!smsConsent) {
      setPhoneError('Please provide consent to receive emergency SMS alerts.');
      return;
    }

    setOtpLoading(true);
    try {
      const fullPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
      await sendPhoneOtp(fullPhone);
      setOtpSent(true);
    } catch {
      setPhoneError('Failed to send verification SMS. Try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setPhoneError('Please enter the 6-digit OTP code.');
      return;
    }

    setOtpLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
      const fullPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
      const res = await verifyPhoneOtp(fullPhone, otpCode.trim());
      if (!res.success) {
        setPhoneError(res.message);
      }
    } catch {
      setPhoneError('Verification failed. Try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // STEP 3: NOTIFICATION PERMISSION
  const handleEnableNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm === 'granted');
      } catch {
        setNotificationPermission(true);
      }
    } else {
      setNotificationPermission(true);
    }
  };

  const handleSkipNotifications = () => {
    setNotificationPermission(false);
  };

  // STEP 4: DISCLAIMER ACCEPTANCE
  const handleAcceptDisclaimer = () => {
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Step Indicator Header */}
        <div className="p-5 pb-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm border border-white shrink-0 bg-white">
              <Image
                src="/logo.png"
                alt="HYDRA Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  HYDRA 2.0
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  Setup Step {onboardingStep === 'location' ? '1/4' : onboardingStep === 'phone' ? '2/4' : onboardingStep === 'notification' ? '3/4' : '4/4'}
                </span>
              </div>
              <h2 className="text-base font-black text-gray-900 tracking-tight mt-0.5">
                Citizen Safety Profile
              </h2>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {(['location', 'phone', 'notification', 'disclaimer'] as OnboardingStep[]).map((step) => {
              const active = onboardingStep === step;
              const completed =
                (step === 'location' && onboardingStep !== 'location') ||
                (step === 'phone' && (onboardingStep === 'notification' || onboardingStep === 'disclaimer')) ||
                (step === 'notification' && onboardingStep === 'disclaimer');

              return (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    active
                      ? 'w-6 bg-blue-600'
                      : completed
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-gray-200'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-800">
          {/* ================= STEP 1: LOCATION ================= */}
          {onboardingStep === 'location' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Allow HYDRA to use your location?
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  HYDRA uses hyper-local geospatial positioning to detect whether your current street, ward, or route intersects with upcoming urban flood nowcasts and drainage bottlenecks.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-950 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Guaranteed:</strong> Your precise location is processed locally in-browser for safe route calculation and is never shared with third parties.
                </span>
              </div>

              {/* Manual City Selector Alternative */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="text-[11px] font-bold text-gray-700 block">
                  Or select your Indian Metro basin manually:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mumbai', name: 'Mumbai', desc: 'Mithi & BKC' },
                    { id: 'delhi', name: 'Delhi', desc: 'Yamuna & Minto' },
                    { id: 'chennai', name: 'Chennai', desc: 'Adyar & Cooum' },
                    { id: 'bengaluru', name: 'Bengaluru', desc: 'Bellandur Basin' },
                    { id: 'kolkata', name: 'Kolkata', desc: 'Hooghly & Canal' },
                  ].map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => setManualCity(city.id as MetroCity)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        manualCity === city.id
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="font-bold">{city.name}</div>
                      <div className="text-[9px] text-gray-500">{city.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleAllowLocation}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Allow Location Access</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualLocation}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Choose Location Manually ({manualCity.toUpperCase()})
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PHONE VERIFICATION (EMERGENCY SMS) ================= */}
          {onboardingStep === 'phone' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Add your mobile number for emergency SMS alerts
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  During extreme monsoon events and cloudbursts, mobile data towers often congest or fail. High-priority SMS ensures you receive critical flood alerts even with weak connectivity.
                </p>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Mobile Number (India)
                    </label>
                    <div className="flex rounded-xl shadow-sm border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                      <span className="inline-flex items-center px-3.5 bg-gray-50 text-gray-600 font-bold text-xs border-r border-gray-300">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="98201 12345"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 text-xs font-bold text-gray-900 outline-none placeholder:text-gray-400"
                        maxLength={12}
                        autoFocus
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <span className="text-[11px] leading-tight">
                      I consent to receive critical weather, cloudburst, and street flood warnings via SMS on this number.
                    </span>
                  </label>

                  {phoneError && (
                    <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {otpLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                      <span>Send Verification Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={skipPhoneVerification}
                      className="w-full py-2 px-4 rounded-xl text-gray-500 hover:text-gray-800 text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Skip for Now (App Notifications Only)
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Verification code dispatched to: </span>
                      <span className="font-mono font-bold">+91 {phoneNumber}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-center tracking-widest text-lg font-mono font-black text-gray-900 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      maxLength={6}
                      autoFocus
                    />
                    <div className="mt-1 text-[10px] text-blue-600 font-mono font-bold">
                      💡 Smart India Hackathon Demo: Code is 123456
                    </div>
                  </div>

                  {phoneError && (
                    <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {otpLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Verify &amp; Confirm Number</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-full py-2 px-4 rounded-xl text-gray-500 hover:text-gray-800 text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= STEP 3: NOTIFICATION PERMISSION ================= */}
          {onboardingStep === 'notification' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Enable HYDRA alerts?
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Receive real-time push warnings when rain intensity increases or street water accumulation is estimated near your location.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div>
                    <span className="font-bold text-gray-900">Severe Inundation Watches:</span>
                    <span className="text-gray-500 block text-[11px]">Immediate notification if water exceeds 0.3m on nearby roads.</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div>
                    <span className="font-bold text-gray-900">Doppler Cloudburst Tracking:</span>
                    <span className="text-gray-500 block text-[11px]">30 to 120 minute lead-time forecast updates.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enable Push Alerts</span>
                </button>

                <button
                  type="button"
                  onClick={handleSkipNotifications}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Not Now
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: SAFETY DISCLAIMER ================= */}
          {onboardingStep === 'disclaimer' && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] font-bold">
                  Notice: AI-assisted hydrological nowcasts are probabilistic decision-support estimates and not guaranteed forecasts.
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-gray-900">
                  HYDRA Early Warning Disclaimer
                </h3>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                  HYDRA provides AI-assisted weather, rainfall, flood and waterlogging risk assessments intended for early awareness and disaster-response planning.
                </p>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                These assessments are <strong className="font-black text-gray-900">NOT guaranteed predictions</strong> and should <strong className="font-black text-gray-900">NOT be treated as 100% certain</strong>. Weather conditions can change rapidly, and actual rainfall, cloudburst occurrence, flooding and waterlogging may differ from the estimated conditions.
              </p>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 font-bold text-blue-950 flex items-center gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
                <span>In an emergency, follow official instructions from authorized disaster authorities.</span>
              </div>

              {/* Optional Safety Precautions Drawer */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
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
                    <div className="font-bold text-gray-900">
                      🚨 Essential Urban Flood Precautions:
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      <li><strong>Never enter flooded subways/underpasses</strong>: Inundation can exceed 1.5 meters within minutes.</li>
                      <li><strong>Avoid downed power lines and substations</strong> to eliminate electrocution risk.</li>
                      <li><strong>Emergency Helplines</strong>: National <strong>112 / 1070</strong>, BMC <strong>1916</strong>, MCD <strong>155305</strong>, GCC <strong>1913</strong>.</li>
                      <li>Follow evacuation orders from municipal disaster cells immediately.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleAcceptDisclaimer}
                  className="w-full py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Understand &amp; Continue to HYDRA</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-500 font-mono">
          Smart India Hackathon 2024–2026 Prototype • Ministry of Jal Shakti
        </div>
      </div>
    </div>
  );
}
