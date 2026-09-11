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

const INITIAL_DEMO_USER: UserProfile = {
  id: 'hydra-usr-001',
  googleId: 'google-oauth2-1092837465',
  displayName: 'Arjun Sharma',
  email: 'arjun.sharma@hydra-disaster.gov.in',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces',
  phone: '+91 98201 12345',
  phoneVerified: true,
  smsConsent: true,
  pushConsent: true,
  locationPermission: 'granted',
  createdAt: '2026-09-11T08:00:00Z',
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
  user: UserProfile | null;
  sessionToken: string | null;
  onboardingStep: OnboardingStep;
  alertPreferences: UserAlertPreferences;
  alertHistory: UserAlertHistoryItem[];
  isAlertSettingsOpen: boolean;
  isAlertHistoryOpen: boolean;
  isDisclaimerOpen: boolean;
  isPhoneModalOpen: boolean;

  // Actions
  loginWithGoogle: (demoName?: string, demoEmail?: string) => Promise<void>;
  logout: () => void;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string; demoHint?: string }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  skipPhoneVerification: () => void;
  setLocationPermission: (status: 'granted' | 'manual') => void;
  setNotificationPermission: (granted: boolean) => void;
  completeOnboarding: () => void;
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
  // Read persisted authentication and onboarding state from localStorage if available
  let initialAuth = false;
  let initialUser: UserProfile | null = null;
  let initialStep: OnboardingStep = 'login';

  if (typeof window !== 'undefined') {
    const savedToken = localStorage.getItem('hydra_session_token');
    const savedUser = localStorage.getItem('hydra_user_profile');
    const onboardingDone = localStorage.getItem('hydra_onboarding_completed') === 'true';

    if (savedToken && savedUser) {
      try {
        initialAuth = true;
        initialUser = JSON.parse(savedUser);
        initialStep = onboardingDone ? 'completed' : 'location';
      } catch {
        // Corrupt storage reset
      }
    }
  }

  return {
    isAuthenticated: initialAuth,
    user: initialUser,
    sessionToken: null,
    onboardingStep: initialStep,
    alertPreferences: DEFAULT_PREFERENCES,
    alertHistory: INITIAL_ALERT_HISTORY,
    isAlertSettingsOpen: false,
    isAlertHistoryOpen: false,
    isDisclaimerOpen: false,
    isPhoneModalOpen: false,

    loginWithGoogle: async (demoName, demoEmail) => {
      // 1. Attempt backend Google OAuth
      let userProfile = { ...INITIAL_DEMO_USER };
      if (demoName) userProfile.displayName = demoName;
      if (demoEmail) userProfile.email = demoEmail;

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_demo: true, name: demoName, email: demoEmail }),
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
        // Fallback to local userProfile
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('hydra_session_token', 'hydra_sess_active');
        localStorage.setItem('hydra_user_profile', JSON.stringify(userProfile));
      }

      // Check if user has already completed onboarding previously
      const alreadyCompleted =
        typeof window !== 'undefined' &&
        localStorage.getItem('hydra_onboarding_completed') === 'true';

      set({
        isAuthenticated: true,
        user: userProfile,
        sessionToken: 'hydra_sess_active',
        onboardingStep: alreadyCompleted ? 'completed' : 'location',
      });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hydra_session_token');
        localStorage.removeItem('hydra_user_profile');
        localStorage.removeItem('hydra_onboarding_completed');
      }
      set({
        isAuthenticated: false,
        user: null,
        sessionToken: null,
        onboardingStep: 'login',
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
              const updatedUser = state.user
                ? { ...state.user, phone, phoneVerified: true, smsConsent: true }
                : null;
              if (typeof window !== 'undefined' && updatedUser) {
                localStorage.setItem('hydra_user_profile', JSON.stringify(updatedUser));
              }
              return {
                user: updatedUser,
                onboardingStep: 'notification',
              };
            });
            return { success: true, message: 'Phone number verified' };
          }
        }
      } catch {
        // Fallback demo verification
      }

      if (otp === '123456') {
        set((state) => {
          const updatedUser = state.user
            ? { ...state.user, phone, phoneVerified: true, smsConsent: true }
            : null;
          if (typeof window !== 'undefined' && updatedUser) {
            localStorage.setItem('hydra_user_profile', JSON.stringify(updatedUser));
          }
          return {
            user: updatedUser,
            onboardingStep: 'notification',
          };
        });
        return { success: true, message: 'Phone number verified (Demo Mode)' };
      }

      return { success: false, message: 'Invalid OTP code. Please enter 123456.' };
    },

    skipPhoneVerification: () => {
      set({ onboardingStep: 'notification' });
    },

    setLocationPermission: (permStatus) => {
      set((state) => {
        const updated = state.user
          ? { ...state.user, locationPermission: permStatus }
          : null;
        if (typeof window !== 'undefined' && updated) {
          localStorage.setItem('hydra_user_profile', JSON.stringify(updated));
        }
        return {
          user: updated,
          onboardingStep: 'phone',
        };
      });
    },

    setNotificationPermission: (granted) => {
      set((state) => {
        const updated = state.user
          ? { ...state.user, pushConsent: granted }
          : null;
        if (typeof window !== 'undefined' && updated) {
          localStorage.setItem('hydra_user_profile', JSON.stringify(updated));
        }
        return {
          user: updated,
          onboardingStep: 'disclaimer',
        };
      });
    },

    completeOnboarding: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hydra_onboarding_completed', 'true');
        localStorage.setItem('hydra_disclaimer_accepted', 'true');
      }
      set({ onboardingStep: 'completed' });
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
