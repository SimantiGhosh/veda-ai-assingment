import pino from 'pino'
import { env } from '../config'

export const logger = pino({
  level: 'info',
  ...(env.NODE_ENV === 'development'
    ? { transport: { target: 'pino-pretty' } }
    : {}),
})