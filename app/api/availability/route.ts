import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// Fonction pour créer un JWT signé avec la clé privée
function createJWTWithPrivateKey() {
  const payload = {
    iss: process.env.GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey) {
    throw new Error("GOOGLE_PRIVATE_KEY manquante ou invalide");
  }

  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    header: { alg: "RS256", typ: "JWT" },
  });
}

// Obtenir un token d'accès OAuth 2.0
async function getAccessToken() {
  const jwt = createJWTWithPrivateKey();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Échec récupération token Google: ${errorData}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Récupérer les événements du calendrier
async function getCalendarEvents(date: string) {
  const accessToken = await getAccessToken();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const calendarId = process.env.GOOGLE_CALENDAR_ID!;
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?` +
    new URLSearchParams({
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
    });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API Google Calendar: ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Calculer les créneaux horaires disponibles
function calculateAvailableSlots(date: string, events: any[]) {
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();

  let workingHours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
  ];

  if (dayOfWeek === 0 || dayOfWeek === 6) {
  }

  const occupiedSlots = new Set<string>();

  events.forEach((event: any) => {
    if (event.start?.dateTime && event.end?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);

      const current = new Date(start);
      current.setMinutes(0, 0, 0); // arrondi à l’heure

      while (current < end) {
        const timeSlot = current.toTimeString().substring(0, 5);
        occupiedSlots.add(timeSlot);
        current.setHours(current.getHours() + 1);
      }
    }
  });

  const availableSlots = workingHours.filter(
    (slot) => !occupiedSlots.has(slot)
  );

  return {
    availableSlots,
    mode: "google_calendar_real",
  };
}

// API route GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: 'Le paramètre "date" est requis', availableSlots: [] },
        { status: 400 }
      );
    }

    const isGoogleConfigured = !!(
      process.env.GOOGLE_CALENDAR_ID &&
      process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_CALENDAR_ID !==
        "your_calendar_id@group.calendar.google.com"
    );

    if (!isGoogleConfigured) {
      return NextResponse.json(
        {
          error: "Google Calendar non configuré",
          availableSlots: [],
          message: "Veuillez configurer vos identifiants Google Calendar",
        },
        { status: 500 }
      );
    }

    const events = await getCalendarEvents(date);
    const result = calculateAvailableSlots(date, events);

    return NextResponse.json({
      availableSlots: result.availableSlots,
      totalFound: result.availableSlots.length,
      date,
      mode: result.mode,
      googleCalendarActive: true,
    });
  } catch (error: any) {
    console.error("❌ Erreur dans availability API:", error);

    return NextResponse.json(
      {
        error: "Échec de la récupération de la disponibilité",
        availableSlots: [],
        debug: {
          type: error.constructor.name,
          message: error.message,
        },
      },
      { status: 502 }
    );
  }
}
