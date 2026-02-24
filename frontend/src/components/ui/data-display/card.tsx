import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

const brutalCardVariants = cva(
  "border-[2px] border-foreground shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)]",
  {
    variants: {
      variant: {
        default: "bg-card p-6",
        primary: "bg-primary text-primary-foreground p-4 rounded-lg border-[3px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function BrutalCard({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof brutalCardVariants>) {
  return (
    <div
      data-slot="brutal-card"
      className={cn(brutalCardVariants({ variant, className }))}
      {...props}
    />
  )
}

function BrutalInteractiveCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="brutal-interactive-card"
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border-[2px] md:border-[3px] border-foreground bg-secondary transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:-translate-y-1.5 group-hover:translate-x-1.5 cursor-pointer",
        "shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)]",
        "group-hover:shadow-[8px_8px_0_0_rgb(0,0,0)] dark:group-hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.9)]",
        className
      )}
      {...props}
    />
  )
}

function BrutalShard({ className, rotate = "primary", ...props }: React.ComponentProps<"div"> & { rotate?: "primary" | "secondary" | "none" }) {
  const rotationClass = 
    rotate === "primary" ? "transform rotate-0 lg:rotate-1" :
    rotate === "secondary" ? "transform rotate-0 lg:-rotate-1" :
    ""

  return (
    <div
      data-slot="brutal-shard"
      className={cn(
        "border-[2px] border-foreground bg-card shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] p-4 md:p-6 lg:p-8",
        rotationClass,
        className
      )}
      {...props}
    />
  )
}

function BrutalEmptyState({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="brutal-empty-state"
      className={cn(
        "flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-foreground/30 p-8 text-center bg-secondary/20",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  BrutalCard,
  BrutalInteractiveCard,
  BrutalShard,
  BrutalEmptyState,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
