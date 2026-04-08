import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, Eye, ChevronLeft, ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import { OwnProperty } from "../property-view"

interface PropertyGalleryProps {
    property: OwnProperty
    onUpdateImage?: (newImageUrl: string) => void
}

export function PropertyGallery({ property, onUpdateImage }: PropertyGalleryProps) {
    const galleryImages = property.imageUrl
        ? [property.imageUrl]
        : [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        ]

    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        if (galleryImages.length <= 1) return
        const intervalId = window.setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
        }, 5000)
        return () => window.clearInterval(intervalId)
    }, [galleryImages.length])

    const nextImage = () => {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
    }

    const prevImage = () => {
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    }

    return (
        <div className="space-y-6">
            {/* Main Image Display */}
            <div className="relative overflow-hidden rounded-xl border-2 border-foreground aspect-[16/9] md:aspect-[21/9] bg-muted/10 group shadow-[4px_4px_0_0_#0D0D0D]">
                {/* Image */}
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeImageIndex}
                        src={galleryImages[activeImageIndex] || ""}
                        alt={property.title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                </AnimatePresence>

                {/* Featured Badge */}
                {property.featured && (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-primary-foreground font-mono font-black border-2 border-foreground shadow-[2px_2px_0_0_#0D0D0D] text-[10px] uppercase tracking-widest">
                            <Star className="h-3.5 w-3.5 fill-current" strokeWidth={3} />
                            <span>Premium Asset</span>
                        </div>
                    </div>
                )}

                {/* Navigation Arrows */}
                {galleryImages.length > 1 && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
                        <button
                            onClick={prevImage}
                            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-background shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100"
                            title="Imagem Anterior"
                        >
                            <ChevronLeft className="h-6 w-6" strokeWidth={3} />
                        </button>

                        <button
                            onClick={nextImage}
                            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-background shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100"
                            title="Próxima Imagem"
                        >
                            <ChevronRight className="h-6 w-6" strokeWidth={3} />
                        </button>
                    </div>
                )}

                {/* Fullscreen Button */}
                <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-md border-2 border-foreground bg-background shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100"
                    title="Ver em ecrã inteiro"
                >
                    <Eye className="h-5 w-5" strokeWidth={2.5} />
                </button>

                {/* Image Counter Shard */}
                {galleryImages.length > 1 && (
                    <div className="absolute bottom-4 left-4 z-10">
                        <div className="flex items-center gap-2 rounded-md border-2 border-foreground bg-foreground px-3 py-1.5 text-background font-mono font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D]">
                            {String(activeImageIndex + 1).padStart(2, '0')} // {String(galleryImages.length).padStart(2, '0')}
                        </div>
                    </div>
                )}
            </div>

            {/* Thumbnail Grid */}
            {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {galleryImages.map((imageSrc, index) => (
                        <button
                            key={`${imageSrc}-${index}`}
                            onClick={() => setActiveImageIndex(index)}
                            className={cn(
                                "relative aspect-square overflow-hidden rounded-md transition-all duration-300",
                                "border-2",
                                activeImageIndex === index
                                    ? "border-primary shadow-[2px_2px_0_0_#0D0D0D] -translate-y-1"
                                    : "border-foreground/20 hover:border-foreground/40 hover:-translate-y-0.5"
                            )}
                        >
                            <img
                                src={imageSrc}
                                alt=""
                                className={cn(
                                    "h-full w-full object-cover transition-all duration-300",
                                    activeImageIndex === index ? "grayscale-0 scale-105" : "grayscale opacity-50"
                                )}
                            />

                            {/* Delete Button Shard */}
                            <button
                                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-md border-2 border-foreground bg-rose-500 text-white shadow-[1px_1px_0_0_#0D0D0D] opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // Handle delete
                                }}
                                title="Remover imagem"
                            >
                                <X className="h-3.5 w-3.5" strokeWidth={3} />
                            </button>
                        </button>
                    ))}
                </div>
            )}

            {/* Upload Section Shard */}
            <div className="rounded-xl border-2 border-dashed border-foreground/30 bg-muted/5 p-4 hover:border-primary/50 transition-colors">
                <ImageInput
                    onUploadComplete={(novosUrls) => {
                        if (novosUrls.length > 0 && onUpdateImage) {
                            onUpdateImage(novosUrls[0])
                        }
                    }}
                />
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFullscreen(false)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                    >
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-md border-2 border-white bg-white/10 text-white hover:bg-white/20 transition-all z-10"
                            title="Fechar"
                        >
                            <X className="h-8 w-8" strokeWidth={2.5} />
                        </button>

                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={galleryImages[activeImageIndex]}
                            alt={property.title}
                            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl border-4 border-foreground bg-card shadow-[12px_12px_0_0_#0D0D0D]"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {galleryImages.length > 1 && (
                            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage() }}
                                    className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-md border-2 border-white bg-white/10 text-white hover:bg-white/20 transition-all"
                                    title="Anterior"
                                >
                                    <ChevronLeft className="h-10 w-10" strokeWidth={3} />
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage() }}
                                    className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-md border-2 border-white bg-white/10 text-white hover:bg-white/20 transition-all"
                                    title="Próxima"
                                >
                                    <ChevronRight className="h-10 w-10" strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}