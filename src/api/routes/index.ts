import { Router } from 'express'
import assignmentRoutes from './assignment.route'
import uploadRoutes from './upload.route'
import authRoutes from './auth.route'

const router = Router()

router.use('/assignments', assignmentRoutes)
router.use('/uploads', uploadRoutes)
router.use('/auth', authRoutes)

export default router
