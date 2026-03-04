import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check, Computer } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import { BookingProperty } from "../../booking/booking-card"
import { use, useState } from "react"
import { cn } from "@/lib/utils"
import React from "react"
import { PropertyEditContext, EditableFieldsI } from "./property-edit"
import { fi } from "date-fns/locale"



const PRICE_TEXT_STYLES = "font-mono font-bold text-primary text-lg md:text-xl"


export function PropertyNamePriceEdit({context} :  {context : PropertyEditContext}){
    const [changeFields, setChangeFields] = useState<Set<keyof EditableFieldsI>>(new Set())

    function handleCancel(key: keyof EditableFieldsI) {
        context.cancelFieldEdit(key)

        setChangeFields(prevSet => {
            const newSet = new Set(prevSet)
            newSet.delete(key)
            return newSet
        })
    }

    function handleCancelAll() {
        context.revertFields([...changeFields])
        setChangeFields(new Set());
    }

    function handleSave(){
        changeFields.forEach(
            (field)=>{
                context.savePropertyData(field, context.property[field])
            }
        )
        changeFields.clear()
    }


    /**
     * Componete do React para ajudar a editar os Fields
     * @param param0 
     * @returns converte o chidren para inputs e adicona o button de reverter
     */
    function EditComponte(
            { children, field, value, inputClassName }: { children: React.ReactNode, field: keyof EditableFieldsI, value :string|number, inputClassName?:string 
        }){

        // coisa ja mudaram, temos de dar o butão de cancelar 
        if ( context.editField == field ){
            return (
                <>
                    {context.editField ==="price"
                        ?   <input className={inputClassName}
                                    value={value}
                                    type="number"
                                    autoFocus
                                    onChange={change => {
                                        context.updateProperty(field, change.target.value)
                                        changeFields.add(field)
                                    }}
                                    onBlur={() => context.setEditField(null)}
                            />
                        :   <input className={inputClassName}
                                value={value}
                                autoFocus
                                onChange={change => {
                                        context.updateProperty(field, change.target.value)
                                        changeFields.add(field)
                                    }}
                                onBlur={() => context.setEditField(null)}
                            />
                    }
                    {changeFields.has(field) 
                        ?   <Button variant={"brutal"} onClick={()=>handleCancel(field)}> REVERT </Button> 
                        :   <></>
                    }
                </>
            )
        }
        else{
            //não está a editar, mostra a chidren e o botão
            return(
                <>
                    { children }
                    {changeFields.has(field) 
                        ?   <Button variant={"brutal"} onClick={()=>handleCancel(field)}> REVERT </Button> 
                        :   <></>
                    }
                </>
            )
        }   
    }

    return(
        <BrutalShard id="locationCard" className="flex flex-row not-sm:flex-col">
            <div className="flex flex-4 flex-col space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2" onClick={()=>context.setEditField("location")}>
                        <MapPin className="h-5 w-5 text-primary" />
                        <EditComponte field="location" value={context.property.location} inputClassName="font-mono text-sm md:text-lg font-bold text-muted-foreground uppercase">
                            <span className="font-mono text-sm md:text-lg font-bold text-muted-foreground uppercase">{context.property.location}</span>
                        </EditComponte>
                    </div>
                    
                    <div onClick={()=>context.setEditField("title")} className="gap-2 py-3">
                        <EditComponte field="title" value={context.property.title} inputClassName="text-3xl md:text-4xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                            <h1 className="text-3xl md:text-4xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                                {context.property.title}
                            </h1>
                        </EditComponte>
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge variant="rating">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{context.property.rating}</span>
                        </Badge>
                        <div className="h-px w-12 bg-foreground/30" />
                        <div onClick={()=>context.setEditField("price")}>
                            <EditComponte field="price" value={context.property.price} inputClassName={PRICE_TEXT_STYLES}>
                                <span className={PRICE_TEXT_STYLES}>
                                    ${context.property.price}<span className="text-sm text-muted-foreground">/night</span>
                                </span>
                            </EditComponte>
                        </div>
                    </div>
                </div>
            </div>
            
            { changeFields.size > 0 ?
                <div className="flex flex-1 flex-col justify-center gap-8 py-4"> 
                    <Button variant={"brutal"} onClick={()=>handleSave()}>SAVE</Button>
                    <Button variant={"brutal"} onClick={()=>handleCancelAll()}>CANCEL</Button>
                </div>
                :
                <></>
            }
        </BrutalShard>
    )
}