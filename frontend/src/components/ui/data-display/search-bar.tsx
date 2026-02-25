import * as React from "react"
import { cn } from "@/lib/utils"

const SearchBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mx-auto mb-6 md:mb-10 max-w-6xl border-[2px] border-foreground bg-card text-foreground shadow-[3px_3px_0_0_rgb(0,0,0)] md:shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)] dark:md:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] animate-in fade-in slide-in-from-bottom-4 duration-700",
      className
    )}
    {...props}
  />
))
SearchBar.displayName = "SearchBar"

const SearchBarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-2 divide-y divide-white/20 md:grid-cols-4 md:divide-y-0 md:divide-x dark:divide-white/20",
      className
    )}
    {...props}
  />
))
SearchBarContent.displayName = "SearchBarContent"

const SearchBarSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-white/20 dark:border-white/20", className)}
    {...props}
  />
))
SearchBarSection.displayName = "SearchBarSection"

const SearchBarLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 bg-foreground px-3 py-2 md:px-4 md:py-3 font-mono text-[9px] md:text-[11px] font-semibold uppercase tracking-[0.18em] text-background dark:bg-muted dark:text-foreground",
      className
    )}
    {...props}
  />
))
SearchBarLabel.displayName = "SearchBarLabel"

const SearchBarInputContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 md:gap-3 bg-secondary px-3 py-2 md:px-4 md:py-3 dark:bg-background transition-transform active:scale-[0.98]",
      className
    )}
    {...props}
  />
))
SearchBarInputContainer.displayName = "SearchBarInputContainer"

export {
  SearchBar,
  SearchBarContent,
  SearchBarSection,
  SearchBarLabel,
  SearchBarInputContainer,
}
