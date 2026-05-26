export const TopBar = () => {
  return (
    <header className="absolute left-[320px] right-2 top-2 flex h-14 items-center gap-2.5 rounded-2xl bg-white/75 px-6 pr-3 overflow-hidden max-[1280px]:static max-[1280px]:w-full">
      <div className="flex w-10 items-center">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white" type="button">
          <img src="/icons/icon_line/Arrow_Left.svg" alt="Back" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[16px] font-semibold text-[#a9a9a9] whitespace-nowrap">
        <img src="/icons/home_assingment_navbar.svg" alt="Assignment" />
        <span>Assignment</span>
      </div>

      <div className="ml-auto flex items-center gap-3 max-[768px]:w-full max-[768px]:justify-between">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f6f6f6]">
          <img src="/icons/notification.svg" alt="Notifications" />
          <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-[#ff5623]" />
        </div>
        <div className="flex max-w-[220px] items-center gap-2 rounded-xl bg-white px-3 py-1.5 shadow-[0px_32px_48px_rgba(0,0,0,0.2),0px_16px_48px_rgba(0,0,0,0.12)] overflow-hidden">
          <img src="/icons/Avatar.svg" alt="User" className="h-8 w-8 rounded-full bg-[#f6f6f6]" />
          <div className="truncate text-[16px] font-semibold text-[#303030]">John Doe</div>
          <img src="/icons/Chevron down.svg" alt="Open" />
        </div>
      </div>
    </header>
  )
}
