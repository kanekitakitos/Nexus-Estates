import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        brutal:
          "border-[2px] border-foreground rounded-xl bg-primary text-primary-foreground shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all",
        "brutal-outline":
          "border-[2px] border-foreground bg-background font-mono text-[11px] font-semibold uppercase tracking-[0.18em] shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-xl",
        "brutal-property-cta":
          "rounded-xl border-2 border-foreground bg-primary px-8 py-4 font-mono text-xs font-black uppercase text-white shadow-[4px_4px_0_0_#0D0D0D] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#0D0D0D] flex items-center gap-2",
        "brutal-wizard-exit":
          "h-12 rounded-xl border-2 border-foreground px-6 font-mono text-[10px] font-black uppercase text-foreground shadow-[2px_2px_0_0_#0D0D0D] transition-all dark:border-zinc-700 dark:text-zinc-400",
        "brutal-wizard-back":
          "h-12 rounded-xl border-2 border-foreground bg-background px-6 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0_0_#0D0D0D] transition-all",
        "brutal-wizard-next":
          "flex h-12 items-center gap-2 rounded-xl border-2 border-foreground bg-foreground px-10 font-mono text-[10px] font-black uppercase text-background shadow-[4px_4px_0_0_#0D0D0D] transition-all",
        "brutal-wizard-save":
          "flex h-12 items-center gap-2 rounded-xl border-2 border-foreground bg-primary px-10 font-mono text-[10px] font-black uppercase text-white shadow-[4px_4px_0_0_#0D0D0D] transition-all",
        "brutal-wizard-inline":
          "h-12 rounded-lg border-2 border-foreground bg-primary px-6 font-mono text-[10px] font-black text-white shadow-[3px_3px_0_0_#000]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function BrutalButton({
  className,
  variant = "brutal",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants, BrutalButton }
