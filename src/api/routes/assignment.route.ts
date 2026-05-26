import { Router } from 'express'
import { assignmentController } from '../controllers/assignment.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware'
import { assignmentSchema } from '../../schemas/assignment.schema'

const router = Router()

router.use(authMiddleware)
router.use(rateLimitMiddleware)

router.post('/', validate(assignmentSchema), assignmentController.create)
router.get('/', assignmentController.list)
router.get('/:id/status', assignmentController.getStatus)
router.get('/:id/paper', assignmentController.getPaper)
router.post('/:id/export-pdf', assignmentController.exportPdf)

export default router