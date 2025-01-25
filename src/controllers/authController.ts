import { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AuthController {
  private dbPath: string;

  constructor() {
    this.dbPath = join(__dirname, '../data/db.json');
  }

  private async loadUsers() {
    try {
      const data = await readFile(this.dbPath, 'utf8');
      const dbData = JSON.parse(data);
      return dbData.user || [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }
  private async loadData() {
    try {
      const data = await readFile(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading data:', error);
      return { media: [], user: [] };
    }
  }
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }

      const users = await this.loadUsers();
      const user = users.find((u: any) => u.email === email);

      if (!user) {
        res.status(404).json({ success: false, message: 'User does not exist' });
        return;
      }
      if (password !== user.password) {
        res.status(401).json({ success: false, message: 'Incorrect password' });
        return;
      }

      const { password: _, ...userWithoutPassword } = user; 
      res.json({ success: true, message: 'Login successful', data: { user: userWithoutPassword } });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
    }
  }
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        return;
      }
  
      const dbData = await this.loadData();
  
      const users = dbData.user || [];
      const existingUser = users.find((u: any) => u.email === email);
  
      if (existingUser) {
        res.status(409).json({ success: false, message: 'Email already exists' });
        return;
      }
  
      const newUser = { name, email, password };
      users.push(newUser);
  
      dbData.user = users;
  
      await writeFile(this.dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  
      res.status(201).json({ success: true, message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ success: false, message: 'An error occurred during registration' });
    }
  }
}

export default new AuthController();
