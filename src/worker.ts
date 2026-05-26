import { connectDatabase } from './config'
import { createGenerationWorker } from './workers/generation.worker'
import { createPdfWorker } from './workers/pdf.worker'
import { logger } from './utils/logger'

const start = async () => {
  await connectDatabase()

  const generationWorker = createGenerationWorker()
  const pdfWorker = createPdfWorker()

  logger.info('Workers started')

  // graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing workers')
    await generationWorker.close()
    await pdfWorker.close()
    process.exit(0)
  })
}

start()