import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { IMedia } from '../types/Movie.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MediaController {
  private dbPath: string;

  constructor() {
    this.dbPath = join(__dirname, '../data/db.json');
  }

  private async loadMedia(): Promise<IMedia[]> {
    try {
      const data = await readFile(this.dbPath, 'utf8');
      const dbData = JSON.parse(data);
      console.log('Loaded media items:', dbData.media.length);
      return dbData.media;
    } catch (error) {
      console.error('Error loading media:', error);
      return []; 
    }
  }

  // Get all media items with pagination
  public async getAllMedia(req: Request, res: Response): Promise<void> {
    try {
      const { page = "1", limit = "8" } = req.query;
      const currentPage = Math.max(parseInt(page as string, 10), 1);
      const itemsPerPage = Math.max(parseInt(limit as string, 10), 1);
      const mediaItems = await this.loadMedia();
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedItems = mediaItems.slice(startIndex, startIndex + itemsPerPage);
      res.json({
        totalItems: mediaItems.length,
        data: paginatedItems,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch media items' });
    }
  }

  // Get a specific media item by ID
  public async getMediaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const mediaItems = await this.loadMedia();
      const mediaItem = mediaItems.find(m => m.id === id);
      
      if (mediaItem) {
        res.json(mediaItem);
      } else {
        res.status(404).json({ error: 'Media item not found' });
      }
    } catch (error) {
      console.error('Error in getMediaById:', error);
      res.status(500).json({ error: 'Failed to fetch media item' });
    }
  }

  // Get media items by type (Movie or TV Show)
  public async getMediaByType(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as string;
      const { page = "1", limit = "8" } = req.query;
      const mediaItems = await this.loadMedia();
      const currentPage = Math.max(parseInt(page as string, 10), 1);
      const itemsPerPage = Math.max(parseInt(limit as string, 10), 1);
      const startIndex = (currentPage - 1) * itemsPerPage;
      
      const formattedType = type === 'movies' ? 'Movie' : type === 'tv-shows' ? 'TV Show' : undefined;

      if (!formattedType) {
        res.status(400).json({ error: 'Invalid media type' });
      }else {
        const filteredItems = mediaItems.filter(m => m.type === formattedType);
        const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
  
        res.json({
          totalItems: filteredItems.length,
          data: paginatedItems,
        });
      }
    } catch (error) {
      console.error('Error in getMediaByType:', error);
      res.status(500).json({ error: 'Failed to fetch media items' });
    }
  }

  // Search media items
  public async searchMedia(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const mediaItems = await this.loadMedia();
      if (!query) {
        res.json(mediaItems);
        return;
      }

      const searchQuery = (query as string).toLowerCase();
      const filteredItems = mediaItems.filter(item => 
        item.movie_name.toLowerCase().includes(searchQuery)
      );
      res.json(filteredItems);
    } catch (error) {
      console.error('Error in searchMedia:', error);
      res.status(500).json({ error: 'Failed to search media items' });
    }
  }

  // Get media items by genre
  public async getMediaByGenre(req: Request, res: Response): Promise<void> {
    try {
      const { genre } = req.params;
      const { page = "1", limit = "8" } = req.query;
      const mediaItems = await this.loadMedia();
      const currentPage = Math.max(parseInt(page as string, 10), 1);
      const itemsPerPage = Math.max(parseInt(limit as string, 10), 1);
      const startIndex = (currentPage - 1) * itemsPerPage;

      const filteredItems = mediaItems.filter(item => 
        item.genres.some(g => g.toLowerCase() === genre.toLowerCase())
      );

      const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

      res.json({
        totalItems: filteredItems.length,
        data: paginatedItems,
      });
    } catch (error) {
      console.error('Error in getMediaByGenre:', error);
      res.status(500).json({ error: 'Failed to fetch media items by genre' });
    }
  }
}

export default new MediaController();
