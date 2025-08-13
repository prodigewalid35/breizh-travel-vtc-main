"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ChevronDown,
  Mail,
  Car,
  Timer,
  Route,
  CheckCircle,
  Loader2,
  Edit, // AJOUTÉ: Icône pour le forfait personnalisé
} from "lucide-react";
import { setupScrollAnimation } from "@/lib/animations";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import GooglePlacesInput from "@/components/ui/google-places-input";
import PhoneInput from "@/components/ui/phone-input";

// MODIFIÉ: Ajout de "personnalise" au type
type BookingType = "simple" | "disposition";
type DispositionPackage =
  | "confort"
  | "decouverte"
  | "prestige"
  | "personnalise";

interface DispositionPricing {
  duration: string;
  dayPrice: number;
  nightPrice: number;
  includedKm: number;
}

// Define booking data interface for URL parameters
interface BookingDataForURL {
  id: string;
  type: BookingType;
  date: string;
  time: string;
  pickup: string;
  dropoff?: string;
  name: string;
  phone: string;
  email: string;
  package?: DispositionPackage;
  customHours?: number; // AJOUTÉ: Pour le forfait personnalisé
  estimatedKm?: string;
  pricing?: any;
}

const dispositionPackages: Record<
  "confort" | "decouverte" | "prestige", // MODIFIÉ: Exclure 'personnalise' d'ici
  DispositionPricing
> = {
  confort: {
    duration: "1 heure",
    dayPrice: 55,
    nightPrice: 70,
    includedKm: 25,
  },
  decouverte: {
    duration: "Demi-journée (4h)",
    dayPrice: 195,
    nightPrice: 245,
    includedKm: 100,
  },
  prestige: {
    duration: "Journée complète (8h)",
    dayPrice: 360,
    nightPrice: 450,
    includedKm: 200,
  },
};

export default function BookingSection() {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<BookingType>("simple");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // États pour mise à disposition
  const [dispositionPackage, setDispositionPackage] =
    useState<DispositionPackage>("confort");
  const [estimatedKm, setEstimatedKm] = useState("");
  const [debouncedEstimatedKm, setDebouncedEstimatedKm] = useState(""); // Debounced state for mileage
  const [dispositionPricing, setDispositionPricing] = useState<any>(null);
  // AJOUTÉ: État pour la durée personnalisée et sa version débattue
  const [customHours, setCustomHours] = useState<number>(2);
  const [debouncedCustomHours, setDebouncedCustomHours] = useState<number>(2);
  const [customPackageDetails, setCustomPackageDetails] = useState<any>({
    dayPrice: 0,
    nightPrice: 0,
    includedKm: 0,
  });

  // Nouveaux états pour gérer la sélection d'adresses et animations
  const [pickupSelected, setPickupSelected] = useState(false);
  const [dropoffSelected, setDropoffSelected] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [pricingAnimation, setPricingAnimation] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const cleanup = setupScrollAnimation();
    return cleanup;
  }, []);

  useEffect(() => {
    if (date) {
      fetchAvailableSlots(date);
    } else {
      setAvailableSlots([]);
      setTime("");
      setIsDemo(false);
    }
  }, [date]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce the estimatedKm input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEstimatedKm(estimatedKm);
    }, 800);
    return () => clearTimeout(timer);
  }, [estimatedKm]);

  // AJOUTÉ: Debounce the customHours input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCustomHours(customHours);
    }, 500);
    return () => clearTimeout(timer);
  }, [customHours]);

  // AJOUTÉ: Fonction de calcul par interpolation linéaire pour le forfait personnalisé
  const calculateCustomPackageDetails = (hours: number) => {
    const h = Math.max(1, hours); // Minimum 1 heure
    const tiers = [
      { h: 1, ...dispositionPackages.confort },
      { h: 4, ...dispositionPackages.decouverte },
      { h: 8, ...dispositionPackages.prestige },
    ];

    let dayPrice, nightPrice;

    if (h <= tiers[0].h) {
      dayPrice = tiers[0].dayPrice * h;
      nightPrice = tiers[0].nightPrice * h;
    } else if (h >= tiers[2].h) {
      // Extrapolation au-delà de 8h en se basant sur le tarif du forfait prestige
      const rateDay = tiers[2].dayPrice / tiers[2].h;
      const rateNight = tiers[2].nightPrice / tiers[2].h;
      dayPrice = tiers[2].dayPrice + (h - tiers[2].h) * rateDay;
      nightPrice = tiers[2].nightPrice + (h - tiers[2].h) * rateNight;
    } else {
      // Interpolation linéaire entre les paliers
      const tierIndex = tiers.findIndex((t) => h < t.h);
      const t1 = tiers[tierIndex - 1];
      const t2 = tiers[tierIndex];

      const ratio = (h - t1.h) / (t2.h - t1.h);
      dayPrice = t1.dayPrice + ratio * (t2.dayPrice - t1.dayPrice);
      nightPrice = t1.nightPrice + ratio * (t2.nightPrice - t1.nightPrice);
    }

    return {
      dayPrice: Math.round(dayPrice),
      nightPrice: Math.round(nightPrice),
      includedKm: Math.round(h * 25), // 25 km/h inclus, comme les autres forfaits
    };
  };

  // AJOUTÉ: Mettre à jour les détails du forfait personnalisé quand les heures changent
  useEffect(() => {
    if (
      bookingType === "disposition" &&
      dispositionPackage === "personnalise"
    ) {
      setCustomPackageDetails(calculateCustomPackageDetails(customHours));
    }
  }, [customHours, dispositionPackage, bookingType]);

  // Calculer le prix pour trajet simple avec animations
  useEffect(() => {
    if (
      bookingType === "simple" &&
      pickupSelected &&
      dropoffSelected &&
      pickup &&
      dropoff &&
      time
    ) {
      if (pricing) {
        setPricingAnimation("animate-pulse");
        setTimeout(() => calculatePricing(), 200);
      } else {
        calculatePricing();
      }
    } else if (bookingType === "simple" && showPricing) {
      setPricingAnimation("animate-out");
      setTimeout(() => {
        setPricing(null);
        setShowPricing(false);
        setPricingAnimation("");
      }, 300);
    }
  }, [bookingType, pickupSelected, dropoffSelected, pickup, dropoff, time]);

  // MODIFIÉ: Calculer le prix pour mise à disposition, incluant le forfait personnalisé
  useEffect(() => {
    const isReadyForCalc =
      bookingType === "disposition" &&
      pickupSelected &&
      pickup &&
      time &&
      debouncedEstimatedKm &&
      !isNaN(Number(debouncedEstimatedKm));

    // Déclencher le calcul si les conditions sont remplies
    if (isReadyForCalc) {
      // Gérer l'animation de mise à jour
      if (dispositionPricing) {
        setPricingAnimation("animate-pulse");
        setTimeout(() => calculateDispositionPricing(), 200);
      } else {
        calculateDispositionPricing();
      }
    } else if (bookingType === "disposition" && showPricing) {
      // Masquer la carte de prix si les conditions ne sont plus remplies
      setPricingAnimation("animate-out");
      setTimeout(() => {
        setDispositionPricing(null);
        setShowPricing(false);
        setPricingAnimation("");
      }, 300);
    }
  }, [
    bookingType,
    dispositionPackage,
    pickupSelected,
    pickup,
    time,
    debouncedEstimatedKm,
    debouncedCustomHours, // AJOUTÉ: Recalculer si la durée personnalisée change
  ]);

  // Reset des champs lors du changement de type avec animations
  useEffect(() => {
    if (bookingType === "simple") {
      setEstimatedKm("");
      if (dispositionPricing) {
        setPricingAnimation("animate-out");
        setTimeout(() => {
          setDispositionPricing(null);
          setShowPricing(false);
          setPricingAnimation("");
        }, 300);
      }
    } else {
      setDropoff("");
      setDropoffSelected(false);
      if (pricing) {
        setPricingAnimation("animate-out");
        setTimeout(() => {
          setPricing(null);
          setShowPricing(false);
          setPricingAnimation("");
        }, 300);
      }
    }
  }, [bookingType]);

  const calculateDispositionPricing = async () => {
    if (!debouncedEstimatedKm) return; // Safety check
    setCalculatingPrice(true);

    // Si pas encore affiché, montrer la card avec skeleton
    if (!showPricing) {
      setShowPricing(true);
      setPricingAnimation("animate-in");
    }

    // MODIFIÉ: Envoyer les données du forfait personnalisé à l'API
    const payload = {
      package: dispositionPackage,
      pickup,
      estimatedKm: parseInt(debouncedEstimatedKm), // Use debounced value for the API call
      time,
      date: date ? format(date, "yyyy-MM-dd") : undefined,
      ...(dispositionPackage === "personnalise" && {
        customHours: debouncedCustomHours,
      }), // AJOUTÉ: Envoyer les heures personnalisées
    };

    try {
      const response = await fetch("/api/calculate-disposition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        // Animation de transition fluide
        setPricingAnimation("animate-update");
        setTimeout(() => {
          setDispositionPricing(data);
          setPricingAnimation("animate-success");

          toast({
            title: "✅ Prix calculé",
            description: `Forfait ${dispositionPackage} - ${data.finalPrice}€`,
            variant: "default",
          });

          // Retour à l'état normal
          setTimeout(() => setPricingAnimation(""), 1000);
        }, 200);
      }
    } catch (error) {
      console.error("Erreur calcul prix disposition:", error);
      setPricingAnimation("animate-error");
      setTimeout(() => setPricingAnimation(""), 1000);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const calculatePricing = async () => {
    setCalculatingPrice(true);

    // Si pas encore affiché, montrer la card avec skeleton
    if (!showPricing) {
      setShowPricing(true);
      setPricingAnimation("animate-in");
    }

    try {
      const response = await fetch("/api/calculate-distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup,
          dropoff,
          time,
          date: date ? format(date, "yyyy-MM-dd") : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Animation de transition fluide
        setPricingAnimation("animate-update");
        setTimeout(() => {
          setPricing(data);
          setPricingAnimation("animate-success");

          toast({
            title: "✅ Prix calculé",
            description: `${data.distance} km - ${data.pricing.finalPrice}€ - ${data.calculationMode === "Maps" ? "📍 Calcul précis" : "📍 Estimation"}`,
            variant: "default",
          });

          // Retour à l'état normal
          setTimeout(() => setPricingAnimation(""), 1000);
        }, 200);
      }
    } catch (error) {
      console.error("Erreur calcul prix:", error);
      setPricingAnimation("animate-error");
      setTimeout(() => setPricingAnimation(""), 1000);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const fetchAvailableSlots = async (selectedDate: Date) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/availability?date=${format(selectedDate, "yyyy-MM-dd")}`
      );
      const data = await response.json();

      setAvailableSlots(data.availableSlots || []);
      setIsDemo(data.isDemo || false);

      if (data.availableSlots?.length === 0) {
        toast({
          title: "Pas de disponibilité",
          description: "Aucun créneau disponible pour cette date.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
      toast({
        title: "Erreur de connexion",
        description:
          "Impossible de récupérer les créneaux. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleTimeSelect = (selectedTime: string) => {
    setTime(selectedTime);
    setIsTimeDropdownOpen(false);
  };

  const handleTimeDropdownToggle = () => {
    if (!date) {
      toast({
        title: "Sélectionnez d'abord une date",
        description: "Veuillez choisir une date pour voir vos disponibilités",
        variant: "destructive",
      });
      return;
    }

    if (availableSlots.length === 0 && !loadingSlots) {
      toast({
        title: "Pas de disponibilité",
        description: "Vous n'êtes pas disponible à cette date",
        variant: "destructive",
      });
      return;
    }

    setIsTimeDropdownOpen(!isTimeDropdownOpen);
  };

  // Handlers pour la sélection d'adresses
  const handlePickupChange = (value: string) => {
    setPickup(value);
    if (pickupSelected) {
      setPickupSelected(false);
      if (showPricing) {
        setPricingAnimation("animate-pulse");
      }
    }
  };

  const handlePickupSelect = (value: string) => {
    setPickup(value);
    setPickupSelected(true);
  };

  const handleDropoffChange = (value: string) => {
    setDropoff(value);
    if (dropoffSelected) {
      setDropoffSelected(false);
      if (showPricing) {
        setPricingAnimation("animate-pulse");
      }
    }
  };

  const handleDropoffSelect = (value: string) => {
    setDropoff(value);
    setDropoffSelected(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const baseValidation =
      !date || !time || !pickup || !name || !phone || !acceptTerms;
    const simpleValidation = bookingType === "simple" && !dropoff;
    const dispositionValidation = bookingType === "disposition" && !estimatedKm;

    if (baseValidation || simpleValidation || dispositionValidation) {
      toast({
        title: "Erreur",
        description:
          "Veuillez remplir tous les champs obligatoires et accepter les conditions d'utilisation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    toast({
      title: "Redirection vers le paiement...",
      description: "Préparation de votre réservation",
      variant: "default",
    });

    // Créer les données de réservation
    const bookingData: BookingDataForURL = {
      id: `booking_${Date.now()}`,
      type: bookingType,
      date: format(date!, "yyyy-MM-dd"),
      time,
      pickup,
      name,
      phone,
      email: email || "",
    };

    // Add conditional properties based on booking type
    if (bookingType === "simple") {
      bookingData.dropoff = dropoff;
      bookingData.pricing = pricing;
    } else {
      bookingData.package = dispositionPackage;
      bookingData.estimatedKm = estimatedKm;
      bookingData.pricing = dispositionPricing;
      // AJOUTÉ
      if (dispositionPackage === "personnalise") {
        bookingData.customHours = customHours;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Convert to URLSearchParams-compatible format
    const urlParams: Record<string, string> = {
      id: bookingData.id,
      type: bookingData.type,
      date: bookingData.date,
      time: bookingData.time,
      pickup: bookingData.pickup,
      name: bookingData.name,
      phone: bookingData.phone,
      email: bookingData.email,
      pricing: JSON.stringify(bookingData.pricing),
    };

    // Add conditional URL parameters
    if (bookingData.dropoff) {
      urlParams.dropoff = bookingData.dropoff;
    }
    if (bookingData.package) {
      urlParams.package = bookingData.package;
    }
    if (bookingData.estimatedKm) {
      urlParams.estimatedKm = bookingData.estimatedKm;
    }
    // AJOUTÉ
    if (bookingData.customHours) {
      urlParams.customHours = bookingData.customHours.toString();
    }

    const params = new URLSearchParams(urlParams);
    router.push(`/payment?${params.toString()}`);

    setLoading(false);
  };

  const getTimeButtonText = () => {
    if (loadingSlots) return "Chargement...";
    if (!date) return "Sélectionnez d'abord une date";
    if (availableSlots.length === 0) return "Pas disponible";
    return time || "Sélectionnez une heure";
  };

  const isTimeButtonDisabled = !date || loadingSlots;
  const canOpenDropdown = date && availableSlots.length > 0 && !loadingSlots;

  const currentPricing =
    bookingType === "disposition" ? dispositionPricing : pricing;

  // Classes d'animation CSS personnalisées
  const getPricingClasses = () => {
    const baseClasses =
      "bg-primary/10 rounded-2xl p-6 border border-primary/20 transition-all duration-500 ease-out";

    switch (pricingAnimation) {
      case "animate-in":
        return `${baseClasses} transform translate-y-4 opacity-0 animate-[slideInUp_0.5s_ease-out_forwards]`;
      case "animate-out":
        return `${baseClasses} transform translate-y-0 opacity-100 animate-[slideOutDown_0.3s_ease-in_forwards]`;
      case "animate-update":
        return `${baseClasses} transform scale-105 opacity-90`;
      case "animate-success":
        return `${baseClasses} transform scale-100 opacity-100 shadow-lg shadow-primary/20 ring-2 ring-primary/30`;
      case "animate-error":
        return `${baseClasses} transform scale-100 opacity-100 bg-red-500/10 border-red-500/20`;
      default:
        return `${baseClasses} transform scale-100 opacity-100`;
    }
  };

  return (
    <section id="booking" className="section-padding bg-black">
      <style jsx>{`
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOutDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-20px);
            opacity: 0;
          }
        }

        .animate-in {
          animation: slideInUp 0.5s ease-out forwards;
        }

        .animate-out {
          animation: slideOutDown 0.3s ease-in forwards;
        }
      `}</style>

      <div className="container mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <span className="inline-block text-primary font-medium mb-4 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm">
            Réservation en ligne
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Réservez votre <span className="text-primary">service VTC</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choisissez entre un trajet simple ou une mise à disposition selon
            vos besoins.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl relative border border-white/5 fade-in led-glow">
              {/* Sélecteur de type de réservation */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Type de service
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBookingType("simple")}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      bookingType === "simple"
                        ? "border-primary bg-primary/10 text-white shadow-lg shadow-primary/20"
                        : "border-white/20 bg-white/5 text-gray-300 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Route className="h-6 w-6 text-primary" />
                      <span className="font-semibold">Trajet Simple</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Transport d'un point A vers un point B.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType("disposition")}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      bookingType === "disposition"
                        ? "border-primary bg-primary/10 text-white shadow-lg shadow-primary/20"
                        : "border-white/20 bg-white/5 text-gray-300 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Timer className="h-6 w-6 text-primary" />
                      <span className="font-semibold">Mise à Disposition</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Chauffeur à votre disposition avec forfaits horaires tout
                      compris
                    </p>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Forfaits mise à disposition */}
                {bookingType === "disposition" && (
                  <div className="space-y-4 animate-[slideInUp_0.5s_ease-out]">
                    <h3 className="text-lg font-semibold text-white">
                      Choisissez votre forfait
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(dispositionPackages).map(([key, pkg]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setDispositionPackage(key as DispositionPackage)
                          }
                          className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 flex flex-col justify-between ${
                            dispositionPackage === key
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                              : "border-white/20 bg-white/5 hover:border-primary/50"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {key === "confort" && (
                                <Clock className="h-5 w-5 text-primary" />
                              )}
                              {key === "decouverte" && (
                                <Car className="h-5 w-5 text-primary" />
                              )}
                              {key === "prestige" && (
                                <Timer className="h-5 w-5 text-primary" />
                              )}
                              <span className="font-semibold text-white capitalize">
                                {key === "confort"
                                  ? "🕐 Confort"
                                  : key === "decouverte"
                                    ? "🌄 Découverte"
                                    : "🌟 Prestige"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              {pkg.duration}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Jour:{" "}
                              <span className="text-primary font-semibold">
                                {pkg.dayPrice}€
                              </span>
                            </p>
                            <p className="text-sm text-gray-400">
                              Nuit/WE:{" "}
                              <span className="text-primary font-semibold">
                                {pkg.nightPrice}€
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {pkg.includedKm} km inclus
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* AJOUTÉ: Bloc pour le forfait personnalisé */}
                      <div
                        onClick={() => setDispositionPackage("personnalise")}
                        className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 flex flex-col justify-between cursor-pointer ${
                          dispositionPackage === "personnalise"
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                            : "border-white/20 bg-white/5 hover:border-primary/50"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Edit className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-white capitalize">
                              Sur Mesure
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">
                            Choisissez votre durée
                          </p>
                          <div className="relative mt-2">
                            <Input
                              type="number"
                              value={customHours}
                              onChange={(e) =>
                                setCustomHours(
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              onClick={(e) => e.stopPropagation()} // Empêche la sélection du forfait en cliquant sur l'input
                              min="1"
                              className="bg-black/40 border-white/20 text-center pr-12"
                              placeholder="Heures"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                              heures
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">
                            Jour:{" "}
                            <span className="text-primary font-semibold">
                              {customPackageDetails.dayPrice}€
                            </span>
                          </p>
                          <p className="text-sm text-gray-400">
                            Nuit/WE:{" "}
                            <span className="text-primary font-semibold">
                              {customPackageDetails.nightPrice}€
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {customPackageDetails.includedKm} km inclus
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Date <span className="text-blue-500">*</span>
                    </label>
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/10 transition-all duration-300 hover:border-primary/30">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={fr}
                        disabled={(date) =>
                          date < new Date() ||
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className="bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Heure <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative group" ref={dropdownRef}>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <button
                        type="button"
                        onClick={handleTimeDropdownToggle}
                        className={`relative bg-transparent w-full pl-12 pr-4 py-[0.525rem] rounded-2xl border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10 led-glow flex items-center justify-between ${
                          isTimeButtonDisabled
                            ? "text-gray-500 cursor-default"
                            : canOpenDropdown
                              ? "text-white cursor-pointer"
                              : "text-gray-500 cursor-default"
                        }`}
                      >
                        <span className={time ? "text-white" : "text-gray-500"}>
                          {getTimeButtonText()}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-primary transition-transform duration-300 ${
                            isTimeDropdownOpen ? "rotate-180" : ""
                          } ${!canOpenDropdown ? "opacity-50" : ""}`}
                        />
                      </button>

                      {isTimeDropdownOpen && canOpenDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto animate-[slideInUp_0.3s_ease-out]">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleTimeSelect(slot)}
                              className="w-full px-4 py-3 text-left text-white hover:bg-primary/20 transition-all duration-200 hover:translate-x-1 first:rounded-t-2xl last:rounded-b-2xl"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Nom complet <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <User className="h-5 w-5 text-blue-500" />
                      </div>
                      <Input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="relative bg-transparent w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10 led-glow"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Téléphone <span className="text-blue-500">*</span>
                    </label>
                    <PhoneInput
                      id="phone"
                      value={phone}
                      onChange={setPhone}
                      placeholder="Votre numéro de téléphone"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Email <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="relative bg-transparent w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10 led-glow"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Champs spécifiques selon le type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="pickup"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Lieu de{" "}
                      {bookingType === "disposition"
                        ? "prise en charge"
                        : "départ"}{" "}
                      <span className="text-blue-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <MapPin className="h-5 w-5 text-blue-500" />
                      </div>
                      <GooglePlacesInput
                        id="pickup"
                        value={pickup}
                        onChange={handlePickupChange}
                        onAddressSelect={handlePickupSelect}
                        placeholder={`Entrez l'adresse de ${bookingType === "disposition" ? "prise en charge" : "départ"}`}
                      />
                    </div>
                  </div>

                  {bookingType === "simple" ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="dropoff"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Lieu d'arrivée <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                        <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <MapPin className="h-5 w-5 text-blue-500" />
                        </div>
                        <GooglePlacesInput
                          id="dropoff"
                          value={dropoff}
                          onChange={handleDropoffChange}
                          onAddressSelect={handleDropoffSelect}
                          placeholder="Entrez l'adresse d'arrivée"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label
                        htmlFor="estimatedKm"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Kilométrage prévisionnel{" "}
                        <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                        <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <Route className="h-5 w-5 text-blue-500" />
                        </div>
                        <Input
                          type="number"
                          id="estimatedKm"
                          value={estimatedKm}
                          onChange={(e) => setEstimatedKm(e.target.value)}
                          className="relative bg-transparent w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10 led-glow"
                          placeholder="Estimation en km"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Affichage du prix calculé avec animations fluides */}
                {showPricing && (
                  <div className={getPricingClasses()}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {bookingType === "disposition"
                              ? "Forfait sélectionné"
                              : "Estimation du trajet"}
                          </h3>
                          {calculatingPrice ? (
                            <Loader2 className="h-5 w-5 text-primary animate-spin" />
                          ) : pricingAnimation === "animate-success" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                          ) : null}
                        </div>

                        {calculatingPrice ? (
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-700/50 rounded animate-pulse w-2/3"></div>
                            <div className="h-4 bg-gray-700/50 rounded animate-pulse w-1/2"></div>
                          </div>
                        ) : currentPricing ? (
                          <div className="space-y-1 text-sm text-gray-300">
                            {bookingType === "disposition" ? (
                              <>
                                <p className="flex items-center justify-between">
                                  <span>Forfait:</span>
                                  <span className="text-white font-medium capitalize">
                                    {dispositionPackage}
                                  </span>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span>Durée:</span>
                                  <span className="text-white font-medium">
                                    {dispositionPackage === "personnalise"
                                      ? `${customHours} heure(s)`
                                      : dispositionPackages[
                                          dispositionPackage as
                                            | "confort"
                                            | "decouverte"
                                            | "prestige"
                                        ].duration}
                                  </span>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span>Km inclus:</span>
                                  <span className="text-white font-medium">
                                    {currentPricing.includedKm} km
                                  </span>
                                </p>
                                {currentPricing.extraKm > 0 && (
                                  <p className="flex items-center justify-between">
                                    <span>Km supplémentaires:</span>
                                    <span className="text-white font-medium">
                                      {currentPricing.extraKm} km
                                    </span>
                                  </p>
                                )}
                                {currentPricing.pickupFeeDetails && (
                                  <p className="flex items-center justify-between">
                                    <span>Prise en charge hors zone:</span>
                                    <span className="text-white font-medium">
                                      +{currentPricing.pickupFee}€
                                    </span>
                                  </p>
                                )}
                                <hr className="border-white/20 my-3" />
                                <p className="flex items-center justify-between text-base">
                                  <span>Prix total:</span>
                                  <span className="text-white font-bold">
                                    {currentPricing.finalPrice}€
                                  </span>
                                </p>
                                <p className="flex items-center justify-between text-primary font-semibold">
                                  <span>Acompte à payer (30%):</span>
                                  <span className="text-xl">
                                    {Math.round(
                                      currentPricing.finalPrice * 0.3
                                    )}
                                    €
                                  </span>
                                </p>
                                <p className="flex items-center justify-between text-gray-400 text-xs">
                                  <span>Solde le jour J:</span>
                                  <span>
                                    {Math.round(
                                      currentPricing.finalPrice * 0.7
                                    )}
                                    €
                                  </span>
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="flex items-center justify-between">
                                  <span>Distance:</span>
                                  <span className="text-white font-medium">
                                    {currentPricing.distance} km
                                  </span>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span>Durée estimée:</span>
                                  <span className="text-white font-medium">
                                    {currentPricing.duration} min
                                  </span>
                                </p>
                                <p className="flex items-center justify-between">
                                  <span>Mode de calcul:</span>
                                  <span className="text-white font-medium">
                                    {currentPricing.calculationMode === "Maps"
                                      ? "📍 Précis"
                                      : "📍 Estimation"}
                                  </span>
                                </p>
                              </>
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div className="text-right ml-6">
                        {calculatingPrice ? (
                          <div className="text-2xl font-bold text-primary animate-pulse">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                          </div>
                        ) : currentPricing ? (
                          <div className="space-y-2">
                            <div
                              className={`text-3xl font-bold transition-all duration-500 ${
                                pricingAnimation === "animate-success"
                                  ? "text-green-400 scale-110"
                                  : "text-primary"
                              }`}
                            >
                              {bookingType === "disposition"
                                ? `${Math.round(currentPricing.finalPrice * 0.3)}€`
                                : `${currentPricing.pricing.finalPrice}€`}
                            </div>
                            {bookingType === "disposition" && (
                              <div className="text-sm text-gray-400">
                                Acompte 30%
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* Informations mise à disposition */}
                {bookingType === "disposition" && (
                  <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20 animate-[slideInUp_0.6s_ease-out] hover:bg-blue-500/15 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">
                      ℹ️ Informations importantes
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                      <p className="flex items-start gap-2">
                        <span>🌍</span>
                        <span>
                          <strong>Zone de prise en charge :</strong> Gratuite
                          dans un rayon de 30 km autour de Rennes, ajustement
                          automatique du tarif au-delà
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span>🚗</span>
                        <span>
                          <strong>Tarifs km supplémentaires :</strong> Des frais
                          sont appliqués au-delà du forfait inclus
                        </span>
                      </p>

                      <p className="flex items-start gap-2">
                        <span>🕓</span>
                        <span>
                          <strong>Temps supplémentaire :</strong> 50 €/h,
                          comprenant jusqu’à 25 km inclus.
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span>🔒</span>
                        <span>
                          <strong>Acompte :</strong> 30% à la réservation, solde
                          le jour J
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span>📋</span>
                        <span>
                          <strong>Annulation :</strong> Gratuite jusqu'à 7 jours
                          avant
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Case à cocher conditions d'utilisation */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        onClick={() => setAcceptTerms(!acceptTerms)}
                        className={`w-6 h-6 rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-center ${
                          acceptTerms
                            ? "bg-primary border-primary shadow-lg shadow-primary/30"
                            : "border-white/30 hover:border-primary/50"
                        }`}
                      >
                        {acceptTerms && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm text-gray-300 cursor-pointer leading-relaxed"
                      >
                        J'accepte les{" "}
                        <a
                          href="/conditions-generales"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline transition-colors"
                        >
                          conditions générales d'utilisation
                        </a>{" "}
                        et la{" "}
                        <a
                          href="/politique-confidentialite"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline transition-colors"
                        >
                          politique de confidentialité
                        </a>
                        . <span className="text-primary">*</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        En cochant cette case, vous confirmez avoir lu et
                        accepté nos conditions d'utilisation et notre politique
                        de traitement des données personnelles.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-8">
                  <button
                    type="submit"
                    disabled={loading || !acceptTerms}
                    className="group relative inline-flex items-center justify-center mx-auto transform transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500 group-hover:blur-xl"></div>
                    <span
                      className={`relative flex items-center gap-2 bg-black px-8 py-4 rounded-full text-base font-medium transition-all duration-300 ${
                        !acceptTerms
                          ? "text-gray-500 cursor-not-allowed"
                          : loading
                            ? "text-white group-hover:bg-black/80 animate-pulse"
                            : "text-white group-hover:bg-black/80 hover:shadow-lg hover:shadow-primary/20"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          "Redirection..."
                        </>
                      ) : currentPricing ? (
                        <>
                          {`Payer ${bookingType === "disposition" ? Math.round(currentPricing.finalPrice * 0.3) : currentPricing.pricing.finalPrice}€`}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      ) : (
                        <>
                          "Procéder au paiement"
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
