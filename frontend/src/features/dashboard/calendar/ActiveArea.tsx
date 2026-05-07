import { Period } from "@/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/overlay/tooltip"
import { differenceInCalendarDays } from "date-fns"
import { MouseEventHandler } from "react"

/**
 * Bloco visual de uma reserva no calendário (a "pill" colorida).
 *
 * Também expõe hover rico (Tooltip) com:
 * - email (quando disponível)
 * - número de hóspedes
 * - duração em dias (mín. 1)
 */
export function ActiveArea({
  year,
  month,
  period,
  isStart,
  isEnd,
  pading_x = 0,
  dayWidth = 56,
  height = 48,
  top = 8,
  onClick,
}: {
  year: number
  month: number
  period: Period
  isStart: boolean
  isEnd: boolean
  pading_x?: number
  dayWidth?: number
  height?: number
  top?: number
  onClick?: MouseEventHandler<HTMLDivElement> | undefined
}) {
  let startPos = 0
  let duration = 0

  if (period.startDay.getMonth() < month && period.endDay.getMonth() > month) {
    startPos = -1 * dayWidth
    duration = new Date(year, month + 1, 0).getDate() + 2
  } else {
    startPos =
      (period.startDay.getMonth() < month ? -1 : period.startDay.getDate() - 1) *
      dayWidth
    duration =
      period.endDay.getDate() -
      period.startDay.getDate() +
      1 +
      (period.endDay.getMonth() > month
        ? new Date(year, month + 1, 0).getDate() + 1
        : 0)
  }

  let width = duration * dayWidth

  startPos += isStart ? pading_x : 0
  width -= isEnd ? pading_x * 2 : 0

  const slant = 15
  const clipPath = `polygon(
        ${isStart ? "0% 0%" : `${slant}px 0%`}, 
        ${isEnd ? "100% 0%" : `100% 0%`}, 
        ${isEnd ? "100% 100%" : `calc(100% - ${slant}px) 100%`}, 
        ${isStart ? "0% 100%" : "0% 100%"}
    )`

  const email =
    period.meta?.email ?? (typeof period.name === "string" && period.name.includes("@") ? period.name : undefined)
  const guests = period.meta?.guestCount
  const stayDays = Math.max(1, differenceInCalendarDays(period.endDay, period.startDay))

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          id={"active"}
          className={`absolute ${period.color} flex items-center px-4 group transition-all`}
          style={{
            left: `${startPos}px`,
            width: `${width}px`,
            height: `${height}px`,
            top: `${top}px`,
            zIndex: 5,
            clipPath: clipPath,
            borderTopLeftRadius: isStart ? "24px" : "0",
            borderBottomLeftRadius: isStart ? "24px" : "0",
            borderTopRightRadius: isEnd ? "24px" : "0",
            borderBottomRightRadius: isEnd ? "24px" : "0",
          }}
          onClick={onClick}
        >
          {!isEnd && (
            <div
              className="absolute right-0 top-0 h-full w-[4px] bg-black"
              style={{
                transform: `skewX(-${slant}deg)`,
                transformOrigin: "top",
                marginRight: "-2px",
              }}
            />
          )}

          <span className="font-mono font-bold uppercase text-xs text-black truncate relative z-10">
            {period.name}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="rounded-xl border-2 border-foreground bg-card text-foreground shadow-[4px_4px_0_0_#0D0D0D] px-3 py-2"
      >
        <div className="grid gap-1">
          <div className="font-mono text-[11px] font-black truncate">
            {period.name ?? "Reserva"}
          </div>
          <div className="text-xs text-muted-foreground">Email: {email ?? "—"}</div>
          <div className="text-xs text-muted-foreground">
            Hóspedes: {typeof guests === "number" ? guests : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            Dias: {Number.isFinite(stayDays) ? stayDays : "—"}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
