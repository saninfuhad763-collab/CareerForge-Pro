import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { execSync } from 'child_process';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment configurations
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Security Headers Setup
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list or matches production CLIENT_URL
    const clientUrl = process.env.CLIENT_URL;
    if (allowedOrigins.includes(origin) || (clientUrl && origin === clientUrl)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// HTTP Request Logging
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// JSON & Payload Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 10000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api/', limiter);

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// App Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// Catch 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Production-ready instance running in [${process.env.NODE_ENV || 'development'}] mode on port: ${PORT}`);
});

// Handle port already in use — kill stale process and retry
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Server] Port ${PORT} is already in use. Attempting to free it...`);
    try {
      if (process.platform === 'win32') {
        const result = execSync(`netstat -ano | findstr :${PORT}`).toString();
        const lines = result.trim().split('\n').filter(l => l.includes('LISTENING'));
        const pids = [...new Set(lines.map(line => line.trim().split(/\s+/).pop()).filter(Boolean))];
        pids.forEach(pid => {
          if (pid && pid !== process.pid.toString()) {
            try {
              execSync(`taskkill /PID ${pid} /F`);
              console.log(`[Server] Killed stale process PID ${pid} on port ${PORT}.`);
            } catch (cmdErr) {
              // Safe to ignore if taskkill fails because process was already terminated by a previous call
            }
          }
        });
      } else {
        execSync(`lsof -ti tcp:${PORT} | xargs kill -9`);
        console.log(`[Server] Freed port ${PORT}.`);
      }
      setTimeout(() => {
        server.listen(PORT, () => {
          console.log(`[Server] Re-bound successfully on port: ${PORT}`);
        });
      }, 1000);
    } catch (killErr) {
      console.error(`[Server] Could not free port ${PORT}. Please run: taskkill /F /IM node.exe`);
      process.exit(1);
    }
  } else {
    console.error('[Server] Unexpected server error:', err);
    process.exit(1);
  }
});

// Graceful Shutdown configurations
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Process terminated.');
  });
});
