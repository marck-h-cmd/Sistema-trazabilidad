import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from '@config/app';
import { errorHandler } from '@middleware/errorHandler';
import { requestLogger } from '@middleware/requestLogger';
import { generalLimiter } from '@middleware/rateLimiter';
import routes from '@routes/index';
import { logger } from '@utils/logger';
import path from 'path';

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.http(message.trim()) },
  }));
}

app.use(requestLogger);
app.use(`${config.apiPrefix}/`, generalLimiter);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(config.apiPrefix, routes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Ruta no encontrada',
    },
  });
});

app.use(errorHandler);

export default app;