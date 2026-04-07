import { Home, MapPin, Building2, Users2, Pencil } from "lucide-react"
import { BrutalShard, BrutalCard } from "@/components/ui/data-display/card"
import { BrutalButton } from "@/components/ui/forms/button"
import { cn } from "@/lib/utils"
import { OwnProperty } from "../property-view"

const backgroundColors = {
    AVAILABLE: "bg-red-300",
    BOOKED: "bg-green-300",
    MAINTENANCE: "bg-yellow-300",
}

const statusColors = {
    AVAILABLE: "text-red-900",
    BOOKED: "text-green-900",
    MAINTENANCE: "text-yellow-900",
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
            className="flex gap-0 group items-stretch"
            onClick={() => onSelect(prop.id)}
        >
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center border-b-4 border-black">
                    <div>
                        <div className="flex flex-row w-full items-start justify-between">
                            <div className="flex items-center">
                                <Home size={24}/>
                                <h3 className="text-4xl font-bold">{prop.title}</h3>
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-6">
                            <div className="flex items-center">
                                <MapPin size={24} className="shrink-0"/>
                                <span className="text-2xl font-light">{prop.location}</span>
                            </div>
                            <div className="flex items-center">
                                <Building2/>
                                <span className="text-2xl font-light">{prop.city}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-md font-light">{"Address:  " + prop.address}</span>
                        </div>
                    </div>
                    <BrutalCard className={cn("m-2", backgroundColors[prop.status])}>
                        <span className={cn("font-medium", statusColors[prop.status])}>{prop.status}</span>
                    </BrutalCard>
                </div>

                <div className="flex flex-col gap-4 mt-3 pl-2 border-l-4 border-black">
                    <div className="flex justify-evenly w-full">
                        <BrutalCard variant="primary" className="flex flex-col justify-evenly items-center">
                            <Users2/>
                            <h1 className="text-3xl font-black">{prop.maxGuests}</h1>
                            <h1>Max Guests</h1>
                        </BrutalCard>
                        <BrutalCard variant="primary" className="flex flex-col justify-evenly items-center">
                            <div className="flex items-center">
                                <MapPin size={24} className="shrink-0"/>
                                <span className="text-2xl font-black">{prop.location}</span>
                            </div>
                            <div className="flex items-center">
                                <Building2/>
                                <span className="text-2xl font-black">{prop.city}</span>
                            </div>
                        </BrutalCard>
                        <BrutalCard variant="primary" className="flex flex-col justify-evenly items-center">
                            <h1 className="text-3xl font-black">{prop.price}</h1>
                            <h1 className="text-sm font-bold uppercase">€/Mês</h1>
                        </BrutalCard>
                    </div>
                    <h1 className="text-xl font-medium">{prop.description}</h1>
                </div>
            </div>
            <div className="flex flex-col justify-around">
                <BrutalButton
                    className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit(prop)
                    }}
                >
                    <Pencil/>
                </BrutalButton>
                {onDelete && (
                    <BrutalButton
                        className="w-full bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation()
                            void onDelete(prop.id)
                        }}
                    >
                        X
                    </BrutalButton>
                )}
            </div>
        </BrutalShard>
    )
}