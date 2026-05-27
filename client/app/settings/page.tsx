"use client"

import DashboardShell from '../components/DashboardShell'

export default function SettingsPage() {
  return (
    <DashboardShell
      activeTab="Settings"
      topBarTitle="Settings"
      topBarIcon="/icons/icon_line/Setting.svg"
      allowCreate={false}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full max-w-[640px] rounded-3xl bg-white p-8 text-center shadow-[0px_18px_30px_rgba(0,0,0,0.08)]">
          <div className="text-[20px] font-bold text-[#303030]">Settings</div>
          <div className="mt-2 text-[14px] text-[#5d5d5d]/70">
            Account preferences will appear here.
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
