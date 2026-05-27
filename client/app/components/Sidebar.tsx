"use client"

import { motion } from 'framer-motion'

const navItems = [
  { label: 'Home', icon: '/icons/home_assingment_navbar.svg' },
  { label: 'My Groups', icon: '/icons/Vector.svg' },
  { label: 'Assignments', icon: '/icons/icon_line/file-text.svg' },
  { label: "AI Teacher's Toolkit", icon: '/icons/Book.svg' },
  { label: 'My Library', icon: '/icons/my_ibrary.svg' },
]

type SidebarProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  onCreateClick: () => void
}

export const Sidebar = ({ activeTab, onTabChange, onCreateClick }: SidebarProps) => {
  return (
    <aside className="absolute left-2 top-2 bottom-4 flex w-[304px] flex-col items-start justify-between overflow-hidden rounded-2xl bg-white px-6 pb-8 pt-6 shadow-[0px_32px_48px_rgba(0,0,0,0.2),0px_16px_48px_rgba(0,0,0,0.12)] max-[1280px]:static max-[1280px]:h-auto max-[1280px]:w-full">
      <div className="flex w-full flex-col items-start gap-10 max-[768px]:gap-6">
        <div className="flex w-full items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-[18px] shadow-[0px_10px_24px_rgba(0,0,0,0.2)]">
            <img src="/icons/vedalogo.png" alt="VedaAI logo" className="h-full w-full object-cover" />
          </div>
          <div className="text-[30px] font-bold leading-6 text-[#303030] whitespace-nowrap">VedaAI</div>
        </div>

        <button
          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-full border-0 bg-[#272727] px-4 text-[16px] font-medium leading-7 text-white shadow-[0px_16px_32px_rgba(0,0,0,0.12)] transition hover:bg-[#1f1f1f] hover:outline hover:outline-[4px] hover:outline-[#ff7950] active:outline active:outline-[4px] active:outline-[#ff7950]"
          type="button"
          onClick={onCreateClick}
        >
          <span>Create Assignment</span>
        </button>

        <nav className="flex w-full flex-col gap-1.5">
          {navItems.map(item => (
            <motion.button
              key={item.label}
              type="button"
              onClick={() => onTabChange(item.label)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[16px] leading-[22.4px] transition hover:bg-[#f0f0f0] hover:text-[#303030] ${
                activeTab === item.label ? 'bg-[#f0f0f0] text-[#303030]' : 'text-[rgba(94,94,94,0.8)]'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24, mass: 0.2 }}
            >
              <img src={item.icon} alt="" className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>

      <div className="flex w-full flex-col gap-3">
        <motion.button
          type="button"
          onClick={() => onTabChange('Settings')}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[16px] leading-[22.4px] text-[rgba(94,94,94,0.8)] transition hover:bg-[#f0f0f0] hover:text-[#303030]"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <motion.img
            src="/icons/icon_line/Setting.svg"
            alt="Settings"
            className="h-5 w-5"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
          <span>Settings</span>
        </motion.button>

        <div className="flex items-center gap-3 rounded-2xl bg-[#f0f0f0] p-3 overflow-hidden">
          <img src="/icons/Avatar.svg" alt="School" className="h-14 w-[59px] rounded-full" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="truncate text-[16px] font-bold text-[#303030]">Delhi Public School</div>
            <div className="truncate text-[14px] text-[#5e5e5e]">Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </aside>
  )
}