"use client"

import { useState } from 'react'
import { EmptyState } from './components/EmptyState'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'

export default function HomePage() {
	const [activeMobileTab, setActiveMobileTab] = useState('Assignments')

	return (
		<div className="relative min-h-screen w-full overflow-y-auto bg-gradient-to-b from-[#eeeeee] to-[#dadada] p-2 font-[var(--font-bricolage)]">
			<div className="relative min-h-[calc(100vh-16px)] max-[1280px]:flex max-[1280px]:h-auto max-[1280px]:flex-col max-[1280px]:gap-4">
				<div className="hidden md:block">
					<Sidebar />
				</div>
				<div className="hidden md:block">
					<TopBar />
				</div>

				<header className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-[0px_12px_24px_rgba(0,0,0,0.12)] md:hidden">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 overflow-hidden rounded-xl">
							<img src="/icons/vedalogo.png" alt="VedaAI" className="h-full w-full object-cover" />
						</div>
						<span className="text-[18px] font-semibold text-[#303030]">VedaAI</span>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white"
						>
							<img src="/icons/notification.svg" alt="Notifications" className="h-5 w-5" />
							<span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-[#ff5623]" />
						</button>
						<img src="/icons/Avatar.svg" alt="Profile" className="h-8 w-8 rounded-full" />
						<button
							className="flex h-8 w-8 flex-col items-center justify-center gap-1 rounded-full bg-white"
							type="button"
						>
							<span className="block h-[4px] w-[4px] rounded-full bg-[#303030]" />
							<span className="block h-[4px] w-[4px] rounded-full bg-[#303030]" />
							<span className="block h-[4px] w-[4px] rounded-full bg-[#303030]" />
						</button>
					</div>
				</header>

				<main className="absolute left-[320px] right-2 top-[86px] flex h-[678px] items-center justify-center px-4 max-[1280px]:static max-[1280px]:h-auto max-[1280px]:w-full max-[1280px]:px-0 max-md:mt-6 max-md:pb-28">
					<EmptyState />
				</main>
			</div>

			<button
				className="fixed bottom-24 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[26px] text-[#ff5623] shadow-[0px_18px_30px_rgba(0,0,0,0.18)] md:hidden"
				type="button"
			>
				+
			</button>

			<nav className="fixed bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-3xl bg-[#1f1f1f] px-6 py-3 text-white shadow-[0px_24px_40px_rgba(0,0,0,0.25)] md:hidden">
				<button
					type="button"
					onClick={() => setActiveMobileTab('Home')}
					className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
						activeMobileTab === 'Home' ? 'bg-white text-[#1f1f1f]' : 'text-[#b6b6b6]'
					}`}
				>
					<img src="/icons/home_assingment_navbar.svg" alt="Home" className="h-5 w-5" />
					<span className="text-[12px]">Home</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveMobileTab('Assignments')}
					className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
						activeMobileTab === 'Assignments'
							? 'bg-white text-[#1f1f1f]'
							: 'bg-transparent text-[#b6b6b6]'
					}`}
				>
					<img src="/icons/icon_line/file-text.svg" alt="Assignments" className="h-5 w-5" />
					<span className="text-[12px] font-semibold">Assignments</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveMobileTab('Library')}
					className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
						activeMobileTab === 'Library' ? 'bg-white text-[#1f1f1f]' : 'text-[#b6b6b6]'
					}`}
				>
					<img src="/icons/my_ibrary.svg" alt="Library" className="h-5 w-5" />
					<span className="text-[12px]">Library</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveMobileTab('AI Toolkit')}
					className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${
						activeMobileTab === 'AI Toolkit' ? 'bg-white text-[#1f1f1f]' : 'text-[#b6b6b6]'
					}`}
				>
					<img src="/icons/Book.svg" alt="AI Toolkit" className="h-5 w-5" />
					<span className="text-[12px]">AI Toolkit</span>
				</button>
			</nav>
		</div>
	)
}
