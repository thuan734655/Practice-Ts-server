import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { IMedia } from '../types/Movie.js';
import fs from 'fs/promises';
import { sendResponse } from '../utils/respone.js';

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

  private async saveDatabase(data: any): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
      throw new Error('Failed to save database');
    }
  }

  public async getAllMedia(req: Request, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '8' } = req.query;
      const currentPage = Math.max(parseInt(page as string, 10), 1);
      const itemsPerPage = Math.max(parseInt(limit as string, 10), 1);
      const mediaItems = await this.loadMedia();
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedItems = mediaItems.slice(startIndex, startIndex + itemsPerPage);

      sendResponse(res, 200, {
        success: true,
        data: paginatedItems,
        message: 'Fetched media items successfully',
        totalItems: mediaItems.length
      });
    } catch (error) {
      console.error('Error fetching media items:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'Failed to fetch media items',
      });
    }
  }

  public async getMediaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const mediaItems = await this.loadMedia();
      const mediaItem = mediaItems.find(m => m.id === id);

      if (mediaItem) {
        sendResponse(res, 200, {
          success: true,
          data: mediaItem,
        });
      } else {
        sendResponse(res, 404, {
          success: false,
          message: 'Media item not found',
        });
      }
    } catch (error) {
      console.error('Error in getMediaById:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'Failed to fetch media item',
      });
    }
  }

  public async getMediaAuthor(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.query;
      const dbData = await this.loadMedia();
      const userMedia = dbData.filter((item: any) => item.author === username);
  
      const { page = '1', limit = '8' } = req.query;
      const currentPage = Math.max(parseInt(page as string, 10), 1);
      const itemsPerPage = Math.max(parseInt(limit as string, 10), 1);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedItems = userMedia.slice(startIndex, startIndex + itemsPerPage);
  
      if (userMedia.length === 0) {
        sendResponse(res, 404, {
          success: false,
          message: 'No media found for this author',
          data: null, 
          totalItems: 0,
        });
        return;
      }
  
      sendResponse(res, 200, {
        success: true,
        message: 'Fetched media for the author successfully',
        data: paginatedItems,
        totalItems: userMedia.length,
      });
    } catch (error) {
      console.error('Error in getMediaByUsername:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'An error occurred while fetching media',
        data: null,
      });
    }
  }
  

  public async getMediaByType(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type as string;
      const { page = '1', limit = '8' } = req.query;
      const mediaItems = await this.loadMedia();
      const currentPage = Math.max(parseInt(page as string, 10), 1);
      const itemsPerPage = Math.max(parseInt(limit as string, 10), 1);
      const startIndex = (currentPage - 1) * itemsPerPage;

      const formattedType = type === 'movies' ? 'Movie' : type === 'tv-shows' ? 'TV Show' : undefined;

      if (!formattedType) {
        sendResponse(res, 400, {
          success: false,
          message: 'Invalid media type',
        });
        return;
      }

      const filteredItems = mediaItems.filter(m => m.type === formattedType);
      const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

      sendResponse(res, 200, {
        success: true,
        data: paginatedItems,
        totalItems: filteredItems.length,
      });
    } catch (error) {
      console.error('Error in getMediaByType:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'Failed to fetch media items',
      });
    }
  }

  public async searchMedia(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const mediaItems = await this.loadMedia();

      if (!query) {
        sendResponse(res, 200, {
          success: true,
          data: mediaItems,
        });
        return;
      }

      const searchQuery = (query as string).toLowerCase();
      const filteredItems = mediaItems.filter(item =>
        item.movie_name.toLowerCase().includes(searchQuery),
      );
      sendResponse(res, 200, {
        success: true,
        data: filteredItems,
      });
    } catch (error) {
      console.error('Error in searchMedia:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'Failed to search media items',
      });
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
        background,
      } = req.body;

      if (!movie_name || !description || !rating || !type || !status || !author) {
        sendResponse(res, 400, {
          success: false,
          message: 'Missing required fields',
        });
        return;
      }

      const database = await this.loadDatabase();
      const mediaList = database.media;
      const newId = mediaList.length ? mediaList[mediaList.length - 1].id + 1 : 1;

      const newMedia: IMedia = {
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

      sendResponse(res, 201, {
        success: true,
        data: newMedia,
      });
    } catch (error) {
      console.error('Error in addMedia:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'Failed to add media',
      });
    }
  }

  public async deleteMedia(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const database = await this.loadDatabase();
      const mediaList = database.media;

      const mediaIndex = mediaList.findIndex((media: IMedia) => media.id === id);

      if (mediaIndex === -1) {
        sendResponse(res, 404, {
          success: false,
          message: 'Media item not found',
        });
        return;
      }

      mediaList.splice(mediaIndex, 1);
      database.media = mediaList;
      await this.saveDatabase(database);

      sendResponse(res, 200, {
        success: true,
        message: 'Media item deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteMedia:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'Failed to delete media item',
      });
    }
  }

  public async updateMedia(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
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

      const database = await this.loadDatabase();
      const mediaList = database.media;
      const mediaIndex = mediaList.findIndex((media: IMedia) => media.id === id);

      if (mediaIndex === -1) {
        sendResponse(res, 404, {
          success: false,
          message: 'Media item not found',
        });
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

      sendResponse(res, 200, {
        success: true,
        data: updatedMedia,
      });
    } catch (error) {
      console.error('Error in updateMedia:', error);
      sendResponse(res, 500, {
        success: false,
        message: 'Failed to update media item',
      });
    }
  }
}

export default new MediaController();





