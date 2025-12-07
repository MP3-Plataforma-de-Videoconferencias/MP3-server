import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendMeetingSummaryEmail = async (
  email: string,
  meetingId: string,
  participants: { name: string; email: string }[]
): Promise<void> => {
  try {
    if (!process.env.SENDGRID_API_KEY) return;

    const summaryText = `
Código de reunión
Reunion: ${meetingId}
Total de participantes: ${participants.length}

Lista de participantes:
${participants.map(p => `- ${p.name} (${p.email})`).join("\n")}
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Código de reunión: ${meetingId}</h2>
        <p>Total de participantes: ${participants.length}</p>
        <ul>
          ${participants.map(p => `<li>${p.name} (${p.email})</li>`).join("")}
        </ul>
        <p>Gracias por usar TeamCall.</p>
      </div>
    `;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || "teamcall.com@gmail.com",
      subject: `Informacion de la reunion`,
      text: summaryText,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Meeting summary email sent to ${email}`);
  } catch (error) {
    console.error("Error sending meeting summary email:", error);
  }
};
