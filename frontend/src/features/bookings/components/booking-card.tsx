"use client"

/**
 * BookingCard — v2
 *
 * Contexto
 * - Card usado na listagem (BookingList) para representar uma propriedade.
 *
 * Responsabilidades
 * - Apresentar imagem, título, localização e preço de forma impactante.
 * - Ser “tap-friendly” em mobile (container inteiro clicável).
 * - Emitir `onBook(property.id)` quando o utilizador interage.
 *
 * UX/Animação
 * - Presets (hover/tap/shadow/glow) vêm de `features/bookings/motion.ts` para consistência.
 * - Respeita `prefers-reduced-motion` através de `useReducedMotion`.
 */

import { motion, useReducedMotion } from "framer-motion"
import { MapPin, ArrowRight, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import Image from "next/image"
import { useEffect, useState } from "react"
import type { BookingProperty } from "@/types/booking"
import {
  brutalShadow,
  brutalShadowHover,
  cardHover,
  cardTap,
  featuredGlow,
  iconButtonHover,
  iconButtonTap,
  springSnap,
  springBounce,
  staggerItem,
} from "@/features/bookings/motion"

// ─────────────────────────────────────────────
// Types — exportados para uso em booking-details, booking-view, etc.
// ─────────────────────────────────────────────

export type { BookingProperty }

interface BookingCardProps {
  property: BookingProperty
  onBook?: (id: string) => void
  className?: string
}

// ─────────────────────────────────────────────
// BookingCard
// ─────────────────────────────────────────────

/**
 * Card principal da listagem de propriedades.
 * É intencionalmente “clickable” no container para reduzir atrito em mobile.
 */
export function BookingCard({ property, onBook, className }: BookingCardProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={staggerItem}
      className={cn("group relative w-full", className)}
      whileHover={
        shouldReduceMotion
          ? undefined
          : cardHover
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : cardTap
      }
    >
      {/* Card shell — brutalist border + animated shadow on hover */}
      <motion.div
        onClick={() => onBook?.(property.id)}
        className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-foreground bg-background"
        animate={{ boxShadow: brutalShadow }}
        whileHover={
          shouldReduceMotion
            ? undefined
            : { boxShadow: brutalShadowHover }
        }
        transition={springSnap}
      >
        {/* ── Image section */}
        <CardImage property={property} />

        {/* ── Details section */}
        <CardDetails property={property} onBook={onBook} />
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// CardImage — imagem full-bleed com gradiente para legibilidade
// ─────────────────────────────────────────────

/** Secção superior do card: imagem, badge featured, rating, título e localização. */
function CardImage({ property }: { property: BookingProperty }) {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [property.imageUrl])

  const isUnsplash = property.imageUrl.includes("images.unsplash.com")
  const showImage = Boolean(property.imageUrl) && !hasImageError

  return (
    <div className="relative h-52 md:h-56 w-full overflow-hidden">
      {showImage ? (
        <div className="absolute inset-0">
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
            unoptimized={isUnsplash}
            onError={() => setHasImageError(true)}
          />
        </div>
      ) : (
        <div className="h-full w-full bg-muted/50 grid place-items-center">
          <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
            Sem imagem
          </span>
        </div>
      )}

      {/* Gradient — only bottom third for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

      {/* Featured badge — top left, pulsing glow */}
      {property.featured && <FeaturedBadge />}

      {/* Rating — top right */}
      {property.rating != null && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full border-2 border-foreground bg-background px-2 py-0.5 shadow-[2px_2px_0_0_rgb(0,0,0)]">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="font-mono text-[11px] font-black">{property.rating}</span>
        </div>
      )}

      {/* Title + location — overlaid at bottom of image */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
        {/* Location */}
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3 text-primary shrink-0" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/80 truncate">
            {property.location}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-black text-sm md:text-base uppercase leading-tight tracking-tight line-clamp-2">
          {property.title}
        </h3>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// FeaturedBadge — pill com glow pulsante
// ─────────────────────────────────────────────

/** Badge de destaque para propriedades “featured”. */
function FeaturedBadge() {
  return (
    <div className="absolute top-3 left-3 z-10">
      <motion.div
        animate={featuredGlow.animate}
        transition={featuredGlow.transition}
        className="rounded-full"
      >
        <div className="flex items-center gap-1 rounded-full border-2 border-primary bg-primary px-2 py-0.5 shadow-[2px_2px_0_0_rgb(0,0,0)]">
          <Zap className="h-2.5 w-2.5 fill-primary-foreground text-primary-foreground" />
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-primary-foreground">
            Featured
          </span>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────
// CardDetails — preço, tags e CTA
// ─────────────────────────────────────────────

/** Secção inferior do card: tags, preço por noite e CTA para abrir detalhes. */
function CardDetails({
  property,
  onBook,
}: {
  property: BookingProperty
  onBook?: (id: string) => void
}) {
  return (
    <div className="px-3 pt-2 pb-3 space-y-2.5">
      {/* Divider */}
      <div className="h-[2px] w-full bg-foreground" />

      {/* Tags — up to 3 pills */}
      {property.tags && property.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {property.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-foreground/40 bg-muted/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {property.tags.length > 3 && (
            <span className="font-mono text-[9px] text-muted-foreground/60">
              +{property.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Price + CTA row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[9px] font-bold uppercase text-muted-foreground leading-none mb-0.5">
            A partir de
          </div>
          <div className="font-mono text-sm font-black text-primary leading-none">
            €{property.price}
            <span className="text-[10px] font-normal text-muted-foreground ml-0.5">/noite</span>
          </div>
        </div>

        <motion.div
          whileHover={iconButtonHover}
          whileTap={iconButtonTap}
          transition={springBounce}
        >
          <Button
            variant="brutal"
            onClick={(e) => {
              e.stopPropagation()
              onBook?.(property.id)
            }}
            className="h-9 w-9 p-0 shadow-[3px_3px_0_0_rgb(0,0,0)] flex items-center justify-center"
            aria-label={`Ver ${property.title}`}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
