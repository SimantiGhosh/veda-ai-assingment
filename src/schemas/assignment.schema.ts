import { z } from 'zod'

export const assignmentSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  totalQuestions: z.number().int().min(1).max(50),
  totalMarks: z.number().int().min(1),
  difficulty: z.object({
    easy: z.number().min(0).max(100),
    medium: z.number().min(0).max(100),
    hard: z.number().min(0).max(100),
  }).refine(d => d.easy + d.medium + d.hard === 100, {
    message: 'Difficulty percentages must sum to 100'
  }),
  questionTypes: z.array(z.enum(['mcq', 'short_answer', 'long_answer'])).min(1),
  sections: z.number().int().min(1).max(5),
  instructions: z.string().optional(),
  dueDate: z.string().datetime(),
})

export type AssignmentInput = z.infer<typeof assignmentSchema>