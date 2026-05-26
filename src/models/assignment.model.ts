import mongoose from 'mongoose'

const assignmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  traceId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending'
  },
  config: { type: mongoose.Schema.Types.Mixed, required: true },
  fileKey: { type: String },
  resultId: { type: String },
}, { timestamps: true })

assignmentSchema.index({ userId: 1, createdAt: -1 })

export const Assignment = mongoose.model('Assignment', assignmentSchema)