"use client"

import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notify"
import { profileTokens } from "@/features/profile/tokens"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { ShieldAlert, Lock, CheckCircle2 } from "lucide-react"

/**
 * @description Esquema de validação para alteração de palavra-passe.
 * Utiliza o Zod para assegurar regras de segurança (tamanho mínimo, números, símbolos) 
 * e verificar se a nova palavra-passe corresponde à confirmação.
 * 
 * @reference "Secure by Design": Validação rigorosa do lado do cliente melhora a UX 
 * e previne envio desnecessário de dados inválidos ao servidor.
 */
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "A password atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Deve ter no mínimo 8 caracteres")
      .regex(/[0-9]/, "Deve conter pelo menos um número")
      .regex(/[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/, "Deve conter pelo menos um símbolo"),
    confirmPassword: z.string().min(8, "A confirmação é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As passwords não coincidem",
    path: ["confirmPassword"],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

/**
 * Propriedades do formulário de alteração de palavra-passe.
 */
interface ChangePasswordFormProps {
  /** Callback executado após a submissão com sucesso do formulário */
  onSubmit: (payload: { currentPassword: string; newPassword: string }) => void | Promise<void>
}

/**
 * @component ChangePasswordForm
 * @description Formulário para alteração da credencial do utilizador.
 * 
 * @reference Clean Code - "Encapsulation" e "Single Responsibility Principle":
 * A lógica de validação do formulário está separada da sua apresentação. 
 * O formulário é dividido em subcomponentes para gerir cada campo individualmente de forma mais legível.
 */
export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordValues>({ 
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ 
        currentPassword: values.currentPassword, 
        newPassword: values.newPassword 
      })
      form.reset()
      notify.success(profileTokens.copy.security.updatedOk)
    } catch {
      notify.error(profileTokens.copy.security.updatedError)
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <ProfilePanel 
      title={profileTokens.copy.security.panelTitle} 
      subtitle={profileTokens.copy.security.panelSubtitle}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-1">
          <CurrentPasswordInput form={form} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <NewPasswordInput form={form} />
            <ConfirmPasswordInput form={form} />
          </div>
        </div>
        
        <SubmitPasswordButton isSubmitting={isSubmitting} onClick={() => void handleSubmit()} />
      </div>
    </ProfilePanel>
  )
}

/**
 * @component CurrentPasswordInput
 * @description Subcomponente para inserção da palavra-passe atual.
 */
function CurrentPasswordInput({ form }: { form: UseFormReturn<ChangePasswordValues> }) {
  const { watch, setValue, formState: { errors } } = form
  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/60 flex items-center gap-2" htmlFor="current-password">
        <Lock className="w-3 h-3" />
        Password Atual
      </Label>
      <Input
        id="current-password"
        type="password"
        value={watch("currentPassword")}
        onChange={(e) => setValue("currentPassword", e.target.value, { shouldValidate: true })}
        className="bg-background/50 border-(--fg-color)/20 rounded-lg h-12 text-(--fg-color) placeholder:text-(--fg-color)/30 focus-visible:ring-(--primary-accent)"
        placeholder="••••••••"
      />
      {errors.currentPassword && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
          {errors.currentPassword.message}
        </p>
      )}
    </div>
  )
}

/**
 * @component NewPasswordInput
 * @description Subcomponente para inserção da nova palavra-passe com validação rigorosa.
 */
function NewPasswordInput({ form }: { form: UseFormReturn<ChangePasswordValues> }) {
  const { watch, setValue, formState: { errors } } = form
  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/60 flex items-center gap-2" htmlFor="new-password">
        <ShieldAlert className="w-3 h-3 text-(--primary-accent)" />
        Nova Password
      </Label>
      <Input
        id="new-password"
        type="password"
        value={watch("newPassword")}
        onChange={(e) => setValue("newPassword", e.target.value, { shouldValidate: true })}
        className="bg-background/50 border-(--fg-color)/20 rounded-lg h-12 text-(--fg-color) placeholder:text-(--fg-color)/30 focus-visible:ring-(--primary-accent)"
        placeholder="Mín. 8 chars + num + sym"
      />
      {errors.newPassword && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
          {errors.newPassword.message}
        </p>
      )}
    </div>
  )
}

/**
 * @component ConfirmPasswordInput
 * @description Subcomponente de confirmação da nova palavra-passe.
 */
function ConfirmPasswordInput({ form }: { form: UseFormReturn<ChangePasswordValues> }) {
  const { watch, setValue, formState: { errors } } = form
  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase font-bold tracking-widest text-(--fg-color)/60 flex items-center gap-2" htmlFor="confirm-password">
        <CheckCircle2 className="w-3 h-3" />
        Confirmar Password
      </Label>
      <Input
        id="confirm-password"
        type="password"
        value={watch("confirmPassword")}
        onChange={(e) => setValue("confirmPassword", e.target.value, { shouldValidate: true })}
        className="bg-background/50 border-(--fg-color)/20 rounded-lg h-12 text-(--fg-color) placeholder:text-(--fg-color)/30 focus-visible:ring-(--primary-accent)"
        placeholder="Repete a nova password"
      />
      {errors.confirmPassword && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
          {errors.confirmPassword.message}
        </p>
      )}
    </div>
  )
}

/**
 * @component SubmitPasswordButton
 * @description Subcomponente contendo o botão de envio para o formulário de password.
 */
function SubmitPasswordButton({ isSubmitting, onClick }: { isSubmitting: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end pt-4">
      <Button
        onClick={onClick}
        disabled={isSubmitting}
        className="h-12 px-8 rounded-lg bg-(--primary-accent) text-white font-bold uppercase tracking-widest transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
      >
        {isSubmitting ? profileTokens.copy.security.submitting : profileTokens.copy.security.submit}
      </Button>
    </div>
  )
}
