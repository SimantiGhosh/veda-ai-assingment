import Redis from 'ioredis'
import { env } from './env'
import { logger } from '../utils/logger'

const redisUrl = env.REDIS_URL
const redisUsesTls = redisUrl.startsWith('rediss://')

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: redisUsesTls ? {} : undefined,
  retryStrategy: (times) => {
    if (times > 5) {
      logger.error('Redis connection failed after 5 retries')
      return null
    }
    return Math.min(times * 500, 2000)
  },
})

redis.on('connect', () => logger.info('Redis connected'))
redis.on('error', (err) => logger.error({ err }, 'Redis error'))