import { forwardRef, ComponentProps } from "react"
import { ArrowDown, ArrowDown01, ArrowDown10 } from "lucide-react"
import { Input } from "@/components/ui/forms/input"
import { BrutalButton } from "@/components/ui/forms/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu"

export const ButtonSortPrice = forwardRef<
    HTMLButtonElement,
    ComponentProps<"button"> & { sortOrder: string }
>((props, ref) => {
    const { sortOrder, ...rest } = props
    const icons = {
        crescente: <ArrowDown01 size={16}/>,
        decrescente: <ArrowDown10 size={16}/>,
        "sem filtro": <>No Order <ArrowDown/></>
    }
    return (
        <BrutalButton ref={ref} {...rest} className="text-xs">
            {icons[sortOrder as keyof typeof icons] || "Order Price"}
        </BrutalButton>
    )
})
ButtonSortPrice.displayName = "ButtonSortPrice"

interface PropertyFilterBarProps {
    filters: {
        queryNome: string
        queryLocal: string
        available: boolean
        booked: boolean
        maintenance: boolean
        minPrice: number | ""
        maxPrice: number | ""
        sortPrice: "sem filtro" | "crescente" | "decrescente"
    }
    setFilter: (key: string, value: any) => void
}

export function PropertyFilterBar({ filters, setFilter }: PropertyFilterBarProps) {
    return (
        <div className="flex flex-col gap-2 p-3 group items-stretch border-b">
            <Input
                variant="brutal"
                type="search"
                placeholder="Pesquisar nome..."
                value={filters.queryNome}
                onChange={(e) => setFilter("queryNome", e.target.value)}
            />
            <Input
                variant="brutal"
                type="search"
                placeholder="Pesquisar local..."
                value={filters.queryLocal}
                onChange={(e) => setFilter("queryLocal", e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
                <BrutalButton
                    className="text-xs px-1 tracking-normal"
                    variant={filters.available ? "brutal" : "brutal-outline"}
                    onClick={() => setFilter("available", !filters.available)}
                >
                    AVAILABLE
                </BrutalButton>
                <BrutalButton
                    className="text-xs px-1 tracking-normal"
                    variant={filters.booked ? "brutal" : "brutal-outline"}
                    onClick={() => setFilter("booked", !filters.booked)}
                >
                    BOOKED
                </BrutalButton>
                <BrutalButton
                    className="text-xs px-1 tracking-normal"
                    variant={filters.maintenance ? "brutal" : "brutal-outline"}
                    onClick={() => setFilter("maintenance", !filters.maintenance)}
                >
                    MAINTENANCE
                </BrutalButton>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <ButtonSortPrice sortOrder={filters.sortPrice}/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={filters.sortPrice}>
                            <DropdownMenuRadioItem value="sem filtro" onClick={() => setFilter("sortPrice", "sem filtro")}>No Order</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="crescente" onClick={() => setFilter("sortPrice", "crescente")}>Ascendente</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="decrescente" onClick={() => setFilter("sortPrice", "decrescente")}>Descendente</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Input
                    variant="brutal"
                    type="number"
                    placeholder="Mín €"
                    value={filters.minPrice}
                    className="border"
                    onChange={(e) => setFilter("minPrice", e.target.value === "" ? "" : Number(e.target.value))}
                />
                <Input
                    variant="brutal"
                    type="number"
                    placeholder="Máx €"
                    value={filters.maxPrice}
                    className="border"
                    onChange={(e) => setFilter("maxPrice", e.target.value === "" ? "" : Number(e.target.value))}
                />
            </div>
        </div>
    )
}