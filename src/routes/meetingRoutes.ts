import { Router } from "express";
import { MeetingController } from "../controllers/meetingController";

const router = Router();
const controller = new MeetingController();

/**
 * Routes for handling meeting-related operations.
 *
 * This file connects HTTP endpoints with the MeetingController methods.
 * Each route receives the request and directly passes it to the controller.
 *
 * Endpoints included:
 * - POST /create          → Create a new meeting
 * - PATCH /finish/:id     → Mark a meeting as finished
 * - GET /:id              → Get meeting by id
 * - PUT /:id              → Update meeting information
 * - DELETE /:id           → Delete meeting by id
 *
 * All routes use HTTP verbs that match their behavior.
 */

 /** 
  * Route to create a new meeting.
  * Calls controller.createMeeting with request and response objects.
  */
router.post("/create", (req, res) => controller.createMeeting(req, res));

/**
 * Route to mark a meeting as finished.
 * Requires the meeting ID in the URL parameter.
 */
router.patch("/finish/:id", (req, res) => controller.finishMeeting(req, res));

/**
 * Route to get a meeting by its ID.
 * Returns the meeting info or 404 if not found.
 */
router.get("/:id", (req, res) => controller.getMeeting(req, res));

/**
 * Route to update an existing meeting.
 * Uses PUT to modify meeting data completely or partially.
 */
router.put("/:id", (req, res) => controller.updateMeeting(req, res));

/**
 * Route to delete a meeting by its ID.
 * If successful, returns status 200.
 */
router.delete("/:id", (req, res) => controller.deleteMeeting(req, res));

export default router;
