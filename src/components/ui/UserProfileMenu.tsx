'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import {
  User,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

export default function UserProfileMenu() {
  const {
    user,
    logout,
    openAlertSettings,
    openAlertHistory,
    openDisclaimer,
    openPhoneModal,
  } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-white/90 hover:bg-white border border-slate-200/80 shadow-sm hover:shadow transition-all cursor-pointer text-left focus:outline-none"
      >
        <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-blue-100 border border-blue-200 shrink-0 flex items-center justify-center">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-blue-600" />
          )}
        </div>

        <div className="flex flex-col text-left">
          <div className="text-xs font-bold text-gray-900 leading-tight max-w-[110px] truncate">
            {user.displayName}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono">
            {user.phoneVerified ? (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> SMS Active
              </span>
            ) : (
              <span className="text-amber-600 font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> SMS Inactive
              </span>
            )}
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-2.5 border-b border-gray-100">
            <div className="font-black text-gray-900 text-xs truncate">
              {user.displayName}
            </div>
            <div className="text-[11px] text-gray-500 truncate">
              {user.email}
            </div>

            {/* Phone Status Strip */}
            <div className="mt-2 p-2 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] font-mono text-gray-700 font-bold">
                  {user.phone ? user.phone : 'No phone linked'}
                </span>
              </div>
              {user.phoneVerified ? (
                <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openPhoneModal();
                  }}
                  className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                >
                  Verify
                </button>
              )}
            </div>
          </div>

          {/* Action Menu Items */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openAlertHistory();
              }}
              className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-blue-50/70 hover:text-blue-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Alert History &amp; Warnings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openAlertSettings();
              }}
              className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-blue-50/70 hover:text-blue-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>Alert &amp; Hazard Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openDisclaimer();
              }}
              className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-blue-50/70 hover:text-blue-700 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Safety &amp; Disclaimer Notice</span>
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
