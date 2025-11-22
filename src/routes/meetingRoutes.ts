import { Router } from "express";
import { MeetingController } from "../controllers/meetingController";

const router = Router();
const controller = new MeetingController();

router.post("/create", (req, res) => controller.createMeeting(req, res));
router.patch("/finish/:id", (req, res) => controller.finishMeeting(req, res));
router.get("/:id", (req, res) => controller.getMeeting(req, res));
router.put("/:id", (req, res) => controller.updateMeeting(req, res));
router.delete("/:id", (req, res) => controller.deleteMeeting(req, res));

export default router;
