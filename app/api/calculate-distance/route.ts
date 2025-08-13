import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Fonction pour calculer la distance entre deux adresses avec Google Maps API uniquement
async function calculateDistance(
  pickup: string,
  dropoff: string,
  date: string,
  time: string
) {
  // ✅ Utilisation de la clé API côté serveur (sans NEXT_PUBLIC)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API Google Maps manquante");
  }

  const dateTimeString = `${date}T${time}:00`;
  const localDate = new Date(dateTimeString);
  const departureTimestamp = Math.floor(
    new Date(
      localDate.toLocaleString("en-US", { timeZone: "Europe/Paris" })
    ).getTime() / 1000
  );

  if (isNaN(departureTimestamp)) {
    throw new Error("Date et heure invalides");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      "https://maps.googleapis.com/maps/api/distancematrix/json?" +
        new URLSearchParams({
          origins: pickup,
          destinations: dropoff,
          units: "metric",
          key: apiKey,
          language: "fr",
          mode: "driving",
          departure_time: departureTimestamp.toString(),
        }),
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "VTC-Booking-App/1.0",
          Accept: "application/json",
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur HTTP Google Maps:", response.status, errorText);
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📍 Réponse Google Maps:", JSON.stringify(data, null, 2));

    if (data.status !== "OK") {
      console.error(
        "Erreur status Google Maps:",
        data.status,
        data.error_message
      );
      throw new Error(
        `Erreur API Google Maps: ${data.status} - ${data.error_message || "Erreur inconnue"}`
      );
    }

    const element = data.rows[0]?.elements[0];

    if (!element) {
      throw new Error("Aucun élément retourné par l'API Google Maps");
    }

    if (element.status !== "OK") {
      console.error("Erreur élément:", element.status);
      let errorMessage = `Erreur pour ce trajet: ${element.status}`;

      switch (element.status) {
        case "NOT_FOUND":
          errorMessage = "Adresse de départ ou d'arrivée introuvable";
          break;
        case "ZERO_RESULTS":
          errorMessage = "Aucun itinéraire trouvé entre ces deux points";
          break;
        case "MAX_ROUTE_LENGTH_EXCEEDED":
          errorMessage = "Distance du trajet trop importante";
          break;
      }

      throw new Error(errorMessage);
    }

    const durationInSeconds =
      element.duration_in_traffic?.value || element.duration.value;
    const normalDurationInSeconds = element.duration?.value;

    const durationText =
      element.duration_in_traffic?.text || element.duration.text;
    const arrivalTimestamp = departureTimestamp + durationInSeconds;
    const arrivalTime = new Date(arrivalTimestamp * 1000).toISOString();

    return {
      distance: Math.round(element.distance.value / 1000),
      duration: Math.round(durationInSeconds / 60),
      normalDuration: Math.round(normalDurationInSeconds / 60),
      durationText,
      arrivalTime,
      success: true,
      mode: "GoogleMaps",
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Calcul du prix basé sur distance et horaire
function calculatePrice(distance: number, time: string) {
  const hour = parseInt(time.split(":")[0]);
  const isNightTime = hour >= 20 || hour < 7;
  const ratePerKm = isNightTime ? 2.5 : 2.0;
  const basePrice = distance * ratePerKm;
  const finalPrice = Math.max(basePrice, 15);

  return {
    distance,
    ratePerKm,
    basePrice: Math.round(basePrice * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    isNightTime,
    timeCategory: isNightTime ? "Nuit (20h-7h)" : "Jour (7h-20h)",
  };
}

// === ROUTE HANDLER ===
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickup, dropoff, time, date } = body;

    console.log("📊 Paramètres reçus:", { pickup, dropoff, time, date });

    // Validation des paramètres
    if (!pickup || !dropoff || !time || !date) {
      return NextResponse.json(
        {
          error: "Tous les champs sont requis",
          details: "Adresses de départ, arrivée, heure et date requises",
        },
        { status: 400 }
      );
    }

    // Validation du format de l'heure
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: "Format d'heure invalide (HH:MM attendu)" },
        { status: 400 }
      );
    }

    // Validation du format de la date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Format de date invalide (YYYY-MM-DD attendu)" },
        { status: 400 }
      );
    }

    // Vérification de la clé API avant de commencer
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("❌ GOOGLE_MAPS_API_KEY non définie");
      return NextResponse.json(
        {
          error: "Configuration manquante",
          details: "Service temporairement indisponible",
        },
        { status: 503 }
      );
    }

    const homeAddress = process.env.VTC_HOME_ADDRESS;
    let finalApproachFee = 0;
    let finalApproachDetails = null;

    // Calcul frais d'approche si adresse de domicile définie
    if (homeAddress) {
      try {
        console.log("📍 Calcul frais d'approche:", homeAddress, "->", pickup);
        const approachCalc = await calculateDistance(
          homeAddress,
          pickup,
          date,
          time
        );

        if (approachCalc.distance > 20) {
          const hour = parseInt(time.split(":")[0]);
          const isNightTime = hour >= 20 || hour < 7;
          const approachRate = isNightTime ? 0.2 : 0.3;
          finalApproachFee = parseFloat(
            (approachCalc.distance * approachRate).toFixed(2)
          );
          finalApproachDetails = {
            distance: approachCalc.distance,
            fee: finalApproachFee,
            message: `Frais d'approche de ${approachCalc.distance} km appliqués.`,
            mode: approachCalc.mode,
          };
        }
      } catch (error) {
        console.error("⚠️ Erreur calcul frais d'approche:", error);
        // On continue sans les frais d'approche en cas d'erreur
      }
    }

    // Calcul du trajet principal
    console.log("📍 Calcul trajet principal:", pickup, "->", dropoff);
    const tripCalc = await calculateDistance(pickup, dropoff, date, time);
    const tripPriceDetails = calculatePrice(tripCalc.distance, time);

    // Supplément embouteillage
    let trafficSurcharge = 0;
    let trafficDetails = null;

    if (
      tripCalc.duration &&
      tripCalc.normalDuration &&
      tripCalc.duration > tripCalc.normalDuration
    ) {
      const delay = tripCalc.duration - tripCalc.normalDuration;
      trafficSurcharge = parseFloat((delay * 0.3).toFixed(2));
      trafficDetails = {
        normalDuration: tripCalc.normalDuration,
        trafficDuration: tripCalc.duration,
        delay,
        surcharge: trafficSurcharge,
        message: `Un supplément de ${trafficSurcharge} € a été appliqué pour ${delay} min d'embouteillage.`,
      };
    }

    const finalTotalPrice = parseFloat(
      (
        tripPriceDetails.finalPrice +
        finalApproachFee +
        trafficSurcharge
      ).toFixed(2)
    );

    // Réponse
    const responsePayload = {
      success: true,
      distance: tripCalc.distance,
      duration: tripCalc.duration,
      durationText: tripCalc.durationText,
      arrivalTime: tripCalc.arrivalTime,
      pricing: {
        ...tripPriceDetails,
        tripPrice: tripPriceDetails.finalPrice,
        approachFee: finalApproachFee,
        trafficSurcharge,
        finalPrice: finalTotalPrice,
      },
      approachDetails: finalApproachDetails,
      trafficDetails,
      calculationMode: tripCalc.mode,
    };

    console.log("✅ Réponse finale:", JSON.stringify(responsePayload, null, 2));
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("❌ Erreur lors du calcul:", error);

    // Gestion des erreurs spécifiques avec plus de détails
    if (error.message.includes("Clé API")) {
      return NextResponse.json(
        {
          error: "Configuration manquante",
          details: "Service temporairement indisponible",
        },
        { status: 503 }
      );
    }

    if (error.message.includes("Date et heure invalides")) {
      return NextResponse.json(
        {
          error: "Paramètres invalides",
          details: "Date ou heure invalide",
        },
        { status: 400 }
      );
    }

    if (
      error.message.includes("Google Maps") ||
      error.message.includes("API")
    ) {
      return NextResponse.json(
        {
          error: "Service externe indisponible",
          details: "Impossible de calculer la distance. Veuillez réessayer.",
          debug:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 503 }
      );
    }

    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Timeout",
          details: "Le calcul a pris trop de temps. Veuillez réessayer.",
        },
        { status: 408 }
      );
    }

    // Gestion des erreurs d'adresses
    if (
      error.message.includes("introuvable") ||
      error.message.includes("NOT_FOUND")
    ) {
      return NextResponse.json(
        {
          error: "Adresse introuvable",
          details: "Vérifiez que les adresses saisies sont correctes",
        },
        { status: 400 }
      );
    }

    if (error.message.includes("ZERO_RESULTS")) {
      return NextResponse.json(
        {
          error: "Itinéraire impossible",
          details: "Aucun itinéraire trouvé entre ces deux points",
        },
        { status: 400 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        error: "Erreur interne",
        details: "Une erreur est survenue lors du calcul. Veuillez réessayer.",
        debug:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
