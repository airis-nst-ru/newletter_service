import { Router } from "express";
import unsubscribeEmail, { submitFeedback } from "../controllers/email.controller";
import sendNewsletter from "../controllers/send.controller";

const router = Router();

router.route("/unsubscribe").get(unsubscribeEmail);
router.route("/feedback").post(submitFeedback);
router.route("/send").post(sendNewsletter);

export default router;