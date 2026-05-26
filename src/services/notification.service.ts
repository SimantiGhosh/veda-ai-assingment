import { Server } from 'socket.io'
import type { JobEvent } from '../types/job.types'

let io: Server

export const notificationService = {
  init(socketServer: Server) {
    io = socketServer
  },

  emit(assignmentId: string, event: JobEvent) {
    if (!io) return
    io.to(`room:${assignmentId}`).emit(event.event, event)
  }
}