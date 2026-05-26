import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  id: String,
  text: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  marks: Number,
  type: { type: String, enum: ['mcq', 'short_answer', 'long_answer'] },
  options: [String],
}, { _id: false })

const sectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  instruction: String,
  questions: [questionSchema],
}, { _id: false })

const questionPaperSchema = new mongoose.Schema({
  assignmentId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  title: String,
  subject: String,
  totalMarks: Number,
  sections: [sectionSchema],
}, { timestamps: true })

export const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema)