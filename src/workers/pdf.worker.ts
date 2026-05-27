import { Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { QuestionPaper } from '../models/questionPaper.model'
import { Assignment } from '../models/assignment.model'
import { pdfService } from '../services/pdf.service'
import { notificationService } from '../services/notification.service'
import type { PdfJobData } from '../types/job.types'
import type { QuestionPaper as QuestionPaperType } from '../types/paper.types'
import { env } from '../config'

const workerRedis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined,
})

export const createPdfWorker = () => {
  const worker = new Worker<PdfJobData>(
    'pdf-export',
    async (job: Job<PdfJobData>) => {
      const { assignmentId, paperId } = job.data

      const paper = await QuestionPaper.findById(paperId)
      if (!paper) throw new Error('Paper not found')

      const assignment = await Assignment.findById(assignmentId)
      const assignmentConfig = assignment?.config

      const paperData = paper.toObject()
      const paperForPdf: QuestionPaperType = {
        _id: paperData._id.toString(),
        assignmentId: paperData.assignmentId,
        userId: paperData.userId,
        title: paperData.title ?? '',
        subject: paperData.subject ?? '',
        totalMarks: paperData.totalMarks ?? 0,
        generatedAt: paperData.createdAt ?? new Date(),
        sections: (paperData.sections ?? []).map(section => ({
          id: section.id ?? '',
          title: section.title ?? '',
          instruction: section.instruction ?? '',
          questions: (section.questions ?? []).map(question => ({
            id: question.id ?? '',
            text: question.text ?? '',
            difficulty: (question.difficulty ?? 'easy'),
            marks: question.marks ?? 0,
            type: (question.type ?? 'short_answer'),
            options: question.options ?? undefined,
          })),
        })),
      }

      const url = await pdfService.generate(paperForPdf, assignmentId, assignmentConfig)

      notificationService.emit(assignmentId, {
        event: 'pdf:done',
        assignmentId,
        pdfUrl: url
      })
    },
    {
      connection: workerRedis,
      concurrency: parseInt(env.PDF_QUEUE_CONCURRENCY),
    }
  )

  return worker
}