import { Request, Response } from "express";
import { nanoid } from "nanoid";
import MeetingDao from "../dao/meetingDAO";
import { InformationMeetings } from "../models/InformationMeetings";

export class MeetingController {

  async createMeeting(req: Request, res: Response): Promise<void> {
    try {
      
      const rawId = nanoid(9);
      const formattedId = rawId.match(/.{1,3}/g)?.join("-") || rawId;

      const createdBy = req.body.createdBy || "unknown_user";
      
      const meetingData: InformationMeetings = {
        idMeeting: formattedId,
        createdAt: new Date(),
        createdBy,
        finishedAt: null,
      };

      await MeetingDao.create(meetingData);

      res.status(201).json({
        ok: true,
        meetingId: formattedId,
        createdAt: meetingData.createdAt,
        finishedAt: meetingData.finishedAt,
        message: "Meeting created"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating meeting" });
    }
  }

  async getMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const meeting = await MeetingDao.getById(id);

      if (!meeting) {
        res.status(404).json({ ok: false });
        return;
      }

      res.json({ ok: true, meeting });

    } catch {
      res.status(500).json({ error: "Error getting meeting" });
    }
  }

  async updateMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await MeetingDao.update(id, req.body);

      if (!updated) {
        res.status(404).json({ ok: false });
        return;
      }

      res.json({ ok: true });

    } catch {
      res.status(500).json({ error: "Error updating meeting" });
    }
  }

  async deleteMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await MeetingDao.delete(id);

      if (!deleted) {
        res.status(404).json({ ok: false });
        return;
      }

      res.json({ ok: true });

    } catch {
      res.status(500).json({ error: "Error deleting meeting" });
    }
  }

  async finishMeeting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const updated = await MeetingDao.update(id, {
        finishedAt: new Date()
      });

      if (!updated) {
        res.status(404).json({ ok: false });
        return;
      }

      res.json({ ok: true });

    } catch {
      res.status(500).json({ error: "Error finishing meeting" });
    }
  }

}
