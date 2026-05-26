import { v4 as uuid } from 'uuid'
import { Assignment } from '../models/assignment.model'
import { generationQueue } from '../queues'
import type { AssignmentInput } from '../schemas/assignment.schema'
import { redis } from '../config'
import crypto from 'crypto'

export const assignmentService = {
  async create(userId: string, traceId: string, data: AssignmentInput, fileKey?: string) {
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify({ userId, ...data }))
      .digest('hex')
    const existing = await redis.get(`app:idempotency:${hash}`)
    if (existing) return { assignmentId: existing, status: 'pending' }

    const assignmentPayload = {
      userId,
      traceId,
      status: 'pending' as const,
      config: data,
      ...(fileKey ? { fileKey } : {}),
    }

    const assignment = await Assignment.create(assignmentPayload)

    const job = await generationQueue.add('generate-paper', {
      assignmentId: assignment._id.toString(),
      userId,
      traceId,
      config: data,
      fileKey,
    })

    await redis.set(`app:idempotency:${hash}`, assignment._id.toString(), 'EX', 60)

    return { assignmentId: assignment._id.toString(), jobId: job.id, status: 'pending' }
  },

  async getStatus(assignmentId: string, userId: string) {
    const assignment = await Assignment.findOne({ _id: assignmentId, userId })
    if (!assignment) throw new Error('Assignment not found')
    return assignment
  },

  async getPaper(assignmentId: string, userId: string) {
    const cacheKey = `app:cache:paper:${assignmentId}`
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const assignment = await Assignment.findOne({ _id: assignmentId, userId })
    if (!assignment || !assignment.resultId) throw new Error('Paper not ready')

    const { QuestionPaper } = await import('../models/questionPaper.model')
    const paper = await QuestionPaper.findById(assignment.resultId)
    if (!paper) throw new Error('Paper not found')

    await redis.set(cacheKey, JSON.stringify(paper), 'EX', 3600)
    return paper
  },

  async listByUser(userId: string) {
    return Assignment.find({ userId }).sort({ createdAt: -1 }).limit(20)
  }
}