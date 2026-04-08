import { Home, MapPin, Users2, Pencil, X } from "lucide-react"
import { BrutalShard } from "@/components/ui/data-display/card"
import { Button } from "@/components/ui/forms/button"
import { cn } from "@/lib/utils"
import { OwnProperty } from "../property-view"

const backgroundColors = {
    AVAILABLE: "bg-[#B4F8C8]", // Pastel Green for brutalism
    BOOKED: "bg-[#FFAEBC]", // Pastel Pink/Red
    MAINTENANCE: "bg-[#FBE7C6]", // Pastel Orange/Yellow
}

const statusColors = {
    AVAILABLE: "text-green-950",
    BOOKED: "text-red-950",
    MAINTENANCE: "text-yellow-950",
}

interface PropertyCardItemProps {
    prop: OwnProperty
    onSelect: (id: string) => void
    onEdit: (prop: OwnProperty) => void
    onDelete?: (id: string) => void | Promise<void>
}

export function PropertyCardItem({ prop, onSelect, onEdit, onDelete }: PropertyCardItemProps) {
    return (
        <BrutalShard
            className="group cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0_0_rgb(0,0,0)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.8)] border-4 border-foreground bg-background p-0"
            onClick={() => onSelect(prop.id)}
        >
            <div className="flex flex-col md:flex-row w-full aspect-auto md:h-48">
                {/* Image Section */}
                <div className="w-full md:w-48 xl:w-56 shrink-0 bg-muted border-b-4 md:border-b-0 md:border-r-4 border-foreground relative overflow-hidden flex items-center justify-center">
                    {prop.imageUrl ? (
                        <img 
                            src={prop.imageUrl} 
                            alt={prop.title} 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" 
                        />
                    ) : (
                        <Home className="w-16 h-16 text-muted-foreground opacity-50 drop-shadow-md" />
                    )}
                    {/* Status Pill Overlay */}
                    <div className="absolute top-3 left-3 z-10">
                        <div className={cn("px-3 py-1 border-2 border-foreground shadow-[2px_2px_0_0_rgb(0,0,0)] font-mono text-[10px] font-black uppercase tracking-widest", backgroundColors[prop.status], statusColors[prop.status])}>
                            {prop.status}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between p-4 md:p-6 lg:p-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-primary" strokeWidth={3} /> {prop.location} • {prop.city}
                            </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter truncate w-[85%]">{prop.title}</h3>
                        <p className="font-mono text-sm text-muted-foreground mt-2 line-clamp-2 md:line-clamp-1">{prop.description}</p>
                    </div>

                    <div className="flex items-end justify-between mt-6">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preço/Noite</span>
                                <span className="text-2xl md:text-3xl font-black text-primary leading-none">{prop.price}€</span>
                            </div>
                            <div className="w-1 h-8 bg-foreground/10 rotate-12" />
                            <div className="flex flex-col gap-1">
                                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capacidade</span>
                                <span className="text-lg md:text-xl font-bold flex items-center gap-2 leading-none"><Users2 className="w-5 h-5" /> {prop.maxGuests}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions (Hover) */}
            <div className="absolute top-4 right-4 flex gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                    variant="brutal" 
                    size="icon" 
                    className="w-10 h-10 border-2 shadow-[2px_2px_0_0_rgb(0,0,0)] hover:shadow-[4px_4px_0_0_rgb(0,0,0)] bg-white text-black"
                    onClick={(e) => { e.stopPropagation(); onEdit(prop) }}
                >
                    <Pencil className="w-4 h-4" strokeWidth={3} />
                </Button>
                {onDelete && (
                    <Button 
                        variant="brutal" 
                        size="icon" 
                        className="w-10 h-10 border-2 shadow-[2px_2px_0_0_rgb(0,0,0)] hover:shadow-[4px_4px_0_0_rgb(0,0,0)] bg-orange-500 text-black border-black"
                        onClick={(e) => { e.stopPropagation(); void onDelete(prop.id) }}
                    >
                        <X className="w-5 h-5" strokeWidth={3} />
                    </Button>
                )}
            </div>
        </BrutalShard>
    )
}