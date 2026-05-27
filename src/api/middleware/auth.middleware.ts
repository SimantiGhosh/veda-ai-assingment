import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Support: Authorization header, cookie, or ?token= query param (for iframe/direct URLs)
  const token =
    req.headers.authorization?.split(' ')[1] ||
    req.cookies?.token ||
    (req.query.token as string | undefined)

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}