import process from 'node:process'
import { questionPaperSchema } from '../schemas/paper.schema'
import { buildGenerationPrompt } from '../utils/promptMaker'
import type { AssignmentConfig } from '../types/assignment.types'
import { logger } from '../utils/logger'

const GEMINI_MODEL = 'gemini-2.5-flash'
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
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.4,
              responseMimeType: 'application/json',
            },
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Gemini API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()

        // Check if Gemini truncated the response due to token limits
        const finishReason = data?.candidates?.[0]?.finishReason
        if (finishReason && finishReason !== 'STOP') {
          throw new Error(`Gemini stopped early: finishReason=${finishReason}. Try reducing totalQuestions.`)
        }

        const rawText: string = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? '')
          .join('')
          ?? ''

        if (!rawText) {
          throw new Error('Empty response from Gemini')
        }

        // Strip markdown fences if model ignores responseMimeType
        const cleaned = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim()

        console.log('=== RAW LLM OUTPUT (attempt', attempt, ') ===')
        console.log(cleaned)
        console.log('=== END LLM OUTPUT ===')

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

        console.log('=== ERROR on attempt', attempt, '===')
        console.log(lastError.message)
        console.log('=== END ERROR ===')

        // Don't retry on validation errors — the JSON parsed fine but schema failed,
        // retrying with same config won't help
        if (lastError.message.startsWith('ZodError') || attempt === 3) break

        // Exponential backoff before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 1000))
      }
    }

    throw lastError
  }
}