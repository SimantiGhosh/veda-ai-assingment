import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { Assignment } from '../models/assignment.model'
import { QuestionPaper } from '../models/questionPaper.model'
import { JobLog } from '../models/jobLog.model'
import { aiService } from '../services/ai.service'
import { notificationService } from '../services/notification.service'
import { storageService } from '../services/storage.service'
import type { GenerationJobData } from '../types/job.types'
import { env } from '../config'
import { redis } from '../config'
import { logger } from '../utils/logger'

let pdfParserReady = false

const parsePdfText = async (buffer: Buffer): Promise<{ text: string; numpages: number }> => {
  const mod = await import('pdf-parse')
  const PDFParse = (mod as unknown as { PDFParse?: unknown }).PDFParse

  if (typeof PDFParse !== 'function') {
    throw new Error('pdf-parse PDFParse export is not a function')
  }

  const parser = new (PDFParse as new (options: { data: Buffer }) => {
    getText: () => Promise<{ text: string; total: number }>
    destroy: () => Promise<void>
  })({ data: buffer })

  try {
    const result = await parser.getText()
    return { text: result.text, numpages: result.total }
  } finally {
    await parser.destroy()
  }
}

const workerRedis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
})

export const createGenerationWorker = () => {
  const worker = new Worker<GenerationJobData>(
    'ai-generation',
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, userId, traceId, config, fileKey } = job.data
      const startTime = Date.now()

      console.log('=== JOB STARTED ===')
      console.log('assignmentId:', assignmentId)
      console.log('fileKey received:', fileKey)
      if (!pdfParserReady) {
        console.log('pdf-parse loader ready')
        pdfParserReady = true
      }

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
          console.log('=== DOWNLOADING FILE ===', fileKey)
          const buffer = await storageService.downloadFile(fileKey)
          console.log('=== FILE DOWNLOADED, size:', buffer.length, 'bytes ===')

          const parsed = await parsePdfText(buffer)
          console.log('=== PDF PARSED, pages:', parsed.numpages, ', raw text length:', parsed.text.length, '===')

          extractedText = parsed.text
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 12000)

          console.log('=== EXTRACTED TEXT LENGTH:', extractedText.length, '===')
          console.log('=== FIRST 300 CHARS ===')
          console.log(extractedText.slice(0, 300))
          console.log('=== END ===')
        } catch (err) {
          console.log('=== PDF PARSE ERROR ===', (err as Error).message)
          logger.warn(`File parse failed for ${fileKey}: ${(err as Error).message}`)
        }
      } else {
        console.log('=== NO fileKey — generating without PDF context ===')
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
        inputTokens: usage?.promptTokenCount,
        outputTokens: usage?.candidatesTokenCount,
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
      connection: workerRedis,
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