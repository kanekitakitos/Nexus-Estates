import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        brutal:
          "border-[2px] border-foreground bg-background px-2 py-0.5 md:px-2 md:py-1 text-[9px] md:text-[10px] font-bold uppercase shadow-[1.5px_1.5px_0_0_rgb(0,0,0)] dark:shadow-[1.5px_1.5px_0_0_rgba(255,255,255,0.9)]",
        featured:
          "bg-primary text-primary-foreground px-3 py-1 font-mono font-bold border-[2px] border-foreground shadow-[3px_3px_0_0_rgb(0,0,0)] text-xs md:text-sm rounded-none",
        rating:
          "bg-foreground text-background px-2 py-0.5 md:px-3 md:py-1 font-mono font-bold text-xs md:text-sm rounded-none gap-1",
        amenity:
          "border-[2px] border-foreground px-2 py-1 md:px-3 md:py-1.5 font-mono text-xs md:text-sm font-bold uppercase hover:bg-foreground hover:text-background transition-colors cursor-default shadow-[2px_2px_0_0_rgb(0,0,0)] rounded-none gap-2 bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
