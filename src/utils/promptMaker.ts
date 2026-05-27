import type { AssignmentConfig } from '../types/assignment.types'

export const buildGenerationPrompt = (config: AssignmentConfig, extractedText?: string) => {
  const systemPrompt = `You are an expert exam paper creator for teachers.
Respond ONLY with a valid JSON object matching the schema provided.
No markdown, no explanation, no text outside the JSON object.`

  const hasPdfContent = extractedText && extractedText.trim().length > 0

  const sourceInstruction = hasPdfContent
    ? `IMPORTANT: You MUST generate all questions directly from the provided document content below.
Every question must be based on facts, concepts, or information found in the document.
Do NOT generate generic or unrelated questions. The document is the sole source of truth.`
    : `Generate questions appropriate for the subject and topic provided.`

  const requirementLines = [
    `- Subject: ${config.subject}`,
    `- Topic: ${config.topic}`,
    ...(config.schoolName ? [`- School name: ${config.schoolName}`] : []),
    ...(config.className ? [`- Class: ${config.className}`] : []),
    ...(config.timeAllowed ? [`- Time allowed: ${config.timeAllowed}`] : []),
    ...(config.paperInstructions ? [`- General instructions: ${config.paperInstructions}`] : []),
    `- Total questions: ${config.totalQuestions}`,
    `- Total marks: ${config.totalMarks}`,
    `- Difficulty split: ${config.difficulty.easy}% easy, ${config.difficulty.medium}% medium, ${config.difficulty.hard}% hard`,
    `- Question types: ${config.questionTypes.join(', ')}`,
    `- Number of sections: ${config.sections}`,
    ...(config.instructions ? [`- Additional instructions: ${config.instructions}`] : []),
  ]

  const userPrompt = `${sourceInstruction}

Assignment requirements:
${requirementLines.join('\n')}

${hasPdfContent ? `--- DOCUMENT CONTENT (use this as the source for all questions) ---\n${extractedText}\n--- END DOCUMENT CONTENT ---` : ''}

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