import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-change-me',
    expiresIn: process.env.JWT_EXPIRATION || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@trazabilidad.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Sistema de Trazabilidad',
  },
  storage: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'trazabilidad-docs',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  barcode: {
    type: process.env.BARCODE_TYPE || 'code128',
    scale: parseInt(process.env.BARCODE_SCALE || '2', 10),
    height: parseInt(process.env.BARCODE_HEIGHT || '40', 10),
    background: process.env.BARCODE_BACKGROUND || 'ffffff',
    color: process.env.BARCODE_COLOR || '000000',
  },
  qrCode: {
    baseUrl: process.env.QR_BASE_URL || 'https://trazabilidad.com/t',
    errorCorrection: (process.env.QR_ERROR_CORRECTION as 'L' | 'M' | 'Q' | 'H') || 'H',
    size: parseInt(process.env.QR_SIZE || '300', 10),
  },
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || 'logs',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || '7d',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    dir: process.env.UPLOAD_DIR || 'uploads',
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
  },
  lot: {
    prefix: process.env.LOT_PREFIX || 'L',
    includeDate: process.env.LOT_INCLUDE_DATE !== 'false',
    includeLine: process.env.LOT_INCLUDE_LINE !== 'false',
    correlativeLength: parseInt(process.env.LOT_CORRELATIVE_LENGTH || '2', 10),
  },
};