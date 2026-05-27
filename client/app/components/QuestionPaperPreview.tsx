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

  // Append the auth token as a query param so the iframe can authenticate
  // (iframes cannot send custom Authorization headers)
  const iframeSrc = useMemo(() => {
    const base = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''
    const token = api.getAuthToken()
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
    return `${base}/api/v1/assignments/${assignmentId}/paper/html${tokenParam}`
  }, [apiBaseUrl, assignmentId])

  useEffect(() => {
    if (!isPaperReady) return
    api
      .getAssignmentPaper(assignmentId)
      .then((data: any) => {
        setPaperSummary({
          title: data?.title,
          subject: data?.subject,
          totalMarks: data?.totalMarks,
        })
      })
      .catch(() => {
        // summary is non-critical, silently ignore
      })
  }, [isPaperReady, assignmentId])

  return (
    <div className="flex h-full w-full flex-col gap-6">
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
      </div>

      {/* Paper summary header — shown once paper is ready */}
      {isPaperReady && paperSummary && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-6 py-4 shadow-[0px_4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-0.5">
            <div className="text-[18px] font-bold text-[#303030]">
              {paperSummary.title ?? 'Question Paper'}
            </div>
            {paperSummary.subject && (
              <div className="text-[13px] text-[#5d5d5d]/70">
                Subject: <span className="font-semibold text-[#303030]">{paperSummary.subject}</span>
              </div>
            )}
          </div>
          {typeof paperSummary.totalMarks === 'number' && (
            <div className="flex items-center gap-1.5 rounded-full bg-[#f0f0f0] px-4 py-1.5">
              <span className="text-[13px] font-semibold text-[#303030]">
                Total Marks: {paperSummary.totalMarks}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Preview iframe */}
      <div className="flex-1 overflow-hidden rounded-[24px] bg-white shadow-[0px_20px_40px_rgba(0,0,0,0.12)]">
        {isPaperReady ? (
          <iframe
            title="Question paper preview"
            src={iframeSrc}
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[14px] text-[#6b6b6b]">Preparing preview...</span>
          </div>
        )}
      </div>
    </div>
  )
}