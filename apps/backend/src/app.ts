import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './libs/logger';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({ 
    message: 'Hello from Nx Serverless Backend!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes will be added here
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API endpoint working!',
    data: { test: true }
  });
});

// Import route modules
import { authRouter, usersRouter, postsRouter } from './routes';

// Use route modules
app.use('/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

export { app };
