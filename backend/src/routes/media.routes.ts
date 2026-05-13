import { Router } from 'express';
import { uploadMedia, listMedia } from '../controllers/media.controller';
import { upload } from '../middlewares/upload.middleware';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Protect all media routes
router.use(verifyToken);

router.post('/upload', upload.single('file'), uploadMedia);
router.get('/', listMedia);

export default router;
