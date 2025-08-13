// hooks/useLoadGoogleMaps.ts
import { useState, useEffect } from "react";

export function useLoadGoogleMaps(apiKey: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;

    script.onload = () => setLoaded(true);
    script.onerror = () => {
      console.error("Erreur chargement Google Maps JS");
      setLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  return loaded;
}
