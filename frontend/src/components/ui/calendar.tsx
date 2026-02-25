"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import * as React from "react"

import { buttonVariants } from "@/components/ui/forms/button"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 font-mono",
        className,
      )}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption:
          "flex justify-center pt-1 relative items-center w-full uppercase tracking-wider font-bold",
        caption_label: "text-sm",
        nav: "gap-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-[2px] border-foreground rounded-none shadow-[2px_2px_0_0_rgb(0,0,0)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-none w-9 font-normal text-[0.8rem] uppercase tracking-wider",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-none [&:has(>.day-range-start)]:rounded-l-none first:[&:has([aria-selected])]:rounded-l-none last:[&:has([aria-selected])]:rounded-r-none"
            : "[&:has([aria-selected])]:rounded-none",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-none hover:bg-secondary hover:text-foreground hover:border-[2px] hover:border-foreground border-[2px] border-transparent transition-all",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground border-[2px] border-foreground shadow-[2px_2px_0_0_rgb(0,0,0)]",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground border-[2px] border-foreground shadow-[2px_2px_0_0_rgb(0,0,0)]",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground border-[2px] border-foreground shadow-[2px_2px_0_0_rgb(0,0,0)]",
        day_today: "bg-secondary text-foreground border-[2px] border-foreground/50",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-secondary aria-selected:text-foreground border-y-[2px] border-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export type BrutalCalendarProps = CalendarProps & {
  title?: string
}

function BrutalCalendar({
  className,
  classNames,
  showOutsideDays = true,
  title,
  ...props
}: BrutalCalendarProps) {
  const calendar = (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("font-mono", className)}
      classNames={{
        months: "flex flex-col md:flex-row gap-4",
        month: "w-full space-y-4",
        caption: "flex justify-center pt-1 relative items-center w-full uppercase tracking-wider font-bold",
        caption_label: "text-sm",
        nav: "gap-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-[2px] border-foreground rounded-none shadow-[2px_2px_0_0_rgb(0,0,0)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground rounded-none w-9 font-normal text-[0.8rem] uppercase tracking-wider",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )

  if (title) {
    return (
      <div className="border-[2px] border-foreground bg-card p-4 overflow-hidden shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)]">
        <h3 className="mb-4 font-mono text-lg font-bold uppercase tracking-wider text-center md:text-left">
          {title}
        </h3>
        <div className="flex justify-center w-full overflow-x-auto">
          {calendar}
        </div>
      </div>
    )
  }

  return calendar
}
BrutalCalendar.displayName = "BrutalCalendar"


export { Calendar, BrutalCalendar }
