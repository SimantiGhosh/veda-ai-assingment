"use client"

import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type PaperSummary = {
  title?: string
  subject?: string
  totalMarks?: number
}

type QuestionPaperPreviewProps = {
  assignmentId: string
  apiBaseUrl: string
  isPaperReady: boolean
  isPdfGenerating: boolean
  pdfUrl?: string | null
  progress?: number | null
  error?: string | null
  onBack: () => void
  onGeneratePdf: () => void
}

export default function QuestionPaperPreview({
  assignmentId,
  apiBaseUrl,
  isPaperReady,
  isPdfGenerating,
  pdfUrl,
  progress,
  error,
  onBack,
  onGeneratePdf,
}: QuestionPaperPreviewProps) {
  const [paperSummary, setPaperSummary] = useState<PaperSummary | null>(null)
  const [previewReady, setPreviewReady] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [iframeKey, setIframeKey] = useState(0)

  // Append the auth token as a query param so the iframe can authenticate
  // (iframes cannot send custom Authorization headers)
  const iframeSrc = useMemo(() => {
    const base = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''
    const token = api.getAuthToken()
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
    return `${base}/api/v1/assignments/${assignmentId}/paper/html${tokenParam}`
  }, [apiBaseUrl, assignmentId])

  useEffect(() => {
    if (!isPaperReady) {
      setPreviewReady(false)
      setPreviewError(null)
      return
    }

    let active = true
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const loadPaper = async () => {
      try {
        const data = await api.getAssignmentPaper(assignmentId)
        if (!active) return
        setPaperSummary({
          title: data?.title,
          subject: data?.subject,
          totalMarks: data?.totalMarks,
        })
        setPreviewReady(true)
        setPreviewError(null)
        setIframeKey(prev => prev + 1)
      } catch (err) {
        if (!active) return
        const message = (err as Error).message || 'Paper not ready'
        if (message.toLowerCase().includes('paper not ready')) {
          retryTimer = setTimeout(loadPaper, 1500)
          return
        }
        setPreviewError(message)
      }
    }

    loadPaper()

    return () => {
      active = false
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [isPaperReady, assignmentId])

  return (
    <div className="flex h-full min-h-[100dvh] w-full flex-col gap-6">
      {/* Top control bar */}
      <div className="flex flex-col gap-4 rounded-[22px] bg-[#1f1f1f] px-6 py-4 text-white shadow-[0px_18px_30px_rgba(0,0,0,0.15)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Back"
            >
              <span className="text-lg leading-none">&#8592;</span>
            </button>
            <div>
              <div className="text-[16px] font-semibold">Question Paper Preview</div>
              <div className="text-[13px] text-white/70">
                {isPaperReady ? 'Ready to review and export.' : 'Generating preview...'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGeneratePdf}
              disabled={!isPaperReady || isPdfGenerating}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-[#1f1f1f] disabled:opacity-60"
            >
              <img src="/icons/icon_line/Plus.svg" alt="Export" className="h-4 w-4" />
              {isPdfGenerating ? 'Generating PDF...' : 'Download as PDF'}
            </button>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                className="text-[13px] font-medium text-white underline"
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
            ) : null}
          </div>
        </div>

        {typeof progress === 'number' && progress < 100 ? (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12px] text-white/60">Progress: {progress}%</div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}
        {error ? <div className="text-[12px] text-[#ffb4a2]">{error}</div> : null}
        {previewError ? <div className="text-[12px] text-[#ffb4a2]">{previewError}</div> : null}
      </div>

      {/* Preview iframe */}
      <div className="flex-1 overflow-hidden rounded-[24px] bg-white shadow-[0px_20px_40px_rgba(0,0,0,0.12)]">
        {previewReady ? (
          <iframe
            key={iframeKey}
            title="Question paper preview"
            src={iframeSrc}
            className="h-screen w-full border-0"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1f1f1f]/20 border-t-[#1f1f1f]" />
            <span className="text-[14px] text-[#6b6b6b]">
              {isPaperReady ? 'Finalizing preview...' : 'Preparing preview...'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}