import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

/**
 * Painéis neo-brutalistas reutilizáveis (vidro fosco, aside, etc.).
 * As variantes espelham estilos já usados na feature property — não alterar tokens sem rever o visual.
 */
export const brutalSurfaceVariants = cva("border-2 border-foreground dark:border-zinc-800", {
  variants: {
    variant: {
      glass:
        "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-xl shadow-[4px_4px_0_0_#0D0D0D]",
      glassLg:
        "bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-xl shadow-[8px_8px_0_0_#0D0D0D]",
      aside: "bg-white dark:bg-zinc-900 rounded-xl shadow-[5px_5px_0_0_#0D0D0D]",
      /** Painel editorial: menos “rubber”, mais produto */
      pro: "rounded-xl border border-[#0D0D0D]/20 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
    },
    padding: {
      none: "",
      sm: "p-5",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "glass",
    padding: "md",
  },
})

export type BrutalSurfaceProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof brutalSurfaceVariants>

export function BrutalSurface({ className, variant, padding, ...props }: BrutalSurfaceProps) {
  return <div className={cn(brutalSurfaceVariants({ variant, padding }), className)} {...props} />
}
