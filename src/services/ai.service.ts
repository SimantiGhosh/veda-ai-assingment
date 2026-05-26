import process from 'node:process'
import { questionPaperSchema } from '../schemas/paper.schema'
import { buildGenerationPrompt } from '../utils/promptMaker'
import type { AssignmentConfig } from '../types/assignment.types'
import { logger } from '../utils/logger'

const GEMINI_MODEL = 'gemini-3-flash-preview'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export const aiService = {
  async generatePaper(config: AssignmentConfig, extractedText?: string) {
    const { systemPrompt, userPrompt } = buildGenerationPrompt(config, extractedText)
    let lastError: Error | null = null
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 4000,
              temperature: 0.4,
            },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Gemini API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        const rawText = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? '')
          .join('')
          ?? ''

        const cleaned = rawText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        const parsed = JSON.parse(cleaned)
        const validated = questionPaperSchema.parse(parsed)

        return {
          paper: validated,
          usage: data?.usageMetadata,
          model: GEMINI_MODEL,
        }
      } catch (error) {
        lastError = error as Error
        logger.warn(`AI generation attempt ${attempt} failed: ${lastError.message}`)
        if (attempt === 3) break
      }
    }

    throw lastError
  }
}