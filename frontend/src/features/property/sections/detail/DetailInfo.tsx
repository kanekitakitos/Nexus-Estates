import { MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import { cn } from "@/lib/utils"
import { OwnProperty } from "../../types"

interface DetailInfoProps {
    property: OwnProperty
}

export function DetailInfo({ property }: DetailInfoProps) {
    const title = typeof property.title === 'string' ? property.title : property.title?.pt || property.title?.en || "Sem Título"
    const description = typeof property.description === 'string' ? property.description : property.description?.pt || property.description?.en || "Sem descrição disponível."
    
    return (
        <div className="space-y-6">
            {/* 01. Header Card */}
            <BrutalShard rotate="primary">
                <div className="flex flex-col space-y-4">
                    <span className="font-mono text-[10px] font-black text-primary uppercase tracking-widest">01 // Perfil Principal</span>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" strokeWidth={3} />
                        <span className="font-mono text-xs md:text-sm font-black text-muted-foreground uppercase tracking-widest">
                            {property.location}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase leading-[0.9] tracking-tighter mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                        {title}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge variant="rating" className="border-2 shadow-[2px_2px_0_0_rgb(0,0,0)] px-3">
                            <Star className="h-4 w-4 fill-current mr-1 text-yellow-400" />
                            <span className="font-mono font-bold">{(property.rating || 0).toFixed(1)}</span>
                        </Badge>
                        <div className="h-px w-8 md:w-12 bg-foreground/30" />
                        <span className="font-mono font-bold text-primary text-lg md:text-xl">
                            <span className="text-2xl md:text-3xl font-black">{property.price}€</span>
                            <span className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">/ Noite</span>
                        </span>
                    </div>
                </div>
            </BrutalShard>

            {/* 02. Description & Specs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BrutalShard rotate="secondary" className="h-full">
                    <div className="flex flex-col space-y-6 justify-between h-full py-2">
                        <div>
                            <span className="font-mono text-[10px] font-black text-primary uppercase tracking-widest block mb-4">02 // Descrição</span>
                            <div className="border-l-4 border-primary pl-4 py-1">
                                <p className="font-mono text-sm md:text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                    {description}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-6">
                            {[
                                { icon: Users, label: `${property.maxGuests || 0} Hóspedes` },
                                { icon: Home,  label: "Alojamento" }, 
                                { icon: Maximize, label: "Premium" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 md:gap-3 border-[2px] border-foreground p-2 md:p-3 bg-secondary/30 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_rgb(0,0,0)] transition-all">
                                    <Icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" strokeWidth={2.5} />
                                    <span className="font-mono font-black uppercase tracking-tighter text-[10px] md:text-[11px]">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </BrutalShard>

                <BrutalShard rotate="primary" className="h-full">
                    <div className="flex flex-col space-y-6 h-full justify-between py-2">
                        <div>
                            <span className="font-mono text-[10px] font-black text-primary uppercase tracking-widest block mb-4">03 // Comodidades</span>
                            <div className="flex flex-wrap gap-2 md:gap-2.5">
                                {property.tags?.map((tag, index) => (
                                    <Badge key={`${tag}-${index}`} variant="outline" className="border-2 border-foreground bg-background hover:-translate-y-0.5 hover:shadow-[2px_2px_0_0_rgb(0,0,0)] transition-all flex items-center gap-1.5 py-1.5 px-3">
                                        <Check className="h-3.5 w-3.5 text-primary" strokeWidth={4} />
                                        <span className="font-mono font-bold uppercase text-[10px] md:text-xs tracking-widest">{tag}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </BrutalShard>
            </div>
        </div>
    )
}
