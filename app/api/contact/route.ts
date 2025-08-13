import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("📧 === NOUVEAU MESSAGE DE CONTACT ===");

  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validation des champs requis
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nom, email et message sont requis" },
        { status: 400 }
      );
    }

    console.log("📝 Nouveau message de:", name, "(", email, ")");
    console.log("📋 Sujet:", subject || "Non spécifié");

    // Initialiser Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("❌ Clé API Resend manquante");
      return NextResponse.json(
        { error: "Configuration email manquante" },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);
    console.log("✅ Resend initialisé avec la clé API");

    // Template email pour l'équipe
    const teamEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); color: #ffffff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">📧 Nouveau Message de Contact</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Breizh Travel VTC</p>
        </div>
        
        <div style="padding: 30px; background: rgba(0,0,0,0.4);">
          <div style="background: rgba(59,130,246,0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(59,130,246,0.2);">
            <h2 style="margin: 0 0 15px 0; color: #3B82F6; font-size: 18px;">👤 Informations du contact</h2>
            <p style="margin: 5px 0;"><strong>Nom :</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${email}" style="color: #3B82F6;">${email}</a></p>
            ${phone ? `<p style="margin: 5px 0;"><strong>Téléphone :</strong> <a href="tel:${phone}" style="color: #3B82F6;">${phone}</a></p>` : ""}
            ${subject ? `<p style="margin: 5px 0;"><strong>Sujet :</strong> ${subject}</p>` : ""}
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #ffffff;">💬 Message</h3>
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 15px; white-space: pre-wrap; line-height: 1.6;">
${message}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border-left: 4px solid #22c55e;">
            <p style="margin: 0; color: #ffffff;"><strong>⏰ Rappel :</strong> Répondre dans les 2 heures pendant les heures d'ouverture.</p>
          </div>
        </div>
        
        <div style="background: rgba(0,0,0,0.8); padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 14px;">
            <strong style="color: #3B82F6;">Breizh Travel VTC</strong> - Système de contact automatique
          </p>
        </div>
      </div>
    `;

    const logoUrl = "https://www.breizhtravelvtc.fr/images/navbar/logo.png"; // Logo clair/blanc qui fonctionne sur tous les fonds

    // Template email de confirmation pour le client
    const clientEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); color: #ffffff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 30px; text-align: center;">
          <div style="margin-bottom: 15px;">
            <img src="${logoUrl}" alt="Breizh Travel VTC Logo" style="width: 150px; height: auto;">
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Message bien reçu !</h1>
        </div>
        
        <div style="padding: 30px; background: rgba(0,0,0,0.4);">
          <p style="font-size: 18px; margin-bottom: 20px;">Bonjour <strong>${name}</strong>,</p>
          
          <p style="margin-bottom: 20px; line-height: 1.6; color: rgba(255,255,255,0.9);">
            Merci pour votre message ! Nous avons bien reçu votre demande et nous vous répondrons dans les plus brefs délais.
          </p>
          
          <div style="background: rgba(59,130,246,0.1); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid rgba(59,130,246,0.2);">
            <h3 style="margin: 0 0 15px 0; color: #3B82F6;">📋 Récapitulatif de votre message</h3>
            ${subject ? `<p style="margin: 5px 0;"><strong>Sujet :</strong> ${subject}</p>` : ""}
            <p style="margin: 5px 0;"><strong>Date d'envoi :</strong> ${new Date().toLocaleDateString(
              "fr-FR",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</p>
          </div>
          
          <div style="background: rgba(34, 197, 94, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p style="margin: 0; color: #ffffff;"><strong>⏰ Temps de réponse :</strong> Nous nous engageons à vous répondre dans un délai de 2 heures maximum pendant nos heures d'ouverture.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px; color: rgba(255,255,255,0.8);">En attendant notre réponse, vous pouvez :</p>
            <a href="tel:+330604184121" style="display: inline-block; background: linear-gradient(45deg, #3B82F6, #2563EB); color: white; text-decoration: none; padding: 12px 24px; border-radius: 25px; margin: 5px; font-weight: 500;">
              📞 Nous appeler : +33 06 04 18 41 21
            </a>
          </div>
        </div>
        
        <div style="background: rgba(0,0,0,0.8); padding: 25px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="margin: 5px 0; color: rgba(255,255,255,0.6); font-size: 14px;">
            <strong style="color: #3B82F6;">Breizh Travel VTC</strong> - Service de chauffeur privé premium
          </p>
          <p style="margin: 5px 0; color: rgba(255,255,255,0.6); font-size: 14px;">
            Confort • Ponctualité • Excellence
          </p>
        </div>
      </div>
    `;

    const results = { team: false, client: false };

    try {
      // Envoi à l'équipe
      if (process.env.CHAUFFEUR_EMAIL) {
        console.log("📧 Envoi email à l'équipe:", process.env.CHAUFFEUR_EMAIL);
        await resend.emails.send({
          from: "Contact VTC <contact@breizhtravelvtc.fr>",
          to: process.env.CHAUFFEUR_EMAIL,
          subject: `📧 Nouveau contact - ${subject || "Message"} - ${name}`,
          html: teamEmailHtml,
        });
        results.team = true;
        console.log("✅ Email équipe envoyé");
      }

      // Envoi de confirmation au client
      console.log("📧 Envoi confirmation au client:", email);
      await resend.emails.send({
        from: "Breizh Travel VTC <contact@breizhtravelvtc.fr>",
        to: email,
        subject: "✅ Message bien reçu - Breizh Travel VTC",
        html: clientEmailHtml,
      });
      results.client = true;
      console.log("✅ Email client envoyé");

      console.log("🎉 Tous les emails envoyés avec succès");

      return NextResponse.json({
        success: true,
        message: "Message envoyé avec succès",
        emailsSent: results,
      });
    } catch (emailError: any) {
      console.error("❌ Erreur envoi emails:", emailError.message);
      return NextResponse.json(
        {
          error: "Erreur lors de l'envoi des emails",
          details: emailError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur dans contact API:", error.message);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}
