import http from 'http'
import app from './app'
import { connectDatabase, env } from './config'
import { createSocketServer } from './socket'
import { notificationService } from './services/notification.service'
import { logger } from './utils/logger'

const start = async () => {
  await connectDatabase()

  const httpServer = http.createServer(app)
  const io = await createSocketServer(httpServer)

  // init subscribes to Redis and wires up socket broadcasts
  await notificationService.init(io)

  httpServer.listen(env.PORT, () => {
    logger.info(`API server running on port ${env.PORT}`)
  })

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down')
    httpServer.close(() => process.exit(0))
  })
}

start()