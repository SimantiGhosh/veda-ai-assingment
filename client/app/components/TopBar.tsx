"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../lib/api'

type TopBarProps = {
  title?: string
  iconSrc?: string
}

export const TopBar = ({
  title = 'Assignment',
  iconSrc = '/icons/home_assingment_navbar.svg',
}: TopBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsAuthed(Boolean(api.getAuthToken()))
  }, [])

  const handleLogout = () => {
    api.clearAuthToken()
    setIsAuthed(false)
    router.replace('/login')
  }

  const handleProfileClick = () => {
    if (!isAuthed) {
      router.replace('/login')
      return
    }

    setMenuOpen(open => !open)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <header className="absolute left-[320px] right-2 top-2 flex h-14 items-center gap-2.5 rounded-2xl bg-white/75 px-6 pr-3 max-[1280px]:static max-[1280px]:w-full">
      <div className="flex w-10 items-center">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          type="button"
          onClick={handleBack}
          aria-label="Back"
        >
          <img src="/icons/icon_line/Arrow_Left.svg" alt="Back" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[16px] font-semibold text-[#a9a9a9] whitespace-nowrap">
        <img src={iconSrc} alt={title} />
        <span>{title}</span>
      </div>

      <div className="ml-auto flex items-center gap-3 max-[768px]:w-full max-[768px]:justify-between">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f6f6f6]">
          <img src="/icons/notification.svg" alt="Notifications" />
          <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-[#ff5623]" />
        </div>
        <div className="relative">
          <button
            className="flex max-w-[220px] items-center gap-2 rounded-xl bg-white px-3 py-1.5 shadow-[0px_32px_48px_rgba(0,0,0,0.2),0px_16px_48px_rgba(0,0,0,0.12)] overflow-hidden"
            type="button"
            onClick={handleProfileClick}
            aria-haspopup={isAuthed ? 'menu' : undefined}
            aria-expanded={isAuthed ? menuOpen : undefined}
          >
            <img src="/icons/Avatar.svg" alt="User" className="h-8 w-8 rounded-full bg-[#f6f6f6]" />
            <div className="truncate text-[16px] font-semibold text-[#303030]">
              {isAuthed ? 'John Doe' : 'Sign in'}
            </div>
            {isAuthed ? <img src="/icons/Chevron down.svg" alt="Open" /> : null}
          </button>

          {isAuthed && menuOpen && (
            <div
              className="absolute right-0 top-[52px] z-10 w-[160px] rounded-xl bg-white p-1 shadow-[0px_16px_32px_rgba(0,0,0,0.14)]"
              role="menu"
            >
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-medium text-[#C52828] hover:bg-red-50"
                type="button"
                onClick={handleLogout}
                role="menuitem"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
