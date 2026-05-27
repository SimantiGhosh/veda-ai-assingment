import type { Request, Response } from 'express'
import { assignmentService } from '../../services/assignment.service'
import { Assignment } from '../../models/assignment.model'
import { pdfQueue } from '../../queues'
import { pdfService } from '../../services/pdf.service'
import type { QuestionPaper as QuestionPaperType } from '../../types/paper.types'

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

  async getPaperHtml(req: Request, res: Response) {
    try {
      const assignmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!assignmentId) return res.status(400).json({ error: 'Assignment id is required' })
      const paper = await assignmentService.getPaper(assignmentId, req.userId)
      const assignment = await Assignment.findById(assignmentId)
      const assignmentConfig = assignment?.config
      const paperData = (paper as any)?.toObject ? (paper as any).toObject() : paper

      const paperForView: QuestionPaperType = {
        _id: paperData._id?.toString() ?? '',
        assignmentId: paperData.assignmentId ?? assignmentId,
        userId: paperData.userId ?? '',
        title: paperData.title ?? '',
        subject: paperData.subject ?? '',
        totalMarks: paperData.totalMarks ?? 0,
        generatedAt: paperData.createdAt ?? paperData.generatedAt ?? new Date(),
        sections: (paperData.sections ?? []).map((section: any) => ({
          id: section.id ?? '',
          title: section.title ?? '',
          instruction: section.instruction ?? '',
          questions: (section.questions ?? []).map((question: any) => ({
            id: question.id ?? '',
            text: question.text ?? '',
            difficulty: question.difficulty ?? 'easy',
            marks: question.marks ?? 0,
            type: question.type ?? 'short_answer',
            options: question.options ?? undefined,
          })),
        })),
      }

      const html = pdfService.renderHtml(paperForView, assignmentConfig)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.send(html)
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
  },

  async delete(req: Request, res: Response) {
    try {
      const assignmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      if (!assignmentId) return res.status(400).json({ error: 'Assignment id is required' })
      const result = await assignmentService.deleteById(assignmentId, req.userId)
      res.json(result)
    } catch (err) {
      const message = (err as Error).message
      const status = message === 'Assignment not found' ? 404 : 500
      res.status(status).json({ error: message })
    }
  }
}