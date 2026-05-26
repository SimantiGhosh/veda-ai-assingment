import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { v4 as uuid } from 'uuid'
import routes from './api/routes'
import { errorMiddleware } from './api/middleware/error.middleware'
import { logger } from './utils/logger'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(express.json())
app.use((req, res, next) => {
  req.traceId = uuid()
  res.setHeader('x-trace-id', req.traceId)
  logger.info({ traceId: req.traceId, method: req.method, path: req.path }, 'Incoming request')
  next()
})

app.use('/api/v1', routes)
app.use(errorMiddleware)

export default app