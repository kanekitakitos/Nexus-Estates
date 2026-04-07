"use client"

import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { ShieldAlert, Lock, CheckCircle2 } from "lucide-react"

const schema = z
  .object({
    currentPassword: z.string().min(1, "Password atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[0-9]/, "Deve conter um número")
      .regex(/[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/, "Deve conter um símbolo"),
    confirmPassword: z.string().min(8),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords não coincidem",
    path: ["confirmPassword"],
  })

type Values = z.infer<typeof schema>

export function ChangePasswordForm({
  onSubmit,
}: {
  onSubmit: (payload: { currentPassword: string; newPassword: string }) => void | Promise<void>
}) {
  const form = useForm<Values>({ resolver: zodResolver(schema) })
  const [busy, setBusy] = React.useState(false)

  const submit = form.handleSubmit(async (values) => {
    setBusy(true)
    try {
      await onSubmit({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      form.reset()
      toast.success("Password atualizada com sucesso.")
    } finally {
      setBusy(false)
    }
  })

  return (
    <ProfilePanel 
      title="Segurança" 
      subtitle="Protege a tua conta com uma credencial forte"
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-1">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/60 flex items-center gap-2" htmlFor="current-password">
              <Lock className="w-3 h-3" />
              Password Atual
            </Label>
            <Input
              id="current-password"
              type="password"
              value={form.watch("currentPassword") || ""}
              onChange={(e) => form.setValue("currentPassword", e.target.value, { shouldValidate: true })}
              className="bg-background/50 border-[var(--fg-color)]/20 rounded-lg h-12 text-[var(--fg-color)] placeholder:text-[var(--fg-color)]/30 focus-visible:ring-[var(--primary-accent)]"
              placeholder="••••••••"
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/60 flex items-center gap-2" htmlFor="new-password">
                <ShieldAlert className="w-3 h-3 text-[var(--primary-accent)]" />
                Nova Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={form.watch("newPassword") || ""}
                onChange={(e) => form.setValue("newPassword", e.target.value, { shouldValidate: true })}
                className="bg-background/50 border-[var(--fg-color)]/20 rounded-lg h-12 text-[var(--fg-color)] placeholder:text-[var(--fg-color)]/30 focus-visible:ring-[var(--primary-accent)]"
                placeholder="Mín. 8 chars + num + sym"
              />
              {form.formState.errors.newPassword && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/60 flex items-center gap-2" htmlFor="confirm-password">
                <CheckCircle2 className="w-3 h-3" />
                Confirmar Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={form.watch("confirmPassword") || ""}
                onChange={(e) => form.setValue("confirmPassword", e.target.value, { shouldValidate: true })}
                className="bg-background/50 border-[var(--fg-color)]/20 rounded-lg h-12 text-[var(--fg-color)] placeholder:text-[var(--fg-color)]/30 focus-visible:ring-[var(--primary-accent)]"
                placeholder="Repete a nova password"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button
            onClick={() => void submit()}
            disabled={busy}
            className="h-12 px-8 rounded-lg bg-[var(--primary-accent)] text-white font-bold uppercase tracking-widest transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
          >
            {busy ? "A Processar..." : "Atualizar Segurança"}
          </Button>
        </div>
      </div>
    </ProfilePanel>
  )
}

