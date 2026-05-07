"use client"

import { CalendarTimeline } from "@/components/ui/calendars/calendar(x,y)"
import type { TimelineItemWithNames } from "@/types"

export function DashboardTimeline({
  calendarItems,
  seasonality,
  viewDate,
  onClickData,
}: {
  calendarItems: TimelineItemWithNames[]
  seasonality?: {
    multipliers: number[]
  }
  viewDate: Date
  onClickData: (timelineItem: TimelineItemWithNames) => void
}) {
  return (
    <CalendarTimeline
      items={calendarItems}
      year={viewDate.getFullYear()}
      month={viewDate.getMonth()}
      onClickData={onClickData}
      density="compact"
      maxHeightClassName="max-h-[520px]"
      seasonality={seasonality}
    />
  )
}
