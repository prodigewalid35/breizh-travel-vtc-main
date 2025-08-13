export const generateClientConfirmationEmail = (bookingData: any) => {
  const { date, time, pickup, dropoff, name } = bookingData;

  const bookingDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0070ff, #0099ff); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Réservation Confirmée</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333;">Bonjour ${name},</h2>
        <p style="color: #666; font-size: 16px;">Votre réservation VTC a été confirmée avec succès !</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0070ff; margin-top: 0;">Détails de votre réservation</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Date :</td>
              <td style="padding: 8px 0; color: #333;">${bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Heure :</td>
              <td style="padding: 8px 0; color: #333;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Départ :</td>
              <td style="padding: 8px 0; color: #333;">${pickup}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Arrivée :</td>
              <td style="padding: 8px 0; color: #333;">${dropoff}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1976d2;">
            <strong>Important :</strong> Votre chauffeur vous contactera 15 minutes avant l'heure prévue.
          </p>
        </div>
        
        <p style="color: #666;">
          Si vous avez des questions ou devez modifier votre réservation, 
          n'hésitez pas à nous contacter au <strong>+33 06 04 18 41 21</strong>.
        </p>
        
        <p style="color: #666;">
          Merci de votre confiance,<br>
          <strong>L'équipe Breizh Travel VTC</strong>
        </p>
      </div>
      
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 14px;">
          Breizh Travel VTC - Service de chauffeur privé premium
        </p>
      </div>
    </div>
  `;
};

export const generateChauffeurNotificationEmail = (bookingData: any) => {
  const { date, time, pickup, dropoff, name, phone, email } = bookingData;

  const bookingDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Nouvelle Réservation</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #333;">Nouvelle course à effectuer</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ff6b35; margin-top: 0;">Informations client</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Nom :</td>
              <td style="padding: 8px 0; color: #333;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Téléphone :</td>
              <td style="padding: 8px 0; color: #333;"><a href="tel:${phone}">${phone}</a></td>
            </tr>
            ${
              email
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Email :</td>
              <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            `
                : ""
            }
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ff6b35; margin-top: 0;">Détails de la course</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Date :</td>
              <td style="padding: 8px 0; color: #333;">${bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Heure :</td>
              <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Départ :</td>
              <td style="padding: 8px 0; color: #333;">${pickup}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Arrivée :</td>
              <td style="padding: 8px 0; color: #333;">${dropoff}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;">
            <strong>Rappel :</strong> Contactez le client 15 minutes avant l'heure prévue.
          </p>
        </div>
      </div>
    </div>
  `;
};
