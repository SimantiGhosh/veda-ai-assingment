"use client"

import { useMemo } from 'react'

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
  const iframeSrc = useMemo(() => {
    const base = apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''
    return `${base}/api/v1/assignments/${assignmentId}/paper/html`
  }, [apiBaseUrl, assignmentId])

  return (
    <div className="flex h-full w-full flex-col gap-6">
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

        {typeof progress === 'number' ? (
          <div className="text-[12px] text-white/60">Progress: {progress}%</div>
        ) : null}
        {error ? <div className="text-[12px] text-[#ffb4a2]">{error}</div> : null}
      </div>

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
