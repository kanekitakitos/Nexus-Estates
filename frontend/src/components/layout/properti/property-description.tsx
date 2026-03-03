import { useEffect, useCallback, useState, useRef } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check, Key } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import { BookingProperty } from "../booking/booking-card"
import { cn } from "@/lib/utils"


import { PropertyEditContext  } from "./property-edit"




const SUMMARY_CARD_STYLES = "flex items-center gap-2 md:gap-3 border-[2px] border-foreground p-2 md:p-3 bg-secondary/30"


export function PropertyDescription({context} :{context : PropertyEditContext}){

    interface CardItem {
        icon: React.ElementType;
        label: string;
    }
    const [cards, setCards] = useState<CardItem[]>([
            { icon: Users, label: "2 Guests" },
            { icon: Home, label: "1 Bedroom" },
            { icon: Maximize, label: "85 m²" }
        ]);

    const [cardsSave, setCardsSave] = useState<CardItem[]>(cards);
    const [dataChange, setDataChange] = useState<Set<number>>(new Set());
    const [indexEdit, setIndexEdit] = useState<number>(-999);



    function addCard(){
        const newCard: CardItem = {
            icon: Home,
            label: `new Card ${cards.length + 1}`
        }
        setCards(prevData=>[...prevData, newCard])
    }

    function AddableCard(){
        return (
            <div 
                onClick={addCard}
                className={cn(SUMMARY_CARD_STYLES, "flex justify-center items-center")                
            }>
                <span className="font-mono font-bold uppercase text-xs md:text-sm"> + </span>
            </div>
        )
    }

    function EditableCard({item, index ,onLabelChange} : {item:CardItem, index: number,onLabelChange:(data:string)=>void}){
        
        return(
            <div className={SUMMARY_CARD_STYLES}>
                <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                <div onClick={()=>setIndexEdit(index)}>
                    {indexEdit == index
                        ?   <input 
                                className="font-mono font-bold uppercase text-xs md:text-sm"
                                value={item.label}
                                autoFocus
                                onChange={change => {onLabelChange(change.target.value); dataChange.add(index)}}
                                onBlur={() => {context.setEditField(null);}}
                            />
                        :   <span className="font-mono font-bold uppercase text-xs md:text-sm">{item.label}</span>
                    }
                </div>
            </div>
        )
    }

    const updateCardLabel = useCallback((index: number, newLabel: string) => {
        setCards(prev => {
            const newCards = [...prev]
            newCards[index] = { ...newCards[index], label: newLabel }
            return newCards
        })
        setDataChange(prev => new Set([...prev, -1])) // Marca como alterado
    }, [])

    return(
        <BrutalShard id="infoCard">
            <div className="border-t-[3px] border-b-[3px] border-foreground py-6 space-y-4">
                <div id="Sadsadds" onClick={()=>context.setEditField("description")}>
                    {context.editField == "description"
                        ?   <textarea 
                                className="font-mono text-base md:text-lg leading-relaxed text-muted-foreground w-full resize-none px-2"
                                value={context.property.description}
                                autoFocus
                                onChange={change => {
                                        context.updateProperty("description", change.target.value)
                                        dataChange.add(-1)
                                        

                                        // Auto-resize
                                        const el = change.target as HTMLTextAreaElement
                                        el.style.height = "auto"
                                        el.style.height = `${el.scrollHeight}px`
                                    }}
                                onBlur={() => context.setEditField(null)}
                            />
                        :   <p className="font-mono text-base md:text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                                {context.property.description}
                            </p>
                    }
                    {dataChange.has(-1)
                        ?    <div className="grid grid-cols-2 gap-3 md:gap-4 mt-1 mb-10">
                                <Button 
                                    variant={"brutal"} 
                                    onClick={()=>{
                                                context.cancelFieldEdit("description");
                                                dataChange.delete(-1)
                                            }}
                                        >
                                        REVERT 
                                </Button>
                                <Button 
                                    variant={"brutal"} 
                                    onClick={()=>{
                                                context.savePropertyData("description", context.property.description);
                                                dataChange.forEach((index)=>{
                                                    if (index < 0) return;
                                                    
                                                    return;
                                                })
                                            }}
                                        >
                                        SAVE
                                </Button>
                            </div>
                        : <></>
                    }

                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                    { cards.map((item, i)=>(
                            <EditableCard
                                item={item}
                                key={i}
                                index={i}
                                onLabelChange={(newLable)=>updateCardLabel(i, newLable)}/>
                        ))
                    }
                    <AddableCard/>
                </div>
            </div>
        </BrutalShard>
    )
} 