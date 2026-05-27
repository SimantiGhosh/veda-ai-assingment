import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import http from 'http'
import { env } from '../config'
import { redis } from '../config'
import { logger } from '../utils/logger'

export const createSocketServer = async (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || '*' }
  })

  const isTls = env.REDIS_URL.startsWith('rediss://')

  const pubClient = createClient({
    url: env.REDIS_URL,
    ...(isTls ? { socket: { tls: true, rejectUnauthorized: false } } : {}),
  })
  const subClient = pubClient.duplicate()
  await Promise.all([pubClient.connect(), subClient.connect()])
  io.adapter(createAdapter(pubClient, subClient))

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`)

    socket.on('join:assignment', async (assignmentId: string) => {
      socket.join(`room:${assignmentId}`)
      logger.info(`Socket ${socket.id} joined room:${assignmentId}`)

      // Send the last known job event so late-joining clients catch up.
      // This handles the race where the worker already emitted progress
      // before the socket had a chance to join the room.
      try {
        const cached = await redis.get(`app:job:progress:${assignmentId}`)
        if (cached) {
          const lastEvent = JSON.parse(cached)
          socket.emit(lastEvent.event, lastEvent)
          logger.info(`Sent catch-up event "${lastEvent.event}" to socket ${socket.id} for assignment ${assignmentId}`)
        }
      } catch (e) {
        // Best-effort — don't crash the connection if Redis read fails
        logger.warn(`Failed to read catch-up event for ${assignmentId}: ${(e as Error).message}`)
      }
    })

    socket.on('leave:assignment', (assignmentId: string) => {
      socket.leave(`room:${assignmentId}`)
    })

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}