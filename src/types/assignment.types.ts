export interface AssignmentConfig {
  subject: string
  topic: string
  totalQuestions: number
  totalMarks: number
  difficulty: {
    easy: number
    medium: number
    hard: number
  }
  questionTypes: ('mcq' | 'short_answer' | 'long_answer')[]
  sections: number
  instructions?: string
  dueDate: string
}

export interface Assignment {
  _id: string
  userId: string
  traceId: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  config: AssignmentConfig
  fileKey?: string
  resultId?: string
  createdAt: Date
}