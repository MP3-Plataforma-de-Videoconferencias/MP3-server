import { Request, Response } from "express";
import { nanoid } from "nanoid";
import MeetingDao from "../dao/meetingDAO";
import { InformationMeetings } from "../models/InformationMeetings";

export class MeetingController {

  /**
   * Creates a new meeting entry.
   * Generates a unique meeting ID (formatted in 3-character groups).
   * Saves the meeting in the database using MeetingDao.
   *
   * @param {Request} req - Express request object containing meeting data
   * @param {Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with created meeting details
   *
   * @example
   * POST /meetings
   * {
   *   "createdBy": "user123"
   * }
   */
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

  /**
   * Retrieves a meeting by ID.
   *
   * @param {Request} req - Express request with meeting ID in params
   * @param {Response} res - Express response object
   * @returns {Promise<void>} Sends meeting data or 404 if not found
   *
   * @example
   * GET /meetings/:id
   */
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

  /**
   * Updates an existing meeting with new data.
   *
   * @param {Request} req - Express request with meeting ID and update body
   * @param {Response} res - Express response object
   * @returns {Promise<void>} Sends success status or 404 if meeting not found
   *
   * @example
   * PATCH /meetings/:id
   * {
   *   "createdBy": "new-user"
   * }
   */
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

  /**
   * Deletes a meeting from the database.
   *
   * @param {Request} req - Express request containing meeting ID
   * @param {Response} res - Express response object
   * @returns {Promise<void>} Sends { ok: true } or 404 if not found
   *
   * @example
   * DELETE /meetings/:id
   */
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

  /**
   * Marks a meeting as finished by setting `finishedAt` to the current date.
   *
   * @param {Request} req - Express request containing meeting ID
   * @param {Response} res - Express response object
   * @returns {Promise<void>} Sends { ok: true } or 404 if meeting not found
   *
   * @example
   * PATCH /meetings/:id/finish
   */
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
