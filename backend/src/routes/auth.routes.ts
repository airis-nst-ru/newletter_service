import { Router } from "express";
import { signin, refreshAccessToken, logout } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.route("/signin").post(signin);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").post(verifyToken, logout);

export default router;
