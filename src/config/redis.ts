import Redis from 'ioredis'
import { env } from './env'

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 5) {
      console.error('Redis connection failed after 5 retries')
      return null
    }
    return Math.min(times * 500, 2000)
  },
})

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error', err))