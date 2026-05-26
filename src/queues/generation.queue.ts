import { Queue } from 'bullmq'
import { redis } from '../config'

export const generationQueue = new Queue('ai-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: false,
    removeOnFail: false,
  }
})