import 'dotenv/config'
import { z } from 'zod'
import process from 'node:process'

const envSchema = z.object({
  PORT: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASSWORD: z.string(),
  MONGODB_URI: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GCS_PROJECT_ID: z.string(),
  GCS_BUCKET_NAME: z.string(),
  GENERATION_QUEUE_CONCURRENCY: z.string(),
  PDF_QUEUE_CONCURRENCY: z.string(),
  JWT_SECRET: z.string(),
  GEMINI_API_KEY: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data