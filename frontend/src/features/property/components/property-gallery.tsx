import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/forms/button"
import { cn } from "@/lib/utils"
import { ImageInput } from "@/components/ui/file-handler/imageInput"
import { OwnProperty } from "../property-view"

const MAIN_IMAGE_WRAPPER_STYLES = "relative w-full overflow-hidden rounded-xl md:rounded-3xl h-[60vh] md:h-auto md:aspect-[16/5]"
const THUMBNAIL_STYLES = "relative aspect-[4/3] overflow-hidden rounded-lg md:rounded-xl border-[2px] border-foreground/70 bg-muted/50 hover:bg-primary/10 transition-colors cursor-pointer group snap-center"
const THUMBNAIL_LABEL_STYLES = "absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 font-mono text-[8px] md:text-[10px] font-bold uppercase tracking-[0.18em] text-foreground"

export function PropertyGallery({ property }: { property: OwnProperty }) {
    const galleryImages = [
        property.imageUrl,
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        // Podes adicionar mais aqui como tinhas no original...
    ]

    const [activeImageIndex, setActiveImageIndex] = useState(0)

    useEffect(() => {
        if (galleryImages.length <= 1) return
        const intervalId = window.setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
        }, 6000)
        return () => window.clearInterval(intervalId)
    }, [galleryImages.length])

    return (
        <div>
            <div className={MAIN_IMAGE_WRAPPER_STYLES}>
                <img
                    src={galleryImages[activeImageIndex] || ""}
                    alt={property.title}
                    className="h-full w-full object-cover"
                />
                <Badge variant="featured" className="absolute top-4 left-4">FEATURED</Badge>
            </div>

            <div className="grid grid-flow-col grid-cols-4 my-3 gap-4 ">
                <div id="images" className="grid gap-4 pb-2 grid-flow-col auto-cols-[33%] overflow-x-scroll col-span-4 snap-x">
                    {galleryImages.map((imageSrc, index) => (
                        <div
                            key={`${imageSrc}-${index}`}
                            onClick={() => setActiveImageIndex(index)}
                            className={cn(THUMBNAIL_STYLES, activeImageIndex === index && "border-primary")}
                        >
                            <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                            <Button variant="brutal" className="absolute top-4 left-4 scale-75 md:scale-100">DELETE</Button>
                            <div className={THUMBNAIL_LABEL_STYLES}>VIEW</div>
                        </div>
                    ))}
                </div>
            </div>

            <ImageInput/>
        </div>
    )
}