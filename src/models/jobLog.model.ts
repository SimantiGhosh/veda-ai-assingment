import mongoose from 'mongoose'

const jobLogSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true },
  traceId: String,
  model: String,
  inputTokens: Number,
  outputTokens: Number,
  durationMs: Number,
  attempts: Number,
  status: { type: String, enum: ['success', 'failed'] },
}, { timestamps: true })

jobLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 })

export const JobLog = mongoose.model('JobLog', jobLogSchema)