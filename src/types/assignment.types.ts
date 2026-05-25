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
  questionTypes: Array<'mcq' | 'short_answer' | 'long_answer'>
  sections: number
  instructions?: string
  dueDate?: string
}
