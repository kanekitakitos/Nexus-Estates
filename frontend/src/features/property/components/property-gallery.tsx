import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import { OwnProperty } from "../property-view"

interface PropertyGalleryProps {
    /** Objeto da propriedade para extração de imagens e metadados */
    property: OwnProperty
    /** Callback opcional para atualizar a imagem principal */
    onUpdateImage?: (newImageUrl: string) => void
}

// ─── Sub-Componentes Internos ───────────────────────────────────────────────

/** Display principal da galeria com controlos de navegação e badges */
function GalleryViewer({ 
    images, activeIndex, title, isFeatured, onPrev, onNext, onExpand 
}: { 
    images: string[]; activeIndex: number; title: string; isFeatured?: boolean; 
    onPrev: () => void; onNext: () => void; onExpand: () => void 
}) {
    return (
        <div className="relative overflow-hidden rounded-xl border-2 border-foreground aspect-[16/9] md:aspect-[21/9] bg-muted/10 group shadow-[4px_4px_0_0_#0D0D0D]">
            <AnimatePresence mode="wait">
                <motion.img
                    key={activeIndex} src={images[activeIndex] || ""} alt={title}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }} className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
            </AnimatePresence>

            {isFeatured && (
                <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-primary-foreground font-mono font-black border-2 border-foreground shadow-[2px_2px_0_0_#0D0D0D] text-[10px] uppercase tracking-widest">
                        <Star className="h-3.5 w-3.5 fill-current" strokeWidth={3} />
                        <span>Premium Asset</span>
                    </div>
                </div>
            )}

            {images.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
                    <button onClick={onPrev} className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-background shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100" title="Anterior"><ChevronLeft className="h-6 w-6" strokeWidth={3} /></button>
                    <button onClick={onNext} className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-background shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100" title="Próxima"><ChevronRight className="h-6 w-6" strokeWidth={3} /></button>
                </div>
            )}

            <button onClick={onExpand} className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-background shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] transition-all opacity-0 group-hover:opacity-100" title="Ecrã Inteiro"><Eye className="h-5 w-5" strokeWidth={2.5} /></button>

            {images.length > 1 && (
                <div className="absolute bottom-4 left-4 z-10">
                    <div className="flex items-center gap-2 rounded-md border-2 border-foreground bg-foreground px-3 py-1.5 text-background font-mono font-black text-[10px] tracking-widest shadow-[2px_2px_0_0_#0D0D0D]">
                        {String(activeIndex + 1).padStart(2, '0')} // {String(images.length).padStart(2, '0')}
                    </div>
                </div>
            )}
        </div>
    )
}

/** Grelha de miniaturas para seleção direta */
function GalleryThumbs({ images, activeIndex, onSelect }: { images: string[]; activeIndex: number; onSelect: (i: number) => void }) {
    return (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {images.map((src, i) => (
                <button
                    key={`${src}-${i}`} onClick={() => onSelect(i)}
                    className={cn(
                        "relative aspect-square overflow-hidden rounded-md transition-all duration-300 border-2",
                        activeIndex === i ? "border-primary shadow-[2px_2px_0_0_#0D0D0D] -translate-y-1" : "border-foreground/20 hover:border-foreground/40 hover:-translate-y-0.5"
                    )}
                >
                    <img src={src} alt="" className={cn("h-full w-full object-cover transition-all duration-300", activeIndex === i ? "grayscale-0 scale-105" : "grayscale opacity-50")} />
                </button>
            ))}
        </div>
    )
}

/** Modal de visualização imersiva */
function GalleryFullscreen({ 
    images, activeIndex, title, onClose, onPrev, onNext 
}: { 
    images: string[]; activeIndex: number; title: string; onClose: () => void; onPrev: () => void; onNext: () => void 
}) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <button onClick={onClose} className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-md border-2 border-white bg-white/10 text-white hover:bg-white/20 transition-all z-10" title="Fechar"><X className="h-8 w-8" strokeWidth={2.5} /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={images[activeIndex]} alt={title} className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl border-4 border-foreground bg-card shadow-[12px_12px_0_0_#0D0D0D]" onClick={(e) => e.stopPropagation()} />
            {images.length > 1 && (
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button onClick={(e) => { e.stopPropagation(); onPrev() }} className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-md border-2 border-white bg-white/10 text-white hover:bg-white/20 transition-all" title="Anterior"><ChevronLeft className="h-10 w-10" strokeWidth={3} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onNext() }} className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-md border-2 border-white bg-white/10 text-white hover:bg-white/20 transition-all" title="Próxima"><ChevronRight className="h-10 w-10" strokeWidth={3} /></button>
                </div>
            )}
        </motion.div>
    )
}

// ─── Componente Principal ───────────────────────────────────────────────────

/**
 * PropertyGallery - O motor de visualização de média da Nexus.
 * 
 * Gere a exibição de imagens em modo carrossel, grelha de miniaturas e visualização
 * em ecrã inteiro. Refatorado para maior modularidade.
 */
export function PropertyGallery({ property, onUpdateImage }: PropertyGalleryProps) {
    const galleryImages = property.imageUrl ? [property.imageUrl] : [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    ]

    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        if (galleryImages.length <= 1) return
        const intervalId = window.setInterval(() => setActiveImageIndex((p) => (p + 1) % galleryImages.length), 5000)
        return () => window.clearInterval(intervalId)
    }, [galleryImages.length])

    const next = () => setActiveImageIndex((p) => (p + 1) % galleryImages.length)
    const prev = () => setActiveImageIndex((p) => (p - 1 + galleryImages.length) % galleryImages.length)

    return (
        <div className="space-y-6">
            <GalleryViewer 
                images={galleryImages} activeIndex={activeImageIndex} title={property.title as string} 
                isFeatured={property.featured} onPrev={prev} onNext={next} onExpand={() => setIsFullscreen(true)} 
            />

            {galleryImages.length > 1 && (
                <GalleryThumbs images={galleryImages} activeIndex={activeImageIndex} onSelect={setActiveImageIndex} />
            )}

            <div className="rounded-xl border-2 border-dashed border-foreground/30 bg-muted/5 p-4 hover:border-primary/50 transition-colors">
                <ImageInput onUploadComplete={(urls) => urls.length > 0 && onUpdateImage?.(urls[0])} />
            </div>

            <AnimatePresence>
                {isFullscreen && (
                    <GalleryFullscreen 
                        images={galleryImages} activeIndex={activeImageIndex} title={property.title as string} 
                        onClose={() => setIsFullscreen(false)} onPrev={prev} onNext={next} 
                    />
                )}
            </AnimatePresence>
        </div>
    )
}