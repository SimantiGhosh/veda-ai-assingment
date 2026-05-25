import type { AssignmentConfig } from '../types/assignment.types'

export const buildGenerationPrompt = (config: AssignmentConfig, extractedText?: string) => {
  const systemPrompt = `You are an expert exam paper creator for teachers.
Respond ONLY with a valid JSON object matching the schema provided.
No markdown, no explanation, no text outside the JSON object.`

  const userPrompt = `Create an exam paper with these requirements:
- Subject: ${config.subject}
- Topic: ${config.topic}
- Total questions: ${config.totalQuestions}
- Total marks: ${config.totalMarks}
- Difficulty split: ${config.difficulty.easy}% easy, ${config.difficulty.medium}% medium, ${config.difficulty.hard}% hard
- Question types: ${config.questionTypes.join(', ')}
- Number of sections: ${config.sections}
- Additional instructions: ${config.instructions || 'none'}
${extractedText ? `- Reference material: ${extractedText}` : ''}

Respond with this exact JSON structure:
{
  "title": "string",
  "subject": "string",
  "totalMarks": number,
  "sections": [
    {
      "id": "A",
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "id": "A1",
          "text": "string",
          "difficulty": "easy | medium | hard",
          "marks": number,
          "type": "mcq | short_answer | long_answer",
          "options": ["string"] // only for mcq
        }
      ]
    }
  ]
}`

  return { systemPrompt, userPrompt }
}