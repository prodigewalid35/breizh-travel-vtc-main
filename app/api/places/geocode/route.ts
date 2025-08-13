// app/api/places/geocode/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latlng = searchParams.get("latlng");
    const language = searchParams.get("language") || "fr";

    // Vérification des paramètres requis
    if (!latlng) {
      return NextResponse.json(
        { error: "Le paramètre latlng est requis" },
        { status: 400 }
      );
    }

    // Validation du format latlng (latitude,longitude)
    const latlngRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!latlngRegex.test(latlng)) {
      return NextResponse.json(
        { error: "Format latlng invalide. Utilisez: latitude,longitude" },
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

    // Construction de l'URL pour l'API Google Geocoding
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${apiKey}&language=${language}`;

    // Appel à l'API Google Geocoding
    const response = await fetch(geocodingUrl);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erreur API Google Geocoding:", response.status, errorData);
      return NextResponse.json(
        { error: "Erreur lors de l'appel à l'API Google Geocoding" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Erreur Google Geocoding status:", data.status);
      return NextResponse.json(
        { error: `Erreur Google Geocoding: ${data.status}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur dans l'API route geocoding:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
