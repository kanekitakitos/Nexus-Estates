"use client"

import { useState, forwardRef, ComponentProps, useMemo } from "react"
import { MapPin, ArrowDown, ArrowDown01, ArrowDown10, Home, Building2, Users2 } from "lucide-react"
import { BrutalButton } from "@/components/ui/forms/button"
import { BrutalCard, BrutalShard } from "@/components/ui/data-display/card"
import { cn } from "@/lib/utils"
import { PropertyCreateForm } from "./property-form"
import { Separator } from "@/components/ui/layout/separator"
import { Input } from "@/components/ui/forms/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu"
import {OwnProperty} from "@/components/layout/properti/property-view";

const PAGE_CONTAINER_STYLES = "flex flex-col min-h-screen"

type PropertyListProps = {
    variant?: "CARDS" | "BARS"
    filter?: boolean
    addNewProperty?: boolean

    propertys: OwnProperty[];

    onSelect?: (id: string) => void;
    onDelete?: (id: string) => void | Promise<void>;
    onSaved?: () => void | Promise<void>;
    isLoading?: boolean;
    isExiting?: boolean;
    animate?: boolean;
};

// cores do background para indicar o estado
const backgroundColors = {
    AVAILABLE: "bg-red-300",
    BOOKED: "bg-green-300",
    MAINTENANCE: "bg-yellow-300",
};

// cores do texto para indicar o estado
const statusColors = {
    AVAILABLE: "text-red-900",
    BOOKED: "text-green-900",
    MAINTENANCE: "text-yellow-900",
};

function AddNewPropertyForm({open, onClose, onSaved} : {open:boolean; onClose:()=>void; onSaved?: () => void | Promise<void>}){

    return(
        <>
            <PropertyCreateForm onClose={onClose} open={open} onSaved={onSaved}/>
        </>
    )
}


function PropertyList({variant="CARDS", propertys, onSelect = ()=>{}, onDelete, onSaved, isLoading=false, isExiting=true, animate=false, filter=false, addNewProperty=false}: PropertyListProps){
    const props ={
        propertys, onSelect, onDelete, onSaved, isLoading, isExiting, animate, filter, addNewProperty,
    }

    switch (variant){
        case "BARS": return (<PropertyListBars {...props}/>)
        case "CARDS": return (<PropertyListCards {...props}/>)
    }
}


function PropertyListCards({propertys, onSelect = ()=>{}, onDelete, onSaved, isLoading=false, isExiting=true, animate=false, addNewProperty=false ,filter=false}: PropertyListProps){
    const [editFormOpen, setEditFormOpen] = useState<boolean>(false)

    return(
        <div id="abc" className={cn(
            PAGE_CONTAINER_STYLES,
            "space-y-6 p-4 md:p-6",
            animate && (isExiting ? "animate-fly-out-right" : "animate-fly-in"),
        )}>
            
            <BrutalShard 
                className="flex gap-0 group items-stretch p-1"
            >
                <p className="w-2/5 uppercase font-bold">TITLE</p>

                <p className="w-2/5 uppercase font-bold">location</p>

                <p className="w-1/5 uppercase font-bold"></p> 

            </BrutalShard>

            {addNewProperty 
                ?   <>
                        <AddNewPropertyForm open={editFormOpen} onClose={()=>setEditFormOpen(false)} onSaved={onSaved}/>

                        <BrutalCard className="gap-2">
                            <BrutalButton onClick={()=>setEditFormOpen(true)} className="w-full">
                            + ADD NEW PROPERTY
                            </BrutalButton>
                        </BrutalCard>
                    </>
                :   <></>
            }

            {isLoading && (
                <BrutalCard className="p-4">
                    <p className="font-mono text-xs uppercase opacity-70">A carregar propriedades...</p>
                </BrutalCard>
            )}

            {
            propertys.map((prop) => (
                <BrutalShard 
                    key={prop.id} 
                    className="flex gap-0 group items-stretch"
                    onClick={()=>{onSelect(prop.id)}} 
                >
                   <div className={"flex flex-col w-full"}>
                       <div id={"id data"} className={"flex justify-between items-center border-b-4 border-black"}>
                           <div id={"text id data"}>
                               <div className="flex flex-row w-full items-start justify-between">
                                   <div className={"flex items-center"}>
                                       <Home size={24}/>
                                       <h3 className="text-4xl font-bold">{prop.title}</h3>
                                   </div>
                               </div>

                               <div className="flex flex-row items-center gap-6">
                                   <div className={"flex items-center"}>
                                       <MapPin size={24} className="shrink-0"/>
                                       <span className="text-2xl font-light">{ prop.location }</span>
                                   </div>
                                   <div className={"flex items-center"}>
                                       <Building2/>
                                       <span className="text-2xl font-light">{ prop.city }</span>
                                   </div>
                               </div>
                               <div className={"flex items-center"}>
                                   <span className="text-md font-light">{"Address:  " +  prop.address }</span>
                               </div>
                           </div>

                           <BrutalCard className={cn("m-2", backgroundColors[prop.status])}>
                               <span className={cn("font-mediu", statusColors[prop.status])}>{prop.status}</span>
                           </BrutalCard>
                       </div>

                       <div className="flex flex-col gap-4 mt-3 pl-2 border-l-4 border-black">
                           <div className={"flex justify-evenly w-full"}>
                                <BrutalCard variant={"primary"} className={"flex flex-col justify-evenly items-center"}>
                                    <Users2/>
                                    <h1 className={"text-3xl font-black"}>{prop.maxGuests}</h1>
                                    <h1>Max Guests</h1>
                                </BrutalCard>
                               <BrutalCard variant={"primary"} className={"flex flex-col justify-evenly items-center"}>
                                   <div className={"flex items-center"}>
                                       <MapPin size={24} className="shrink-0"/>
                                       <span className="text-2xl font-black">{ prop.location }</span>
                                   </div>
                                   <div className={"flex items-center"}>
                                       <Building2/>
                                       <span className="text-2xl font-black">{ prop.city }</span>
                                   </div>
                               </BrutalCard>
                               <BrutalCard variant={"primary"} className={"flex flex-col justify-evenly items-center"}>
                                   <h1 className="text-3xl font-black">{prop.price}</h1>
                                   <h1 className="text-sm font-bold uppercase">€/Mês</h1>
                               </BrutalCard>
                           </div>

                           <h1 className="text-xl font-medium ">{ prop.description }</h1>

                       </div>
                   </div>
                    <div className={"flex items-center"}>
                        <BrutalButton
                            className="w-1/5 bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e)=>{
                                e.stopPropagation()
                                void onDelete?.(prop.id)
                            }}
                        >
                            X
                        </BrutalButton>
                    </div>
                </BrutalShard>
                ))
            }

        </div>
    )
}

/**
 * Sub componete para gerir o texto no botão de ordenar o preço
 */
const ButtonSortPrice = forwardRef<
    HTMLButtonElement,
    ComponentProps<"button"> & { sortOrder: string } // Passamos o estado como prop
>((props, ref) => {
    const {sortOrder, ...rest} = props;

    // Usar um objeto é mais limpo que um switch com breaks
    const icons = {
        crescente: <ArrowDown01 size={16}/>,
        decrescente: <ArrowDown10 size={16}/>,
        "sem filtro": <>No Order <ArrowDown/> </>
    };

    return (
        <BrutalButton ref={ref} {...rest} className="text-xs">
            {icons[sortOrder as keyof typeof icons] || "Order Price"}
        </BrutalButton>
    );
});
ButtonSortPrice.displayName = "ButtonSortPrice"




function PropertyListBars({propertys, onSelect = ()=>{}, onDelete, onSaved, isLoading=false, isExiting=true, animate=false, addNewProperty=false ,filter=false}: PropertyListProps){
    const [editFormOpen, setEditFormOpen] = useState<boolean>(false)

    const [queryNome, setQueryNome] = useState("")
    const [queryLocal, setQueryLocal] = useState("")
    const [sortPrice, setSortPrice] = useState<"sem filtro" | "crescente" | "decrescente">("sem filtro")
    const [available, setAvailable] = useState<boolean>(false)
    const [booked, setBooked] = useState<boolean>(false)
    const [maintenance, setMaintenance] = useState<boolean>(false)   
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");


    const filteredProp = useMemo(() =>{
            // filtra os estatos
            const filtered = propertys.filter((p)=>{
                    const matchesStatus = (!available && !booked && !maintenance) ||
                        (available && p.status === "AVAILABLE") ||
                        (booked && p.status === "BOOKED") ||
                        (maintenance && p.status === "MAINTENANCE");

                    // nao tem o status procurado
                    if (!matchesStatus) return false;

                    // nao tem o nome procurado
                    if(queryNome && !p.title.toLocaleLowerCase().includes(queryNome.toLocaleLowerCase()))
                        return false

                    // nao tem o local procurado
                    if(queryLocal && !p.location.toLocaleLowerCase().includes(queryLocal.toLocaleLowerCase()))
                        return false

                    // 4. Filtro de Preço
                    const matchesMin = minPrice === "" || p.price >= minPrice;
                    const matchesMax = maxPrice === "" || p.price <= maxPrice;
                    
                    return matchesMin && matchesMax;
                }
            ).sort((p1, p2)=>{
                    // ordena o preço
                    if(sortPrice == "crescente") return p1.price - p2.price
                    if(sortPrice == "decrescente") return p2.price - p1.price
                    return 0
                }
            )
            
            return filtered
        }, [propertys, queryNome, queryLocal, available, booked, maintenance, minPrice, maxPrice, sortPrice])


    return(
        <div id="abc" className={cn(
            "felx flex-col",
            animate && (isExiting ? "animate-fly-out-right" : "animate-fly-in"),
        )}>
            {/* Fitros */}
            <div 
                className="flex flex-col gap-2 p-3 group items-stretch border-b" 
            >
                <Input
                    variant="brutal"
                    type="search"
                    placeholder="Pesquisar nome..."
                    value={queryNome}
                    onChange={(e) => setQueryNome(e.target.value)}
                />

                <Input
                    variant="brutal"
                    type="search"
                    placeholder="Pesquisar local..."
                    value={queryLocal}
                    onChange={(e) => setQueryLocal(e.target.value)}
                />

                <div className="grid grid-cols-3 gap-2">
                    <BrutalButton
                        className="text-xs px-1 tracking-normal"
                        variant={available? "brutal" : "brutal-outline"}
                        onClick={()=>{setAvailable(!available)}}
                        >
                        AVAILABLE
                    </BrutalButton>
                    <BrutalButton 
                        className="text-xs px-1 tracking-normal"
                        variant={booked? "brutal" : "brutal-outline"}
                        onClick={()=>{setBooked(!booked)}}
                        >
                        BOOKED
                    </BrutalButton>
                    <BrutalButton 
                        className="text-xs px-1 tracking-normal"
                        variant={maintenance? "brutal" : "brutal-outline"}
                        onClick={()=>{setMaintenance(!maintenance)}}
                        >
                        MAINTENANCE
                    </BrutalButton>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <ButtonSortPrice sortOrder={sortPrice}/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuRadioGroup value={sortPrice}>
                                <DropdownMenuRadioItem
                                    value="Sem Filtro"
                                    onClick={()=>setSortPrice("sem filtro")}
                                    >
                                    No Order
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem 
                                    value="Ascendente"
                                    onClick={()=>setSortPrice("crescente")}
                                    >
                                    Ascendente
                                    </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem 
                                    value="Descendente"
                                    onClick={()=>setSortPrice("decrescente")}
                                    >
                                    Descendente
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Input
                    variant="brutal"
                    type="number"
                    placeholder="Mín €"
                    value={minPrice}
                    className="border"
                    onChange={(e)=>setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />

                    <Input
                    variant="brutal"
                    type="number"
                    placeholder="Máx €"
                    value={maxPrice}
                    className="border"
                    onChange={(e)=>setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                </div>
            </div>
            
            {/* Botão para adicionar uma nova propriedade (OPCIONAL) */}
            {addNewProperty 
                ?   <>
                        <AddNewPropertyForm open={editFormOpen} onClose={()=>setEditFormOpen(false)} onSaved={onSaved}/>

                        <BrutalCard className="gap-2">
                            <BrutalButton onClick={()=>setEditFormOpen(true)} className="w-full">
                            + ADD NEW PROPERTY
                            </BrutalButton>
                        </BrutalCard>
                    </>
                :   <></>
            }

            {isLoading && (
                <div className="p-3">
                    <span className="font-mono text-xs uppercase opacity-70">A carregar propriedades...</span>
                </div>
            )}

            {/* Lista de botões com propriedades */}
            {filteredProp.map((prop) => {

                return(
                    <div
                        key={prop.id}
                        role="button"
                        tabIndex={0}
                        className={`flex flex-col w-full gap-2 px-3 py-3 text-left border-b hover:bg-sidebar-accent transition-colors cursor-pointer`}
                        onClick={()=>{onSelect(prop.id)}}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                onSelect(prop.id)
                            }
                        }}
                    >
                        <div className="flex w-full items-start justify-between">
                            <span className="font-medium">{prop.title}</span>

                            <div className={cn("px-2", backgroundColors[prop.status])}>
                                <span className={cn("font-mediu", statusColors[prop.status])}>{prop.status}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center">
                                <MapPin size={14} className="shrink-0"/>
                                <span className="font-light">{ prop.location }</span>
                            </div>
                            <div>
                                <span className="font-medium text-sm">{prop.price + "€"}</span>
                                <span className="font-xs text-xs font-light">{" /dia"}</span>
                            </div>
                        </div>
                        
                        {onDelete ? (
                            <div className="flex justify-end">
                                <BrutalButton
                                    className="bg-destructive text-xs"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        void onDelete(prop.id)
                                    }}
                                >
                                    Delete
                                </BrutalButton>
                            </div>
                        ) : null}

                    </div>
                )})
            }

        </div>
    )
}


export { PropertyList, PropertyListCards, PropertyListBars}
