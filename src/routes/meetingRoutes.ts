import { Router } from "express";
import { MeetingController } from "../controllers/meetingController";

const router = Router();
const meetingController = new MeetingController();

router.post("/create", (req, res) => meetingController.createMeeting(req, res));
router.get("/:id", (req, res) => meetingController.getMeeting(req, res));

export default router;
