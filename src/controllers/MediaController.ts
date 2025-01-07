import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Media } from '../types/Movie.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MediaController {
  private dbPath: string;

  constructor() {
    this.dbPath = join(__dirname, '../data/db.json');
  }

  private async loadMedia(): Promise<Media[]> {
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

  // Get all media items with optional type filter
  public async getAllMedia(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      const mediaItems = await this.loadMedia();
      res.json(mediaItems);
    } catch (error) {
      console.error('Error in getAllMedia:', error);
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
      console.log('Requested type:', type); // Log the raw type parameter
      
      const mediaItems = await this.loadMedia();
      
      // Convert type parameter to match database format
      const formattedType = type === 'movies' ? 'Movie' : type === 'tv-shows' ? 'TV Show' : undefined;
      console.log('Formatted type:', formattedType); // Log the formatted type
      
      if (!formattedType) {
        res.json(mediaItems); // Return all items if type is not recognized
        return;
      }
      
      const result = mediaItems.filter(m => m.type === formattedType);
      console.log('Filtered results count:', result.length); // Log the number of results
      
      res.json(result);
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
      
      let filteredItems = mediaItems;

      if (query) {
        const searchQuery = (query as string).toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.movie_name.toLowerCase().includes(searchQuery) ||
          item.description.toLowerCase().includes(searchQuery) ||
          item.genres.some(genre => genre.toLowerCase().includes(searchQuery))
        );
      }

      console.log(`Search results: ${filteredItems.length} items found`);
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
      const mediaItems = await this.loadMedia();
      
      const filteredItems = mediaItems.filter(item => 
        item.genres.some(g => g.toLowerCase() === genre.toLowerCase())
      );

      res.json(filteredItems);
    } catch (error) {
      console.error('Error in getMediaByGenre:', error);
      res.status(500).json({ error: 'Failed to fetch media items' });
    }
  }
}

export default new MediaController();
