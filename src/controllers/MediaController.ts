import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { IMedia } from '../types/Movie.js';
import fs from 'fs/promises';



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
  private async loadDatabase(): Promise<any> {
    const data = await fs.readFile(this.dbPath, 'utf-8');
    return JSON.parse(data);
  }

  // Lưu dữ liệu vào file JSON
  private async saveDatabase(data: any): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
      throw new Error('Failed to save database');
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

  public async getMediaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const mediaItems = await this.loadMedia();
      const mediaItem = mediaItems.find(m => m.id === id);
      console.log(mediaItem);
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
  public async getMediaAuthor(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.query; 

      const dbData = await this.loadMedia();

      const userMedia = dbData.filter((item: any) => item.author === username);

      const { page = "1", limit = "8" } = req.query;
      const currentPage = Math.max(parseInt(page as string, 10), 1);
      const itemsPerPage = Math.max(parseInt(limit as string, 10), 1);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedItems = userMedia.slice(startIndex, startIndex + itemsPerPage);

      if (userMedia.length === 0) {
        res.status(404).json({ success: false, message: 'No media found for this user' });
        return;
      }

      res.json({ success: true, data: paginatedItems,totalItems: userMedia.length });
    } catch (error) {
      console.error('Error in getMediaByUsername:', error);
      res.status(500).json({ success: false, message: 'An error occurred while fetching media' });
    }
  }

  public async addMedia(req: Request, res: Response): Promise<void> {
    try {
      const {
        movie_name,
        description,
        title,
        rating,
        type,
        status,
        release_date,
        first_air_date,
        last_air_date,
        number_of_seasons,
        number_of_episodes,
        episode_run_time,
        genres,
        author,
        avatar,
        background
      } = req.body;

      if (!movie_name || !description || !rating || !type || !status || !author) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
  
      const database = await this.loadDatabase();
      const mediaList = database.media;
  
      const newId = mediaList.length ? mediaList[mediaList.length - 1].id + 1 : 1;
  
      const newMedia:IMedia = {
        id: newId,
        movie_name,
        description,
        title,
        rating: parseFloat(rating),
        type,
        status,
        release_date: release_date || null,
        first_air_date: first_air_date || null,
        last_air_date: last_air_date || null,
        number_of_seasons: number_of_seasons ? parseInt(number_of_seasons, 10) : undefined,
        number_of_episodes: number_of_episodes ? parseInt(number_of_episodes, 10) : undefined,
        episode_run_time: episode_run_time || null,
        genres: Array.isArray(genres) ? genres : genres.split(',').map((g: string) => g.trim()),
        background,
        avatar,
        author,
      };
      mediaList.push(newMedia);
      database.media = mediaList;

      await this.saveDatabase(database);
  
      res.status(201).json({ success: true, data: newMedia });
    } catch (error) {
      console.error('Error in addMedia:', error);
      res.status(500).json({ error: 'Failed to add media' });
    }
  }
  public async deleteMedia(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10); 
      const database = await this.loadDatabase();
      const mediaList = database.media;
      console.log(id)
  
      const mediaIndex = mediaList.findIndex((media: IMedia) => media.id === id);
  
      if (mediaIndex === -1) {
        res.status(404).json({ success: false, message: 'Media item not found' });
        return;
      }
  
      mediaList.splice(mediaIndex, 1);
      database.media = mediaList;
  
      await this.saveDatabase(database);
  
      res.json({ success: true, message: 'Media item deleted successfully' });
    } catch (error) {
      console.error('Error in deleteMedia:', error);
      res.status(500).json({ success: false, message: 'Failed to delete media item' });
    }
  }
  
  public async updateMedia(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      console.log(id)
      const {
        movie_name,
        description,
        rating,
        type,
        status,
        release_date,
        first_air_date,
        last_air_date,
        number_of_seasons,
        number_of_episodes,
        episode_run_time,
        genres,
        author,
        avatar,
        background,
      } = req.body;

      console.log(req.body)

  
      const database = await this.loadDatabase();
      const mediaList = database.media;
  
      const mediaIndex = mediaList.findIndex((media: IMedia) => media.id === id);
  
      if (mediaIndex === -1) {
        res.status(404).json({ error: 'Media item not found' });
        return;
      }
  
      const currentMedia = mediaList[mediaIndex];
  
      const updatedMedia: IMedia = {
        ...currentMedia,
        ...(movie_name && { movie_name }),
        ...(description && { description }),
        ...(rating && { rating: parseFloat(rating) }),
        ...(type && { type }),
        ...(status && { status }),
        ...(release_date && { release_date }),
        ...(first_air_date && { first_air_date }),
        ...(last_air_date && { last_air_date }),
        ...(number_of_seasons && { number_of_seasons: parseInt(number_of_seasons, 10) }),
        ...(number_of_episodes && { number_of_episodes: parseInt(number_of_episodes, 10) }),
        ...(episode_run_time && { episode_run_time }),
        ...(genres && { genres: Array.isArray(genres) ? genres : genres.split(',').map((g: string) => g.trim()) }),
        ...(avatar && { avatar }),
        ...(background && { background }),
        ...(author && { author }),
      };
  
      mediaList[mediaIndex] = updatedMedia;
      database.media = mediaList;
  
      await this.saveDatabase(database);
  
      res.status(200).json({ success: true, data: updatedMedia });
    } catch (error) {
      console.error('Error in updateMedia:', error);
      res.status(500).json({ error: 'Failed to update media item' });
    }
  }
  
  
}

export default new MediaController();
