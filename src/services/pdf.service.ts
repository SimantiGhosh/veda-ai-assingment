import puppeteer from 'puppeteer'
import Handlebars from 'handlebars'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { QuestionPaper } from '../types/paper.types'
import { storageService } from './storage.service'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const template = Handlebars.compile(
  fs.readFileSync(path.join(__dirname, '../../templates/paper.hbs'), 'utf-8')
)

export const pdfService = {
  renderHtml(paper: QuestionPaper): string {
    return template({ paper })
  },

  async generate(paper: QuestionPaper, assignmentId: string): Promise<string> {
    const html = this.renderHtml(paper)

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.waitForNetworkIdle()
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    const fileKey = `exports/${assignmentId}/paper_${Date.now()}.pdf`
    await storageService.uploadFile(fileKey, Buffer.from(pdfBuffer), 'application/pdf')

    const url = await storageService.getDownloadUrl(fileKey)
    return url
  }
}