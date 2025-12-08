import { Router } from "express";
import { AISummaryController } from "../controllers/aiSummaryController";

const router = Router();
const controller = new AISummaryController();

router.post("/", (req, res) => controller.saveSummary(req, res));

router.get("/:meetingId", (req, res) => controller.getSummary(req, res));

export default router;