import { AnimatePresence, motion } from "framer-motion"

import { usePropertyForm } from "./hooks/use-property-form"
import { OwnProperty } from "@/types"
import { pageVariants } from "./animations"

// Sub-components
import { WizardProgress } from "./sections/wizard/WizardProgress"
import { WizardControls } from "./sections/wizard/WizardControls"
import { 
    EssenceStep, 
    LocationStep, 
    AmenitiesStep, 
    PermissionsStep, 
    PreviewStep 
} from "./sections/wizard/WizardSteps"

export interface PropertyFormProps {
    property: OwnProperty | null
    onClose: () => void
    onSaved: () => void | Promise<void>
}

/**
 * PropertyWizard Component
 * Lean orchestrator for the property creation flow.
 */
export function PropertyForm({ property: initialData, onClose, onSaved }: PropertyFormProps) {
    const {
        property,
        step,
        isSaving,
        isEdit,
        updateField,
        nextStep,
        prevStep,
        handleFinalSave
    } = usePropertyForm(initialData, onSaved)

    return (
        <div className="flex flex-col min-h-[85vh] bg-transparent">
            <WizardProgress currentStep={step} isEdit={isEdit} />

            <div className="flex-1 w-full mb-20 px-4 md:px-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageVariants}
                        className="space-y-8"
                    >
                        {step === 'essence' && <EssenceStep property={property} initialData={initialData} updateField={updateField} />}
                        {step === 'location' && <LocationStep property={property} initialData={initialData} updateField={updateField} />}
                        {step === 'amenities' && <AmenitiesStep property={property} initialData={initialData} updateField={updateField} />}
                        {step === 'permissions' && <PermissionsStep property={property} updateField={updateField} />}
                        {step === 'preview' && <PreviewStep property={property} />}
                    </motion.div>
                </AnimatePresence>

                <WizardControls 
                    step={step}
                    isSaving={isSaving}
                    isEdit={isEdit}
                    onClose={onClose}
                    onPrev={prevStep}
                    onNext={nextStep}
                    onSave={handleFinalSave}
                />
            </div>
        </div>
    )
}