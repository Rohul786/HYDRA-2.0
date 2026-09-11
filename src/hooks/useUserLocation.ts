'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useFloodStore } from '@/store/useFloodStore';
import { getNearbyEmergencyServices } from '@/utils/emergencyServices';
import { fetchGlobalEarthquakes, fetchLiveWeatherHazards } from '@/utils/globalHazards';

export function useUserLocation() {
  const {
    userLocation,
    setUserLocation,
    setNearbyServices,
    evaluateSafetyStatus,
    setMapCenterTarget,
    addGlobalHazards,
    setCurrentWeather,
  } = useFloodStore();

  const watchIdRef = useRef<number | null>(null);
  const initialLoadDoneRef = useRef(false);

  // Update services, live weather, and safety for a given coordinate pair anywhere in the world
  const updateLocationContext = useCallback(
    async (lat: number, lng: number, placeLabel = 'Your Location') => {
      evaluateSafetyStatus(lat, lng);

      // 1. Fetch live meteorological conditions from Open-Meteo
      fetchLiveWeatherHazards(lat, lng, placeLabel).then(({ weather, dynamicHazards }) => {
        setCurrentWeather({
          temp: weather.temp,
          precipitation: weather.precipitation,
          windSpeed: weather.windSpeed,
          condition: weather.condition,
          alert: dynamicHazards.length > 0 ? dynamicHazards[0].name : undefined,
        });

        if (dynamicHazards.length > 0) {
          addGlobalHazards(dynamicHazards);
        }
        evaluateSafetyStatus(lat, lng);
      });

      // 2. Fetch nearby emergency services from OpenStreetMap Overpass
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
    [evaluateSafetyStatus, setNearbyServices, setCurrentWeather, addGlobalHazards]
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
      timeout: 10000,
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

        // Update emergency services, live weather & safety status
        updateLocationContext(lat, lng, 'Your Location');

        // Subscribe to watchPosition for live position updates
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
            console.warn('Geolocation watchPosition notice:', err.message);
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

        // If GPS is denied or unavailable, ensure default location context is fully loaded
        const fallbackLat = userLocation.latitude ?? 19.0596;
        const fallbackLng = userLocation.longitude ?? 72.8626;
        updateLocationContext(fallbackLat, fallbackLng, 'Default Hub');
      },
      options
    );
  }, [setUserLocation, setMapCenterTarget, updateLocationContext, evaluateSafetyStatus, userLocation.latitude, userLocation.longitude]);

  // Automatically detect location when the user opens the app!
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;

      // Automatically request user location right away
      requestLocation();

      // Fetch live real-time USGS earthquakes worldwide
      fetchGlobalEarthquakes().then((quakes) => {
        if (quakes.length > 0) {
          addGlobalHazards(quakes);
        }
      });
    }
  }, [requestLocation, addGlobalHazards]);

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
