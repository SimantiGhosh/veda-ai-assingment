import { Worker, Job } from 'bullmq'
import { redis } from '../config'
import { Assignment } from '../models/assignment.model'
import { QuestionPaper } from '../models/questionPaper.model'
import { JobLog } from '../models/jobLog.model'
import { aiService } from '../services/ai.service'
import { notificationService } from '../services/notification.service'
import { storageService } from '../services/storage.service'
import type { GenerationJobData } from '../types/job.types'
import { env } from '../config'
import { logger } from '../utils/logger'
import { PDFParse } from 'pdf-parse'

export const createGenerationWorker = () => {
  const worker = new Worker<GenerationJobData>(
    'ai-generation',
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, userId, traceId, config, fileKey } = job.data
      const startTime = Date.now()

      await job.updateProgress(5)
      notificationService.emit(assignmentId, {
        event: 'job:processing',
        assignmentId,
        message: 'Starting generation...'
      })

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' })

      let extractedText: string | undefined
      if (fileKey) {
        try {
          const buffer = await storageService.downloadFile(fileKey)
          const parser = new PDFParse({ data: buffer })
          try {
            const parsed = await parser.getText()
            extractedText = parsed.text.slice(0, 3000)
          } finally {
            await parser.destroy()
          }
        } catch (err) {
          logger.warn(`File parse failed for ${fileKey}, proceeding without it`)
        }
      }

      await job.updateProgress(20)
      notificationService.emit(assignmentId, {
        event: 'job:progress',
        assignmentId,
        progress: 20,
        message: 'Generating questions...'
      })

      const { paper, usage, model } = await aiService.generatePaper(config, extractedText)

      await job.updateProgress(80)
      notificationService.emit(assignmentId, {
        event: 'job:progress',
        assignmentId,
        progress: 80,
        message: 'Saving paper...'
      })

      const savedPaper = await QuestionPaper.create({
        assignmentId,
        userId,
        ...paper,
      })

      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'done',
        resultId: savedPaper._id.toString()
      })

      await redis.set(
        `app:cache:paper:${assignmentId}`,
        JSON.stringify(savedPaper),
        'EX', 3600
      )

      await JobLog.create({
        assignmentId,
        traceId,
        model,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        durationMs: Date.now() - startTime,
        attempts: job.attemptsMade + 1,
        status: 'success'
      })

      await job.updateProgress(100)
      notificationService.emit(assignmentId, {
        event: 'job:done',
        assignmentId,
        paperId: savedPaper._id.toString()
      })
    },
    {
      connection: redis,
      concurrency: parseInt(env.GENERATION_QUEUE_CONCURRENCY),
    }
  )

  worker.on('failed', async (job, err) => {
    if (!job) return
    const { assignmentId } = job.data
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' })
    notificationService.emit(assignmentId, {
      event: 'job:failed',
      assignmentId,
      reason: err.message
    })
    logger.error(`Generation job failed for ${assignmentId}: ${err.message}`)
  })

  return worker
}