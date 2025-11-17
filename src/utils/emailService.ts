import sgMail from "@sendgrid/mail";

/**
 * Initialize SendGrid with API key from environment.
 */
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * @param email - User's email address
 */
export const sendchangedEmail = async (
  email: string,
): Promise<void> => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not set. Welcome email not sent.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #66eac5ff 0%, #4ba25fff 100%); color: white; text-align: center; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
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
              <a 
                href="${process.env.FRONTEND_URL}/reset-password?token=" 
                style="display:inline-block; background:#28a745; color:white; text-decoration:none; padding:12px 30px; border-radius:5px; font-weight:bold; margin:20px 0;"
                >
                Cambiar mi contraseña
               </a>
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
      subject: "TeamCall",
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
