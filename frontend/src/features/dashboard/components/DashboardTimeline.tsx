"use client"

import { CalendarTimeline } from "@/features/dashboard/calendar/calendar(x,y)"
import type { TimelineItemWithNames } from "@/types"
import { DashboardSeasonalityLine } from "@/features/dashboard/components/DashboardSeasonalityLine"

export function DashboardTimeline({
  calendarItems,
  isFocused,
  seasonalityMultipliers,
  viewDate,
  onClickData,
}: {
  calendarItems: TimelineItemWithNames[]
  isFocused: boolean
  seasonalityMultipliers?: number[] | null
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
      renderAfterRow={(ctx, _item, index) => {
        if (!isFocused) return null
        if (index !== 0) return null
        if (!seasonalityMultipliers || seasonalityMultipliers.length !== ctx.daysInMonth) return null
        return (
          <div className="pt-6">
            <DashboardSeasonalityLine
              year={ctx.year}
              month={ctx.month}
              dayWidth={ctx.dayWidth}
              labelWClassName={ctx.labelWClassName}
              borderRightClassName={ctx.borderRightClassName}
              borderColorClassName={ctx.borderColorClassName}
              multipliers={seasonalityMultipliers}
            />
          </div>
        )
      }}
    />
  )
}
