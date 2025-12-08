import { Request, Response } from "express";
import AISummaryDAO from "../dao/aiSummaryDAO";

export class AISummaryController {
  /**
   * Guarda un resumen de IA
   * POST /api/ai-summaries
   */
  async saveSummary(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId, summary, userId, userName } = req.body;

      console.log("Recibiendo resumen para:", {
        meetingId,
        summaryLength: summary?.length,
        userId,
        userName
      });

      // Validación básica
      if (!meetingId || !summary) {
        res.status(400).json({ 
          error: "Se requieren meetingId y summary" 
        });
        return;
      }

      // Guardar en base de datos
      const summaryId = await AISummaryDAO.saveSummary(
        meetingId, 
        summary, 
        userId, 
        userName
      );

      res.status(201).json({
        ok: true,
        message: "Resumen de IA guardado",
        summaryId,
        meetingId,
        userId
      });

    } catch (error: any) {
      console.error("Error en saveSummary:", error);
      res.status(500).json({ 
        error: "Error guardando resumen",
        details: error.message 
      });
    }
  }

  /**
   * Obtiene el último resumen de una reunión
   * GET /api/ai-summaries/:meetingId
   */
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;

      if (!meetingId) {
        res.status(400).json({ error: "meetingId is required" });
        return;
      }

      // Obtener el último resumen
      const summaries = await AISummaryDAO.getAllByMeetingId(meetingId);
      const summary = summaries.length > 0 ? summaries[0] : null;

      if (!summary) {
        res.status(404).json({ 
          ok: false, 
          message: "No hay resumen para esta reunión" 
        });
        return;
      }

      res.json({
        ok: true,
        data: summary
      });

    } catch (error: any) {
      console.error("Error en getSummary:", error);
      res.status(500).json({ 
        error: "Error obteniendo resumen", 
        details: error.message 
      });
    }
  }

  /**
   * Obtiene el resumen de una reunión para un usuario específico
   * GET /api/ai-summaries/:meetingId/user/:userId
   */
  async getUserSummary(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId, userId } = req.params;

      if (!meetingId || !userId) {
        res.status(400).json({ error: "meetingId and userId are required" });
        return;
      }

      const summary = await AISummaryDAO.getByMeetingAndUser(meetingId, userId);

      if (!summary) {
        res.status(404).json({ 
          ok: false, 
          message: "No hay resumen para este usuario en esta reunión" 
        });
        return;
      }

      res.json({
        ok: true,
        data: summary
      });

    } catch (error: any) {
      console.error(" Error en getUserSummary:", error);
      res.status(500).json({ 
        error: "Error obteniendo resumen", 
        details: error.message 
      });
    }
  }

  /**
   * Obtiene todos los resúmenes de una reunión
   * GET /api/ai-summaries/:meetingId/all
   */
  async getAllSummaries(req: Request, res: Response): Promise<void> {
    try {
      const { meetingId } = req.params;

      if (!meetingId) {
        res.status(400).json({ error: "meetingId is required" });
        return;
      }

      const summaries = await AISummaryDAO.getAllByMeetingId(meetingId);

      res.json({
        ok: true,
        count: summaries.length,
        data: summaries
      });

    } catch (error: any) {
      console.error("Error en getAllSummaries:", error);
      res.status(500).json({ 
        error: "Error obteniendo resúmenes", 
        details: error.message 
      });
    }
  }
}