"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, Car } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { setupScrollAnimation } from "@/lib/animations";
import GooglePlacesInput from "@/components/ui/google-places-input";
import PhoneInput from "@/components/ui/phone-input";
import { useRouter } from "next/navigation";

export default function BookingSection() {
  const router = useRouter();
  const { toast } = useToast();
  
  // États pour le formulaire
  const [bookingType, setBookingType] = useState("simple");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [estimatedKm, setEstimatedKm] = useState("");
  
  // États pour les calculs
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  useEffect(() => {
    const cleanup = setupScrollAnimation();
    return cleanup;
  }, []);

  // Fonction pour récupérer les créneaux disponibles
  const fetchAvailableSlots = async (date: Date) => {
    try {
      const dateString = date.toISOString().split('T')[0];
      const response = await fetch(`/api/availability?date=${dateString}`);
      const data = await response.json();
      
      if (data.availableSlots) {
        setAvailableSlots(data.availableSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des créneaux:", error);
      setAvailableSlots([]);
    }
  };

  // Gestion de la sélection de date
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    setPricing(null);
    
    if (date) {
      fetchAvailableSlots(date);
    } else {
      setAvailableSlots([]);
    }
  };

  // Calcul du prix pour trajet simple
  const calculateSimplePrice = async () => {
    if (!pickup || !dropoff || !selectedDate || !selectedTime) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setCalculatingPrice(true);
    
    try {
      const response = await fetch("/api/calculate-distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup,
          dropoff,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPricing(data);
        toast({
          title: "Prix calculé",
          description: `Distance: ${data.distance}km - Prix: ${data.pricing.finalPrice}€`,
          variant: "default",
        });
      } else {
        toast({
          title: "Erreur de calcul",
          description: data.error || "Impossible de calculer le prix",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur calcul prix:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du calcul du prix",
        variant: "destructive",
      });
    } finally {
      setCalculatingPrice(false);
    }
  };

  // Calcul du prix pour mise à disposition
  const calculateDispositionPrice = async () => {
    if (!pickup || !selectedPackage || !estimatedKm || !selectedDate || !selectedTime) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setCalculatingPrice(true);
    
    try {
      const response = await fetch("/api/calculate-disposition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: selectedPackage,
          pickup,
          estimatedKm: parseInt(estimatedKm),
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPricing(data);
        toast({
          title: "Prix calculé",
          description: `Forfait ${selectedPackage} - Acompte: ${data.deposit}€`,
          variant: "default",
        });
      } else {
        toast({
          title: "Erreur de calcul",
          description: data.error || "Impossible de calculer le prix",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur calcul disposition:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du calcul du prix",
        variant: "destructive",
      });
    } finally {
      setCalculatingPrice(false);
    }
  };

  // Fonction de réservation
  const handleBooking = async () => {
    // Validation des champs obligatoires
    if (!selectedDate || !selectedTime || !pickup || !name || !phone) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (bookingType === "simple" && !dropoff) {
      toast({
        title: "Destination manquante",
        description: "Veuillez indiquer votre destination",
        variant: "destructive",
      });
      return;
    }

    if (bookingType === "disposition" && (!selectedPackage || !estimatedKm)) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez sélectionner un forfait et indiquer les kilomètres estimés",
        variant: "destructive",
      });
      return;
    }

    if (!pricing) {
      toast({
        title: "Prix non calculé",
        description: "Veuillez d'abord calculer le prix de votre trajet",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Générer un ID unique pour la réservation
      const bookingId = `BTV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Préparer les données de réservation
      const bookingData = {
        id: bookingId,
        type: bookingType,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        pickup,
        dropoff: bookingType === "simple" ? dropoff : "",
        name,
        phone,
        email,
        pricing,
        ...(bookingType === "disposition" && {
          package: selectedPackage,
          estimatedKm: parseInt(estimatedKm),
        }),
      };

      // Déterminer le montant à payer
      let paymentAmount;
      if (bookingType === "disposition") {
        // Pour mise à disposition, on paie l'acompte de 30%
        paymentAmount = Math.round(pricing.deposit * 100); // en centimes
      } else {
        // Pour trajet simple, on paie le prix total
        paymentAmount = Math.round((pricing.pricing?.finalPrice || pricing.finalPrice) * 100); // en centimes
      }

      console.log("📊 Données de réservation:", bookingData);
      console.log("💰 Montant à payer:", paymentAmount, "centimes");

      // Construire l'URL de redirection avec tous les paramètres
      const searchParams = new URLSearchParams({
        id: bookingData.id,
        type: bookingData.type,
        date: bookingData.date,
        time: bookingData.time,
        pickup: bookingData.pickup,
        dropoff: bookingData.dropoff,
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        pricing: JSON.stringify(bookingData.pricing),
        ...(bookingType === "disposition" && {
          package: selectedPackage,
          estimatedKm: estimatedKm,
        }),
      });

      const paymentUrl = `/payment?${searchParams.toString()}`;
      
      console.log("🔗 URL de redirection:", paymentUrl);

      // Redirection vers la page de paiement
      router.push(paymentUrl);

    } catch (error) {
      console.error("❌ Erreur lors de la réservation:", error);
      toast({
        title: "Erreur de réservation",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const packages = [
    {
      id: "confort",
      name: "Confort",
      duration: "1 heure",
      price: "À partir de 55€",
      description: "Parfait pour un rendez-vous ou une course rapide",
      features: ["25 km inclus", "Véhicule premium", "Chauffeur professionnel"],
    },
    {
      id: "decouverte",
      name: "Découverte",
      duration: "Demi-journée (4h)",
      price: "À partir de 195€",
      description: "Idéal pour visiter plusieurs lieux ou événements",
      features: ["100 km inclus", "Flexibilité totale", "Attente incluse"],
    },
    {
      id: "prestige",
      name: "Prestige",
      duration: "Journée complète (8h)",
      price: "À partir de 360€",
      description: "Pour une journée complète en toute sérénité",
      features: ["200 km inclus", "Service premium", "Disponibilité maximale"],
    },
  ];

  return (
    <section id="booking" className="section-padding bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Réservez Votre <span className="text-primary">Transport VTC</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choisissez le service qui correspond à vos besoins et réservez en quelques clics.
            Paiement sécurisé et confirmation immédiate.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5 fade-in">
            <Tabs value={bookingType} onValueChange={setBookingType} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Trajet Simple
                </TabsTrigger>
                <TabsTrigger value="disposition" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Mise à Disposition
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Date <span className="text-primary">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-transparent border-white/10 hover:bg-white/5"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          {selectedDate ? (
                            selectedDate.toLocaleDateString("fr-FR")
                          ) : (
                            <span className="text-gray-500">Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Heure */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Heure <span className="text-primary">*</span>
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      disabled={!selectedDate || availableSlots.length === 0}
                    >
                      <option value="">Sélectionner une heure</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot} className="bg-black">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Départ */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Adresse de départ <span className="text-primary">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <GooglePlacesInput
                        id="pickup"
                        value={pickup}
                        onChange={setPickup}
                        placeholder="Adresse de départ"
                        required
                      />
                    </div>
                  </div>

                  {/* Arrivée */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Adresse d'arrivée <span className="text-primary">*</span>
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
                        onChange={setDropoff}
                        placeholder="Adresse d'arrivée"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bouton calcul prix */}
                <div className="text-center">
                  <Button
                    onClick={calculateSimplePrice}
                    disabled={calculatingPrice || !pickup || !dropoff || !selectedDate || !selectedTime}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                  >
                    {calculatingPrice ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calcul en cours...
                      </>
                    ) : (
                      "Calculer le prix"
                    )}
                  </Button>
                </div>

                {/* Affichage du prix */}
                {pricing && (
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                    <h3 className="text-lg font-semibold mb-4 text-primary">Détails du trajet</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Distance :</span>
                        <span className="text-white ml-2">{pricing.distance} km</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Durée :</span>
                        <span className="text-white ml-2">{pricing.durationText}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tarif :</span>
                        <span className="text-white ml-2">{pricing.pricing.timeCategory}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Prix total :</span>
                        <span className="text-primary font-bold ml-2">{pricing.pricing.finalPrice}€</span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="disposition" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Date <span className="text-primary">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-transparent border-white/10 hover:bg-white/5"
                        >
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          {selectedDate ? (
                            selectedDate.toLocaleDateString("fr-FR")
                          ) : (
                            <span className="text-gray-500">Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Heure */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Heure <span className="text-primary">*</span>
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      disabled={!selectedDate || availableSlots.length === 0}
                    >
                      <option value="">Sélectionner une heure</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot} className="bg-black">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Forfaits */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">
                    Choisissez votre forfait <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedPackage === pkg.id
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        <div className="text-center">
                          <h3 className="font-semibold text-white">{pkg.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{pkg.duration}</p>
                          <p className="text-primary font-bold">{pkg.price}</p>
                          <p className="text-xs text-gray-500 mt-2">{pkg.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Point de prise en charge */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Point de prise en charge <span className="text-primary">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <GooglePlacesInput
                        id="pickup-disposition"
                        value={pickup}
                        onChange={setPickup}
                        placeholder="Point de prise en charge"
                        required
                      />
                    </div>
                  </div>

                  {/* Kilomètres estimés */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Kilomètres estimés <span className="text-primary">*</span>
                    </label>
                    <input
                      type="number"
                      value={estimatedKm}
                      onChange={(e) => setEstimatedKm(e.target.value)}
                      className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      placeholder="Ex: 50"
                      min="1"
                      max="500"
                    />
                  </div>
                </div>

                {/* Bouton calcul prix */}
                <div className="text-center">
                  <Button
                    onClick={calculateDispositionPrice}
                    disabled={calculatingPrice || !pickup || !selectedPackage || !estimatedKm || !selectedDate || !selectedTime}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                  >
                    {calculatingPrice ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Calcul en cours...
                      </>
                    ) : (
                      "Calculer le prix"
                    )}
                  </Button>
                </div>

                {/* Affichage du prix */}
                {pricing && (
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                    <h3 className="text-lg font-semibold mb-4 text-primary">Détails du forfait</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Forfait :</span>
                        <span className="text-white ml-2 capitalize">{pricing.package}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Durée :</span>
                        <span className="text-white ml-2">{pricing.packageDetails.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Km inclus :</span>
                        <span className="text-white ml-2">{pricing.includedKm} km</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Km supplémentaires :</span>
                        <span className="text-white ml-2">{pricing.extraKm} km</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Prix total :</span>
                        <span className="text-white ml-2">{pricing.finalPrice}€</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Acompte (30%) :</span>
                        <span className="text-primary font-bold ml-2">{pricing.deposit}€</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-yellow-400 text-sm">
                        <strong>Solde à régler le jour J :</strong> {pricing.balance}€
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Informations client */}
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-semibold">Vos informations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Nom complet <span className="text-primary">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                    <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="relative bg-transparent w-full pl-12 pr-4 py-3 rounded-2xl text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10"
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Téléphone <span className="text-primary">*</span>
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email (optionnel)
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
                  <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative bg-transparent w-full pl-12 pr-4 py-3 rounded-2xl text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Bouton de réservation */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleBooking}
                disabled={loading || !pricing}
                className="group relative inline-flex items-center justify-center"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <span className="relative flex items-center gap-2 bg-black px-8 py-4 rounded-full text-base font-medium text-white transition-colors group-hover:bg-black/80">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Procéder au paiement
                      {pricing && (
                        <span className="ml-2 text-primary font-bold">
                          {bookingType === "disposition" ? `${pricing.deposit}€` : `${pricing.pricing?.finalPrice || pricing.finalPrice}€`}
                        </span>
                      )}
                    </>
                  )}
                </span>
              </Button>
            </div>

            {/* Informations légales */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                En procédant au paiement, vous acceptez nos{" "}
                <a href="/conditions-generales" className="text-primary hover:underline">
                  conditions générales
                </a>{" "}
                et notre{" "}
                <a href="/politique-confidentialite" className="text-primary hover:underline">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}