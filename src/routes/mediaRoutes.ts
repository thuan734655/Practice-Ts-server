import express  from 'express';
import MediaController from 'controllers/MediaController.js';

const router = express.Router();

router.get('/api/media', MediaController.getAllMedia.bind(MediaController));
router.get('/api/media/search', MediaController.searchMedia.bind(MediaController));
router.get('/api/media/:id', MediaController.getMediaById.bind(MediaController));
router.get('/api/media/type/:type', MediaController.getMediaByType.bind(MediaController));
router.get('/api/media/genre/:genre', MediaController.getMediaByGenre.bind(MediaController));

export default router;