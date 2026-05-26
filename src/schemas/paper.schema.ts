import { z } from 'zod'

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().int().min(1),
  type: z.enum(['mcq', 'short_answer', 'long_answer']),
  options: z.array(z.string()).optional(),
})

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  questions: z.array(questionSchema).min(1),
})

export const questionPaperSchema = z.object({
  title: z.string(),
  subject: z.string(),
  totalMarks: z.number(),
  sections: z.array(sectionSchema).min(1),
})

export type QuestionPaperOutput = z.infer<typeof questionPaperSchema>