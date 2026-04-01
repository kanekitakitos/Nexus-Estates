import { Button } from "@/components/ui/forms/button";
import { EditableFieldsI } from "./property-edit2";
import { cn } from "@/lib/utils"
import { useState, Dispatch, SetStateAction } from "react"

import { BookingProperty } from "@/features/bookings/components/booking-card"

import { BrutalCard, BrutalShard, CardHeader } from "@/components/ui/data-display/card"
import { BrutalInput } from "@/components/ui/forms/input"
import { FieldGroup, FieldSeparator, FieldLabel, Field } from "@/components/ui/forms/field";
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { BrutalButton } from "@/components/ui/forms/button"
import { CreatePropertyRequest, PropertyService } from "@/services/property.service";
import { toast } from "sonner";
import {OwnProperty} from "@/components/layout/properti/property-view";


const FIELD_STYLE = "gap-1"
const TEXT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm"
const INPUT_STYLE = "font-mono font-bold uppercase text-xs md:text-sm flex-6"

export interface PropertyEditContext {
    property: OwnProperty;
    propertySaved: OwnProperty;
    updateProperty: <K extends keyof EditableFieldsI>(field: K, value: EditableFieldsI[K]) => void;
    updateTags: (index: number, value: string) => void;
    savePropertyData: <K extends keyof EditableFieldsI>(field: K, value: EditableFieldsI[K]) => void;
    savePropertyDataAll: () => void;
    revertToSavedData: () => void;
    revertFields: (fieldSet: (keyof EditableFieldsI)[]) => void;
    revertField: (field: keyof EditableFieldsI) => void;
}

function NewPropertyData(id: string) : OwnProperty {
    return {
        id: id,
        title: "",
        description: "",
        location: "",
        city: "",
        address: "",
        maxGuests: 1,
        price: 100,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "MAINTENANCE",
        rating: 0.0,
        tags: []
    } as OwnProperty;
}

// Funções de API
async function handleCrate(property: OwnProperty): Promise<boolean> {
    if (typeof window === "undefined") return false
    const userIdRaw = localStorage.getItem("userId")
    if (!userIdRaw) {
        toast.warning("Sem userId. Faz login novamente.")
        return false
    }
    const data: CreatePropertyRequest = {
        title: property.title,
        description: {
            en: property.description || "No description provided",
            pt: property.description || "Sem descrição"
        },
        price: property.price,
        ownerId: Number(userIdRaw),
        location: property.location,
        city: property.city,
        address: property.address,
        maxGuests: property.maxGuests,
        amenityIds: [1],
    }

    try {
        const status = await PropertyService.creatPropertie(data)
        if (status >= 200 && status < 300) {
            toast.success("Property Created")
            return true
        }
        toast.warning("Não foi possível criar a propriedade.")
        return false
    } catch (err) {
        console.error(err);
        return false
    }
}

async function handleEdit(property: OwnProperty): Promise<boolean> {
    if (typeof window === "undefined") return false
    const userIdRaw = localStorage.getItem("userId")
    if (!userIdRaw) {
        toast.warning("Sem userId. Faz login novamente.")
        return false
    }
    const data: CreatePropertyRequest = {
        title: property.title,
        description: {
            en: property.description || "No description provided",
            pt: property.description || "Sem descrição"
        },
        price: property.price,
        ownerId: Number(userIdRaw),
        location: property.location,
        address: property.address,
        city: property.city,
        maxGuests: property.maxGuests,
        amenityIds: [1]
    }

    try {
        const status = await PropertyService.editPropertie(property.id, data)
        if (status >= 200 && status < 300) {
            toast.success("Property Updated")
            return true
        }
        toast.warning("Não foi possível atualizar a propriedade.")
        return false
    } catch (err) {
        console.error(err);
        return false
    }
}

// --- COMPONENTE DE CRIAÇÃO ---
export function PropertyCreateForm({ onClose, open, onSaved }: { onClose: () => void; open: boolean; onSaved?: () => void | Promise<void> }) {
    const [TitleChange, setTitleChange] = useState(false)
    const [LocationChange, setLocationChange] = useState(false)
    const [AdressChange, setAdressChange] = useState(false)
    const [CityChange, setCityChange] = useState(false)
    const [PriceChange, setPriceChange] = useState(false)
    const [DescriptionChange, setDescriptionChange] = useState(false)
    const [AmenetiesChange, setAmenetiesChange] = useState(false)
    const [MaxGuestChange, setMaxGuestChange] = useState(false)

    const [propertySaved, setpropertySaved] = useState<OwnProperty>(NewPropertyData("temp-id"));
    const [propertyConcrete, setPropertyConcrete] = useState<OwnProperty>(propertySaved);

    const context = createFormContext(propertyConcrete, propertySaved, setPropertyConcrete, setpropertySaved);

    if (!open) return null;

    return (
        <FormLayout
            title="Creating Property"
            context={context}
            onClose={onClose}
            states={{setTitleChange, setLocationChange, setCityChange, setAdressChange, setPriceChange, setDescriptionChange, setAmenetiesChange, setMaxGuestChange}}
            statesValues={{TitleChange, LocationChange, CityChange, AdressChange, PriceChange, DescriptionChange, AmenetiesChange, MaxGuestChange}}
            onSave={async () => {
                const ok = await handleCrate(propertyConcrete)
                if (ok) await onSaved?.()
            }}
        />
    )
}

// --- COMPONENTE DE EDIÇÃO ---
export function PropertyEditForm({ propertyState, onClose, open, onSaved }:
                                 { propertyState: [OwnProperty, Dispatch<SetStateAction<OwnProperty>>]; onClose: () => void; open: boolean; onSaved?: () => void | Promise<void> }) {

    const [TitleChange, setTitleChange] = useState(false)
    const [LocationChange, setLocationChange] = useState(false)
    const [AdressChange, setAdressChange] = useState(false)
    const [CityChange, setCityChange] = useState(false)
    const [PriceChange, setPriceChange] = useState(false)
    const [DescriptionChange, setDescriptionChange] = useState(false)
    const [AmenetiesChange, setAmenetiesChange] = useState(false)
    const [MaxGuestChange, setMaxGuestChange] = useState(false)

    const [propertySaved, setpropertySaved] = propertyState;
    const [propertyConcrete, setPropertyConcrete] = useState<OwnProperty>(propertySaved);

    const context = createFormContext(propertyConcrete, propertySaved, setPropertyConcrete, setpropertySaved);

    if (!open) return null;

    return (
        <FormLayout
            title="Editing Property"
            context={context}
            onClose={onClose}
            states={{setTitleChange, setLocationChange, setCityChange, setAdressChange, setPriceChange, setDescriptionChange, setAmenetiesChange, setMaxGuestChange}}
            statesValues={{TitleChange, LocationChange, CityChange, AdressChange, PriceChange, DescriptionChange, AmenetiesChange, MaxGuestChange}}
            onSave={async () => {
                const ok = await handleEdit(propertyConcrete)
                if (ok) await onSaved?.()
            }}
        />
    )
}


// --- AUXILIARES PARA EVITAR REPETIÇÃO DE CÓDIGO ---

function createFormContext(
    propertyConcrete: OwnProperty,
    propertySaved: OwnProperty,
    setPropertyConcrete: Dispatch<SetStateAction<OwnProperty>>,
    setpropertySaved: Dispatch<SetStateAction<OwnProperty>>
): PropertyEditContext {
    return {
        property: propertyConcrete,
        propertySaved: propertySaved,
        updateProperty(key, value) {
            setPropertyConcrete(prevData => ({ ...prevData, [key]: value }))
        },
        savePropertyDataAll() {
            setpropertySaved(propertyConcrete)
        },
        savePropertyData(key, value) {
            setpropertySaved(prevData => ({ ...prevData, [key]: value }))
        },
        revertToSavedData() {
            setPropertyConcrete(propertySaved)
        },
        revertFields(fields) {
            setPropertyConcrete((prevData): OwnProperty => ({
                ...prevData,
                ...Object.fromEntries(fields.map(field => [field, propertySaved[field]]))
            }));
        },
        revertField(field) {
            setPropertyConcrete(prevData => ({ ...prevData, [field]: propertySaved[field] }))
        },
        updateTags(idx, value) {
            setPropertyConcrete(prevData => ({
                ...prevData,
                tags: (prevData.tags ?? []).map((tag, i) => i === idx ? value : tag)
            }));
        }
    }
}

// 1. EXTRAÍMOS O COMPONENTE PARA FORA!
interface RevertButtonProps {
    didChange: boolean;
    onRevert: () => void;
}

function RevertButton({ didChange, onRevert }: RevertButtonProps) {
    if (!didChange) return null;

    return (
        <BrutalButton className="flex-1" onClick={onRevert}>
            Revert
        </BrutalButton>
    );
}

type FormChangeSetters = {
    setTitleChange: Dispatch<SetStateAction<boolean>>;
    setLocationChange: Dispatch<SetStateAction<boolean>>;
    setAdressChange: Dispatch<SetStateAction<boolean>>;
    setCityChange: Dispatch<SetStateAction<boolean>>;
    setPriceChange: Dispatch<SetStateAction<boolean>>;
    setDescriptionChange: Dispatch<SetStateAction<boolean>>;
    setAmenetiesChange: Dispatch<SetStateAction<boolean>>;
    setMaxGuestChange: Dispatch<SetStateAction<boolean>>;
};

type FormChangeValues = {
    TitleChange: boolean;
    LocationChange: boolean;
    AdressChange: boolean;
    CityChange: boolean;
    PriceChange: boolean;
    DescriptionChange: boolean;
    AmenetiesChange: boolean;
    MaxGuestChange: boolean;
};

interface FormLayoutProps {
    title: string;
    context: PropertyEditContext;
    onClose: () => void;
    onSave: () => void | Promise<void>;
    states: FormChangeSetters;
    statesValues: FormChangeValues;
}

function FormLayout({ title, context, onClose, onSave, states, statesValues }: FormLayoutProps) {
    const { setTitleChange, setLocationChange, setCityChange, setAdressChange, setPriceChange, setDescriptionChange, setAmenetiesChange, setMaxGuestChange } = states;
    const { TitleChange, LocationChange, CityChange, AdressChange, PriceChange, DescriptionChange, AmenetiesChange, MaxGuestChange } = statesValues;

    return(
        <div
            onClick={onClose}
            className={`absolute inset-0 flex justify-center items-start px-10 py-5 transition-colors z-10 bg-black/20`}
        >
            <BrutalCard
                onClick={(e)=>e.stopPropagation()}
                className="w-full"
            >
                <CardHeader className={cn(TEXT_STYLE, "text-center")}>
                    {title}
                </CardHeader>

                <form>
                    <FieldGroup className="gap-4">
                        <FieldSeparator/>

                        <Field className={FIELD_STYLE}>
                            <FieldLabel className={TEXT_STYLE}>Name of Property</FieldLabel>
                            <div className="flex gap-4">
                                <BrutalInput
                                    value={context.property.title}
                                    className={INPUT_STYLE}
                                    onChange={(e)=>{context.updateProperty("title", e.target.value); setTitleChange(true)}}
                                />
                                {/* 2. Passamos os estados diretamente sem precisar de switches! */}
                                <RevertButton didChange={TitleChange} onRevert={() => { context.revertField("title"); setTitleChange(false); }} />
                            </div>
                        </Field>

                        <FieldSeparator/>

                        <Field className={FIELD_STYLE}>
                            <FieldLabel className={TEXT_STYLE}>Location</FieldLabel>
                            <div className="flex gap-4">
                                <BrutalInput
                                    value={context.property.location}
                                    className={INPUT_STYLE}
                                    onChange={(e)=>{context.updateProperty("location", e.target.value); setLocationChange(true)}}
                                />
                                <RevertButton didChange={LocationChange} onRevert={() => { context.revertField("location"); setLocationChange(false); }} />
                            </div>
                        </Field>

                        <FieldGroup className={"flex flex-row"}>
                            <Field className={FIELD_STYLE}>
                                <FieldLabel className={TEXT_STYLE}>Adress</FieldLabel>
                                <div className="flex gap-4">
                                    <BrutalInput
                                        value={context.property.address}
                                        className={INPUT_STYLE}
                                        onChange={(e)=>{context.updateProperty("address", e.target.value); setAdressChange(true)}}
                                    />
                                    <RevertButton didChange={AdressChange} onRevert={() => { context.revertField("address"); setAdressChange(false); }} />
                                </div>
                            </Field>

                            <Field className={FIELD_STYLE}>
                                <FieldLabel className={TEXT_STYLE}>City</FieldLabel>
                                <div className="flex gap-4">
                                    <BrutalInput
                                        value={context.property.city}
                                        className={INPUT_STYLE}
                                        onChange={(e)=>{context.updateProperty("city", e.target.value); setCityChange(true)}}
                                    />
                                    <RevertButton didChange={CityChange} onRevert={() => { context.revertField("city"); setCityChange(false); }} />
                                </div>
                            </Field>

                        </FieldGroup>

                        <FieldSeparator/>

                        <FieldGroup className={"flex flex-row"}>
                        <Field className={FIELD_STYLE}>
                            <FieldLabel className={TEXT_STYLE}>Price for the night</FieldLabel>
                            <div className="flex gap-4">
                                <BrutalInput
                                    value={context.property.price}
                                    className={INPUT_STYLE}
                                    type="number"
                                    onChange={(e)=>{
                                        context.updateProperty("price", Number(e.target.value))
                                        setPriceChange(true)
                                    }}
                                />
                                <RevertButton didChange={PriceChange} onRevert={() => { context.revertField("price"); setPriceChange(false); }} />
                            </div>
                        </Field>

                        <Field className={FIELD_STYLE}>
                            <FieldLabel className={TEXT_STYLE}>Max Guests</FieldLabel>
                            <div className="flex gap-4">
                                <BrutalInput
                                    value={context.property.maxGuests}
                                    className={INPUT_STYLE}
                                    type="number"
                                    onChange={(e)=>{
                                        context.updateProperty("maxGuests", Number(e.target.value))
                                        setMaxGuestChange(true)
                                    }}
                                />
                                <RevertButton didChange={MaxGuestChange} onRevert={() => { context.revertField("maxGuests"); setMaxGuestChange(false); }} />
                            </div>
                        </Field>
                        </FieldGroup>

                        <FieldSeparator/>

                        <Field className={FIELD_STYLE}>
                            <FieldLabel className={TEXT_STYLE}>Description</FieldLabel>
                            <div className="flex gap-4">
                                <BrutalInput
                                    value={context.property.description}
                                    className={INPUT_STYLE}
                                    onChange={(e)=>{context.updateProperty("description", e.target.value); setDescriptionChange(true)}}
                                />
                                <RevertButton didChange={DescriptionChange} onRevert={() => { context.revertField("description"); setDescriptionChange(false); }} />
                            </div>
                        </Field>


                        <FieldSeparator/>

                        <Field>
                            <FieldLabel className={TEXT_STYLE}>Amenities</FieldLabel>
                            <div className="flex gap-4">
                                <div className="grid grid-cols-4 gap-10 not-sm:grid-cols-2">
                                    {context.property.tags?.map((tag, index)=>(
                                        <BrutalShard key={index} className="p-0 flex flex-row">
                                            <BrutalInput
                                                value={`${tag}`}
                                                className={INPUT_STYLE}
                                                onChange={(e) => {context.updateTags(index, e.target.value); setAmenetiesChange(true)}}
                                            />
                                            <BrutalButton
                                                className="bg-destructive"
                                                type="button"
                                                onClick={()=>{
                                                    const newTags = context.property.tags?.filter((_, i) => i !== index) || [];
                                                    context.updateProperty("tags", newTags)
                                                    setAmenetiesChange(true)
                                                }}>
                                                X
                                            </BrutalButton>
                                        </BrutalShard>
                                    ))}
                                    <Badge
                                        variant={"amenity"}
                                        onClick={()=>{
                                            setAmenetiesChange(true)
                                            const newTags = context.property.tags ? [...context.property.tags, "new amenity"] : ["new amenity"];
                                            context.updateProperty("tags", newTags);
                                        }}
                                    >
                                        + New Amenity
                                    </Badge>
                                </div>
                                <RevertButton didChange={AmenetiesChange} onRevert={() => { context.revertField("tags"); setAmenetiesChange(false); }} />
                            </div>
                        </Field>

                        <FieldSeparator className="p-10"/>

                        <div className="flex gap-4">
                            <Button className="flex-1" type="button" onClick={()=>{
                                context.revertToSavedData();
                                onClose();
                                setTitleChange(false); setAmenetiesChange(false); setDescriptionChange(false); setLocationChange(false); setPriceChange(false);
                            }}>
                                CANCEL
                            </Button>

                            <Button className="flex-1" type="button" onClick={()=>{
                                context.savePropertyDataAll();
                                onClose();
                                setTitleChange(false); setAmenetiesChange(false); setDescriptionChange(false); setLocationChange(false); setPriceChange(false);
                                void onSave();
                            }}> SAVE ALL</Button>
                        </div>
                    </FieldGroup>
                </form>
            </BrutalCard>
        </div>
    )
}
