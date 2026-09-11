'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { getNearbyEmergencyServices } from '@/utils/emergencyServices';

export function useUserLocation() {
  const {
    userLocation,
    locationMode,
    switchToGps,
    setUserLocation,
    setNearbyServices,
    evaluateSafetyStatus,
    setMapCenterTarget,
    openLocationPermissionModal,
  } = useFloodStore();

  const watchIdRef = useRef<number | null>(null);
  const initialLoadDoneRef = useRef(false);

  // Update emergency rescue services and flood safety for active coordinates
  const updateLocationContext = useCallback(
    async (lat: number, lng: number) => {
      evaluateSafetyStatus(lat, lng);

      // Fetch nearby emergency facilities (hospitals, shelters, police, fire)
      setNearbyServices({ loading: true, error: null });
      try {
        const services = await getNearbyEmergencyServices(lat, lng);
        setNearbyServices({
          hospitals: services.hospitals,
          policeStations: services.policeStations,
          fireStations: services.fireStations,
          shelters: services.shelters,
          loading: false,
          lastUpdated: Date.now(),
        });
      } catch {
        setNearbyServices({
          loading: false,
          error: 'Using verified regional emergency services fallback.',
        });
      }
    },
    [evaluateSafetyStatus, setNearbyServices]
  );

  // Trigger browser geolocation
  const requestLocation = useCallback((forceGpsMode = true) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setUserLocation({
        loading: false,
        error: 'Geolocation is not supported by your browser.',
        permissionState: 'unavailable',
      });
      return;
    }

    if (forceGpsMode) {
      switchToGps();
    }

    setUserLocation({ loading: true, error: null });

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Check active mode from Zustand store
        const currentMode = useFloodStore.getState().locationMode;
        if (!forceGpsMode && currentMode !== 'gps') {
          // User has selected a metro city — do NOT override with GPS
          setUserLocation({
            loading: false,
            permissionState: 'granted',
          });
          return;
        }

        setUserLocation({
          latitude: lat,
          longitude: lng,
          accuracy,
          loading: false,
          error: null,
          permissionState: 'granted',
          isRealGps: true,
        });

        // Center map on user's real location
        setMapCenterTarget([lat, lng]);

        // Update emergency services & safety status
        updateLocationContext(lat, lng);

        // Subscribe to watchPosition for live position tracking
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            // CRITICAL: Prevent silent override if user is in 'metro' mode
            const modeNow = useFloodStore.getState().locationMode;
            if (modeNow !== 'gps') {
              return;
            }

            const nextLat = pos.coords.latitude;
            const nextLng = pos.coords.longitude;
            setUserLocation({
              latitude: nextLat,
              longitude: nextLng,
              accuracy: pos.coords.accuracy,
              isRealGps: true,
            });
            evaluateSafetyStatus(nextLat, nextLng);
          },
          (err) => {
            console.warn('Geolocation watch notice:', err.message);
          },
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
      },
      (err) => {
        let message = 'Location access is required to find nearby flood shelters.';
        let permission: 'denied' | 'unavailable' = 'unavailable';

        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location access is required to find nearby flood shelters.';
          permission = 'denied';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable.';
          permission = 'unavailable';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Please try again.';
          permission = 'unavailable';
        }

        setUserLocation({
          loading: false,
          error: message,
          permissionState: permission,
        });

        const fallbackLat = userLocation.latitude ?? 19.0626;
        const fallbackLng = userLocation.longitude ?? 72.8626;
        updateLocationContext(fallbackLat, fallbackLng);
      },
      options
    );
  }, [switchToGps, setUserLocation, setMapCenterTarget, updateLocationContext, evaluateSafetyStatus, userLocation.latitude, userLocation.longitude]);

  // Check permission state without passively triggering browser location popup
  useEffect(() => {
    if (initialLoadDoneRef.current || typeof window === 'undefined') return;
    initialLoadDoneRef.current = true;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            // Already granted permission previously: can safely sync GPS position
            requestLocation(false);
          } else if (permissionStatus.state === 'prompt') {
            // Permission has NOT been granted yet: check if prompt was handled in session
            const alreadyPrompted = sessionStorage.getItem('hydra_location_prompt_handled');
            if (!alreadyPrompted) {
              openLocationPermissionModal();
            }
          } else if (permissionStatus.state === 'denied') {
            setUserLocation({ permissionState: 'denied' });
          }

          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              requestLocation(true);
            } else if (permissionStatus.state === 'denied') {
              setUserLocation({ permissionState: 'denied' });
            }
          };
        })
        .catch(() => {
          const alreadyPrompted = sessionStorage.getItem('hydra_location_prompt_handled');
          if (!alreadyPrompted) {
            openLocationPermissionModal();
          }
        });
    } else {
      const alreadyPrompted = sessionStorage.getItem('hydra_location_prompt_handled');
      if (!alreadyPrompted) {
        openLocationPermissionModal();
      }
    }
  }, [requestLocation, openLocationPermissionModal, setUserLocation]);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    accuracy: userLocation.accuracy,
    loading: userLocation.loading,
    error: userLocation.error,
    permissionState: userLocation.permissionState,
    isRealGps: userLocation.isRealGps,
    requestLocation,
    updateLocationContext,
  };
}
