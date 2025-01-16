import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/api/login', authController.login.bind(authController));
router.post('/api/register', authController.register.bind(authController));

export default router;
