import express, { Express } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MediaController from './controllers/MediaController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();
const PORT: number = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Media Routes
app.get('/api/media', MediaController.getAllMedia.bind(MediaController));
app.get('/api/media/search', MediaController.searchMedia.bind(MediaController));
app.get('/api/media/:id', MediaController.getMediaById.bind(MediaController));
app.get('/api/media/type/:type', MediaController.getMediaByType.bind(MediaController));
app.get('/api/media/genre/:genre', MediaController.getMediaByGenre.bind(MediaController));

// Static file serving
app.use('/resources', express.static(join(__dirname, 'resources')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
