'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Smartphone,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PhoneVerificationModal() {
  const {
    isPhoneModalOpen,
    closePhoneModal,
    user,
    sendPhoneOtp,
    verifyPhoneOtp,
  } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isPhoneModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = phoneNumber.replace(/[^0-9]/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const full = `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
      await sendPhoneOtp(full);
      setOtpSent(true);
    } catch {
      setError('Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const clean = phoneNumber.replace(/[^0-9]/g, '');
      const full = `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
      const res = await verifyPhoneOtp(full, otpCode.trim());
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          closePhoneModal();
        }, 1000);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        <div className="p-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/70 to-orange-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-600 text-white">
                Emergency SMS
              </span>
              <h2 className="text-base font-black text-gray-900 tracking-tight mt-0.5">
                Verify Mobile Number
              </h2>
            </div>
          </div>
          <button
            onClick={closePhoneModal}
            className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-gray-700">
          <p className="text-xs text-gray-600">
            Emergency SMS alerts bypass app background limits and mobile network data throttling during monsoon cloudbursts.
          </p>

          {success ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-emerald-900 text-sm">Number Verified Successfully!</div>
              <div className="text-[11px] text-emerald-700">You will now receive high-priority SMS alerts.</div>
            </div>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Indian Mobile Number
                </label>
                <div className="flex rounded-xl shadow-sm border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="inline-flex items-center px-3.5 bg-gray-50 text-gray-600 font-bold text-xs border-r border-gray-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98201 12345"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs font-bold text-gray-900 outline-none"
                    maxLength={12}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Send Verification Code</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-center tracking-widest text-lg font-mono font-black text-gray-900 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  autoFocus
                />
                <div className="mt-1 text-[10px] text-blue-600 font-mono font-bold">
                  💡 Demo Mode: Master code is 123456
                </div>
              </div>

              {error && (
                <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify OTP</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
