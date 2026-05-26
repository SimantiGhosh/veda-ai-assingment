import { Router } from 'express'
import assignmentRoutes from './assignment.route'
import uploadRoutes from './upload.route'

const router = Router()

router.use('/assignments', assignmentRoutes)
router.use('/uploads', uploadRoutes)

export default router
