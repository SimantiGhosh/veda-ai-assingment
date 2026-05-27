import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import http from 'http'
import { env } from '../config'
import { logger } from '../utils/logger'

export const createSocketServer = async (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || '*' }
  })
  
  const pubClient = createClient({ url: env.REDIS_URL })
  const subClient = pubClient.duplicate()
  await Promise.all([pubClient.connect(), subClient.connect()])
  io.adapter(createAdapter(pubClient, subClient))

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`)

    socket.on('join:assignment', (assignmentId: string) => {
      socket.join(`room:${assignmentId}`)
      logger.info(`Socket ${socket.id} joined room:${assignmentId}`)
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