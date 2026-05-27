"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

type AssignmentBoxProps = {
	name: string
	assignedOn: string
	dueDate: string
	onView?: () => void
	onDelete?: () => void
}

export default function AssignmentBox({
	name,
	assignedOn,
	dueDate,
	onView,
	onDelete,
}: AssignmentBoxProps) {
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<motion.div
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			transition={{ type: 'spring', stiffness: 320, damping: 22 }}
			className="inline-flex h-full w-full cursor-pointer flex-col items-start justify-center gap-12 rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
		>
			<div className="flex w-full flex-1 flex-col items-start justify-between gap-5">
				<div className="flex w-full flex-col items-start justify-start gap-1">
					<div className="inline-flex w-full items-center justify-between">
						<div className="flex w-full items-center gap-3">
							<div className="inline-flex flex-col items-start justify-center gap-3">
								<div className="flex flex-col justify-center text-2xl font-extrabold leading-[28.8px] text-[#303030]">
									{name}
								</div>
							</div>
						</div>

						<div className="relative">
							<button
								type="button"
								aria-label="Assignment actions"
								onPointerDown={(event) => event.stopPropagation()}
								onClick={() => setMenuOpen((open) => !open)}
								className="relative h-6 w-6 cursor-pointer border-none bg-transparent p-0"
							>
								<span className="absolute left-[14px] top-[10px] h-1 w-1 rounded-full bg-[#A9A9A9]" />
								<span className="absolute left-[14px] top-[17px] h-1 w-1 rounded-full bg-[#A9A9A9]" />
								<span className="absolute left-[14px] top-[3px] h-1 w-1 rounded-full bg-[#A9A9A9]" />
							</button>

							{menuOpen && (
								<div
									role="menu"
									onPointerDown={(event) => event.stopPropagation()}
									onClick={(event) => event.stopPropagation()}
									className="absolute right-0 top-7 z-10 min-w-[160px] rounded-xl border border-black/10 bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
								>
									<motion.button
										type="button"
										role="menuitem"
										whileTap={{ scale: 0.96 }}
										transition={{ type: 'spring', stiffness: 320, damping: 22 }}
										onPointerDown={(event) => event.stopPropagation()}
										onClick={(event) => {
											event.stopPropagation()
											setMenuOpen(false)
											onView?.()
										}}
										className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#303030] hover:bg-black/5"
									>
										View assignment
									</motion.button>
									<motion.button
										type="button"
										role="menuitem"
										whileTap={{ scale: 0.96 }}
										transition={{ type: 'spring', stiffness: 320, damping: 22 }}
										onPointerDown={(event) => event.stopPropagation()}
										onClick={(event) => {
											event.stopPropagation()
											setMenuOpen(false)
											onDelete?.()
										}}
										className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#C52828] hover:bg-red-50"
									>
										Delete
									</motion.button>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="inline-flex w-full items-center justify-between">
					<div className="flex flex-1 items-center justify-between gap-6">
						<div className="flex items-center gap-1 text-base leading-[19.2px]">
							<span className="font-extrabold text-[#303030]">Assigned on</span>
							<span className="font-normal text-black/50">: {assignedOn}</span>
						</div>
						<div className="flex items-center gap-1 text-base leading-[19.2px]">
							<span className="font-extrabold text-[#303030]">Due</span>
							<span className="font-normal text-black/50">: {dueDate}</span>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}
