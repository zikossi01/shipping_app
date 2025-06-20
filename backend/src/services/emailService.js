const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");

// Email templates
const emailTemplates = {
  emailVerification: {
    subject: "Vérifiez votre compte TransportConnect",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚛 TransportConnect</h1>
            <h2>Bienvenue ${data.name} !</h2>
          </div>
          <div class="content">
            <p>Merci de vous être inscrit sur TransportConnect, la plateforme française de logistique collaborative.</p>
            
            <p>Pour activer votre compte et commencer à utiliser nos services, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <center>
              <a href="${data.verifyURL}" class="button">Vérifier mon compte</a>
            </center>
            
            <p>Ce lien de vérification expirera dans 10 minutes.</p>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez cette URL dans votre navigateur :</p>
            <p><a href="${data.verifyURL}">${data.verifyURL}</a></p>
            
            <p>Si vous n'avez pas créé de compte sur TransportConnect, vous pouvez ignorer cet email.</p>
            
            <p>À bientôt sur TransportConnect !<br>L'équipe TransportConnect</p>
          </div>
          <div class="footer">
            <p>TransportConnect - La logistique collaborative en France</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  passwordReset: {
    subject: "Réinitialisation de votre mot de passe TransportConnect",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Réinitialisation de mot de passe</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.name},</p>
            
            <p>Vous avez demandé la réinitialisation de votre mot de passe TransportConnect.</p>
            
            <p>Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :</p>
            
            <center>
              <a href="${data.resetURL}" class="button">Réinitialiser mon mot de passe</a>
            </center>
            
            <div class="warning">
              <strong>⚠️ Important :</strong> Ce lien expirera dans 10 minutes pour votre sécurité.
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez cette URL dans votre navigateur :</p>
            <p><a href="${data.resetURL}">${data.resetURL}</a></p>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.</p>
            
            <p>Pour votre sécurité, nous vous recommandons de :</p>
            <ul>
              <li>Choisir un mot de passe fort et unique</li>
              <li>Ne jamais partager vos identifiants</li>
              <li>Vous déconnecter des appareils partagés</li>
            </ul>
            
            <p>L'équipe TransportConnect</p>
          </div>
          <div class="footer">
            <p>TransportConnect - Sécurité et confiance</p>
            <p>Si vous avez des questions, contactez notre support : support@transportconnect.fr</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  requestAccepted: {
    subject: "Votre demande de transport a été acceptée !",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Demande acceptée !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.shipperName},</p>
            
            <p>Excellente nouvelle ! Votre demande de transport a été acceptée par <strong>${data.driverName}</strong>.</p>
            
            <div class="info-box">
              <h3>📦 Détails de votre transport :</h3>
              <p><strong>Trajet :</strong> ${data.route}</p>
              <p><strong>Date de départ :</strong> ${data.departureDate}</p>
              <p><strong>Conducteur :</strong> ${data.driverName} (${data.driverRating}⭐)</p>
              <p><strong>Prix convenu :</strong> ${data.price}€</p>
            </div>
            
            <p>Vous pouvez maintenant :</p>
            <ul>
              <li>💬 Discuter avec le conducteur via la messagerie</li>
              <li>📍 Partager les détails de ramassage</li>
              <li>📞 Contacter le conducteur : ${data.driverPhone}</li>
            </ul>
            
            <center>
              <a href="${data.viewRequestURL}" class="button">Voir ma demande</a>
            </center>
            
            <p><strong>Prochaines étapes :</strong></p>
            <ol>
              <li>Le conducteur vous contactera pour coordonner le ramassage</li>
              <li>Préparez votre colis selon les instructions</li>
              <li>Soyez disponible aux créneaux convenus</li>
            </ol>
            
            <p>Merci de faire confiance à TransportConnect !</p>
            
            <p>L'équipe TransportConnect</p>
          </div>
          <div class="footer">
            <p>TransportConnect - Votre transport, notre priorité</p>
            <p>Besoin d'aide ? Contactez-nous : support@transportconnect.fr</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  deliveryCompleted: {
    subject: "Transport terminé avec succès !",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .success-box { background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Transport terminé !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.userName},</p>
            
            <div class="success-box">
              <h3>✅ Votre transport a été livré avec succès !</h3>
              <p><strong>Livré le :</strong> ${data.deliveryDate}</p>
              <p><strong>Trajet :</strong> ${data.route}</p>
            </div>
            
            <p>Nous espérons que tout s'est bien passé. Votre avis nous intéresse !</p>
            
            <center>
              <a href="${data.reviewURL}" class="button">Laisser un avis</a>
            </center>
            
            <p>En évaluant votre expérience, vous aidez notre communauté à s'améliorer et guidez les futurs utilisateurs dans leurs choix.</p>
            
            <p><strong>Rappel :</strong> Le paiement sera traité automatiquement selon le mode choisi.</p>
            
            <p>Merci d'avoir choisi TransportConnect pour votre transport !</p>
            
            <p>L'équipe TransportConnect</p>
          </div>
          <div class="footer">
            <p>TransportConnect - Transport réussi, mission accomplie</p>
            <p>Votre prochaine expédition ? <a href="${data.platformURL}">Créez une nouvelle demande</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  newRequestReceived: {
    subject: "Nouvelle demande de transport pour votre trajet",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f97316; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .request-box { background: #fff7ed; border: 1px solid #f97316; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Nouvelle demande !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.driverName},</p>
            
            <p>Vous avez reçu une nouvelle demande de transport pour votre trajet !</p>
            
            <div class="request-box">
              <h3>📋 Détails de la demande :</h3>
              <p><strong>Expéditeur :</strong> ${data.shipperName} (${data.shipperRating}⭐)</p>
              <p><strong>Colis :</strong> ${data.packageDescription}</p>
              <p><strong>Poids :</strong> ${data.packageWeight} kg</p>
              <p><strong>Prix proposé :</strong> ${data.offeredPrice}€</p>
              <p><strong>Ramassage :</strong> ${data.pickupAddress}</p>
              <p><strong>Livraison :</strong> ${data.deliveryAddress}</p>
            </div>
            
            <p>Cette demande correspond parfaitement à votre trajet ${data.route} prévu le ${data.tripDate}.</p>
            
            <center>
              <a href="${data.viewRequestURL}" class="button">Voir la demande</a>
            </center>
            
            <p><strong>Actions disponibles :</strong></p>
            <ul>
              <li>✅ Accepter la demande</li>
              <li>💬 Discuter avec l'expéditeur</li>
              <li>💰 Négocier le prix</li>
              <li>❌ Refuser poliment</li>
            </ul>
            
            <p><em>Répondez rapidement pour ne pas manquer cette opportunité !</em></p>
            
            <p>Bonne route !<br>L'équipe TransportConnect</p>
          </div>
          <div class="footer">
            <p>TransportConnect - Optimisez vos trajets, augmentez vos revenus</p>
            <p>Gérez toutes vos demandes sur : <a href="${data.dashboardURL}">votre tableau de bord</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    let htmlContent;
    let subject = options.subject;

    // Use template if specified
    if (options.template && emailTemplates[options.template]) {
      const template = emailTemplates[options.template];
      htmlContent = template.getHtml(options.data);

      if (!subject) {
        subject = template.subject;
      }
    } else {
      // Use provided HTML or plain text
      htmlContent =
        options.html ||
        `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0ea5e9;">TransportConnect</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            ${options.message || options.text || ""}
          </div>
          <div style="margin-top: 20px; font-size: 14px; color: #666;">
            <p>TransportConnect - La logistique collaborative</p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: `"TransportConnect" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: subject,
      html: htmlContent,
      // Add plain text version
      text: options.text || "Veuillez consulter la version HTML de cet email.",
    };

    // Add attachments if provided
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("📧 Email sent successfully:", {
      to: options.email,
      subject: subject,
      messageId: info.messageId,
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (emails) => {
  const results = [];

  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({
        email: email.email,
        success: true,
        messageId: result.messageId,
      });
    } catch (error) {
      results.push({
        email: email.email,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return false;
  }
};

// Send welcome email to new users
const sendWelcomeEmail = async (user) => {
  const roleMessages = {
    driver: "Commencez à publier vos trajets et optimisez vos revenus !",
    shipper: "Trouvez le transporteur idéal pour vos marchandises !",
    admin: "Bienvenue dans l'interface d'administration !",
  };

  return sendEmail({
    email: user.email,
    subject: `Bienvenue sur TransportConnect, ${user.firstName} !`,
    template: "welcome",
    data: {
      name: user.firstName,
      role: user.role,
      message: roleMessages[user.role],
      loginURL: `${process.env.FRONTEND_URL}/auth`,
    },
  });
};

// Send notification emails
const sendNotificationEmail = async (userId, type, data) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.preferences.notifications.email) {
      return false;
    }

    const templates = {
      request_accepted: "requestAccepted",
      request_rejected: "requestRejected",
      delivery_completed: "deliveryCompleted",
      new_request: "newRequestReceived",
      payment_received: "paymentReceived",
    };

    const template = templates[type];

    if (template) {
      return sendEmail({
        email: user.email,
        template: template,
        data: {
          ...data,
          userName: user.firstName,
        },
      });
    }

    return false;
  } catch (error) {
    console.error("Notification email error:", error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  testEmailConfig,
  sendWelcomeEmail,
  sendNotificationEmail,
  emailTemplates,
};
