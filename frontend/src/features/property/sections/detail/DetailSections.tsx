import { ArrowLeft, Pencil, MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import { OwnProperty } from "@/types"

// ─── Detail Navigation ──────────────────────────────────────────────────────

export function DetailNavigation({ onBack, onEdit }: { onBack: () => void, onEdit: () => void }) {
    return (
        <div className="mb-8 flex justify-between items-center bg-transparent p-2 rounded-xl border-2 border-foreground/5 overflow-hidden">
            <Button onClick={onBack} variant="outline" className="gap-2 border-2 text-[10px] font-black uppercase tracking-widest px-4 font-mono shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[4px_4px_0_0_#0D0D0D] transition-all">
                <ArrowLeft className="h-3 w-3" /> VOLTAR_LISTA
            </Button>
            <Button onClick={onEdit} variant="brutal" className="gap-2 bg-primary text-white border-2 border-foreground text-[10px] font-black uppercase tracking-widest px-6 shadow-[3px_3px_0_0_#0D0D0D] hover:shadow-[5px_5px_0_0_#0D0D0D] transition-all">
                <Pencil className="h-3 w-3" /> EDITAR_PERFIL
            </Button>
        </div>
    )
}

// ─── Detail Info ────────────────────────────────────────────────────────────

export function DetailInfo({ property }: { property: OwnProperty }) {
    const title = typeof property.title === 'string' ? property.title : property.title?.pt || property.title?.en || "Sem Título"
    const description = typeof property.description === 'string' ? property.description : property.description?.pt || property.description?.en || "Sem descrição."
    
    return (
        <div className="space-y-6">
            <BrutalShard rotate="primary">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <MapPin className="h-4 w-4" />
                        <span className="font-mono text-xs font-black uppercase tracking-widest">{property.location}</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[0.9]">{title}</h1>
                    <div className="flex items-center gap-4">
                        <Badge variant="rating" className="border-2 shadow-[2px_2px_0_0_#000]"><Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" /> {property.rating || 0}</Badge>
                        <span className="font-black text-2xl text-primary">€{property.price}<span className="text-[10px] text-muted-foreground ml-1">/ NOITE</span></span>
                    </div>
                </div>
            </BrutalShard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BrutalShard rotate="secondary">
                    <span className="font-mono text-[9px] font-black uppercase text-primary block mb-3">DESCRIÇÃO //</span>
                    <p className="font-mono text-xs leading-relaxed text-muted-foreground mb-6 line-clamp-4">{description}</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 font-mono text-[10px] font-bold"><Users size={14}/> {property.maxGuests} Hóspedes</div>
                        <div className="flex items-center gap-2 font-mono text-[10px] font-bold"><Home size={14}/> Alojamento</div>
                    </div>
                </BrutalShard>

                <BrutalShard rotate="primary">
                    <span className="font-mono text-[9px] font-black uppercase text-primary block mb-3">COMODIDADES //</span>
                    <div className="flex flex-wrap gap-2">
                        {property.tags?.map((t, i) => {
                            const tagLabel = typeof t === 'string' ? t : (t as any)?.pt || (t as any)?.en || "Amenity"
                            return (
                                <Badge key={`${tagLabel}-${i}`} variant="outline" className="border-2 font-mono text-[9px] font-bold px-2 py-1">
                                    <Check className="h-3 w-3 mr-1 text-primary"/> {tagLabel}
                                </Badge>
                            )
                        })}
                    </div>
                </BrutalShard>
            </div>
        </div>
    )
}
