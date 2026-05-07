"use client"

import React, { useEffect, useRef } from "react"
import Link from "next/link"
import { BrutalCard } from "@/components/ui/data-display/brutal-card"
import { Period, TimelineItemWithNames } from "@/types"
import { ActiveArea } from "@/features/dashboard/calendar/ActiveArea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/overlay/tooltip"

/**
 * Calendário/timeline do dashboard.
 *
 * Características:
 * - header sticky (dias do mês) e labels sticky (coluna esquerda)
 * - modo "compact" com `dayWidth=38px` para reduzir scroll horizontal
 * - hover não intrusivo com Tooltip (delay configurado no Provider)
 *
 * Nota: este componente é específico do dashboard (não é shared).
 */
const border = {
  b: "border-b-0",
  r: "border-r-2",
  color: "border-black",
}

export interface CalendarTimelineProps {
  items: TimelineItemWithNames[]
  year: number
  month: number
  onClickData?: (item: TimelineItemWithNames) => void
  onClickActiveArea?: (period: Period) => void
  scroolOnScroolEvent?: boolean
  density?: "compact" | "comfortable"
  maxHeightClassName?: string
  headerLeft?: React.ReactNode
  renderAfterRow?: (
    ctx: CalendarTimelineRenderContext,
    item: TimelineItemWithNames,
    index: number
  ) => React.ReactNode
}

export type CalendarTimelineRenderContext = {
  year: number
  month: number
  daysInMonth: number
  dayWidth: number
  cellWClassName: string
  cellHClassName: string
  labelWClassName: string
  borderRightClassName: string
  borderColorClassName: string
}

export function CalendarTimeline({
  items,
  year,
  month,
  onClickData,
  onClickActiveArea,
  scroolOnScroolEvent = true,
  density = "comfortable",
  maxHeightClassName = "max-h-[520px]",
  headerLeft,
  renderAfterRow,
}: CalendarTimelineProps) {
  const dayWidth = density === "compact" ? 38 : 56
  const cellW = density === "compact" ? "w-[38px]" : "w-14"
  const cellH = density === "compact" ? "h-12" : "h-16"
  const labelW = density === "compact" ? "w-32" : "w-48"
  const dayLetterClass = density === "compact" ? "text-[10px]" : "text-ms"
  const dayNumberClass = density === "compact" ? "text-base" : "text-lg"
  const gapY = density === "compact" ? "gap-4" : "gap-5"
  const activeAreaHeight = density === "compact" ? 34 : 48
  const activeAreaTop = density === "compact" ? 7 : 8

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const renderCtx: CalendarTimelineRenderContext = {
    year,
    month,
    daysInMonth,
    dayWidth,
    cellWClassName: cellW,
    cellHClassName: cellH,
    labelWClassName: labelW,
    borderRightClassName: border.r,
    borderColorClassName: border.color,
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scroolOnScroolEvent) return
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      el.scrollLeft += e.deltaX
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [scroolOnScroolEvent])

  return (
    <TooltipProvider delayDuration={500}>
      <div className="flex relative w-full">
        <div
          id={"calender"}
          ref={scrollRef}
          className={`overflow-auto ${maxHeightClassName} pe-5 pb-5 bg-transparent ${border.color}
                [&::-webkit-scrollbar]:h-4
                [&::-webkit-scrollbar-track]:bg-zinc-200
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:border-2
                [&::-webkit-scrollbar-thumb]:bg-black
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:border-[4px]
                [&::-webkit-scrollbar-thumb]:border-transparent
                [&::-webkit-scrollbar-thumb]:bg-clip-padding
                `}
        >
          <div className={`flex flex-col ${gapY} min-w-max w-fit mx-auto`}>
          <BrutalCard className={"sticky top-0 z-30 p-0 bg-card overflow-clip"}>
            <div id={"Item Header"} className="flex">
              <div
                className={`sticky left-0 z-20 ${labelW} bg-card ${border.r} ${border.color}  p-4`}
              >
                <div className="flex items-center gap-2">{headerLeft}</div>
              </div>

              <div id={"days"} className="flex">
                {days.map((day, index) => {
                  const date = new Date(year, month, day)
                  const dayOfWeek = date.getDay()
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                  const isLast = days.length == index + 1

                  return (
                    <div
                      key={day}
                      className={`${cellH} ${cellW} flex-shrink-0 flex items-center justify-center ${isLast ? "" : border.r} ${border.color}  ${
                        isWeekend ? "bg-primary text-white" : ""
                      }`}
                    >
                      <div className="text-center">
                        <div className={`${dayLetterClass} font-mono font-bold`}>
                          {["D", "S", "T", "Q", "Q", "S", "S"][dayOfWeek]}
                        </div>
                        <div className={`${dayNumberClass} font-mono font-bold`}>{day}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </BrutalCard>

          {items.map((item, indx) => (
            <div key={indx} className="flex flex-col">
              <BrutalCard className={"p-0 bg-card overflow-clip"}>
                <div id={String(item.id)} key={item.id} className={`flex ${border.color}`}>
                  <div
                    id={"item label"}
                    className={`sticky left-0 z-10 ${labelW} bg-card ${border.r} ${border.color} p-4 flex items-center`}
                    onClick={() => onClickData?.(item)}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate font-bold uppercase text-sm">{item.label}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        sideOffset={8}
                        className="rounded-xl border-2 border-foreground bg-card text-foreground shadow-[4px_4px_0_0_#0D0D0D] px-3 py-2"
                      >
                        <div className="grid gap-1">
                          <div className="font-mono text-[11px] font-black">
                            {item.properti?.name ?? item.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {typeof item.properti?.basePrice === "number"
                              ? `Preço base: €${item.properti.basePrice.toFixed(2)}`
                              : "Preço base: —"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Estado: {item.properti?.isActive ? "Ativa" : "Inativa"}
                          </div>
                            {typeof item.properti?.id === "number" ? (
                              <div className="pt-2 flex items-center gap-2">
                                <Link
                                  href={`/properties?propertyId=${item.properti.id}&mode=EDIT`}
                                  className="inline-flex items-center rounded-lg border-2 border-foreground bg-card px-2 py-1 text-[10px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                  Editar
                                </Link>
                                <Link
                                  href={`/properties?propertyId=${item.properti.id}&mode=RULES`}
                                  className="inline-flex items-center rounded-lg border-2 border-foreground bg-card px-2 py-1 text-[10px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                                >
                                  Regras
                                </Link>
                              </div>
                            ) : null}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className={`flex relative overflow-hidden ${cellH}`}>
                    {days.map((day, index) => {
                      const date = new Date(year, month, day)
                      const dayOfWeek = date.getDay()
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                      const isLast = days.length == index + 1

                      return (
                        <div
                          key={day}
                          className={`${cellW} ${cellH} ${isLast ? "" : border.r} ${border.color}
                                                ${isWeekend ? "bg-primary text-white" : ""}
                                            `}
                        />
                      )
                    })}

                    {item.periods.map((period, idx) => {
                      const hasLeftNeighbor = item.periods.some(
                        (p) => p !== period && p.endDay.getTime() === period.startDay.getTime()
                      )
                      const hasRightNeighbor = item.periods.some(
                        (p) => p !== period && p.startDay.getTime() === period.endDay.getTime()
                      )

                      if (
                        period.startDay < new Date(year, month + 1, 1) &&
                        period.endDay >= new Date(year, month, 1)
                      )
                        return (
                          <ActiveArea
                            year={year}
                            month={month}
                            key={idx}
                            period={period}
                            isStart={!hasLeftNeighbor}
                            isEnd={!hasRightNeighbor}
                            pading_x={5}
                            dayWidth={dayWidth}
                            height={activeAreaHeight}
                            top={activeAreaTop}
                            onClick={() => onClickActiveArea?.(period)}
                          />
                        )
                    })}
                  </div>
                </div>
              </BrutalCard>

              {renderAfterRow ? renderAfterRow(renderCtx, item, indx) : null}
            </div>
          ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
