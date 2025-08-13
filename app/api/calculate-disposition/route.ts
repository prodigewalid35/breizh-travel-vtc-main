import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Tarifs des forfaits
const packages = {
  confort: {
    duration: "1 heure",
    dayPrice: 55,
    nightPrice: 70,
    includedKm: 25,
    kmRate: 2.2,
  },
  decouverte: {
    duration: "Demi-journée (4h)",
    dayPrice: 195,
    nightPrice: 245,
    includedKm: 100,
    kmRate: 1.95,
  },
  prestige: {
    duration: "Journée complète (8h)",
    dayPrice: 360,
    nightPrice: 450,
    includedKm: 200,
    kmRate: 1.8,
  },
};

// Fonction pour calculer la distance et le temps depuis Rennes
async function calculateDistanceAndTimeFromRennes(pickup: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return { distance: 0, duration: 0, withinZone: true };
  }

  try {
    const response = await fetch(
      "https://maps.googleapis.com/maps/api/distancematrix/json?" +
        new URLSearchParams({
          origins: "Rennes, France",
          destinations: pickup,
          units: "metric",
          key: apiKey,
          language: "fr",
        })
    );

    const data = await response.json();

    if (data.status === "OK" && data.rows[0]?.elements[0]?.status === "OK") {
      const distanceKm = Math.round(
        data.rows[0].elements[0].distance.value / 1000
      );
      const durationMinutes = Math.round(
        data.rows[0].elements[0].duration.value / 60
      );
      return {
        distance: distanceKm,
        duration: durationMinutes,
        withinZone: distanceKm <= 30,
      };
    }
  } catch (error) {
    console.error("Erreur calcul distance depuis Rennes:", error);
  }

  return { distance: 0, duration: 0, withinZone: true };
}

// Fonction pour déterminer si c'est un tarif nuit/weekend
function isNightOrWeekend(time: string, date: string) {
  const hour = parseInt(time.split(":")[0]);
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();

  // Nuit : 19h-7h
  const isNight = hour >= 19 || hour < 7;
  // Weekend : samedi (6) et dimanche (0)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return isNight || isWeekend;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { package: packageType, pickup, estimatedKm, time, date } = body;

    console.log("📊 Calcul mise à disposition:", {
      packageType,
      pickup,
      estimatedKm,
      time,
      date,
    });

    // Validation des paramètres
    if (!packageType || !pickup || !estimatedKm || !time || !date) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (!packages[packageType as keyof typeof packages]) {
      return NextResponse.json({ error: "Forfait invalide" }, { status: 400 });
    }

    const selectedPackage = packages[packageType as keyof typeof packages];
    const estimatedKmNum = parseInt(estimatedKm);

    // Déterminer le tarif (jour/nuit/weekend)
    const isSpecialRate = isNightOrWeekend(time, date);
    const basePrice = isSpecialRate
      ? selectedPackage.nightPrice
      : selectedPackage.dayPrice;

    // Calculer les km supplémentaires
    const extraKm = Math.max(0, estimatedKmNum - selectedPackage.includedKm);
    const extraKmPrice = extraKm * selectedPackage.kmRate; // Tarif km selon forfait

    // Calculer la distance et temps depuis Rennes pour prise en charge
    const {
      distance: distanceFromRennes,
      duration: durationMinutes,
      withinZone,
    } = await calculateDistanceAndTimeFromRennes(pickup);

    // Frais de prise en charge hors zone (>30 km de Rennes)
    let pickupFee = 0;
    let pickupFeeDetails = null;
    if (!withinZone && distanceFromRennes > 30) {
      // Temps aller-retour en heures (x2 pour A/R)
      const roundTripHours = (durationMinutes * 2) / 60;
      const hourlyRate = 45; // 45€/heure pour prise en charge
      pickupFee = roundTripHours * hourlyRate;

      pickupFeeDetails = {
        distance: distanceFromRennes,
        oneWayDuration: durationMinutes,
        roundTripDuration: durationMinutes * 2,
        roundTripHours: Math.round(roundTripHours * 100) / 100,
        hourlyRate,
        fee: Math.round(pickupFee * 100) / 100,
        message: `Prise en charge hors zone : ${Math.round(roundTripHours * 100) / 100}h A/R × 45€ = ${Math.round(pickupFee * 100) / 100}€`,
      };
    }

    // Prix final
    const finalPrice =
      Math.round((basePrice + extraKmPrice + pickupFee) * 100) / 100;

    const responsePayload = {
      success: true,
      package: packageType,
      packageDetails: selectedPackage,
      basePrice,
      estimatedKm: estimatedKmNum,
      includedKm: selectedPackage.includedKm,
      extraKm,
      extraKmPrice: Math.round(extraKmPrice * 100) / 100,
      extraKmRate: selectedPackage.kmRate,
      distanceFromRennes,
      durationFromRennes: durationMinutes,
      withinZone,
      pickupFee: Math.round(pickupFee * 100) / 100,
      pickupFeeDetails,
      isSpecialRate,
      rateType: isSpecialRate ? "Nuit/Weekend/Férié" : "Jour (7h-19h, lun-ven)",
      finalPrice,
      deposit: Math.round(finalPrice * 0.3 * 100) / 100, // Acompte 30%
      balance: Math.round(finalPrice * 0.7 * 100) / 100, // Solde 70%
    };

    console.log("✅ Calcul disposition terminé:", responsePayload);
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("❌ Erreur calcul disposition:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du calcul",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
