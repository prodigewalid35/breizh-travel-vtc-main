import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingData, amount = 5000, pricing } = body; // 50€ par défaut

    console.log("📊 Données reçues pour PaymentIntent:", {
      bookingData,
      amount,
      pricing,
    });

    // Déterminer le type de réservation
    const bookingType =
      bookingData.type || (bookingData.package ? "disposition" : "simple");

    // Préparer les métadonnées de base
    const metadata: any = {
      bookingId: bookingData.id,
      type: bookingType,
      date: bookingData.date,
      time: bookingData.time,
      pickup: bookingData.pickup,
      dropoff: bookingData.dropoff || "",
      name: bookingData.name,
      phone: bookingData.phone,
      email: bookingData.email || "",
    };

    // Ajouter les données spécifiques à la mise à disposition
    if (bookingType === "disposition") {
      // Récupérer les données de pricing depuis bookingData.pricing
      const pricingData = bookingData.pricing;

      if (pricingData) {
        console.log(
          "💰 Ajout des données de pricing aux métadonnées:",
          pricingData
        );

        // Ajouter le package et estimatedKm
        metadata.package = pricingData.package || "";
        metadata.estimatedKm = pricingData.estimatedKm?.toString() || "";

        // Ajouter toutes les données de pricing
        metadata.pricing = JSON.stringify(pricingData);
        metadata.basePrice = pricingData.basePrice?.toString() || "";
        metadata.finalPrice = pricingData.finalPrice?.toString() || "";
        metadata.deposit = pricingData.deposit?.toString() || "";
        metadata.balance = pricingData.balance?.toString() || "";
        metadata.includedKm = pricingData.includedKm?.toString() || "";
        metadata.extraKm = pricingData.extraKm?.toString() || "";
        metadata.extraKmPrice = pricingData.extraKmPrice?.toString() || "";
        metadata.extraKmRate = pricingData.extraKmRate?.toString() || "";
        metadata.pickupFee = pricingData.pickupFee?.toString() || "";
        metadata.rateType = pricingData.rateType || "";
        metadata.isSpecialRate =
          pricingData.isSpecialRate?.toString() || "false";
        metadata.withinZone = pricingData.withinZone?.toString() || "true";
        metadata.distanceFromRennes =
          pricingData.distanceFromRennes?.toString() || "";
      }
    } else if (bookingData.pricing) {
      // Pour les trajets simples, ajouter aussi le pricing
      metadata.pricing = JSON.stringify(bookingData.pricing);
      if (bookingData.pricing.distance) {
        metadata.distance = bookingData.pricing.distance.toString();
      }
      if (
        bookingData.pricing.finalPrice ||
        bookingData.pricing.pricing?.finalPrice
      ) {
        metadata.finalPrice = (
          bookingData.pricing.finalPrice ||
          bookingData.pricing.pricing?.finalPrice
        ).toString();
      }
    }

    console.log("📋 Métadonnées à envoyer à Stripe:", metadata);

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // en centimes
      currency: "eur",
      metadata,
      description: `VTC ${bookingData.name} - ${bookingData.date} à ${bookingData.time}`,
    });

    console.log("✅ PaymentIntent créé avec ID:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur création Payment Intent:", error.message);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
