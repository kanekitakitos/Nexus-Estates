import { Button } from "@/components/ui/forms/button";
import { PropertyEditContext } from "./property-edit2";
import { cn } from "@/lib/utils"


import { BrutalCard, BrutalShard, CardHeader } from "@/components/ui/data-display/card"
import { BrutalInput } from "@/components/ui/forms/input"
import { FieldGroup, FieldSeparator, FieldLabel, Field } from "@/components/ui/forms/field";
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"



const FIELD_STYLE = "gap-1"
const TEXT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm"
const INPUT_STYLE = "font-mono text-[11px] font-semibold uppercase"




export function PropertyEditForm({context, onClose, open} :  {context : PropertyEditContext, onClose:()=>void, open: boolean}){

    if(!open) return null

    return(
        <div
            onClick={onClose}
            className={`fixed inset-0 flex justify-center items-start p-10  transition-colors z-10 bg-black/20`}
        >
            <BrutalCard
                onClick={(e)=>e.stopPropagation()}
                className="w-full"
            >
                <CardHeader className={cn(TEXT_STYLE, "text-center")}>
                    Creating New Property
                </CardHeader>
                
                <form>
                <FieldGroup className="gap-4">
                    <FieldSeparator/>
                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            Name of Property
                        </FieldLabel>
                        <BrutalInput 
                            className="font-mono font-bold uppercase text-xs md:text-sm"
                        >
                        </BrutalInput>
                    </Field>
                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            Location
                        </FieldLabel>
                        <BrutalInput 
                            className="font-mono font-bold uppercase text-xs md:text-sm"
                        >
                        </BrutalInput>
                    </Field>

                    <FieldSeparator/>


                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            Price for the night
                        </FieldLabel>
                        <BrutalInput 
                            className="font-mono font-bold uppercase text-xs md:text-sm"
                            type="number"
                        >
                        </BrutalInput>
                    </Field>

                    <FieldSeparator/>

                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            description
                        </FieldLabel>
                        <BrutalInput 
                            className="font-mono font-bold uppercase text-xs md:text-sm"
                        >
                        </BrutalInput>
                    </Field>

                    <FieldSeparator/>
                    
                    <Field>
                        <FieldLabel className={TEXT_STYLE}>
                            amenities
                        </FieldLabel>
                        <div className="grid grid-cols-4 gap-10 not-sm:grid-cols-2">
                            {
                                context.property.tags?.map(
                                    (tag, index)=>(
                                        
                                        <BrutalShard key={index} className="p-0 md:p-0 lg:p-0">
                                        {                
                                                            
                                            <BrutalInput 
                                                key={index}
                                                value={tag} 
                                                className="font-mono font-bold uppercase text-xs md:text-sm"
                                                onChange={(e) => context.updateTags(index, e.target.value)}
                                            >
                                            </BrutalInput>
                                            
                                        }
                                        </BrutalShard>

                                    )
                                )
                            }
                            <Badge 
                                variant={"amenity"}
                                onClick={()=>{
                                    if(context.property.tags == undefined){
                                        context.updateProperty("tags", ["new amenity"])
                                        return;
                                    }
                                    else{
                                        const newTags = context.property.tags.slice()
                                        newTags.push("new amenity")
                                        context.updateProperty("tags", newTags)
                                    }

                                }}
                            >
                                + New Amemity
                            </Badge>  
                        </div>
                    </Field>
                    


                <Button onClick={onClose}> close</Button>

                </FieldGroup>

                
                </form>
            </BrutalCard>

        </div>
    )
}