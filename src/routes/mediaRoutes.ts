import express  from 'express';
import MediaController from 'controllers/MediaController.js';
import upload from 'middleware/upload.js';

const router = express.Router();

router.get('/api/media', MediaController.getAllMedia.bind(MediaController));
router.get('/api/media/search', MediaController.searchMedia.bind(MediaController));
router.get('/api/media/:id', MediaController.getMediaById.bind(MediaController));
router.put('/api/media/:id',upload.fields([
  { name: "background", maxCount: 5 },
  { name: "avatar", maxCount: 5 },
]), MediaController.updateMedia.bind(MediaController));
router.delete('/api/media/:id', MediaController.deleteMedia.bind(MediaController));
router.get('/api/media-author', MediaController.getMediaAuthor.bind(MediaController));
router.post('/api/media-add',upload.fields([
    { name: "background", maxCount: 5 },
    { name: "avatar", maxCount: 5 },
  ]), MediaController.addMedia.bind(MediaController));
router.get('/api/media/type/:type', MediaController.getMediaByType.bind(MediaController));

export default router;