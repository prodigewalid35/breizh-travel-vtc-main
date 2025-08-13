// app/api/places/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      input,
      sessionToken,
      languageCode = "fr",
      includedRegionCodes = ["fr"],
    } = body;

    // Vérification des paramètres requis
    if (!input) {
      return NextResponse.json(
        { error: "Le paramètre input est requis" },
        { status: 400 }
      );
    }

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Le paramètre sessionToken est requis" },
        { status: 400 }
      );
    }

    // Récupération de la clé API depuis les variables d'environnement
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY n'est pas définie");
      return NextResponse.json(
        { error: "Configuration API manquante" },
        { status: 500 }
      );
    }

    // Appel à l'API Google Places
    const response = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
        },
        body: JSON.stringify({
          input,
          sessionToken,
          languageCode,
          includedRegionCodes,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erreur API Google Places:", response.status, errorData);
      return NextResponse.json(
        { error: "Erreur lors de l'appel à l'API Google Places" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur dans l'API route places:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
