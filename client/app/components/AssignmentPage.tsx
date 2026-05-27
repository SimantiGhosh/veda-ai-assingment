"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { io, type Socket } from 'socket.io-client'

import AssignmentBox from './AssignmentBox'
import CreateAssignment, { type CreateAssignmentPayload } from './CreateAssignment'
import { EmptyState } from './EmptyState'
import QuestionPaperPreview from './QuestionPaperPreview'
import { api } from '../lib/api'

type AssignmentItem = {
  _id: string
  config?: { subject?: string; topic?: string; dueDate?: string }
  createdAt?: string
  resultId?: string
}

type AssignmentPageProps = {
  triggerCreate?: boolean
  onCreateTriggered?: () => void
}

export default function AssignmentPage({ triggerCreate, onCreateTriggered }: AssignmentPageProps) {
  const gridScrollRef = useRef<HTMLDivElement | null>(null)
  const scrollTweenRef = useRef<ReturnType<typeof animate> | null>(null)
  const [view, setView] = useState<'list' | 'create' | 'preview'>('list')
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [paperReady, setPaperReady] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true)

  const apiBaseUrl = useMemo(() => api.baseUrl(), [])

  const socketBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOCKET_URL ?? apiBaseUrl
  }, [apiBaseUrl])

  // Respond to sidebar "Create Assignment" click
  useEffect(() => {
    if (triggerCreate) {
      setView('create')
      onCreateTriggered?.()
    }
  }, [triggerCreate, onCreateTriggered])

  const handleGridWheel = useCallback((event: React.WheelEvent) => {
    const container = gridScrollRef.current
    if (!container || event.ctrlKey || event.shiftKey) return
    const maxScrollTop = container.scrollHeight - container.clientHeight
    if (maxScrollTop <= 0) return
    event.preventDefault()
    const targetScrollTop = Math.min(maxScrollTop, Math.max(0, container.scrollTop + event.deltaY))
    scrollTweenRef.current?.stop()
    scrollTweenRef.current = animate(container.scrollTop, targetScrollTop, {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => { container.scrollTop = latest },
    })
  }, [])

  useEffect(() => () => scrollTweenRef.current?.stop(), [])

  const handleCreateNext = async (payload: CreateAssignmentPayload) => {
    setErrorMessage(null)
    setView('preview')
    setProgress(0)
    setPaperReady(false)
    setPdfUrl(null)

    try {
      const data = await api.createAssignment({
        subject: payload.subject ?? 'General',
        topic: payload.topic ?? 'Assignment',
        schoolName: payload.schoolName,
        className: payload.className,
        timeAllowed: payload.timeAllowed,
        paperInstructions: payload.paperInstructions,
        totalQuestions: payload.totalQuestions,
        totalMarks: payload.totalMarks,
        difficulty: payload.difficulty ?? { easy: 34, medium: 33, hard: 33 },
        questionTypes: payload.questionTypes,
        sections: payload.sections ?? 1,
        instructions: payload.instructions,
        dueDate: payload.dueDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fileKey: payload.fileKey,
      })
      setAssignmentId(data.assignmentId)
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  const handleGeneratePdf = async () => {
    if (!assignmentId) return
    setIsPdfGenerating(true)
    setErrorMessage(null)
    try {
      await api.exportPdf(assignmentId)
    } catch (error) {
      setErrorMessage((error as Error).message)
      setIsPdfGenerating(false)
    }
  }

  const handleViewAssignment = async (id: string) => {
    setAssignmentId(id)
    setView('preview')
    setProgress(null)
    setPdfUrl(null)
    setIsPdfGenerating(false)
    setErrorMessage(null)
    try {
      const status = await api.getAssignmentStatus(id)
      const ready = Boolean(status?.resultId)
      setPaperReady(ready)
      if (ready) {
        setProgress(100)
        setErrorMessage(null)
      }
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    try {
      await api.deleteAssignment(id)
      setAssignments(prev => prev.filter(item => item._id !== id))
    } catch (error) {
      setErrorMessage((error as Error).message)
    }
  }

  useEffect(() => {
    if (!assignmentId || view !== 'preview') return

    // Connect immediately — no setTimeout delay.
    // If the worker already emitted progress before we connected,
    // the server will replay the last known event from Redis on join.
    const socket = io(socketBaseUrl || undefined, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join:assignment', assignmentId)
    })

    socket.on('job:processing', (_event: { message?: string }) => {
      setErrorMessage(null)
      setProgress(10)
    })
    socket.on('job:progress', (event: { progress?: number; message?: string }) => {
      setErrorMessage(null)
      if (typeof event.progress === 'number') setProgress(event.progress)
    })
    socket.on('job:done', () => {
      setErrorMessage(null)
      setProgress(100)
      setPaperReady(true)
    })
    socket.on('job:failed', (event: { reason?: string }) => {
      setErrorMessage(event.reason ?? 'Generation failed')
    })
    socket.on('pdf:done', (event: { pdfUrl?: string }) => {
      setIsPdfGenerating(false)
      setPdfUrl(event.pdfUrl ?? null)
    })

    return () => {
      socketRef.current?.emit('leave:assignment', assignmentId)
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [assignmentId, socketBaseUrl, view])

  useEffect(() => {
    if (!assignmentId || view !== 'preview' || paperReady) return

    let active = true
    const pollStatus = async () => {
      try {
        const status = await api.getAssignmentStatus(assignmentId)
        if (!active) return
        if (status?.resultId) {
          setPaperReady(true)
          setProgress(100)
          setErrorMessage(null)
        }
      } catch (error) {
        if (active) setErrorMessage((error as Error).message)
      }
    }

    const intervalId = window.setInterval(pollStatus, 3000)
    pollStatus()

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [assignmentId, view, paperReady])

  useEffect(() => {
    if (view !== 'list') return
    let isMounted = true
    setIsLoadingAssignments(true)
    api.listAssignments()
      .then((data) => { if (isMounted) setAssignments(data) })
      .catch((error) => { if (isMounted) setErrorMessage((error as Error).message) })
      .finally(() => { if (isMounted) setIsLoadingAssignments(false) })
    return () => { isMounted = false }
  }, [view])

  // Early return AFTER all hooks
  if (view === 'list' && !isLoadingAssignments && assignments.length === 0) {
    return (
      <div className="relative flex h-full w-full flex-col gap-5 overflow-hidden px-2 pb-6 pt-2 md:px-4">
        <div className="flex h-full w-full items-center justify-center">
          <EmptyState />
        </div>
        <div className="flex w-full justify-center">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-2 text-[14px] font-semibold text-white shadow-[0px_18px_30px_rgba(0,0,0,0.18)]"
            onClick={() => setView('create')}
          >
            <span className="text-lg leading-none">+</span>
            Create Assignment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-hidden px-2 pb-6 pt-2 md:px-4">
      {view === 'create' ? (
        <div className="assignment-grid-scroll flex-1 min-h-0 overflow-y-auto pb-32 pr-1 md:pb-0">
          <CreateAssignment onBack={() => setView('list')} onNext={handleCreateNext} />
        </div>
      ) : view === 'preview' ? (
        <div className="assignment-grid-scroll flex-1 min-h-0 overflow-y-auto pb-32 pr-1 md:pb-0">
          {assignmentId ? (
            <QuestionPaperPreview
              assignmentId={assignmentId}
              apiBaseUrl={apiBaseUrl}
              isPaperReady={paperReady}
              isPdfGenerating={isPdfGenerating}
              pdfUrl={pdfUrl}
              progress={progress}
              error={errorMessage}
              onBack={() => setView('list')}
              onGeneratePdf={handleGeneratePdf}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-[14px] text-[#6b6b6b]">Creating assignment...</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <section className="flex w-full items-center justify-between md:hidden">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 text-[#303030] backdrop-blur"
              onClick={() => window.history.back()}
              aria-label="Back"
            >
              <span className="text-lg leading-none">&#8592;</span>
            </button>
            <div className="flex-1 text-center text-[16px] font-bold text-[#303030]">Assignments</div>
            <div className="h-12 w-12" />
          </section>
          <section className="flex w-full flex-col gap-4">
            <div className="hidden w-full items-center gap-4 rounded-2xl bg-white/0 px-1 md:inline-flex">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#4BC26D] outline outline-[4px] outline-[#4BC26D]/40 shadow-[0px_32px_48px_rgba(0,0,0,0.20),_0px_16px_48px_rgba(0,0,0,0.12)]" />
                <div className="inline-flex flex-col items-start gap-0.5">
                  <div className="flex flex-col justify-center text-[18px] font-bold leading-7 text-[#303030] md:text-[20px]">Assignments</div>
                  <div className="flex flex-col justify-center text-[13px] font-normal leading-[19.6px] text-[#5d5d5d]/55 md:text-[14px]">Manage and create assignments for your classes.</div>
                </div>
              </div>
            </div>

            <div className="inline-flex h-16 w-full items-center justify-between gap-3 overflow-hidden rounded-[20px] bg-white px-4 md:px-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <img src="/icons/Filter.svg" alt="Filter" className="h-5 w-5" />
                  <span className="text-[14px] font-bold leading-[19.6px] text-[#A9A9A9]">Filter By</span>
                </div>
              </div>
              <div className="flex w-[220px] items-center gap-3 md:w-[380px]">
                <div className="flex h-11 w-full items-center gap-2 rounded-full border border-black/20 px-4">
                  <img src="/icons/Lens.svg" alt="Search" className="h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search Name"
                    className="w-full bg-transparent text-[14px] font-bold leading-[19.6px] text-[#A9A9A9] placeholder:text-[#A9A9A9] focus:outline-none"
                    disabled
                  />
                </div>
              </div>
            </div>
          </section>

          <motion.section
            ref={gridScrollRef}
            className="assignment-grid-scroll relative w-full flex-1 min-h-0 overflow-x-hidden overflow-y-auto"
            onWheel={handleGridWheel}
          >
            <motion.div layout className="grid w-full grid-cols-2 gap-6 pb-28 max-[1280px]:grid-cols-1">
              <AnimatePresence mode="popLayout">
                {assignments.map((assignment) => (
                  <motion.div
                    key={assignment._id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <AssignmentBox
                      name={assignment.config?.topic ?? assignment.config?.subject ?? 'Assignment'}
                      assignedOn={assignment.createdAt?.slice(0, 10) ?? '-'}
                      dueDate={assignment.config?.dueDate?.slice(0, 10) ?? '-'}
                      onView={() => handleViewAssignment(assignment._id)}
                      onDelete={() => handleDeleteAssignment(assignment._id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.section>
          <div className="absolute bottom-6 left-1/2 z-50 hidden -translate-x-1/2 justify-center md:flex">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-2 text-[14px] font-semibold text-white shadow-[0px_18px_30px_rgba(0,0,0,0.18)]"
              onClick={() => setView('create')}
            >
              <span className="text-lg leading-none">+</span>
              Create Assignment
            </button>
          </div>
        </>
      )}
    </div>
  )
}