import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

// Pour forcer le rendu dynamique côté serveur
export const dynamic = "force-dynamic";

// === Fonctions Google Calendar ===
function createGoogleJWT() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Clé privée ou email Google manquant");
  }

  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    },
    privateKey,
    { algorithm: "RS256" }
  );
}

async function getGoogleAccessToken(): Promise<string | null> {
  try {
    const jwt = createGoogleJWT();
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      console.error("❌ Échec récupération token Google", await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error("❌ Erreur récupération access token Google:", error);
    return null;
  }
}

async function createGoogleCalendarEvent(data: any) {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return { success: false, mode: "token_fail" };

  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) return { success: false, mode: "missing_calendar_id" };

  const start = new Date(`${data.date}T${data.time}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // Durée de 1h

  const event = {
    summary: `VTC - ${data.name}`,
    description: `Client: ${data.name}\nTéléphone: ${data.phone}\nDépart: ${data.pickup}\nArrivée: ${data.dropoff}`,
    start: { dateTime: start.toISOString(), timeZone: "Europe/Paris" },
    end: { dateTime: end.toISOString(), timeZone: "Europe/Paris" },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Erreur Google Calendar API:", err);
    return { success: false, mode: "calendar_api_error", error: err };
  }

  const created = await res.json();
  return {
    success: true,
    mode: "google_calendar",
    eventId: created.id,
    link: created.htmlLink,
  };
}

// === Fonction d'envoi d'e-mails ===
async function sendEmails(data: any) {
  const resend = new Resend(process.env.RESEND_API_KEY!);

  const date = new Date(data.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const logoUrl = "https://www.breizhtravelvtc.fr/images/navbar/logo.png"; // Logo clair/blanc qui fonctionne sur tous les fonds

  // Déterminer le type de réservation et les détails financiers
  const isDisposition = data.type === "disposition" || data.package;
  let financialDetails = "";

  if (isDisposition && data.pricing) {
    const totalPrice = data.pricing.finalPrice || 0;
    const deposit = Math.round(totalPrice * 0.3);
    const balance = totalPrice - deposit;

    financialDetails = `
            <div class="booking-details" style="background: rgba(59,130,246,0.1); border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid rgba(59,130,246,0.2);">
                <div class="details-title" style="font-size: 16px; color: #60a5fa; margin-bottom: 15px; font-weight: 600; display: flex; align-items: center; gap: 10px;">💰 Détails financiers - Mise à disposition</div>
                <div class="detail-row">
                    <span class="detail-label">Forfait :</span>
                    <span class="detail-value" style="text-transform: capitalize;">${data.package || "N/A"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Prix de base :</span>
                    <span class="detail-value">${data.pricing.basePrice}€</span>
                </div>
                ${
                  data.estimatedKm
                    ? `<div class="detail-row">
                    <span class="detail-label">Km prévisionnel :</span>
                    <span class="detail-value">${data.estimatedKm} km</span>
                </div>`
                    : ""
                }
                <div class="detail-row">
                    <span class="detail-label">Km inclus :</span>
                    <span class="detail-value">${data.pricing.includedKm} km</span>
                </div>
                ${
                  data.pricing.extraKm && data.pricing.extraKm > 0
                    ? `<div class="detail-row">
                    <span class="detail-label">Km supplémentaires :</span>
                    <span class="detail-value">${data.pricing.extraKm} km</span>
                </div>`
                    : ""
                }
                ${
                  data.pricing.pickupFee && data.pricing.pickupFee > 0
                    ? `<div class="detail-row">
                    <span class="detail-label">Prise en charge hors zone :</span>
                    <span class="detail-value">+${data.pricing.pickupFee}€</span>
                </div>`
                    : ""
                }
              
                
                <div class="detail-row detail-separator">
                    <span class="detail-label detail-highlight">Prix total :</span>
                    <span class="detail-value detail-highlight">${totalPrice}€</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Acompte reçu :</span>
                    <span class="detail-value detail-success">✅ ${deposit}€</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label detail-warning">Solde à encaisser :</span>
                    <span class="detail-value detail-warning">${balance}€</span>
                </div>
            </div>
            <div class="reminder-note" style="background: rgba(106, 7, 255, 0.15); border-left: 4px solid #6a07ffff; padding: 15px 20px; margin: 20px 0; border-radius: 0 12px 12px 0; font-size: 14px;">
                <p style="margin: 0; color: rgba(255, 255, 255, 1);"><strong>💰 Solde à régler :</strong> ${balance}€ à payer le jour de la prestation</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.8);">• Paiement accepté : espèces, carte bancaire ou virement</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.8);">• Temps supplémentaire : 50 €/h, comprenant jusqu’à 25 km inclus.</p>
            </div>`;
  } else if (!isDisposition && data.pricing) {
    // Pour les trajets simples
    financialDetails = `
            <div class="booking-details" style="background: rgba(255, 255, 255, 1); border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid rgba(59,130,246,0.2);">
                <div class="details-title" style="font-size: 16px; color: #60a5fa; margin-bottom: 15px; font-weight: 600; display: flex; align-items: center; gap: 10px;">💰 Détails financiers - Trajet simple</div>
                <div class="detail-row">
                    <span class="detail-label">Distance :</span>
                    <span class="detail-value">${data.pricing.distance || data.pricing.pricing?.distance || "N/A"} km</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label detail-success">Prix payé :</span>
                    <span class="detail-value detail-success">✅ ${data.pricing.finalPrice || data.pricing.pricing?.finalPrice || "N/A"}€</span>
                </div>
            </div>`;
  }
  // --- TEMPLATE E-MAIL CLIENT (BLEU) ---
  const htmlClient = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de réservation VTC</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a1a1a; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,115,255,0.2); }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); background-color: #3B82F6; padding: 30px 20px; text-align: center; }
        .logo-section { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .header-title { font-size: 26px; font-weight: bold; color: #ffffff; margin: 0; }
        .content { padding: 30px 30px; background-color: rgba(0,0,0,0.6); }
        .greeting { font-size: 18px; color: #ffffff; margin-bottom: 10px; font-weight: 600; }
        .message { font-size: 15px; color: rgba(255,255,255,0.8); margin-bottom: 20px; }
        .booking-details { background: rgba(59,130,246,0.1); border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid rgba(59,130,246,0.2); }
        .details-title { font-size: 16px; color: #3B82F6; margin-bottom: 15px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 500; color: rgba(255,255,255,0.7); min-width: 120px; flex-shrink: 0; }
        .detail-value { color: #ffffff; text-align: right; flex: 1; font-weight: 500; word-break: break-word; margin-left: 20px; }
        .detail-separator { border-top: 2px solid rgba(59,130,246,0.3); margin: 15px 0; padding-top: 15px; }
        .detail-highlight { color: #ffffff; font-weight: 600; font-size: 16px; }
        .detail-success { color: #22c55e; font-weight: 600; }
        .detail-warning { color: #3B82F6; font-weight: 700; font-size: 18px; }
        .important-note { background: rgba(59,130,246,0.15); border-left: 4px solid #3B82F6; padding: 15px 20px; margin: 20px 0; border-radius: 0 12px 12px 0; font-size: 14px; }
        .important-note p { margin: 0; color: #ffffff; font-weight: 500; }
        .contact-info { text-align: center; margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; font-size: 14px; }
        .contact-info p { margin: 5px 0; color: rgba(255,255,255,0.8); }
        .phone-link { color: #60a5fa; text-decoration: none; font-weight: 600; }
        .phone-link:hover { text-decoration: underline; }
        .signature { margin-top: 25px; font-size: 15px; color: rgba(255,255,255,0.8); }
        .signature-name { color: #ffffff; font-weight: 600; }
        .footer { background: rgba(0,0,0,0.8); padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); }
        .footer p { margin: 4px 0; color: rgba(255,255,255,0.6); font-size: 13px; }
        .footer-highlight { color: #3B82F6; font-weight: 600; }
        @media (max-width: 600px) { body { padding: 5px; } .content { padding: 20px 15px; } .header { padding: 25px 15px; } .detail-row { flex-direction: column; gap: 5px; align-items: flex-start; } .detail-value { text-align: left; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-section">
                <img src="${logoUrl}" alt="Breizh Travel VTC Logo" style="width: 300px; height: auto; display: block; margin: 0 auto;">
            </div>
            <h1 class="header-title">Réservation Confirmée</h1>
        </div>
        <div class="content">
            <div class="greeting">Bonjour ${data.name},</div>
            <div class="message">Votre réservation VTC a bien été enregistrée. Voici les détails :</div>
            <div class="booking-details">
                <div class="details-title">📅 Détails de votre réservation</div>
                <div class="detail-row">
                    <span class="detail-label">Date :</span>
                    <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Heure :</span>
                    <span class="detail-value">${data.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Départ :</span>
                    <span class="detail-value">${data.pickup}</span>
                </div>
                ${
                  !isDisposition
                    ? `<div class="detail-row">
                    <span class="detail-label">Arrivée :</span>
                    <span class="detail-value">${data.dropoff}</span>
                </div>`
                    : ""
                }
                <div class="detail-row">
                    <span class="detail-label">Type :</span>
                    <span class="detail-value">${isDisposition ? "Mise à disposition" : "Trajet simple"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">N° de réservation :</span>
                    <span class="detail-value">${data.bookingId}</span>
                </div>
            </div>
            ${financialDetails}
            <div class="important-note"><p><strong>📞 Important :</strong> Votre chauffeur vous contactera 15 minutes avant l'heure prévue.</p></div>
            <div class="contact-info">
                <p>Une question ? Contactez-nous :</p>
                <p><a href="tel:+330604184121" class="phone-link">+33 06 04 18 41 21</a></p>
                <p><a href="mailto:contact@breizhtravelvtc.fr" class="phone-link">contact@breizhtravelvtc.fr</a></p>
            </div>
            <div class="signature">Merci,<br><span class="signature-name">L'équipe Breizh Travel VTC</span></div>
        </div>
        <div class="footer">
            <p><span class="footer-highlight">Breizh Travel VTC</span> - Service de chauffeur privé premium</p>
            <p>Confort • Ponctualité • Excellence</p>
        </div>
    </div>
</body>
</html>`;

  // --- TEMPLATE E-MAIL CHAUFFEUR (ORANGE) ---
  const htmlChauffeur = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle réservation VTC</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #ffffff; background-color: #1a1a1a; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(255,107,53,0.2); }
        .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); background-color: #ff6b35; padding: 30px 20px; text-align: center; }
        .logo-section { display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
        .header-title { font-size: 26px; font-weight: bold; color: #ffffff; margin: 0; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
        .client-details, .booking-details { background: rgba(255,107,53,0.1); border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid rgba(255,107,53,0.2); }
        .details-title { font-size: 16px; color: #ff6b35; margin-bottom: 15px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 500; color: rgba(255,255,255,0.7); min-width: 100px; }
        .detail-value { font-weight: 500; text-align: right; flex: 1; word-break: break-word; }
        .contact-link { color: #ff6b35; text-decoration: none; font-weight: 600; }
        .contact-link:hover { text-decoration: underline; }
        .time-highlight { font-weight: bold; color: #ffae35; }
        .reminder-note { background: rgba(255,193,7,0.15); border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 0 12px 12px 0; font-size: 14px; }
        .reminder-note p { margin: 0; }
        .footer { background: rgba(0,0,0,0.8); padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); }
        .footer p { margin: 5px 0; color: rgba(255,255,255,0.6); font-size: 13px; }
        .footer-highlight { color: #ff6b35; font-weight: 600; }
        @media (max-width: 600px) { body { padding: 5px; } .content { padding: 20px 15px; } .header { padding: 25px 15px; } .detail-row { flex-direction: column; gap: 5px; align-items: flex-start; } .detail-value { text-align: left; } }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1 class="header-title">🚗 Nouvelle Réservation</h1>
        </div>
        <div class="content">
            <div class="greeting">Nouvelle course à effectuer</div>
            <div class="client-details">
                <div class="details-title">👤 Informations client</div>
                <div class="detail-row">
                    <span class="detail-label">Nom :</span>
                    <span class="detail-value">${data.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Téléphone :</span>
                    <span class="detail-value"><a href="tel:${data.phone}" class="contact-link">${data.phone}</a></span>
                </div>
                ${
                  data.email
                    ? `<div class="detail-row">
                    <span class="detail-label">Email :</span>
                    <span class="detail-value"><a href="mailto:${data.email}" class="contact-link">${data.email}</a></span>
                </div>`
                    : ""
                }
            </div>
            <div class="booking-details">
                <div class="details-title">📅 Détails de la course</div>
                <div class="detail-row">
                    <span class="detail-label">Date :</span>
                    <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Heure :</span>
                    <span class="detail-value time-highlight">${data.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${isDisposition ? "Prise en charge :" : "Départ :"}</span>
                    <span class="detail-value">${data.pickup}</span>
                </div>
                ${
                  !isDisposition
                    ? `<div class="detail-row">
                    <span class="detail-label">Arrivée :</span>
                    <span class="detail-value">${data.dropoff}</span>
                </div>`
                    : ""
                }
                <div class="detail-row">
                    <span class="detail-label">Type :</span>
                    <span class="detail-value">${isDisposition ? "Mise à disposition" : "Trajet simple"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">N° de réservation :</span>
                    <span class="detail-value">${data.bookingId}</span>
                </div>
            </div>
            ${financialDetails}
            <div class="reminder-note" style="background: rgba(255,193,7,0.15); border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 0 12px 12px 0; font-size: 14px;">
                <p style="margin: 0;"><strong>⏰ Rappel :</strong> Contactez le client 15 minutes avant l'heure prévue.</p>
                ${isDisposition && data.pricing ? `<p style="margin: 5px 0 0 0;"><strong>💰 Encaissement :</strong> Récupérer ${Math.round(data.pricing.finalPrice * 0.7)}€ le jour de la prestation</p>` : ""}
            </div>
        </div>
        <div class="footer">
            <p><span class="footer-highlight">Breizh Travel VTC</span> - Système de gestion des réservations</p>
        </div>
    </div>
</body>
</html>`;

  const results = { client: false, chauffeur: false };

  try {
    if (data.email) {
      await resend.emails.send({
        from: "Breizh Travel VTC <contact@breizhtravelvtc.fr>",
        to: data.email,
        subject: "✅ Confirmation de votre réservation VTC",
        html: htmlClient,
      });
      results.client = true;
    }

    if (process.env.CHAUFFEUR_EMAIL) {
      await resend.emails.send({
        from: "VTC System <contact@breizhtravelvtc.fr>",
        to: process.env.CHAUFFEUR_EMAIL,
        subject: `💰 Nouvelle course PAYÉE - ${date} à ${data.time}`,
        html: htmlChauffeur,
      });
      results.chauffeur = true;
    }

    return { emailsSent: results.client || results.chauffeur, results };
  } catch (error: any) {
    console.error("❌ Erreur envoi email:", error.message);
    return { emailsSent: false, reason: error.message };
  }
}

// === Route POST principale ===
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "PaymentIntent ID requis" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Paiement non confirmé" },
        { status: 400 }
      );
    }

    // Récupérer toutes les métadonnées du PaymentIntent
    const metadata = paymentIntent.metadata;
    console.log("📋 Métadonnées PaymentIntent:", metadata);

    // Déterminer le type de réservation
    const bookingType =
      metadata.type || (metadata.package ? "disposition" : "trajet");
    console.log("🔍 Type de réservation détecté:", bookingType);

    // Parser les données de pricing si elles existent
    let pricing = null;
    if (metadata.pricing) {
      try {
        pricing = JSON.parse(metadata.pricing);
        console.log("💰 Pricing parsé:", pricing);
      } catch (e) {
        console.error("❌ Erreur parsing pricing:", e);
        // Si le parsing échoue, reconstruire les données depuis les métadonnées individuelles
        if (bookingType === "disposition") {
          pricing = {
            basePrice: parseFloat(metadata.basePrice || "0"),
            finalPrice: parseFloat(metadata.finalPrice || "0"),
            deposit: parseFloat(metadata.deposit || "0"),
            balance: parseFloat(metadata.balance || "0"),
            includedKm: parseInt(metadata.includedKm || "0"),
            extraKm: parseInt(metadata.extraKm || "0"),
            extraKmPrice: parseFloat(metadata.extraKmPrice || "0"),
            pickupFee: parseFloat(metadata.pickupFee || "0"),
            rateType: metadata.rateType || "",
            isSpecialRate: metadata.isSpecialRate === "true",
          };
          console.log("🔧 Pricing reconstruit depuis métadonnées:", pricing);
        }
      }
    } else if (bookingType === "disposition") {
      // Si pas de pricing JSON, essayer de reconstruire depuis les métadonnées individuelles
      pricing = {
        basePrice: parseFloat(metadata.basePrice || "0"),
        finalPrice: parseFloat(metadata.finalPrice || "0"),
        deposit: parseFloat(metadata.deposit || "0"),
        balance: parseFloat(metadata.balance || "0"),
        includedKm: parseInt(metadata.includedKm || "0"),
        extraKm: parseInt(metadata.extraKm || "0"),
        extraKmPrice: parseFloat(metadata.extraKmPrice || "0"),
        pickupFee: parseFloat(metadata.pickupFee || "0"),
        rateType: metadata.rateType || "",
        isSpecialRate: metadata.isSpecialRate === "true",
      };
      console.log("🔧 Pricing créé depuis métadonnées individuelles:", pricing);
    }

    const data = {
      bookingId: paymentIntent.metadata.bookingId, // CORRIGÉ
      type: bookingType,
      package: metadata.package,
      estimatedKm: metadata.estimatedKm ? parseInt(metadata.estimatedKm) : null,
      date: paymentIntent.metadata.date,
      time: paymentIntent.metadata.time,
      pickup: paymentIntent.metadata.pickup,
      dropoff: paymentIntent.metadata.dropoff,
      name: paymentIntent.metadata.name,
      phone: paymentIntent.metadata.phone,
      email: paymentIntent.metadata.email,
      pricing: pricing,
      status: "paid",
      paymentIntentId,
      amount: paymentIntent.amount,
      createdAt: new Date().toISOString(),
    };

    console.log(
      "📊 Données complètes pour email:",
      JSON.stringify(data, null, 2)
    );
    console.log("🔍 Type détecté:", bookingType, "Package:", metadata.package);
    console.log("💰 Pricing disponible:", !!pricing);
    console.log("💰 Pricing détails:", pricing);

    const calendar = await createGoogleCalendarEvent(data);

    const emails = await sendEmails(data);

    return NextResponse.json({
      success: true,
      bookingId: data.bookingId,
      amount: data.amount / 100,
      calendarIntegration: calendar.success,
      emailsSent: emails.emailsSent,
      emailStatus: emails.results,
    });
  } catch (error: any) {
    console.error("❌ Erreur générale:", error.message);
    return NextResponse.json(
      { error: "Erreur serveur", message: error.message },
      { status: 500 }
    );
  }
}
