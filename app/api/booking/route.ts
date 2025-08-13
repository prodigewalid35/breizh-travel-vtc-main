import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

// --- JWT signé pour Google Service Account ---
function createJWTWithPrivateKey() {
  const payload = {
    iss: process.env.GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey) {
    throw new Error("Clé privée manquante ou invalide");
  }

  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    header: { alg: "RS256", typ: "JWT" },
  });
}

// --- Obtenir un token d'accès OAuth2 ---
async function getAccessToken() {
  const jwt = createJWTWithPrivateKey();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Erreur récupération token:", error);
    throw new Error("Échec récupération token Google");
  }

  const data = await response.json();
  return data.access_token;
}

// --- Création événement Google Calendar ---
async function createCalendarEvent(bookingData: any) {
  const accessToken = await getAccessToken();

  const { date, time, pickup, dropoff, name, phone, email } = bookingData;

  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const event = {
    summary: `VTC - ${name}`,
    description: `Client: ${name}\nTéléphone: ${phone}\nDépart: ${pickup}\nArrivée: ${dropoff}`,
    start: { dateTime: start.toISOString(), timeZone: "Europe/Paris" },
    end: { dateTime: end.toISOString(), timeZone: "Europe/Paris" },
    attendees: email ? [{ email }] : [],
  };

  const calendarId = process.env.GOOGLE_CALENDAR_ID!;
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Erreur création événement:", error);
    throw new Error("Échec création événement Google Calendar");
  }

  const created = await response.json();
  return { eventId: created.id };
}

// --- Handler principal POST ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, pickup, dropoff, name, phone, email } = body;

    if (!date || !time || !pickup || !dropoff || !name || !phone) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const bookingData = {
      date,
      time,
      pickup,
      dropoff,
      name,
      phone,
      email,
    };

    const calendar = await createCalendarEvent(bookingData);

    return NextResponse.json({
      success: true,
      calendarIntegration: {
        active: true,
        eventId: calendar.eventId,
      },
      booking: {
        client: name,
        date,
        time,
        pickup,
        dropoff,
      },
    });
  } catch (error: any) {
    console.error("❌ Erreur dans POST:", error.message);
    return NextResponse.json(
      { error: "Erreur serveur", message: error.message },
      { status: 500 }
    );
  }
}
