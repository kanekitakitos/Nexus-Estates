import { useState, Dispatch, SetStateAction } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/forms/button"
import { FieldGroup, FieldSeparator } from "@/components/ui/forms/field"
import { BrutalCard, CardHeader } from "@/components/ui/data-display/card"

import { EditableFieldsI } from "./property-edit"
import { OwnProperty } from "@/features/property/property-view"
import { CreatePropertyRequest, PropertyService, UpdatePropertyRequest } from "@/services/property.service"
import { PropertyInputField } from "./components/property-input-field"
import { AmenitiesField } from "./components/amenities-field"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PropertyEditContext {
    property: OwnProperty
    propertySaved: OwnProperty
    updateProperty: <K extends keyof EditableFieldsI>(field: K, value: EditableFieldsI[K]) => void
    savePropertyDataAll: () => void
    revertToSavedData: () => void
    revertField: (field: keyof EditableFieldsI) => void
}

type FormVariant = "create" | "edit"

interface FormLayoutProps {
    title: string
    context: PropertyEditContext
    onClose: () => void
    onSave: () => void | Promise<void>
    variant?: FormVariant
}

interface PropertyFormBaseProps {
    onClose: () => void
    open: boolean
    onSaved?: () => void | Promise<void>
}

export interface PropertyEditFormProps extends PropertyFormBaseProps {
    propertyState: [OwnProperty, Dispatch<SetStateAction<OwnProperty>>]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STYLES = {
    headerText: "font-mono font-bold uppercase text-xs md:text-sm",
} as const

const SAVE_BUTTON_LABEL: Record<FormVariant, string> = {
    create: "CREATE PROPERTY",
    edit: "SAVE CHANGES",
}

// ─── Factories & Helpers ──────────────────────────────────────────────────────

function createEmptyProperty(id: string): OwnProperty {
    return {
        id, title: "", description: "", location: "", city: "", address: "",
        maxGuests: 1, price: 100, imageUrl: "", status: "MAINTENANCE", rating: 0.0, tags: [],
    } as OwnProperty
}

function buildCreateRequest(property: OwnProperty, ownerId: number): CreatePropertyRequest {
    const description = property.description || "No description"
    return {
        title: property.title,
        description: { en: description, pt: property.description || "Sem descrição" },
        price: property.price,
        ownerId,
        location: property.location,
        city: property.city,
        address: property.address,
        maxGuests: property.maxGuests,
        amenityIds: [],
    }
}

function buildUpdateRequest(property: OwnProperty): UpdatePropertyRequest {
    const description = property.description || "No description"
    return {
        title: property.title,
        description: { en: description, pt: property.description || "Sem descrição" },
        basePrice: property.price,
        location: property.location,
        address: property.address,
        city: property.city,
        maxGuests: property.maxGuests,
        isActive: false,
    }
}

function getStoredUserId(): number | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("userId")
    return raw ? Number(raw) : null
}

// ─── API Handlers ─────────────────────────────────────────────────────────────

async function handleCreate(property: OwnProperty): Promise<boolean> {
    const ownerId = getStoredUserId()
    if (!ownerId) { toast.error("Sem userId."); return false }

    try {
        const status = await PropertyService.creatPropertie(buildCreateRequest(property, ownerId))
        if (status >= 200 && status < 300) { toast.success("Property Created"); return true }
        toast.warning("Erro ao criar a propriedade.")
        return false
    } catch (err) {
        console.error(err)
        return false
    }
}

async function handleEdit(property: OwnProperty): Promise<boolean> {
    const ownerId = getStoredUserId()
    if (!ownerId) { toast.warning("Sem userId."); return false }

    try {
        const status = await PropertyService.editPropertie(property.id, buildUpdateRequest(property))
        if (status >= 200 && status < 300) { toast.success("Property Updated"); return true }
        toast.warning("Erro ao atualizar a propriedade.")
        return false
    } catch (err) {
        console.error(err)
        return false
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function usePropertyFormContext(
    propertyConcrete: OwnProperty,
    propertySaved: OwnProperty,
    setPropertyConcrete: Dispatch<SetStateAction<OwnProperty>>,
    setPropertySaved: Dispatch<SetStateAction<OwnProperty>>
): PropertyEditContext {
    return {
        property: propertyConcrete,
        propertySaved,
        updateProperty: (key, value) => setPropertyConcrete(prev => ({ ...prev, [key]: value })),
        savePropertyDataAll: () => setPropertySaved(propertyConcrete),
        revertToSavedData: () => setPropertyConcrete(propertySaved),
        revertField: (field) => setPropertyConcrete(prev => ({ ...prev, [field]: propertySaved[field] })),
    }
}

// ─── Public Components ────────────────────────────────────────────────────────

export function PropertyCreateForm({ onClose, open, onSaved }: PropertyFormBaseProps) {
    const [propertySaved, setPropertySaved] = useState<OwnProperty>(createEmptyProperty("temp-id"))
    const [propertyConcrete, setPropertyConcrete] = useState<OwnProperty>(propertySaved)
    const context = usePropertyFormContext(propertyConcrete, propertySaved, setPropertyConcrete, setPropertySaved)

    if (!open) return null

    return (
        <FormLayout
            title="Creating Property"
            variant="create"
            context={context}
            onClose={onClose}
            onSave={async () => {
                const ok = await handleCreate(context.property)
                if (ok) await onSaved?.()
            }}
        />
    )
}

export function PropertyEditForm({ propertyState, onClose, open, onSaved }: PropertyEditFormProps) {
    const [propertySaved, setPropertySaved] = propertyState
    const [propertyConcrete, setPropertyConcrete] = useState<OwnProperty>(propertySaved)
    const context = usePropertyFormContext(propertyConcrete, propertySaved, setPropertyConcrete, setPropertySaved)

    if (!open) return null

    return (
        <FormLayout
            title="Editing Property"
            variant="edit"
            context={context}
            onClose={onClose}
            onSave={async () => {
                const ok = await handleEdit(context.property)
                if (ok) await onSaved?.()
            }}
        />
    )
}

// ─── Form Layout ──────────────────────────────────────────────────────────────

function FormLayout({ title, context, onClose, onSave, variant = "create" }: FormLayoutProps) {
    const handleSave = () => {
        const { property, updateProperty, savePropertyDataAll } = context

        if (!property.description) updateProperty("description", "No Description")

        const hasRequiredFields = property.title && property.location && property.address && property.city
        if (!hasRequiredFields) {
            toast.warning("Fill all required inputs")
            return
        }

        savePropertyDataAll()
        onClose()
        void onSave()
    }

    const handleCancel = () => {
        context.revertToSavedData()
        onClose()
    }

    return (
        <div
            onClick={onClose}
            className="absolute inset-0 flex justify-center items-start px-10 py-5 transition-colors z-10 bg-black/20"
        >
            <BrutalCard onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className={cn(STYLES.headerText, "text-center")}>{title}</CardHeader>

                <form className="mt-4">
                    <FieldGroup className="gap-4">
                        <FieldSeparator />
                        <FormFields context={context} />
                        <FieldSeparator className="my-6" />
                        <FormActions variant={variant} onSave={handleSave} onCancel={handleCancel} />
                    </FieldGroup>
                </form>
            </BrutalCard>
        </div>
    )
}

// ─── Form Sub-components ──────────────────────────────────────────────────────

function FormFields({ context }: { context: PropertyEditContext }) {
    const { property, propertySaved, updateProperty, revertField } = context

    function fieldProps<K extends keyof EditableFieldsI>(key: K) {
        return {
            value: property[key],
            savedValue: propertySaved[key],
            onChange: (val: EditableFieldsI[K]) => updateProperty(key, val),
            onRevert: () => revertField(key),
        }
    }

    return (
        <>
            <PropertyInputField label="Name of Property" {...fieldProps("title")} />
            <FieldSeparator />

            <PropertyInputField label="Location" {...fieldProps("location")} />

            <FieldGroup className="flex flex-col md:flex-row gap-4">
                <PropertyInputField label="Address" {...fieldProps("address")} />
                <PropertyInputField label="City" {...fieldProps("city")} />
            </FieldGroup>
            <FieldSeparator />

            <FieldGroup className="flex flex-col md:flex-row gap-4">
                <PropertyInputField label="Price per night (€)" type="number" {...fieldProps("price")} />
                <PropertyInputField label="Max Guests" type="number" {...fieldProps("maxGuests")} />
            </FieldGroup>
            <FieldSeparator />

            <PropertyInputField label="Description" {...fieldProps("description")} />
            <FieldSeparator />

            <AmenitiesField
                tags={property.tags ?? []}
                savedTags={propertySaved.tags ?? []}
                onUpdateTags={(newTags) => updateProperty("tags", newTags)}
                onRevert={() => revertField("tags")}
            />
        </>
    )
}

function FormActions({
                         variant,
                         onSave,
                         onCancel,
                     }: {
    variant: FormVariant
    onSave: () => void
    onCancel: () => void
}) {
    return (
        <div className="flex gap-4">
            <Button className="flex-1" type="button" onClick={onCancel}>
                CANCEL
            </Button>
            <Button className="flex-1" type="button" onClick={onSave}>
                {SAVE_BUTTON_LABEL[variant]}
            </Button>
        </div>
    )
}