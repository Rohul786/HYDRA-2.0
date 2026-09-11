'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { getNearbyEmergencyServices } from '@/utils/emergencyServices';

export function useUserLocation() {
  const {
    userLocation,
    setUserLocation,
    setNearbyServices,
    evaluateSafetyStatus,
    setMapCenterTarget,
  } = useFloodStore();

  const watchIdRef = useRef<number | null>(null);
  const initialLoadDoneRef = useRef(false);

  // Update services and safety for a given coordinate pair
  const updateLocationContext = useCallback(
    async (lat: number, lng: number) => {
      evaluateSafetyStatus(lat, lng);

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
          error: 'Failed to load emergency services. Local fallback active.',
        });
      }
    },
    [evaluateSafetyStatus, setNearbyServices]
  );

  // Trigger browser geolocation
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setUserLocation({
        loading: false,
        error: 'Geolocation is not supported by your browser.',
        permissionState: 'unavailable',
      });
      return;
    }

    setUserLocation({ loading: true, error: null });

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

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

        // Optionally subscribe to watchPosition for live tracking
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
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
            console.warn('Geolocation watchPosition update warning:', err.message);
          },
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
      },
      (err) => {
        let message = 'Location access is required to find nearby emergency services.';
        let permission: 'denied' | 'unavailable' = 'unavailable';

        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location access is required to find nearby emergency services.';
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
      },
      options
    );
  }, [setUserLocation, setMapCenterTarget, updateLocationContext, evaluateSafetyStatus]);

  // Load initial services & safety for default location on first mount
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      const initialLat = userLocation.latitude ?? 19.0596;
      const initialLng = userLocation.longitude ?? 72.8626;
      updateLocationContext(initialLat, initialLng);
    }
  }, [userLocation.latitude, userLocation.longitude, updateLocationContext]);

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
  };
}
