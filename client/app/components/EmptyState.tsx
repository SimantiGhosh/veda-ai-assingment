export const EmptyState = () => {
  return (
    <section className="flex flex-col items-center gap-8 max-md:gap-6">
      <div className="relative h-[300px] w-[300px] max-w-[90vw] max-md:h-[220px] max-md:w-[220px]">
        <img
          src="/icons/emptystate.png"
          alt="Empty assignments"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex w-[486px] max-w-[90vw] flex-col items-center gap-0.5 text-center max-md:w-full">
        <div className="text-[20px] font-bold leading-7 text-[#303030] max-md:text-[18px]">
          No assignments yet
        </div>
        <div className="text-[16px] leading-[22.4px] text-[rgba(94,94,94,0.8)] max-md:text-[14px]">
          Create your first assignment to start collecting and grading student submissions. You can
          set up rubrics, define marking criteria, and let AI assist with grading.
        </div>
      </div>

      <button
        className="inline-flex max-w-[90vw] items-center gap-1 rounded-[48px] border-0 bg-[#181818] px-6 py-3 text-[16px] font-medium leading-[22.4px] text-white outline outline-[1.5px] outline-white max-md:text-[14px]"
        type="button"
      >
        <img src="/icons/icon_line/Plus.svg" alt="Add" />
        <span>Create Your First Assignment</span>
      </button>
    </section>
  )
}
