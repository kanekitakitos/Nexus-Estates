"use client"

import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { Button } from "@/components/ui/button"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { User, Image as ImageIcon, Save } from "lucide-react"

/**
 * @description Esquema de validação para o formulário de edição de perfil.
 * @reference Zod - "Schema First Validation": Garante que os dados do formulário cumprem regras restritas antes da submissão.
 */
const editProfileSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres"),
  file: z.instanceof(File).optional(),
})

type EditProfileValues = z.infer<typeof editProfileSchema>

/**
 * Propriedades para o formulário de edição de perfil.
 */
interface EditProfileFormProps {
  /** Nome atual do utilizador para pré-preenchimento do formulário */
  defaultName: string
  /** Callback executado após a validação com sucesso do formulário */
  onSubmit: (payload: { name: string; file?: File }) => void | Promise<void>
}

/**
 * @component EditProfileForm
 * @description Formulário para edição das informações básicas do utilizador (Nome e Avatar).
 * 
 * @reference Clean Code - "KISS" (Keep It Simple, Stupid): 
 * O formulário é dividido em secções sem estado de negócio complexo, apenas manipula a UI e invoca o `onSubmit`.
 */
export function EditProfileForm({ defaultName, onSubmit }: EditProfileFormProps) {
  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: defaultName, file: undefined },
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ name: values.name, file: values.file })
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <ProfilePanel 
      title="Informação Básica" 
      subtitle="Como os outros te veem no Nexus"
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <DisplayNameInput form={form} />
          <AvatarInput form={form} />
        </div>
        
        <SubmitButton isSubmitting={isSubmitting} onClick={() => void handleSubmit()} />
      </div>
    </ProfilePanel>
  )
}

/**
 * @component DisplayNameInput
 * @description Subcomponente para o campo de nome de exibição.
 */
function DisplayNameInput({ form }: { form: UseFormReturn<EditProfileValues> }) {
  const { formState: { errors }, watch, setValue } = form
  
  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/60 flex items-center gap-2" htmlFor="profile-name">
        <User className="w-3 h-3" />
        Nome de Exibição
      </Label>
      <Input
        id="profile-name"
        variant="brutal"
        value={watch("name")}
        onChange={(e) => setValue("name", e.target.value, { shouldValidate: true })}
        className="bg-background/50 border-(--fg-color)/20 rounded-lg h-12 text-(--fg-color) placeholder:text-(--fg-color)/30 focus-visible:ring-(--primary-accent)"
        placeholder="O teu nome completo"
      />
      {errors.name && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
          {errors.name.message}
        </p>
      )}
    </div>
  )
}

/**
 * @component AvatarInput
 * @description Subcomponente para o campo de upload de nova foto de perfil.
 */
function AvatarInput({ form }: { form: UseFormReturn<EditProfileValues> }) {
  const { setValue } = form

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/60 flex items-center gap-2" htmlFor="profile-avatar">
        <ImageIcon className="w-3 h-3" />
        Nova Foto de Perfil
      </Label>
      <div className="relative group">
        <Input
          id="profile-avatar"
          type="file"
          variant="brutal"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue("file", file, { shouldValidate: true })
          }}
          className="bg-background/50 border-(--fg-color)/20 rounded-lg h-12 text-(--fg-color) file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase focus:ring-(--primary-accent) file:text-(--primary-accent) cursor-pointer"
        />
      </div>
    </div>
  )
}

/**
 * @component SubmitButton
 * @description Subcomponente para o botão de submissão do formulário.
 */
function SubmitButton({ isSubmitting, onClick }: { isSubmitting: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end pt-4">
      <Button
        onClick={onClick}
        disabled={isSubmitting}
        className="h-12 px-8 rounded-lg bg-(--primary-accent) text-white font-bold uppercase tracking-widest transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSubmitting ? "A Guardar..." : "Guardar Alterações"}
      </Button>
    </div>
  )
}
