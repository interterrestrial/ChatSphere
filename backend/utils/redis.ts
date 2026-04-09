import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(redisUrl, {
  retryStrategy: (times) => {
    // Reconnect after
    return Math.min(times * 50, 2000);
  },
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully!');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redisClient;
