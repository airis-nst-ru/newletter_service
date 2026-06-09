import { Router } from "express";
import sendNewsletter from "../controllers/send.controller";

const router = Router();

router.route("/").post(sendNewsletter);

export default router;
