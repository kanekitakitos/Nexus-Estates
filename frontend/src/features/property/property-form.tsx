import { useState, Dispatch, SetStateAction } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/forms/button"
import { FieldGroup } from "@/components/ui/forms/field"

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

const SAVE_BUTTON_LABEL: Record<FormVariant, string> = {
    create: "CREATE PROPERTY",
    edit: "SAVE CHANGES",
}

const SECTION_CONFIG = [
    {
        key: "general",
        label: "Dados Gerais",
        accent: "bg-primary",
        index: "01",
    },
    {
        key: "location",
        label: "Localização",
        accent: "bg-orange-400",
        index: "02",
    },
    {
        key: "details",
        label: "Detalhes & Preço",
        accent: "bg-green-500",
        index: "03",
    },
    {
        key: "amenities",
        label: "Comodidades",
        accent: "bg-blue-400",
        index: "04",
    },
]

// ─── Animation Variants ───────────────────────────────────────────────────────

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

const panelVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 340, damping: 28, mass: 0.9 },
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.97,
        transition: { duration: 0.18, ease: "easeIn" },
    },
}

const sectionVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: 0.1 + i * 0.06, duration: 0.35, ease: "easeOut" },
    }),
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
        amenityIds: property.amenityIds ?? [],
        imageUrl: property.imageUrl
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
        isActive: property.status === "AVAILABLE",
        imageUrl: property.imageUrl
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
        const status = await PropertyService.createProperty(buildCreateRequest(property, ownerId))
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
        const status = await PropertyService.updateProperty(property.id, buildUpdateRequest(property))
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

    return (
        <AnimatePresence>
            {open && (
                <FormLayout
                    title="Nova Propriedade"
                    variant="create"
                    context={context}
                    onClose={onClose}
                    onSave={async () => {
                        const ok = await handleCreate(context.property)
                        if (ok) await onSaved?.()
                    }}
                />
            )}
        </AnimatePresence>
    )
}

export function PropertyEditForm({ propertyState, onClose, open, onSaved }: PropertyEditFormProps) {
    const [propertySaved, setPropertySaved] = propertyState
    const [propertyConcrete, setPropertyConcrete] = useState<OwnProperty>(propertySaved)
    const context = usePropertyFormContext(propertyConcrete, propertySaved, setPropertyConcrete, setPropertySaved)

    return (
        <AnimatePresence>
            {open && (
                <FormLayout
                    title="Editar Propriedade"
                    variant="edit"
                    context={context}
                    onClose={onClose}
                    onSave={async () => {
                        const ok = await handleEdit(context.property)
                        if (ok) await onSaved?.()
                    }}
                />
            )}
        </AnimatePresence>
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
        <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 flex items-center justify-center p-4 md:p-10 z-50 bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                className="
                    w-full max-w-4xl max-h-[90vh] overflow-y-auto
                    bg-background
                    rounded-2xl
                    border-2 border-foreground
                    shadow-[5px_5px_0px_0px_rgba(0,0,0,0.85)]
                    flex flex-col
                "
            >
                {/* ── Sticky Header ── */}
                <div className="
                    sticky top-0 z-10
                    bg-background
                    rounded-t-2xl
                    border-b-2 border-foreground
                    px-6 py-4 md:px-8 md:py-5
                    flex justify-between items-center
                ">
                    <div className="flex items-center gap-3">
                        <span className="
                            font-mono text-[10px] font-black tracking-widest uppercase
                            bg-primary text-primary-foreground
                            px-2 py-1 rounded-md
                        ">
                            {variant === "create" ? "NEW" : "EDIT"}
                        </span>
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">
                            {title}
                        </h2>
                    </div>

                    {/* Close button */}
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={onClose}
                        className="
                            w-8 h-8 flex items-center justify-center
                            rounded-lg border-2 border-foreground
                            font-mono font-black text-sm
                            hover:bg-foreground hover:text-background
                            transition-colors duration-150
                        "
                    >
                        ✕
                    </motion.button>
                </div>

                {/* ── Body ── */}
                <div className="p-6 md:p-8">
                    <FieldGroup className="gap-0">
                        <FormFields context={context} />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.38, duration: 0.3 }}
                            className="pt-8 mt-8 border-t-2 border-foreground/10"
                        >
                            <FormActions variant={variant} onSave={handleSave} onCancel={handleCancel} />
                        </motion.div>
                    </FieldGroup>
                </div>
            </motion.div>
        </motion.div>
    )
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function FormSection({
                         label,
                         accent,
                         index,
                         sectionIndex,
                         children,
                     }: {
    label: string
    accent: string
    index: string
    sectionIndex: number
    children: React.ReactNode
}) {
    return (
        <motion.div
            custom={sectionIndex}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 mb-10"
        >
            <div className="flex items-center gap-3 mb-5">
                <span className={`
                    font-mono text-[9px] font-black tracking-widest text-white
                    ${accent} px-2 py-0.5 rounded-md
                `}>
                    {index}
                </span>
                <h3 className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {label}
                </h3>
                <div className="flex-1 h-px bg-foreground/8" />
            </div>
            {children}
        </motion.div>
    )
}

// ─── Form Fields ──────────────────────────────────────────────────────────────

function FormFields({ context }: { context: PropertyEditContext }) {
    const { property, propertySaved, updateProperty, revertField } = context

    function fieldProps<K extends keyof EditableFieldsI>(key: K) {
        return {
            value: (property[key] as string | number) ?? "",
            savedValue: (propertySaved[key] as string | number) ?? "",
            onChange: (val: string | number) => updateProperty(key, val as EditableFieldsI[K]),
            onRevert: () => revertField(key),
        }
    }

    return (
        <>
            <FormSection label="Dados Gerais" accent="bg-primary" index="01" sectionIndex={0}>
                <PropertyInputField label="Nome da Propriedade" {...fieldProps("title")} />
                <PropertyInputField label="Descrição" {...fieldProps("description")} />
            </FormSection>

            <FormSection label="Localização" accent="bg-orange-400" index="02" sectionIndex={1}>
                <PropertyInputField label="Região / Localização" {...fieldProps("location")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <PropertyInputField label="Morada Completa" {...fieldProps("address")} />
                    <PropertyInputField label="Cidade" {...fieldProps("city")} />
                </div>
            </FormSection>

            <FormSection label="Detalhes & Preço" accent="bg-green-500" index="03" sectionIndex={2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <PropertyInputField label="Preço por noite (€)" type="number" {...fieldProps("price")} />
                    <PropertyInputField label="Máximo de Hóspedes" type="number" {...fieldProps("maxGuests")} />
                </div>
            </FormSection>

            <FormSection label="Comodidades" accent="bg-blue-400" index="04" sectionIndex={3}>
                <AmenitiesField
                    selectedIds={property.amenityIds ?? []}
                    savedIds={propertySaved.amenityIds ?? []}
                    onUpdateIds={(newIds) => updateProperty("amenityIds", newIds)}
                    onRevert={() => revertField("amenityIds")}
                />
            </FormSection>
        </>
    )
}

// ─── Form Actions ─────────────────────────────────────────────────────────────

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
        <div className="flex flex-col-reverse md:flex-row gap-3 justify-end">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                    variant="outline"
                    type="button"
                    onClick={onCancel}
                    className="
                        w-full md:w-auto px-6
                        rounded-xl border-2 border-foreground
                        hover:bg-muted
                        font-mono font-bold uppercase tracking-widest text-[10px]
                        transition-colors duration-150
                    "
                >
                    Cancelar
                </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                    variant="brutal"
                    type="button"
                    onClick={onSave}
                    className="
                        w-full md:w-auto px-8
                        rounded-xl border-2 border-foreground
                        shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]
                        hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)]
                        hover:-translate-x-0.5 hover:-translate-y-0.5
                        bg-primary text-primary-foreground
                        font-mono font-black uppercase tracking-widest text-[10px]
                        transition-all duration-150
                    "
                >
                    {SAVE_BUTTON_LABEL[variant]}
                </Button>
            </motion.div>
        </div>
    )
}