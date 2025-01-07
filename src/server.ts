import express, { Express } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MovieController from './controllers/MovieController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();
const PORT: number = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/movies/search', MovieController.searchMovies.bind(MovieController));
app.get('/api/movies/filter', MovieController.filterMovies.bind(MovieController));
app.get('/api/movies/:id', MovieController.getMovieById.bind(MovieController));
app.get('/api/movies', MovieController.getAllMovies.bind(MovieController));

// Static file serving
app.use('/resources', express.static(join(__dirname, 'resources')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
