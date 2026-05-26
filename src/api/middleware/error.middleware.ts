import type { Request, Response, NextFunction } from 'express'
import { logger } from '../../utils/logger'

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, traceId: req.traceId }, 'Unhandled error')
  res.status(500).json({ error: 'Internal server error', traceId: req.traceId })
}