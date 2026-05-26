import { Queue } from 'bullmq'
import { redis } from '../config'

export const pdfQueue = new Queue('pdf-export', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: false,
    removeOnFail: false,
  }
})