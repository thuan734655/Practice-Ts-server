import express, { Express } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mediaRoutes from './routes/mediaRoutes.js';
import authroutes from './routes/authRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Express = express();
const PORT: number = 5001;

app.use(cors());
app.use(express.json());

app.use('/', mediaRoutes)
app.use('/', authroutes)

app.use('/resources', express.static(join(__dirname, 'resources')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
