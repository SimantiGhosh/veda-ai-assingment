import type { Request, Response } from 'express'
import { assignmentService } from '../../services/assignment.service'
import { pdfQueue } from '../../queues'

export const assignmentController = {
  async create(req: Request, res: Response) {
    try {
      const result = await assignmentService.create(
        req.userId,
        req.traceId,
        req.body,
        req.body.fileKey
      )
      res.status(202).json(result)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async getStatus(req: Request, res: Response) {
    try {
      const assignmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!assignmentId) return res.status(400).json({ error: 'Assignment id is required' })
      const assignment = await assignmentService.getStatus(assignmentId, req.userId)
      res.json(assignment)
    } catch (err) {
      res.status(404).json({ error: (err as Error).message })
    }
  },

  async getPaper(req: Request, res: Response) {
    try {
      const assignmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!assignmentId) return res.status(400).json({ error: 'Assignment id is required' })
      const paper = await assignmentService.getPaper(assignmentId, req.userId)
      res.json(paper)
    } catch (err) {
      res.status(404).json({ error: (err as Error).message })
    }
  },

  async exportPdf(req: Request, res: Response) {
    try {
      const assignmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!assignmentId) return res.status(400).json({ error: 'Assignment id is required' })
      const assignment = await assignmentService.getStatus(assignmentId, req.userId)
      if (!assignment.resultId) return res.status(400).json({ error: 'Paper not ready' })

      await pdfQueue.add('export-pdf', {
        assignmentId,
        paperId: assignment.resultId,
        userId: req.userId,
      })

      res.status(202).json({ message: 'PDF export started' })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  },

  async list(req: Request, res: Response) {
    try {
      const assignments = await assignmentService.listByUser(req.userId)
      res.json(assignments)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  }
}