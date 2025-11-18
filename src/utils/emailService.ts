import sgMail from "@sendgrid/mail";

/**
 * Initialize SendGrid with API key from environment.
 */
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Envía un correo para restablecer la contraseña con el token incluido en el enlace
 * @param email - dirección de correo del usuario
 * @param token - token JWT generado para recuperación de contraseña
 */
export const sendchangedEmail = async (
  email: string,
  token: string
): Promise<void> => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not set. Recovery email not sent.");
      return;
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #090d0cff 0%, #abcbb3ff 100%); color: white; text-align: center; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #9fd2abff; color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenid@ a TeamCall!</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña</p>
            <p>Para crear una nueva contraseña, haz clic en el botón de abajo:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Cambiar mi contraseña</a>
            </div>
            <p>Si tú no realizaste esta solicitud, puedes ignorar este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || "teamcall.com@gmail.com",
      subject: "Restablecimiento de contraseña - TeamCall",
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
