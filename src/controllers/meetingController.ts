import { Request, Response } from "express";
import { nanoid } from "nanoid";

export class MeetingController {

  /**
   * Creates a new meeting with a unique ID 
   * @param req Request
   * @param res Response
   */
  async createMeeting(req: Request, res: Response): Promise<void> {
    try {
     
      const rawId = nanoid(9); 
      const formattedId = rawId.match(/.{1,3}/g)?.join("-") || rawId; // "A1b-2C3-d4E"
      
      console.log(`Meeting created: ${formattedId} at ${new Date().toISOString()}`);
      
      res.status(201).json({
        ok: true,
        meetingId: formattedId,
        createdAt: new Date().toISOString(),
        message: "Meeting created"
      });
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ error: "Error creating meeting" });
    }
  }

  /**
   * Get meeting placeholder info
   * @param req Request
   * @param res Response
   */
  async getMeeting(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    res.json({
      ok: true,
      meetingId: id,
      message: "Meeting exists",
      createdAt: null
    });
  }
}
