import { Router } from "express";
import { 
    createNewsletter, 
    getAllNewsletters, 
    getNewsletterById, 
    updateNewsletter, 
    markNewsletterAsSent,
    deleteNewsletter 
} from "../controllers/newsletter.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// All newsletter routes require authentication
router.use(verifyToken);

// CRUD operations
router.route("/").post(createNewsletter).get(getAllNewsletters);
router.route("/:id").get(getNewsletterById).put(updateNewsletter).delete(deleteNewsletter);

// Special action: mark as sent
router.route("/:id/send").patch(markNewsletterAsSent);

export default router;
