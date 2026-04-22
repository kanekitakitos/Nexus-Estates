"use client"

import { useState, useEffect, useCallback, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/** Propriedades do modal cinematográfico de média */
export interface PropertyMediaModalProps {
  /** Se o modal está visível no DOM */
  isOpen: boolean
  /** Callback para encerramento do protocolo de visualização */
  onClose: () => void
  /** Lista de URLs das imagens do ativo */
  images?: string[]
  /** Título do ativo para exibição nos metadados */
  title: string
  /** Índice da imagem a ser exibida inicialmente */
  initialIndex?: number
}

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/**
 * ModalControls - Interface de navegação e fecho com design Neo-Brutalist.
 */
function ModalControls({ 
  onClose, onNext, onPrev, hasMultiple 
}: { 
  onClose: () => void 
  onNext: () => void 
  onPrev: () => void 
  hasMultiple: boolean 
}) {
  return (
    <>
      {/* Botão de Fecho */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 z-[70] flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-rose-600 hover:border-rose-500 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]"
        title="Fechar (Esc)"
      >
        <X className="h-7 w-7" strokeWidth={3} />
      </button>

      {/* Navegação Lateral */}
      {hasMultiple && (
        <div className="absolute inset-x-6 top-1/2 z-[60] flex -translate-y-1/2 justify-between pointer-events-none">
          <button
            type="button"
            onClick={onPrev}
            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-white/10 bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-primary hover:border-primary shadow-[6px_6px_0_0_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            title="Anterior"
          >
            <ChevronLeft className="h-10 w-10" strokeWidth={4} />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-white/10 bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-primary hover:border-primary shadow-[6px_6px_0_0_rgba(0,0,0,0.5)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            title="Próxima"
          >
            <ChevronRight className="h-10 w-10" strokeWidth={4} />
          </button>
        </div>
      )}
    </>
  )
}

/**
 * ModalMetadata - Overlay informativo sobre o ativo e posição e na galeria.
 */
function ModalMetadata({ title, current, total }: { title: string; current: number; total: number }) {
  return (
    <div className="absolute bottom-10 left-0 right-0 z-[60] flex flex-col items-center gap-3">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-[80vw] bg-black/60 backdrop-blur-md border-[2px] border-white/10 rounded-2xl px-8 py-4 shadow-2xl"
      >
        <h3 className="font-serif text-xl font-bold italic text-white uppercase tracking-tight text-center truncate">
          {title}
        </h3>
        {total > 1 && (
          <div className="mt-2 flex items-center justify-center gap-4">
             <div className="h-px w-8 bg-white/20" />
             <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Frame_{String(current).padStart(2, '0')} · Total_{String(total).padStart(2, '0')}
             </span>
             <div className="h-px w-8 bg-white/20" />
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * PropertyMediaModal - Orquestrador Cinematográfico de Média.
 * 
 * @description Providencia um ecrã inteiro imersivo para visualização de ativos
 * visuais de alta densidade. Suporta controlo por teclado, animações de fluidas 
 * e uma interface Neo-Brutalist refinada para ambientes escuros.
 */
export function PropertyMediaModal({
  isOpen,
  onClose,
  images = [],
  title,
  initialIndex = 0,
}: PropertyMediaModalProps) {
  const mounted = useSyncExternalStore(
    (onStoreChange) => {
      onStoreChange()
      return () => {}
    },
    () => true,
    () => false
  )

  const mediaList = images.length > 0 ? images : ["/placeholder-property.jpg"]

  // Guardião de fecho e controle de scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen, initialIndex])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <ModalSession
          mediaList={mediaList}
          title={title}
          initialIndex={initialIndex}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body
  )
}

function ModalSession({
  mediaList,
  title,
  initialIndex,
  onClose,
}: {
  mediaList: string[]
  title: string
  initialIndex: number
  onClose: () => void
}) {
  const totalItems = mediaList.length
  const [activeIndex, setActiveIndex] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(totalItems - 1, 0)))

  const goNext = useCallback(() => {
    setActiveIndex((p) => (p + 1) % totalItems)
  }, [totalItems])

  const goPrev = useCallback(() => {
    setActiveIndex((p) => (p - 1 + totalItems) % totalItems)
  }, [totalItems])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 z-0" onClick={onClose} />

      <ModalControls
        onClose={onClose}
        onNext={goNext}
        onPrev={goPrev}
        hasMultiple={totalItems > 1}
      />

      <div className="relative z-10 w-full max-w-[1400px] px-4 md:px-20 h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={mediaList[activeIndex]}
            alt={title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="max-h-[85vh] w-auto max-w-full object-contain shadow-[20px_20px_60px_rgba(0,0,0,0.8)] border-[4px] border-white/5 rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          />
        </AnimatePresence>
      </div>

      <ModalMetadata
        title={title}
        current={activeIndex + 1}
        total={totalItems}
      />
    </motion.div>
  )
}
