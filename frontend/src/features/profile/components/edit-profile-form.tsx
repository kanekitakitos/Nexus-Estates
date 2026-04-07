"use client"

import React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/forms/input"
import { Label } from "@/components/ui/forms/label"
import { Button } from "@/components/ui/button"
import { ProfilePanel } from "@/features/profile/components/profile-panel"
import { User, Image as ImageIcon, Save } from "lucide-react"

const schema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  file: z.instanceof(File).optional(),
})

type Values = z.infer<typeof schema>

export function EditProfileForm({
  defaultName,
  onSubmit,
}: {
  defaultName: string
  onSubmit: (payload: { name: string; file?: File }) => void | Promise<void>
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName, file: undefined },
  })
  const [busy, setBusy] = React.useState(false)

  const submit = form.handleSubmit(async (values) => {
    setBusy(true)
    try {
      await onSubmit({ name: values.name, file: values.file })
    } finally {
      setBusy(false)
    }
  })

  return (
    <ProfilePanel 
      title="Informação Básica" 
      subtitle="Como os outros te veem no Nexus"
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/60 flex items-center gap-2" htmlFor="profile-name">
              <User className="w-3 h-3" />
              Nome de Exibição
            </Label>
            <Input
              id="profile-name"
              variant="brutal"
              value={form.watch("name")}
              onChange={(e) => form.setValue("name", e.target.value, { shouldValidate: true })}
              className="bg-background/50 border-[var(--fg-color)]/20 rounded-lg h-12 text-[var(--fg-color)] placeholder:text-[var(--fg-color)]/30 focus-visible:ring-[var(--primary-accent)]"
              placeholder="Teu nome completo"
            />
            {form.formState.errors.name && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg-color)]/60 flex items-center gap-2" htmlFor="profile-avatar">
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
                  const f = e.target.files?.[0]
                  if (f) form.setValue("file", f, { shouldValidate: true })
                }}
                className="bg-background/50 border-[var(--fg-color)]/20 rounded-lg h-12 text-[var(--fg-color)] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase focus:ring-[var(--primary-accent)] file:text-[var(--primary-accent)] cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button
            onClick={() => void submit()}
            disabled={busy}
            className="h-12 px-8 rounded-lg bg-[var(--primary-accent)] text-white font-bold uppercase tracking-widest transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {busy ? "A Guardar..." : "Guardar Alterações"}
          </Button>
        </div>
      </div>
    </ProfilePanel>
  )
}

