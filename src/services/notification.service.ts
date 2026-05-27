import type { Server } from 'socket.io'
import type { JobEvent } from '../types/job.types'
import { redis } from '../config'
import { env } from '../config'
import Redis from 'ioredis'

const NOTIFY_CHANNEL = 'app:notify'

let io: Server | null = null

export const notificationService = {
  // Called only in server.ts — sets up the subscriber that broadcasts to sockets
  async init(socketServer: Server) {
    io = socketServer

    // Create a dedicated subscriber connection — ioredis connections in subscribe
    // mode cannot be used for regular commands, so we need a separate instance
    const sub = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
    })

    sub.on('error', (err) => {
      console.error('Notification subscriber Redis error:', err.message)
    })

    // ioredis subscribe: callback receives (channel, message)
    sub.subscribe(NOTIFY_CHANNEL, (err) => {
      if (err) console.error('Failed to subscribe to notify channel:', err.message)
    })

    sub.on('message', (_channel: string, message: string) => {
      try {
        const { assignmentId, event }: { assignmentId: string; event: JobEvent } = JSON.parse(message)
        if (io) {
          io.to(`room:${assignmentId}`).emit(event.event, event)
        }
      } catch (e) {
        // malformed message — ignore
      }
    })
  },

  // Called from both server.ts and worker.ts processes safely
  emit(assignmentId: string, event: JobEvent) {
    // Persist latest event so late-joining sockets can catch up
    redis.set(
      `app:job:progress:${assignmentId}`,
      JSON.stringify(event),
      'EX', 3600
    ).catch(() => {})

    // Publish over Redis pub/sub so the server process (which owns Socket.IO)
    // picks it up and broadcasts to the room — works across processes
    redis.publish(
      NOTIFY_CHANNEL,
      JSON.stringify({ assignmentId, event })
    ).catch(() => {})
  }
}