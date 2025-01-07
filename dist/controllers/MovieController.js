import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class MovieController {
    constructor() {
        this.dbPath = join(__dirname, '../data/db.json');
        this.loadMovies();
    }
    loadMovies() {
        try {
            const data = readFileSync(this.dbPath, 'utf8');
            const dbData = JSON.parse(data);
            this.movies = dbData.movies;
        }
        catch (error) {
            console.error('Error loading movies:', error);
            this.movies = [];
        }
    }
    getAllMovies(req, res) {
        try {
            res.json(this.movies);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch movies' });
        }
    }
    getMovieById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const movie = this.movies.find(m => m.id === id);
            if (movie) {
                res.json(movie);
            }
            else {
                res.status(404).json({ error: 'Movie not found' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch movie' });
        }
    }
    searchMovies(req, res) {
        try {
            const query = (req.query.q || '').toLowerCase();
            const results = this.movies.filter(movie => movie.title.toLowerCase().includes(query) ||
                movie.description.toLowerCase().includes(query));
            res.json(results);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to search movies' });
        }
    }
    filterMovies(req, res) {
        try {
            const genre = req.query.genre;
            const minRating = parseFloat(req.query.rating) || 0;
            let filtered = this.movies;
            if (genre) {
                filtered = filtered.filter(movie => movie.genre.toLowerCase() === genre.toLowerCase());
            }
            if (minRating) {
                filtered = filtered.filter(movie => movie.rating >= minRating);
            }
            res.json(filtered);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to filter movies' });
        }
    }
}
export default new MovieController();
