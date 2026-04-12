import { Router } from "express";
import unsubscribeEmail, { submitFeedback } from "../controllers/email.controller";

const router = Router();

router.route("/unsubscribe").get(unsubscribeEmail);
router.route("/feedback").post(submitFeedback);

export default router;