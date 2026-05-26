import type { Request, Response } from 'express'
import { authService } from '../../services/auth.service'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      const message = (err as Error).message
      const status = message === 'Username already exists' ? 409 : 500
      res.status(status).json({ error: message })
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body)
      res.json(result)
    } catch (err) {
      const message = (err as Error).message
      const status = message === 'Invalid credentials' ? 401 : 500
      res.status(status).json({ error: message })
    }
  }
}
