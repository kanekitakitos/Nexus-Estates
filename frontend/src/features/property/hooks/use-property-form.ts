import { useState, useCallback } from "react"
import { toast } from "sonner"
import { OwnProperty, WizardStep, PropertyPermission } from "@/types"
import { CreatePropertyRequest, PropertyService, UpdatePropertyRequest } from "@/services/property.service"

const STEPS_KEYS: WizardStep[] = ['essence', 'location', 'amenities', 'permissions', 'preview']

function createEmptyProperty(): OwnProperty {
    return {
        id: "temp-" + Math.random().toString(36).substr(2, 9),
        title: "",
        description: "",
        location: "",
        city: "",
        address: "",
        maxGuests: 2,
        price: 0,
        imageUrl: "",
        status: "AVAILABLE",
        rating: 0,
        tags: [],
        amenityIds: [],
        permissions: []
    }
}

function buildCreateRequest(property: OwnProperty, ownerId: number): CreatePropertyRequest {
    const title = typeof property.title === 'string' ? property.title : (property.title?.pt || property.title?.en || "")
    return {
        title,
        description: typeof property.description === 'string' ? { en: property.description, pt: property.description } : property.description,
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

function buildUpdateRequest(property: OwnProperty): UpdatePropertyRequest & { amenityIds?: number[] } {
    const title = typeof property.title === 'string' ? property.title : (property.title?.pt || property.title?.en || "")
    return {
        title,
        description: typeof property.description === 'string' ? { en: property.description, pt: property.description } : property.description,
        basePrice: property.price,
        location: property.location,
        address: property.address,
        city: property.city,
        maxGuests: property.maxGuests,
        isActive: property.status === "AVAILABLE",
        imageUrl: property.imageUrl,
        amenityIds: property.amenityIds ?? []
    }
}

export function usePropertyForm(initialData: OwnProperty | null, onSaved: () => void | Promise<void>) {
    const isEdit = !!initialData
    const [property, setProperty] = useState<OwnProperty>(initialData || createEmptyProperty())
    const [step, setStep] = useState<WizardStep>('essence')
    const [isSaving, setIsSaving] = useState(false)

    const updateField = useCallback(<K extends keyof OwnProperty>(key: K, value: OwnProperty[K]) => {
        setProperty(prev => ({ ...prev, [key]: value }))
    }, [])

    const nextStep = useCallback(() => {
        const idx = STEPS_KEYS.indexOf(step)
        if (idx < STEPS_KEYS.length - 1) setStep(STEPS_KEYS[idx + 1])
    }, [step])

    const prevStep = useCallback(() => {
        const idx = STEPS_KEYS.indexOf(step)
        if (idx > 0) setStep(STEPS_KEYS[idx - 1])
    }, [step])

    const handleFinalSave = async () => {
        setIsSaving(true)
        const userId = localStorage.getItem("userId")
        if (!userId) {
            toast.error("User ID não encontrado.")
            setIsSaving(false)
            return
        }

        try {
            if (isEdit) {
                await PropertyService.updateProperty(property.id, buildUpdateRequest(property))
                toast.success("Ativo atualizado com sucesso!")
            } else {
                await PropertyService.createProperty(buildCreateRequest(property, Number(userId)))
                toast.success("Ativo criado com sucesso!")
            }
            await onSaved()
        } catch (err) {
            console.error(err)
            toast.error("Erro ao guardar ativo.")
        } finally {
            setIsSaving(false)
        }
    }

    return {
        property,
        setProperty,
        step,
        setStep,
        isSaving,
        isEdit,
        updateField,
        nextStep,
        prevStep,
        handleFinalSave
    }
}
