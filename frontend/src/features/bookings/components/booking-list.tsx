"use client"

/**
 * BookingList — v2
 *
 * Contexto
 * - Grid principal de resultados no ecrã de listagem (BookingView).
 *
 * Responsabilidades
 * - Renderizar uma lista de `BookingCard` com animação de entrada em stagger.
 * - Injectar `BookingHowItWorks` numa posição fixa para orientar o utilizador.
 * - Mostrar EmptyState quando a lista vem vazia.
 *
 * Notas de UX
 * - Rotação alternada (±1deg) dá aspecto editorial sem comprometer legibilidade.
 * - Hover remove rotação e sobe z-index para dar “focus” ao card.
 */

import { motion } from "framer-motion"
import { SearchX } from "lucide-react"
import { cn } from "@/lib/utils"

import { BookingCard } from "./booking-card"
import type { BookingProperty } from "@/types/booking"
import { BookingHowItWorks } from "./booking-how-it-works"
import { BrutalEmptyState } from "@/components/ui/data-display/card"
import {
  comicPopVariants,
  listContainerVariants,
  listItemVariants,
  panelVariants,
} from "@/features/bookings/lib/motion"

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

// Position (0-indexed) where the HowItWorks card is injected
const HOW_IT_WORKS_INDEX = 4

const GRID_STYLES =
  "grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 md:gap-8 pb-12"

const CARD_BASE_STYLES =
  "hover:rotate-0 hover:z-10 transition-transform duration-300"

const HOW_IT_WORKS_STYLES =
  "aspect-[4/5] rotate-2 hover:rotate-0 hover:z-10 transition-transform duration-300"

/** Inclinação alternada por índice — mantém o “editorial feel” do grid. */
function cardRotation(index: number): string {
  return index % 2 === 0 ? "rotate-1" : "-rotate-1"
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface BookingListProps {
  properties: BookingProperty[]
  onBook?: (id: string) => void
}

// ─────────────────────────────────────────────
// BookingList
// ─────────────────────────────────────────────

export function BookingList({ properties, onBook }: BookingListProps) {
  if (properties.length === 0) {
    return <EmptyState />
  }

  return (
    <motion.div
      className={GRID_STYLES}
      variants={listContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {properties.map((property, index) => {
        const card = (
          <motion.div
            key={property.id}
            variants={listItemVariants}
            className={cn(cardRotation(index), CARD_BASE_STYLES)}
          >
            <BookingCard property={property} onBook={onBook} />
          </motion.div>
        )

        // Inject HowItWorks at position HOW_IT_WORKS_INDEX
        if (index === HOW_IT_WORKS_INDEX) {
          return (
            <div key={`group-${property.id}`} className="contents">
              <motion.div
                key="how-it-works"
                variants={comicPopVariants}
                className={HOW_IT_WORKS_STYLES}
              >
                <BookingHowItWorks mode="card" className="h-full w-full" />
              </motion.div>
              {card}
            </div>
          )
        }

        return card
      })}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────

/** Estado vazio da listagem quando não existem propriedades para mostrar. */
function EmptyState() {
  return (
    <motion.div variants={panelVariants} initial="initial" animate="animate">
      <BrutalEmptyState>
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 420, damping: 18 }}
            className="rounded-xl border-2 border-foreground/20 bg-muted/30 p-4 shadow-[3px_3px_0_0_rgb(0,0,0,0.06)]"
          >
            <SearchX className="h-8 w-8 text-muted-foreground/50" />
          </motion.div>
          <div>
            <h3 className="font-mono text-xl font-bold uppercase tracking-tight">
              Sem resultados
            </h3>
            <p className="mt-1 text-sm text-muted-foreground font-mono max-w-xs">
              Não encontrámos propriedades com estes critérios. Tenta ajustar os filtros.
            </p>
          </div>
        </div>
      </BrutalEmptyState>
    </motion.div>
  )
}
