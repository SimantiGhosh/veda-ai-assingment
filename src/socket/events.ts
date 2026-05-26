export const SOCKET_EVENTS = {
  JOB_QUEUED: 'job:queued',
  JOB_PROCESSING: 'job:processing',
  JOB_PROGRESS: 'job:progress',
  JOB_DONE: 'job:done',
  JOB_FAILED: 'job:failed',
  PDF_DONE: 'pdf:done',
} as const