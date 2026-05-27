"use client"

import DashboardShell from '../components/DashboardShell'
import AssignmentPage from '../components/AssignmentPage'

export default function AssignmentsPage() {
  return (
    <DashboardShell
      activeTab="Assignments"
      topBarTitle="Assignments"
      topBarIcon="/icons/icon_line/file-text.svg"
    >
      {({ showCreate, clearCreate }) => (
        <AssignmentPage triggerCreate={showCreate} onCreateTriggered={clearCreate} />
      )}
    </DashboardShell>
  )
}
