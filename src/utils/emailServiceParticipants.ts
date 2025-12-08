import sgMail from "@sendgrid/mail";
import { db } from "../config/firebase"; // 👈 NECESARIO para obtener resumen

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendMeetingSummaryEmail = async (
  email: string,
  meetingId: string,
  participants: { name: string; email: string }[]
): Promise<void> => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SENDGRID_API_KEY not set. Meeting summary email not sent.");
      return;
    }

    console.log(`📧 Enviando correo para reunión: ${meetingId}`);
    
    // 1. OBTENER RESUMEN DE IA (SI EXISTE)
    let aiSummary = "";
    try {
      // Obtener TODOS los resúmenes
      const allDocs = await db.collection("ai_summaries").get();
      
      // Filtrar los de esta reunión
      const meetingSummaries = [];
      for (const doc of allDocs.docs) {
        const data = doc.data();
        if (data.meetingId === meetingId && data.summary) {
          meetingSummaries.push({
            data: data,
            createdAt: data.createdAt?.toDate?.() || new Date(0)
          });
        }
      }
      
      // Tomar el más reciente
      if (meetingSummaries.length > 0) {
        meetingSummaries.sort((a, b) => b.createdAt - a.createdAt);
        aiSummary = meetingSummaries[0].data.summary;
        console.log(`✅ Resumen de IA encontrado (${aiSummary.length} caracteres)`);
      } else {
        console.log(`📭 No hay resumen de IA para ${meetingId}`);
      }
      
    } catch (error) {
      console.log("⚠️ Error obteniendo resumen, continuamos sin él");
    }

    // 2. CONSTRUIR CORREO (CON O SIN RESUMEN)
    const summaryText = `
Meeting Summary
Meeting: ${meetingId}
Total participants: ${participants.length}

${aiSummary ? `AI Summary:\n${aiSummary}\n\n` : ''}

Participants list:
${participants.map(p => `- ${p.name} (${p.email})`).join("\n")}
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2>Meeting Summary: ${meetingId}</h2>
        <p>Total participants: ${participants.length}</p>
        
        ${aiSummary ? `
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-top: 0;">🤖 AI-Generated Summary</h3>
          <p style="white-space: pre-wrap;">${aiSummary}</p>
          <small><em>Generated automatically by AI analyzing the chat</em></small>
        </div>
        ` : ''}
        
        <h3>Participants:</h3>
        <ul>
          ${participants.map(p => `<li>${p.name} (${p.email})</li>`).join("")}
        </ul>
        <p>Thank you for using TeamCall.</p>
      </div>
    `;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || "teamcall.com@gmail.com",
      subject: aiSummary ? `🤖 AI Summary - Meeting ${meetingId}` : `Meeting Summary - ${meetingId}`,
      text: summaryText,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`✅ Meeting summary email sent to ${email} ${aiSummary ? 'with AI summary' : ''}`);
    
  } catch (error) {
    console.error("Error sending meeting summary email:", error);
  }
};