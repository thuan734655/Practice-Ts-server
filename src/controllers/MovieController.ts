import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Movie } from '../types/Movie.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MovieController {
  private dbPath: string;
  private movies: Movie[] = [];

  constructor() {
    this.dbPath = join(__dirname, '../data/db.json');
    this.loadMovies();
  }

  private loadMovies(type: string = ''): void {
    try {
      const data = readFileSync(this.dbPath, 'utf8');
      const dbData = JSON.parse(data);
  
      if (type) {
        this.movies = dbData.media.filter((movie: any) => movie.type.toLowerCase() === type.toLowerCase());
      } else {
        this.movies = dbData.media;
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      this.movies = [];
    }
  }
  
  public getAllMovies(req: Request, res: Response): void {
    try {
      res.json(this.movies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  }

  public getMovieById(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const movie = this.movies.find(m => m.id === id);
      
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).json({ error: 'Movie not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch movie' });
    }
  }

  public searchMovies(req: Request, res: Response): void {
    try {
      const query = (req.query.q as string || '').toLowerCase();
      const results = this.movies.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query)
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search movies' });
    }
  }

  public filterMovies(req: Request, res: Response): void {
    try {
      const genre = req.query.genre as string;
      const minRating = parseFloat(req.query.rating as string) || 0;
      
      let filtered = this.movies;
      
      if (genre) {
        filtered = filtered.filter(movie => 
          movie.genre.toLowerCase() === genre.toLowerCase()
        );
      }
      
      if (minRating) {
        filtered = filtered.filter(movie => movie.rating >= minRating);
      }
      
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ error: 'Failed to filter movies' });
    }
  }
}

export default new MovieController();
