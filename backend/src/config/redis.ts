import Redis from 'ioredis';
import { config } from './app';

let redis: Redis | null = null;

try {
  redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redis.on('error', (err) => {
    console.warn('Redis connection error (non-blocking):', err.message);
  });
} catch (error) {
  console.warn('Redis not available, running without cache/queues');
}

export { redis };