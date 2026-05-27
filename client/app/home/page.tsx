"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'
import AssignmentPage from '../components/AssignmentPage'
import { EmptyState } from '../components/EmptyState'
import { api } from '../lib/api'

export default function HomePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Assignments')
  const [authChecked, setAuthChecked] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    const token = api.getAuthToken()
    if (!token) {
      router.replace('/login')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  if (!authChecked) return null

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-gradient-to-b from-[#eeeeee] to-[#dadada] p-2 font-[var(--font-bricolage)]">
      <div className="relative min-h-[calc(100vh-16px)] max-[1280px]:flex max-[1280px]:h-auto max-[1280px]:flex-col max-[1280px]:gap-4">
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCreateClick={() => setShowCreate(true)}
          />
        </div>
        <div className="hidden md:block">
          <TopBar />
        </div>

        {/* Mobile header */}
        <header className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-[0px_12px_24px_rgba(0,0,0,0.12)] md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-xl">
              <img src="/icons/vedalogo.png" alt="VedaAI" className="h-full w-full object-cover" />
            </div>
            <span className="text-[18px] font-semibold text-[#303030]">VedaAI</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <img src="/icons/notification.svg" alt="Notifications" className="h-5 w-5" />
              <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-[#ff5623]" />
            </button>
            <img src="/icons/Avatar.svg" alt="Profile" className="h-8 w-8 rounded-full" />
          </div>
        </header>

        <main className="absolute left-[320px] right-0.5 top-[86px] flex h-[calc(100vh-120px)] flex-col max-[1280px]:static max-[1280px]:h-auto max-[1280px]:w-full max-[1280px]:px-0 max-md:mt-6 max-md:pb-28">
          {activeTab === 'Assignments' ? (
            <AssignmentPage
              triggerCreate={showCreate}
              onCreateTriggered={() => setShowCreate(false)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <EmptyState />
            </div>
          )}
        </main>
      </div>

      {/* Mobile FAB */}
      <button
        className="fixed bottom-24 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[26px] text-[#ff5623] shadow-[0px_18px_30px_rgba(0,0,0,0.18)] md:hidden"
        type="button"
        onClick={() => setShowCreate(true)}
      >
        +
      </button>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-3xl bg-[#1f1f1f] px-6 py-3 text-white shadow-[0px_24px_40px_rgba(0,0,0,0.25)] md:hidden">
        <button type="button" onClick={() => setActiveTab('Home')} className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'Home' ? 'bg-white text-[#1f1f1f]' : 'text-[#b6b6b6]'}`}>
          <img src="/icons/home_assingment_navbar.svg" alt="Home" className="h-5 w-5" />
          <span className="text-[12px]">Home</span>
        </button>
        <button type="button" onClick={() => setActiveTab('Assignments')} className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'Assignments' ? 'bg-white text-[#1f1f1f]' : 'bg-transparent text-[#b6b6b6]'}`}>
          <img src="/icons/icon_line/file-text.svg" alt="Assignments" className="h-5 w-5" />
          <span className="text-[12px] font-semibold">Assignments</span>
        </button>
        <button type="button" onClick={() => setActiveTab('Library')} className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'Library' ? 'bg-white text-[#1f1f1f]' : 'text-[#b6b6b6]'}`}>
          <img src="/icons/my_ibrary.svg" alt="Library" className="h-5 w-5" />
          <span className="text-[12px]">Library</span>
        </button>
        <button type="button" onClick={() => setActiveTab('AI Toolkit')} className={`flex w-[78px] flex-col items-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'AI Toolkit' ? 'bg-white text-[#1f1f1f]' : 'text-[#b6b6b6]'}`}>
          <img src="/icons/Book.svg" alt="AI Toolkit" className="h-5 w-5" />
          <span className="text-[12px]">AI Toolkit</span>
        </button>
      </nav>
    </div>
  )
}