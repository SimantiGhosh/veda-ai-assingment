import type { Request, Response, NextFunction } from 'express'
import { redis } from '../../config'

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const key = `app:rl:${req.userId}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 60)
  if (count > 100) {
    return res.status(429).json({ error: 'Too many requests' })
  }
  next()
}