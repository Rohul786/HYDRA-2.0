import { create } from 'zustand';
import { UserProfile, UserAlertPreferences, UserAlertHistoryItem } from '@/types';

export type OnboardingStep =
  | 'login'
  | 'location'
  | 'phone'
  | 'notification'
  | 'disclaimer'
  | 'completed';

const DEFAULT_PREFERENCES: UserAlertPreferences = {
  pushEnabled: true,
  smsEnabled: true,
  severeRainfall: true,
  floodRisk: true,
  waterlogging: true,
  cyclone: true,
  extremeWeather: true,
  nearbyDisaster: true,
  municipalAlerts: true,
};

export const DEFAULT_GUEST_USER: UserProfile = {
  id: 'hydra-guest',
  googleId: '',
  displayName: 'Guest User',
  email: '',
  avatarUrl: '',
  phone: '',
  phoneVerified: false,
  smsConsent: false,
  pushConsent: false,
  locationPermission: 'granted',
  createdAt: new Date().toISOString(),
};

const INITIAL_ALERT_HISTORY: UserAlertHistoryItem[] = [
  {
    id: 'ALT-2026-0911-001',
    eventId: 'RAIN-MUM-20260911-001',
    timestamp: '11 Sep 2026, 14:32 IST',
    alertType: 'Heavy Rainfall Watch',
    severity: 'CRITICAL',
    location: 'Bandra Kurla Complex (BKC), Mumbai',
    probabilityPct: 84,
    channels: ['Push Notification', 'Emergency SMS'],
    deliveryStatus: 'Delivered',
  },
  {
    id: 'ALT-2026-0910-004',
    eventId: 'FLOOD-MUM-20260910-002',
    timestamp: '10 Sep 2026, 18:15 IST',
    alertType: 'Mithi River Surcharge Advisory',
    severity: 'PRE_ALERT',
    location: 'Kurla West / L-Ward, Mumbai',
    probabilityPct: 76,
    channels: ['Push Notification'],
    deliveryStatus: 'Delivered',
  },
  {
    id: 'ALT-2026-0908-002',
    eventId: 'STORM-DEL-20260908-001',
    timestamp: '08 Sep 2026, 09:40 IST',
    alertType: 'Severe Convective Downpour',
    severity: 'WATCH',
    location: 'Connaught Place, New Delhi',
    probabilityPct: 62,
    channels: ['Push Notification'],
    deliveryStatus: 'Delivered',
  },
];

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile;
  sessionToken: string | null;
  isGoogleConnected: boolean;
  alertPreferences: UserAlertPreferences;
  alertHistory: UserAlertHistoryItem[];
  isAlertSettingsOpen: boolean;
  isAlertHistoryOpen: boolean;
  isDisclaimerOpen: boolean;
  isPhoneModalOpen: boolean;

  // Actions
  autoSyncGoogleSession: () => Promise<void>;
  loginWithGoogle: (authData?: { name?: string; email?: string; avatarUrl?: string; token?: string }) => Promise<void>;
  logout: () => void;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string; demoHint?: string }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  skipPhoneVerification: () => void;
  setLocationPermission: (status: 'granted' | 'manual') => void;
  setNotificationPermission: (granted: boolean) => void;
  updateAlertPreferences: (prefs: Partial<UserAlertPreferences>) => void;
  recordAlert: (alert: UserAlertHistoryItem) => void;
  openAlertSettings: () => void;
  closeAlertSettings: () => void;
  openAlertHistory: () => void;
  closeAlertHistory: () => void;
  openDisclaimer: () => void;
  closeDisclaimer: () => void;
  openPhoneModal: () => void;
  closePhoneModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize with persisted session if available, otherwise graceful Guest User
  let initialUser: UserProfile = { ...DEFAULT_GUEST_USER };
  let initialGoogleConnected = false;

  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('hydra_user_profile');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.displayName && parsed.displayName !== 'Arjun Sharma') {
          initialUser = parsed;
          initialGoogleConnected = Boolean(parsed.googleId || (parsed.email && parsed.email.endsWith('@gmail.com')));
        }
      } catch {
        // Fallback to guest
      }
    }
  }

  return {
    isAuthenticated: true, // Always enter directly into dashboard
    user: initialUser,
    sessionToken: typeof window !== 'undefined' ? localStorage.getItem('hydra_session_token') : null,
    isGoogleConnected: initialGoogleConnected,
    alertPreferences: DEFAULT_PREFERENCES,
    alertHistory: INITIAL_ALERT_HISTORY,
    isAlertSettingsOpen: false,
    isAlertHistoryOpen: false,
    isDisclaimerOpen: false,
    isPhoneModalOpen: false,

    autoSyncGoogleSession: async () => {
      // 1. Check if backend has an active authenticated Google session
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            const syncedUser: UserProfile = {
              id: data.user.id || 'hydra-usr-sync',
              googleId: data.user.google_id || data.user.id,
              displayName: data.user.display_name || 'Google User',
              email: data.user.email || '',
              avatarUrl: data.user.avatar_url || '',
              phone: data.user.phone || '',
              phoneVerified: Boolean(data.user.phone_verified),
              smsConsent: true,
              pushConsent: true,
              locationPermission: 'granted',
              createdAt: data.user.created_at || new Date().toISOString(),
            };

            if (typeof window !== 'undefined') {
              localStorage.setItem('hydra_user_profile', JSON.stringify(syncedUser));
              localStorage.setItem('hydra_session_token', 'hydra_sess_active');
            }

            set({
              user: syncedUser,
              isGoogleConnected: true,
              sessionToken: 'hydra_sess_active',
            });
            return;
          }
        }
      } catch {
        // Backend offline or unreachable — keep graceful guest state
      }

      // 2. If no active session, ensure user is set to Guest User (no hardcoded names)
      if (!get().isGoogleConnected) {
        set({
          user: DEFAULT_GUEST_USER,
          isGoogleConnected: false,
        });
      }
    },

    loginWithGoogle: async (authData) => {
      let userProfile: UserProfile = {
        ...DEFAULT_GUEST_USER,
        id: `hydra-usr-${Date.now().toString().slice(-6)}`,
        displayName: authData?.name || 'Google User',
        email: authData?.email || '',
        avatarUrl: authData?.avatarUrl || '',
      };

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: authData?.token,
            name: authData?.name,
            email: authData?.email,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            userProfile = {
              ...userProfile,
              id: data.user.id,
              displayName: data.user.display_name,
              email: data.user.email,
              avatarUrl: data.user.avatar_url,
              phone: data.user.phone,
              phoneVerified: data.user.phone_verified,
            };
          }
        }
      } catch {
        // Use local userProfile
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('hydra_session_token', 'hydra_sess_active');
        localStorage.setItem('hydra_user_profile', JSON.stringify(userProfile));
      }

      set({
        user: userProfile,
        isGoogleConnected: true,
        sessionToken: 'hydra_sess_active',
      });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hydra_session_token');
        localStorage.removeItem('hydra_user_profile');
      }
      // Gracefully switch to Guest User
      set({
        user: DEFAULT_GUEST_USER,
        isGoogleConnected: false,
        sessionToken: null,
      });
    },

    sendPhoneOtp: async (phone: string) => {
      try {
        const res = await fetch('/api/auth/phone/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            success: true,
            message: data.message || 'OTP dispatched via SMS',
            demoHint: data.demo_hint,
          };
        }
      } catch {
        // Fallback
      }
      return {
        success: true,
        message: 'OTP dispatched via SMS (Demo Mode)',
        demoHint: 'Enter 123456 to verify',
      };
    },

    verifyPhoneOtp: async (phone: string, otp: string) => {
      try {
        const res = await fetch('/api/auth/phone/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            set((state) => {
              const updatedUser: UserProfile = {
                ...state.user,
                phone,
                phoneVerified: true,
                smsConsent: true,
              };
              if (typeof window !== 'undefined') {
                localStorage.setItem('hydra_user_profile', JSON.stringify(updatedUser));
              }
              return { user: updatedUser };
            });
            return { success: true, message: 'Phone number verified' };
          }
        }
      } catch {
        // Fallback demo verification
      }

      if (otp === '123456') {
        set((state) => {
          const updatedUser: UserProfile = {
            ...state.user,
            phone,
            phoneVerified: true,
            smsConsent: true,
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('hydra_user_profile', JSON.stringify(updatedUser));
          }
          return { user: updatedUser };
        });
        return { success: true, message: 'Phone number verified (Demo Mode)' };
      }

      return { success: false, message: 'Invalid OTP code. Please enter 123456.' };
    },

    skipPhoneVerification: () => {
      // Nothing needed
    },

    setLocationPermission: (permStatus) => {
      set((state) => {
        const updated: UserProfile = { ...state.user, locationPermission: permStatus };
        if (typeof window !== 'undefined') {
          localStorage.setItem('hydra_user_profile', JSON.stringify(updated));
        }
        return { user: updated };
      });
    },

    setNotificationPermission: (granted) => {
      set((state) => {
        const updated: UserProfile = { ...state.user, pushConsent: granted };
        if (typeof window !== 'undefined') {
          localStorage.setItem('hydra_user_profile', JSON.stringify(updated));
        }
        return { user: updated };
      });
    },

    updateAlertPreferences: (prefs) => {
      set((state) => ({
        alertPreferences: { ...state.alertPreferences, ...prefs },
      }));
    },

    recordAlert: (alert) => {
      set((state) => ({
        alertHistory: [alert, ...state.alertHistory],
      }));
    },

    openAlertSettings: () => set({ isAlertSettingsOpen: true }),
    closeAlertSettings: () => set({ isAlertSettingsOpen: false }),
    openAlertHistory: () => set({ isAlertHistoryOpen: true }),
    closeAlertHistory: () => set({ isAlertHistoryOpen: false }),
    openDisclaimer: () => set({ isDisclaimerOpen: true }),
    closeDisclaimer: () => set({ isDisclaimerOpen: false }),
    openPhoneModal: () => set({ isPhoneModalOpen: true }),
    closePhoneModal: () => set({ isPhoneModalOpen: false }),
  };
});
