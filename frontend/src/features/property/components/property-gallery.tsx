"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Eye, ChevronLeft, ChevronRight, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import Image from "next/image"
import { OwnProperty } from "@/types"
import { PropertyMediaModal } from "./property-media-modal"
import { propertyCopy, propertyTokens } from "../lib/property-tokens"

// ─── Tipos e Props ────────────────────────────────────────────────────────

/** Propriedades do componente de galeria de ativos */
export interface PropertyGalleryProps {
    /** Objeto da propriedade para extração de título e imagens */
    property: OwnProperty
    /** Callback disparado após sucesso no upload de nova média */
    onUpdateImage?: (newImageUrl: string) => void
}

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
        <div className={propertyTokens.ui.gallery.viewerWrapClass}>
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
                    <div className={propertyTokens.ui.gallery.featuredBadgeClass}>
                        <Star className="h-4 w-4 fill-current" strokeWidth={4} />
                        <span>{propertyCopy.gallery.featuredBadge}</span>
                    </div>
                </div>
            )}

            {/* Controlos de Navegação */}
            {images.length > 1 && (
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
                    <button onClick={onPrev} className={propertyTokens.ui.gallery.navButtonClass} title={propertyCopy.gallery.prevTitle}><ChevronLeft className="h-8 w-8" strokeWidth={4} /></button>
                    <button onClick={onNext} className={propertyTokens.ui.gallery.navButtonClass} title={propertyCopy.gallery.nextTitle}><ChevronRight className="h-8 w-8" strokeWidth={4} /></button>
                </div>
            )}

            {/* Ação de Expansão */}
            <button onClick={onExpand} className={propertyTokens.ui.gallery.fullscreenButtonClass} title={propertyCopy.gallery.fullscreenTitle}>
                <Eye className="h-7 w-7" strokeWidth={3} />
            </button>

            {/* Indicador de Paginação */}
            {images.length > 1 && (
                <div className="absolute bottom-6 left-6 z-10">
                    <div className={propertyTokens.ui.gallery.paginationClass}>
                        {String(activeIndex + 1).padStart(2, propertyCopy.gallery.padChar)}
                        {propertyCopy.gallery.indexDivider}
                        {String(images.length).padStart(2, propertyCopy.gallery.padChar)}
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
                            ? propertyTokens.ui.gallery.thumbsSelectedClass
                            : "border-foreground/20 dark:border-white/10 hover:border-foreground/40 hover:-translate-y-1"
                    )}
                >
                    <Image
                        src={src}
                        alt={propertyCopy.gallery.thumbAlt}
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
        <div className={propertyTokens.ui.gallery.uploadWrapClass}>
            <div className="flex flex-col items-center justify-center gap-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all" />
                    <div className={propertyTokens.ui.gallery.uploadIconWrapClass}>
                        <UploadCloud className="h-10 w-10 text-primary" strokeWidth={2.5} />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h5 className="font-serif text-xl font-bold italic uppercase tracking-tight">{propertyCopy.gallery.uploadTitle}</h5>
                    <p className="font-mono text-[9px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">
                        {propertyCopy.gallery.uploadProtocol}
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
        : [...propertyTokens.ui.gallery.placeholderImages]

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
                title={typeof property.title === "string" ? property.title : property.title?.pt || propertyCopy.gallery.placeholderTitle} 
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
                title={typeof property.title === "string" ? property.title : (property.title?.pt || propertyCopy.gallery.placeholderModalTitle)}
                initialIndex={activeImageIndex}
            />
        </div>
    )
}
