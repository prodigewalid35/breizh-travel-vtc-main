"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, LocateFixed } from "lucide-react";

// Helper to generate a UUID for session tokens, as required by the new API
const generateSessionToken = () => crypto.randomUUID();

interface AddressSuggestion {
  label: string;
  value: string;
  context: string;
}

interface GooglePlacesInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  onAddressSelect?: (address: string) => void;
}

export default function GooglePlacesInput({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  onAddressSelect,
}: GooglePlacesInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const hasSelectedRef = useRef<boolean>(false);

  // Ref to store the session token for the duration of an autocomplete session
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSelectedRef.current && value.length >= 3) {
        // Create a new session token when the user starts typing
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = generateSessionToken();
        }
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!sessionTokenRef.current) return;
    setIsLoading(true);

    try {
      // Appel à votre API route au lieu de l'API Google directement
      const response = await fetch("/api/places/autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: query,
          sessionToken: sessionTokenRef.current,
          languageCode: "fr",
          includedRegionCodes: ["fr"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const formatted: AddressSuggestion[] = (data.suggestions || []).map(
          (s: any) => ({
            label: s.placePrediction.structuredFormat.mainText.text,
            value: s.placePrediction.text.text,
            context:
              s.placePrediction.structuredFormat.secondaryText?.text || "",
          })
        );
        setSuggestions(formatted);
        setShowSuggestions(formatted.length > 0);
        setHighlightedIndex(-1);
      } else {
        const errorData = await response.json();
        console.error("Erreur API Places:", errorData);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Erreur fetch suggestions:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    hasSelectedRef.current = false;
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    hasSelectedRef.current = true;
    onChange(suggestion.value);
    setShowSuggestions(false);
    setSuggestions([]);
    if (onAddressSelect) {
      onAddressSelect(suggestion.value);
    }
    sessionTokenRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setShowSuggestions(false);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex]);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      console.error(
        "La géolocalisation n'est pas supportée par ce navigateur."
      );
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `/api/places/geocode?latlng=${latitude},${longitude}&language=fr`
          );
          const data = await res.json();

          if (data.status === "OK" && data.results[0]) {
            const label = data.results[0].formatted_address;
            hasSelectedRef.current = true;
            onChange(label);
            setShowSuggestions(false);
            setSuggestions([]);
            if (onAddressSelect) {
              onAddressSelect(label);
            }
            sessionTokenRef.current = null;
          } else {
            console.error("Erreur géoloc Google:", data.status || data.error);
          }
        } catch (err) {
          console.error("Erreur géoloc fetch:", err);
        } finally {
          setIsLoading(false);
        }
      },
      async (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            console.error(
              "Permission de géolocalisation refusée par l'utilisateur."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            console.error(
              "Position indisponible : le navigateur ne peut pas déterminer l'emplacement."
            );
            // Exemple de fallback (à implémenter côté API)
            // try {
            //   const ipRes = await fetch("/api/ip-geolocate");
            //   const ipData = await ipRes.json();
            //   onChange(`${ipData.city}, ${ipData.country}`);
            // } catch (fallbackErr) {
            //   console.error("Erreur fallback IP:", fallbackErr);
            // }
            break;
          case err.TIMEOUT:
            console.error("La demande de géolocalisation a expiré.");
            break;
          default:
            console.error("Erreur géolocalisation inconnue:", err);
        }
      }
    );
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        className="relative bg-transparent w-full pl-12 pr-10 py-3 rounded-2xl text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10 led-glow"
        style={{ fontSize: "15px" }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1 z-10">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : (
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="text-primary hover:text-blue-400"
          >
            <LocateFixed className="h-5 w-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <button
              key={s.value + i}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className={`w-full px-4 py-3 text-left text-white transition-colors flex items-start gap-3 first:rounded-t-2xl last:rounded-b-2xl
                ${highlightedIndex === i ? "bg-primary/20" : "hover:bg-primary/10"}`}
            >
              <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{s.label}</div>
                {s.context && (
                  <div className="text-xs text-gray-400 truncate">
                    {s.context}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
