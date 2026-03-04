import { Button } from "@/components/ui/forms/button";
import { PropertyEditContext, EditableFieldsI } from "./property-edit2";
import { cn } from "@/lib/utils"
import { useEffect, useCallback, useState } from "react"


import { BrutalCard, BrutalShard, CardHeader } from "@/components/ui/data-display/card"
import { BrutalInput } from "@/components/ui/forms/input"
import { FieldGroup, FieldSeparator, FieldLabel, Field } from "@/components/ui/forms/field";
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { BrutalButton } from "@/components/ui/forms/button"


const FIELD_STYLE = "gap-1"
const TEXT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm"
const INPUT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm flex-6"





export function PropertyEditForm({context, onClose, open} :  {context : PropertyEditContext, onClose:()=>void, open: boolean}){
    const [TitleChange, setTitleChange] = useState(false) 
    const [LocationChange, setLocationChange] = useState(false) 
    const [PriceChange, setPriceChange] = useState(false) 
    const [DescriptionChange, setDescriptionChange] = useState(false) 
    const [AmenetiesChange, setAmenetiesChange] = useState(false) 


    function RevertButton({field}: {field : keyof EditableFieldsI}){
        var [didChange, setDidChange]:any = []
        switch(field){
            case "description": [didChange, setDidChange] = [DescriptionChange, setDescriptionChange]
                break;
            case "location": [didChange, setDidChange] = [LocationChange, setLocationChange]
                break;
            case "price": [didChange, setDidChange] = [PriceChange, setPriceChange]
                break;
            case "tags": [didChange, setDidChange] = [AmenetiesChange, setAmenetiesChange]
                break;
            case "title": [didChange, setDidChange] = [TitleChange, setTitleChange]
                break;
            default:
                return(
                    <></>
                )
        }

        if (didChange){
            return(
                <BrutalButton
                    className="flex-1"
                    onClick={()=>{context.revertField(field); setDidChange(false)}}
                >
                    Revert
                </BrutalButton>
            )
        }
        else{
            return(
                <></>
            )
        }
    }
    

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
                    Editing Property
                </CardHeader>
                
                <form>
                <FieldGroup className="gap-4">

                    <FieldSeparator/>
                    
                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            Name of Property
                        </FieldLabel>
                        <div className="flex gap-4">
                            <BrutalInput 
                                value={context.property.title}
                                className={INPUT_STYLE}
                                onChange={(e)=>{context.updateProperty("title", e.target.value); setTitleChange(true)}}
                            >
                            </BrutalInput>
                            <RevertButton field="title"/>
                        </div>
                    </Field>
                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            Location
                        </FieldLabel>
                        <div className="flex gap-4">
                            <BrutalInput 
                                value={context.property.location}
                                className={INPUT_STYLE}
                                onChange={(e)=>{context.updateProperty("location", e.target.value); setLocationChange(true)}}

                            >
                            </BrutalInput>
                            <RevertButton field="location"/>
                        </div>
                    </Field>

                    <FieldSeparator/>


                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            Price for the night
                        </FieldLabel>
                        <div className="flex gap-4">
                            <BrutalInput 
                                value={context.property.price}
                                className={INPUT_STYLE}
                                type="number"
                                onChange={(e)=>{
                                    const value = Number(e.target.value)
                                    context.updateProperty("price", value)
                                    setPriceChange(true)
                                }}
                            >
                            </BrutalInput>
                            <RevertButton field="price"/>
                        </div>
                    </Field>

                    <FieldSeparator/>

                    <Field className={FIELD_STYLE}>
                        <FieldLabel className={TEXT_STYLE}>
                            description
                        </FieldLabel>
                        <div className="flex gap-4">
                            <BrutalInput 
                                value={context.property.description}
                                className={INPUT_STYLE}
                                onChange={(e)=>{context.updateProperty("description", e.target.value); setDescriptionChange(true)}}
                            >
                            </BrutalInput>
                            <RevertButton field="description"/>
                        </div>
                    </Field>

                    <FieldSeparator/>
                    
                    <Field>
                        <FieldLabel className={TEXT_STYLE}>
                            amenities
                        </FieldLabel>
                        <div className="flex  gap-4">
                            <div className="grid grid-cols-4 gap-10 not-sm:grid-cols-2">
                                {
                                    context.property.tags?.map(
                                        (tag, index)=>(
                                            
                                            <BrutalShard key={index} className="p-0 md:p-0 lg:p-0">
                                            {                
                                                                
                                                <BrutalInput 
                                                    key={index}
                                                    value={tag} 
                                                    className={INPUT_STYLE}
                                                    onChange={(e) => {context.updateTags(index, e.target.value); setAmenetiesChange(true)}}
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
                                        setAmenetiesChange(true)
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
                            <RevertButton field="tags"/>
                        </div>
                    </Field>
                    
                    <FieldSeparator className="p-10"/>



                <Button onClick={()=>{context.revertToSavedData();onClose()}}> CANCEL </Button>
                <Button onClick={()=>{context.savePropertyDataAll(); onClose()}}> SAVE ALL</Button>


                </FieldGroup>

                
                </form>
            </BrutalCard>

        </div>
    )
}