import { useState, useEffect } from 'react';

export function useGeolocation(options = {}) {
  const [location, setLocation] = useState({
    lat: 28.6139,
    lng: 77.2090,
    accuracy: null,
    error: null,
    loading: false
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false
        });
      },
      (error) => {
        // Fallback default coordinates if GPS permission denied or in sandboxed browser
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 10000, ...options }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    ...location,
    refreshLocation: getCurrentLocation
  };
}
