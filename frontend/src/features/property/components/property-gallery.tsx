"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Eye, ChevronLeft, ChevronRight, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import Image from "next/image"
import { OwnProperty } from "@/types"
import { PropertyMediaModal } from "./property-media-modal"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/** Propriedades do componente de galeria de ativos */
export interface PropertyGalleryProps {
    /** Objeto da propriedade para extração de título e imagens */
    property: OwnProperty
    /** Callback disparado após sucesso no upload de nova média */
    onUpdateImage?: (newImageUrl: string) => void
}

// ─── Constantes de Fallback ──────────────────────────────────────────────

/** Imagens de exemplo utilizadas quando o ativo não possui media cadastrada */
const PLACEHOLDER_GALLERY = [
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
]

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/**
 * GalleryViewer - O visualizador principal de grande escala.
 */
function GalleryViewer({ 
    images, activeIndex, title, isFeatured, onPrev, onNext, onExpand 
}: { 
    images: string[] 
    activeIndex: number 
    title: string 
    isFeatured?: boolean
    onPrev: () => void 
    onNext: () => void 
    onExpand: () => void 
}) {
    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-foreground dark:border-zinc-800 aspect-[16/9] md:aspect-[21/9] bg-muted/10 group shadow-[12px_12px_0_0_#0D0D0D] dark:shadow-none">
            <AnimatePresence mode="wait">
                <motion.img
                    key={activeIndex} 
                    src={images[activeIndex] || ""} 
                    alt={title}
                    initial={{ opacity: 0, scale: 1.1 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }} 
                    className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
            </AnimatePresence>

            {/* Crachá de Destaque */}
            {isFeatured && (
                <div className="absolute top-6 left-6 z-10">
                    <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-2 text-white font-mono font-black border-[3px] border-foreground shadow-[4px_4px_0_0_#000] text-[11px] uppercase tracking-widest -rotate-2">
                        <Star className="h-4 w-4 fill-current" strokeWidth={4} />
                        <span>Premium_Asset</span>
                    </div>
                </div>
            )}

            {/* Controlos de Navegação */}
            {images.length > 1 && (
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
                    <button onClick={onPrev} className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-foreground bg-white shadow-[4px_4px_0_0_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all opacity-0 group-hover:opacity-100 dark:bg-zinc-900" title="Anterior"><ChevronLeft className="h-8 w-8" strokeWidth={4} /></button>
                    <button onClick={onNext} className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-foreground bg-white shadow-[4px_4px_0_0_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all opacity-0 group-hover:opacity-100 dark:bg-zinc-900" title="Próxima"><ChevronRight className="h-8 w-8" strokeWidth={4} /></button>
                </div>
            )}

            {/* Ação de Expansão */}
            <button onClick={onExpand} className="absolute bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-foreground bg-white shadow-[4px_4px_0_0_#0D0D0D] hover:shadow-none transition-all opacity-0 group-hover:opacity-100 dark:bg-zinc-900 text-primary" title="Ecrã Inteiro">
                <Eye className="h-7 w-7" strokeWidth={3} />
            </button>

            {/* Indicador de Paginação */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-6 z-10">
                    <div className="flex items-center gap-2 rounded-xl border-[3px] border-foreground bg-foreground px-4 py-2 text-white font-mono font-black text-[11px] tracking-widest shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
                        {String(activeIndex + 1).padStart(2, '0')}{" // "}{String(images.length).padStart(2, '0')}
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * GalleryThumbs - Lista de miniaturas interativas para seleção rápida.
 */
function GalleryThumbs({ 
    images, activeIndex, onSelect 
}: { 
    images: string[] 
    activeIndex: number 
    onSelect: (i: number) => void 
}) {
    return (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
            {images.map((src, i) => (
                <button
                    key={`${src}-${i}`} 
                    onClick={() => onSelect(i)}
                    className={cn(
                        "relative aspect-square overflow-hidden rounded-2xl transition-all duration-300 border-[3px]",
                        activeIndex === i 
                            ? "border-primary shadow-[4px_4px_0_0_#0D0D0D] -translate-y-1.5" 
                            : "border-foreground/20 dark:border-white/10 hover:border-foreground/40 hover:-translate-y-1"
                    )}
                >
                    <Image
                        src={src}
                        alt=""
                        fill
                        sizes="96px"
                        className={cn(
                            "object-cover transition-all duration-300",
                            activeIndex === i ? "grayscale-0 scale-110" : "grayscale opacity-40"
                        )}
                        unoptimized
                    />
                </button>
            ))}
        </div>
    )
}

/**
 * UploadMediaSection - Slot de upload com design Neo-Brutalist de impacto.
 */
function UploadMediaSection({ onUpload }: { onUpload: (urls: string[]) => void }) {
    return (
        <div className="relative group rounded-[2.5rem] border-[3px] border-dashed border-foreground/30 dark:border-white/10 bg-[#FAFAF5]/50 dark:bg-zinc-900/40 p-12 transition-all hover:border-primary/50 hover:bg-white dark:hover:bg-zinc-900">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all" />
                    <div className="relative h-20 w-20 flex items-center justify-center rounded-3xl border-[3px] border-foreground bg-white shadow-[6px_6px_0_0_#0D0D0D] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all dark:bg-zinc-800">
                        <UploadCloud className="h-10 w-10 text-primary" strokeWidth={2.5} />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h5 className="font-serif text-xl font-bold italic uppercase tracking-tight">Anexar Média Visual</h5>
                    <p className="font-mono text-[9px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">
                        Protocolo_Upload // PNG_JPG_WEBP // Max_25MB_Asset
                    </p>
                </div>

                <div className="mt-2 scale-125 origin-center">
                    <ImageInput onUploadComplete={onUpload} />
                </div>
            </div>
        </div>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * PropertyGallery - Módulo de Visualização e Gestão de Média.
 * 
 * @description Centraliza a interação com os ativos visuais do imóvel, providenciando
 * um visualizador cinematográfico e ferramentas de upload em conformidade com 
 * o design system editorial da rede Nexus Estates.
 */
export function PropertyGallery({ property, onUpdateImage }: PropertyGalleryProps) {
    // Configuração de Imagens (com fallbacks de placeholder)
    const galleryImages = property.imageUrl?.trim()
        ? [property.imageUrl.trim()]
        : PLACEHOLDER_GALLERY

    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Handlers de Navegação
    const handleNext = () => setActiveImageIndex((p) => (p + 1) % galleryImages.length)
    const handlePrev = () => setActiveImageIndex((p) => (p - 1 + galleryImages.length) % galleryImages.length)

    return (
        <div className="space-y-12">
            {/* Visualizador de Alta Escala */}
            <GalleryViewer 
                images={galleryImages} 
                activeIndex={activeImageIndex} 
                title={typeof property.title === 'string' ? property.title : property.title?.pt || "Nexus Asset"} 
                isFeatured={property.featured} 
                onPrev={handlePrev} 
                onNext={handleNext} 
                onExpand={() => setIsFullscreen(true)} 
            />

            {/* Listagem de Thumbs Interativa */}
            {galleryImages.length > 1 && (
                <GalleryThumbs 
                    images={galleryImages} 
                    activeIndex={activeImageIndex} 
                    onSelect={setActiveImageIndex} 
                />
            )}

            {/* Slot de Expansão de Média */}
            <UploadMediaSection 
                onUpload={(urls) => urls.length > 0 && onUpdateImage?.(urls[0])} 
            />

            {/* Modal de Ecrã Inteiro (Protocolo Cinemático) */}
            <PropertyMediaModal 
                isOpen={isFullscreen}
                onClose={() => setIsFullscreen(false)}
                images={galleryImages}
                title={typeof property.title === 'string' ? property.title : (property.title?.pt || "Nexus Gallery")}
                initialIndex={activeImageIndex}
            />
        </div>
    )
}
