"use client"

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../lib/api'

type CreateAssignmentProps = {
	onBack: () => void
	onNext: (payload: CreateAssignmentPayload) => void
}


const questionTypeOptions = [
	'Multiple Choice Questions',
	'Short Questions',
	'Diagram/Graph-Based Questions',
	'Numerical Problems',
]

type QuestionRow = {
	label: string
	questionCount: number
	marks: number
}

export type CreateAssignmentPayload = {
	subject?: string
	topic?: string
	schoolName?: string
	className?: string
	timeAllowed?: string
	paperInstructions?: string
	totalQuestions: number
	totalMarks: number
	questionTypes: ('mcq' | 'short_answer' | 'long_answer')[]
	difficulty?: { easy: number; medium: number; hard: number }
	sections?: number
	instructions?: string
	dueDate?: string
	fileKey?: string
}

const questionTypeMap: Record<string, 'mcq' | 'short_answer' | 'long_answer'> = {
	'Multiple Choice Questions': 'mcq',
	'Short Questions': 'short_answer',
	'Diagram/Graph-Based Questions': 'long_answer',
	'Numerical Problems': 'long_answer',
}

export default function CreateAssignment({ onBack, onNext }: CreateAssignmentProps) {
	const [step, setStep] = useState<'meta' | 'details'>('meta')
	const [openIndex, setOpenIndex] = useState<number | null>(null)
	const [rows, setRows] = useState<QuestionRow[]>(
		questionTypeOptions.map(label => ({ label, questionCount: 4, marks: 1 }))
	)
	const [quizName, setQuizName] = useState('')
	const [schoolName, setSchoolName] = useState('')
	const [subject, setSubject] = useState('')
	const [className, setClassName] = useState('')
	const [timeAllowed, setTimeAllowed] = useState('')
	const [paperInstructions, setPaperInstructions] = useState('')
	const [instructions, setInstructions] = useState('')
	const [fileKey, setFileKey] = useState<string | null>(null)
	const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const handleToggle = (index: number) => {
		setOpenIndex(prev => (prev === index ? null : index))
	}

	const handleSelect = (index: number, value: string) => {
		setRows(prev => {
			const next = [...prev]
			next[index] = { ...next[index], label: value }
			return next
		})
		setOpenIndex(null)
	}

	const handleAddRow = () => {
		setRows(prev => [
			...prev,
			{
				label: questionTypeOptions[0],
				questionCount: 1,
				marks: 1,
			},
		])
	}

	const handleRemoveRow = (index: number) => {
		setRows(prev => prev.filter((_, rowIndex) => rowIndex !== index))
		setOpenIndex(prev => (prev === index ? null : prev))
	}

	const handleCountChange = (index: number, delta: number) => {
		setRows(prev => {
			const next = [...prev]
			const current = next[index]
			const questionCount = Math.max(0, current.questionCount + delta)
			next[index] = { ...current, questionCount }
			return next
		})
	}

	const handleMarksChange = (index: number, delta: number) => {
		setRows(prev => {
			const next = [...prev]
			const current = next[index]
			const marks = Math.max(0, current.marks + delta)
			next[index] = { ...current, marks }
			return next
		})
	}

	const totalQuestions = rows.reduce((sum, row) => sum + row.questionCount, 0)
	const totalMarks = rows.reduce((sum, row) => sum + row.marks * row.questionCount, 0)
	const questionTypes = Array.from(
		new Set(
			rows.map(row => questionTypeMap[row.label]).filter(Boolean)
		)
	)

	const handleBrowseFiles = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		setUploadStatus('uploading')
		try {
			const { url, fileKey: newFileKey } = await api.getUploadUrl(file.type)
			await api.uploadFileToSignedUrl(url, file)
			setFileKey(newFileKey)
			setUploadStatus('done')
		} catch {
			setUploadStatus('error')
		}
	}

	useEffect(() => {
		if (openIndex === null) {
			return
		}

		const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
			if (!(event.target instanceof Element)) {
				return
			}

			const selector = `[data-question-menu-index="${openIndex}"]`
			if (!event.target.closest(selector)) {
				setOpenIndex(null)
			}
		}

		document.addEventListener('mousedown', handleOutsideClick)
		document.addEventListener('touchstart', handleOutsideClick)

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
			document.removeEventListener('touchstart', handleOutsideClick)
		}
	}, [openIndex])

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-8 rounded-[40px] bg-transparent p-6 md:p-8">
			<div className="flex flex-col gap-8">
						<header className="hidden items-center gap-4 px-1 md:flex">
							<span className="h-3 w-3 rounded-full bg-[#4BC26D] outline outline-[4px] outline-[#4BC26D]/40 shadow-[0px_32px_48px_rgba(0,0,0,0.20),_0px_16px_48px_rgba(0,0,0,0.12)]" />
							<div className="flex flex-col gap-0.5">
								<div className="text-[20px] font-bold leading-7 text-[#303030]">Create Assignment</div>
								<div className="text-[14px] font-normal leading-[19.6px] text-[#5d5d5d]/55">
									Set up a new assignment for your students
								</div>
							</div>
						</header>

						<div className="flex items-center gap-4 px-1">
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
								<div
									className="h-full rounded-full bg-[#1f1f1f] transition-all duration-300"
									style={{ width: step === 'meta' ? '50%' : '100%' }}
								/>
							</div>
						</div>

						{step === 'meta' ? (
							<section className="flex flex-col gap-8 rounded-[32px] bg-white/50 p-6 md:p-8">
								<div className="flex flex-col gap-0.5">
									<div className="text-[20px] font-bold leading-7 text-[#303030]">Assignment Details</div>
									<div className="text-[14px] font-normal leading-[19.6px] text-[#5d5d5d]/80">
										Basic information for the question paper header
									</div>
								</div>

								<div className="relative z-50 flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">Quiz Name</div>
										<input
											type="text"
											placeholder="Unit 2 Assessment"
											value={quizName}
											onChange={(event) => setQuizName(event.target.value)}
											className="h-11 rounded-full border border-[#DADADA] bg-white px-4 text-[16px] font-medium text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">School Name</div>
										<input
											type="text"
											placeholder="Delhi Public School, Sector-4, Bokaro"
											value={schoolName}
											onChange={(event) => setSchoolName(event.target.value)}
											className="h-11 rounded-full border border-[#DADADA] bg-white px-4 text-[16px] font-medium text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none"
										/>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<div className="flex flex-col gap-2">
											<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">Subject</div>
											<input
												type="text"
												placeholder="English"
												value={subject}
												onChange={(event) => setSubject(event.target.value)}
												className="h-11 rounded-full border border-[#DADADA] bg-white px-4 text-[16px] font-medium text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none"
											/>
										</div>
										<div className="flex flex-col gap-2">
											<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">Class</div>
											<input
												type="text"
												placeholder="5th"
												value={className}
												onChange={(event) => setClassName(event.target.value)}
												className="h-11 rounded-full border border-[#DADADA] bg-white px-4 text-[16px] font-medium text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none"
											/>
										</div>
									</div>

									<div className="flex flex-col gap-2">
										<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">Maximum Time</div>
										<input
											type="text"
											placeholder="45 minutes"
											value={timeAllowed}
											onChange={(event) => setTimeAllowed(event.target.value)}
											className="h-11 rounded-full border border-[#DADADA] bg-white px-4 text-[16px] font-medium text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none"
										/>
									</div>

									<div className="flex flex-col gap-2">
										<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">Instructions</div>
										<textarea
											className="min-h-[96px] w-full resize-none rounded-2xl border border-[#DADADA] bg-white/70 p-4 text-[14px] font-medium leading-[19.6px] text-[#303030] placeholder:text-[#A9A9A9] focus:outline-none"
											placeholder="All questions are compulsory unless stated otherwise."
											value={paperInstructions}
											onChange={(event) => setPaperInstructions(event.target.value)}
											rows={3}
										/>
									</div>
								</div>
							</section>
						) : (
							<section className="flex flex-col gap-6 rounded-[24px] bg-white/50 p-4 md:gap-8 md:rounded-[32px] md:p-8">
								<div className="flex flex-col gap-0.5">
									<div className="text-[20px] font-bold leading-7 text-[#303030]">Assignment Details</div>
									<div className="text-[14px] font-normal leading-[19.6px] text-[#5d5d5d]/80">
										Set up the question breakdown and supporting files
									</div>
								</div>

								<div className="relative z-50 flex flex-col gap-4">
									<div className="flex flex-col gap-3">
										<div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-black/20 bg-white px-5 py-5 text-center md:gap-4 md:rounded-[24px] md:border-solid md:px-8 md:py-6">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
												<img src="/icons/Upload%20cloud.svg" alt="Upload" className="h-6 w-6" />
											</div>
											<div className="flex flex-col gap-1">
												<div className="text-[14px] font-medium leading-[20px] text-[#303030] md:text-[16px] md:leading-[22.4px]">
													Choose a file or drag &amp; drop it here
												</div>
												<div className="text-[12px] font-normal leading-[18px] text-[#A9A9A9] md:text-[14px] md:leading-[19.6px]">
													JPEG, PNG, upto 10MB
												</div>
											</div>
												<input
													ref={fileInputRef}
													type="file"
													accept="image/*,application/pdf"
													className="hidden"
													onChange={handleFileChange}
												/>
												<button
												type="button"
												className="rounded-full bg-[#f6f6f6] px-5 py-2 text-[13px] font-medium leading-[18px] text-[#303030] md:px-6 md:text-[14px] md:leading-[19.6px]"
												onClick={handleBrowseFiles}
										>
												{uploadStatus === 'uploading'
													? 'Uploading...'
													: uploadStatus === 'done'
														? 'File Uploaded'
														: 'Browse Files'}
											</button>
												{uploadStatus === 'error' ? (
													<span className="text-[12px] text-[#C52828]">Upload failed</span>
												) : null}
										</div>
										<div className="text-center text-[13px] font-medium leading-[18px] text-[#303030]/60 md:text-[16px] md:leading-[22.4px]">
											Upload images of your preferred document/image
										</div>
									</div>

									<div className="flex flex-col gap-2">
										<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">Due Date</div>
										<div className="flex h-11 items-center justify-between rounded-full border border-[#DADADA] px-4">
											<span className="text-[16px] font-medium leading-[22.4px] text-[#A9A9A9]">DD-MM-YYYY</span>
											<img src="/icons/Calendar_plus.svg" alt="Calendar" className="h-5 w-5" />
										</div>
									</div>

									<div className="flex flex-col gap-6">
										<div className="flex flex-col gap-4">
											<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">Question Type</div>
											<div className="hidden items-center justify-end gap-6 pr-1 text-[14px] font-medium text-[#303030] md:flex">
												<span className="w-[140px] text-center">No. of Questions</span>
												<span className="w-[96px] text-center">Marks</span>
											</div>
											<div className="flex flex-col gap-3">
												{rows.map((row, index) => (
													<div
														key={`${row.label}-${index}`}
														data-question-menu-index={index}
														className={`relative flex flex-col gap-2 ${openIndex === index ? 'z-50' : 'z-0'}`}
													>
														<div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_24px_auto]">
															<div className="relative flex flex-1 items-center justify-between rounded-full bg-white px-4 py-2 text-[16px] font-medium leading-[22.4px] text-[#303030]">
																<span>{row.label}</span>
																<button
																	type="button"
																	className="flex h-6 w-6 items-center justify-center rounded-full"
																	onClick={() => handleToggle(index)}
																	aria-label="Toggle question type menu"
																>
																	<motion.img
																		src="/icons/Chevron%20down.svg"
																		alt="Open"
																		className="h-4 w-4"
																		animate={{ rotate: openIndex === index ? 180 : 0 }}
																		transition={{ duration: 0.2, ease: 'easeOut' }}
																	/>
																</button>
																<AnimatePresence>
																	{openIndex === index ? (
																		<motion.div
																			className="absolute left-0 right-0 top-full z-50 mt-2 w-full rounded-2xl border border-black/10 bg-white p-2 shadow-[0px_18px_30px_rgba(0,0,0,0.12)]"
																			initial={{ opacity: 0, y: -6, scale: 0.98 }}
																			animate={{ opacity: 1, y: 0, scale: 1 }}
																			exit={{ opacity: 0, y: -6, scale: 0.98 }}
																			transition={{ duration: 0.18, ease: 'easeOut' }}
																		>
																			{questionTypeOptions.map((option) => (
																				<button
																					type="button"
																					key={option}
																					className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[14px] font-medium text-[#303030] hover:bg-[#f4f4f4]"
																					onClick={() => handleSelect(index, option)}
																				>
																					<span>{option}</span>
																					{option === row.label ? (
																						<span className="text-[12px] text-[#4BC26D]">Selected</span>
																					) : null}
																				</button>
																		))}
																	</motion.div>
																) : null}
															</AnimatePresence>
														</div>

													<div className="flex items-center justify-between gap-3 md:hidden">
														<button type="button" onClick={() => handleRemoveRow(index)} className="flex h-6 w-6 items-center justify-center">
															<img src="/icons/X.svg" alt="Remove" className="h-4 w-4" />
														</button>
														<div className="flex items-center gap-3">
															<div className="flex flex-col items-center gap-1">
																<span className="text-[11px] font-semibold text-[#303030]/70">No. of Questions</span>
																<div className="flex w-24 items-center justify-between rounded-full bg-white px-3 py-2">
																	<button type="button" onClick={() => handleCountChange(index, -1)}>
																		<img src="/icons/Minus.svg" alt="Decrease" className="h-4 w-4" />
																	</button>
																	<AnimatePresence mode="wait">
																		<motion.span
																			key={row.questionCount}
																			className="min-w-[16px] text-center text-[14px] font-medium text-[#303030]"
																			initial={{ y: 6, opacity: 0 }}
																			animate={{ y: 0, opacity: 1 }}
																			exit={{ y: -6, opacity: 0 }}
																			transition={{ duration: 0.16, ease: 'easeOut' }}
																			>
																			{row.questionCount}
																		</motion.span>
																	</AnimatePresence>
																	<button type="button" onClick={() => handleCountChange(index, 1)}>
																		<img src="/icons/Plus.svg" alt="Increase" className="h-4 w-4" />
																	</button>
																</div>
															</div>
															<div className="flex flex-col items-center gap-1">
																<span className="text-[11px] font-semibold text-[#303030]/70">Marks</span>
																<div className="flex w-24 items-center justify-between rounded-full bg-white px-3 py-2">
																	<button type="button" onClick={() => handleMarksChange(index, -1)}>
																		<img src="/icons/Minus.svg" alt="Decrease" className="h-4 w-4" />
																	</button>
																	<AnimatePresence mode="wait">
																		<motion.span
																			key={row.marks}
																			className="min-w-[16px] text-center text-[14px] font-medium text-[#303030]"
																			initial={{ y: 6, opacity: 0 }}
																			animate={{ y: 0, opacity: 1 }}
																			exit={{ y: -6, opacity: 0 }}
																			transition={{ duration: 0.16, ease: 'easeOut' }}
																			>
																			{row.marks}
																		</motion.span>
																	</AnimatePresence>
																	<button type="button" onClick={() => handleMarksChange(index, 1)}>
																		<img src="/icons/Plus.svg" alt="Increase" className="h-4 w-4" />
																	</button>
																</div>
															</div>
													</div>
												</div>

												<button type="button" onClick={() => handleRemoveRow(index)} className="hidden h-6 w-6 items-center justify-center md:flex">
													<img src="/icons/X.svg" alt="Remove" className="h-4 w-4" />
												</button>
												<div className="hidden items-center gap-6 md:flex">
															<div className="flex w-28 items-center justify-between rounded-full bg-white px-3 py-2">
																<button type="button" onClick={() => handleCountChange(index, -1)}>
																	<img src="/icons/Minus.svg" alt="Decrease" className="h-4 w-4" />
																</button>
																<AnimatePresence mode="wait">
																	<motion.span
																		key={row.questionCount}
																		className="min-w-[16px] text-center text-[16px] font-medium text-[#303030]"
																		initial={{ y: 6, opacity: 0 }}
																		animate={{ y: 0, opacity: 1 }}
																		exit={{ y: -6, opacity: 0 }}
																		transition={{ duration: 0.16, ease: 'easeOut' }}
																	>
																		{row.questionCount}
																	</motion.span>
																</AnimatePresence>
																<button type="button" onClick={() => handleCountChange(index, 1)}>
																	<img src="/icons/Plus.svg" alt="Increase" className="h-4 w-4" />
																</button>
															</div>
															<div className="flex w-28 items-center justify-between rounded-full bg-white px-3 py-2">
																<button type="button" onClick={() => handleMarksChange(index, -1)}>
																	<img src="/icons/Minus.svg" alt="Decrease" className="h-4 w-4" />
																</button>
																<AnimatePresence mode="wait">
																	<motion.span
																		key={row.marks}
																		className="min-w-[16px] text-center text-[16px] font-medium text-[#303030]"
																		initial={{ y: 6, opacity: 0 }}
																		animate={{ y: 0, opacity: 1 }}
																		exit={{ y: -6, opacity: 0 }}
																		transition={{ duration: 0.16, ease: 'easeOut' }}
																	>
																		{row.marks}
																	</motion.span>
																</AnimatePresence>
																<button type="button" onClick={() => handleMarksChange(index, 1)}>
																	<img src="/icons/Plus.svg" alt="Increase" className="h-4 w-4" />
																</button>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
											<button
												type="button"
												className="flex items-center gap-2 text-[14px] font-bold text-[#303030]"
												onClick={handleAddRow}
											>
											<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B2B2B]">
												<img src="/icons/Plus.svg" alt="Add" className="h-4 w-4 invert" />
											</span>
											Add Question Type
										</button>
									</div>

										<div className="flex items-end justify-end gap-6 text-right text-[14px] font-medium text-[#303030] md:text-[16px]">
										<div className="flex flex-col gap-2">
												<span>Total Questions : {totalQuestions}</span>
												<span>Total Marks : {totalMarks}</span>
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-3">
									<div className="text-[16px] font-bold leading-[22.4px] text-[#303030]">
										Additional Information (For better output)
									</div>
									<div className="flex h-28 flex-col justify-between rounded-2xl border border-[#DADADA] bg-white/25 p-4">
										<textarea
											className="h-full w-full resize-none bg-transparent text-[14px] font-medium leading-[19.6px] text-[#303030] placeholder:text-[#303030]/60 focus:outline-none"
											placeholder="e.g Generate a question paper for 3 hour exam duration..."
											value={instructions}
											onChange={(event) => setInstructions(event.target.value)}
											rows={3}
										/>
									</div>
								</div>
							</div>
						</section>
						)}

						<footer className="flex items-center justify-between gap-4">
							{step === 'meta' ? (
								<button
									type="button"
									className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[16px] font-medium text-[#303030]"
									onClick={onBack}
								>
									<span className="text-[18px]">&#8592;</span>
									Previous
								</button>
							) : (
								<button
									type="button"
									className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[16px] font-medium text-[#303030]"
									onClick={() => setStep('meta')}
								>
									<span className="text-[18px]">&#8592;</span>
									Previous
								</button>
							)}
							{step === 'meta' ? (
								<button
									type="button"
									className="flex items-center gap-2 rounded-full bg-[#181818] px-6 py-3 text-[16px] font-medium text-white"
									onClick={() => setStep('details')}
								>
									Next
									<span className="text-[18px]">&#8594;</span>
								</button>
							) : (
								<button
									type="button"
									className="flex items-center gap-2 rounded-full bg-[#181818] px-6 py-3 text-[16px] font-medium text-white"
									onClick={() =>
										onNext({
											subject: subject.trim() ? subject.trim() : undefined,
											topic: quizName.trim() ? quizName.trim() : undefined,
											schoolName: schoolName.trim() ? schoolName.trim() : undefined,
											className: className.trim() ? className.trim() : undefined,
											timeAllowed: timeAllowed.trim() ? timeAllowed.trim() : undefined,
											paperInstructions: paperInstructions.trim() ? paperInstructions.trim() : undefined,
											totalQuestions,
											totalMarks,
											questionTypes,
											instructions: instructions.trim() ? instructions.trim() : undefined,
											fileKey: fileKey ?? undefined,
										})
									}
								>
									Next
									<span className="text-[18px]">&#8594;</span>
								</button>
							)}
						</footer>
			</div>
		</div>
	)
}
