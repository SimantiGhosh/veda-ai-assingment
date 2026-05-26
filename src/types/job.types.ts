import type { AssignmentConfig } from './assignment.types'

export interface GenerationJobData {
  assignmentId: string
  userId: string
  traceId: string
  config: AssignmentConfig
  fileKey?: string
}

export interface PdfJobData {
  assignmentId: string
  paperId: string
  userId: string
}

export type JobStatus = 'queued' | 'processing' | 'done' | 'failed'

export interface JobEvent {
  event: 'job:queued' | 'job:processing' | 'job:progress' | 'job:done' | 'job:failed' | 'pdf:done'
  assignmentId: string
  progress?: number
  message?: string
  paperId?: string
  pdfUrl?: string
  reason?: string
}