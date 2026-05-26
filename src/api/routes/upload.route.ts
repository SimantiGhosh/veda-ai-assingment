import { Router } from 'express'
import { uploadController } from '../controllers/upload.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()
router.use(authMiddleware)
router.post('/presigned-url', uploadController.getPresignedUrl)

export default router