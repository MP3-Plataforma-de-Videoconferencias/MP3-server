import { db } from "../config/firebase";
import { AISummary } from "../models/AISummary";

export class AISummaryDAO {
  private collection = db.collection('ai_summaries');

  /**
   * Guarda un resumen generado por IA
   */
  async saveSummary(meetingId: string, summaryText: string, userId?: string, userName?: string): Promise<string> {
    try {
      const summaryData: AISummary = {
        meetingId,
        summary: summaryText,
        userId: userId || "unknown", 
        generatedAt: new Date(),
        createdAt: new Date()
      };

      const docRef = await this.collection.add(summaryData);
      console.log(`✅ Resumen IA guardado para usuario ${summaryData.userId}`);
      
      return docRef.id;
      
    } catch (error) {
      console.error("❌ Error guardando resumen IA:", error);
      throw error;
    }
  }

  /**
   * Obtiene el resumen de una reunión PARA UN USUARIO ESPECÍFICO
   */
  async getByMeetingAndUser(meetingId: string, userId: string): Promise<AISummary | null> {
    try {
      const snapshot = await this.collection
        .where("meetingId", "==", meetingId)
        .where("userId", "==", userId)
        .orderBy("generatedAt", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as AISummary;
      
    } catch (error) {
      console.error("❌ Error obteniendo resumen:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los resúmenes de una reunión
   */
  async getAllByMeetingId(meetingId: string): Promise<AISummary[]> {
    try {
      const snapshot = await this.collection
        .where("meetingId", "==", meetingId)
        .orderBy("generatedAt", "desc")
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AISummary[];
      
    } catch (error) {
      console.error("❌ Error:", error);
      return [];
    }
  }
}

export default new AISummaryDAO();