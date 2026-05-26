export interface Question {
  id: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  type: 'mcq' | 'short_answer' | 'long_answer'
  options?: string[]
}

export interface Section {
  id: string
  title: string
  instruction: string
  questions: Question[]
}

export interface QuestionPaper {
  _id: string
  assignmentId: string
  userId: string
  title: string
  subject: string
  totalMarks: number
  sections: Section[]
  generatedAt: Date
}