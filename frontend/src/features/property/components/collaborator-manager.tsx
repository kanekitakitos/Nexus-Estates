"use client"

import { useState } from "react"
import { ShieldCheck, ChevronDown, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PropertyPermission } from "@/types"
import { BrutalButton } from "@/components/ui/forms/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuRadioGroup, 
    DropdownMenuRadioItem, 
    DropdownMenuTrigger 
} from "@/components/ui/overlay/dropdown-menu"
import { BrutalCard } from "@/components/ui/data-display/brutal-card"
import { toast } from "sonner"
import { proPanel, nexusKineticLight, nexusShadowSm } from "../property-tokens"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, itemFadeUp, microPop } from "../animations"

// ─── Tipos e Interfaces ───────────────────────────────────────────────────

/** Propriedades do Gestor de Colaboradores */
export interface CollaboratorManagerProps {
    /** Lista de permissões/colaboradores atuais */
    permissions: PropertyPermission[]
    /** Callback para adicionar novo colaborador */
    onAdd: (email: string, role: string) => void
    /** Callback para remover colaborador existente */
    onRemove: (email: string) => void
    /** Se verdadeiro, envolve o conteúdo num BrutalCard */
    isCard?: boolean
}

/** Definição de papéis/roles disponíveis */
export const ROLES = [
    { id: "VIEWER", label: "Leitura" },
    { id: "EDITOR", label: "Editor" },
    { id: "ADMIN", label: "Admin" },
    { id: "OWNER", label: "Proprietário" }
]

// ─── Sub-Componentes Internos ──────────────────────────────────────────────

/**
 * RoleSelector - Menu de seleção de papel para o colaborador.
 */
function RoleSelector({ 
    value, onChange 
}: { 
    value: string; onChange: (v: string) => void 
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex w-full min-w-[140px] items-center justify-between gap-2 rounded-xl border-2 border-[#000000] bg-white px-4 py-3 font-mono text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] transition-all hover:bg-[#FAFAF5] dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 shadow-[2px_2px_0_0_#000000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.1)] md:w-auto">
                    {ROLES.find(r => r.id === value)?.label || "ROLE"}
                    <ChevronDown size={14} strokeWidth={3} className="opacity-40" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border-2 border-[#000000] bg-white p-1 shadow-[4px_4px_0_0_#000000] dark:border-zinc-100 dark:bg-zinc-950">
                <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
                    {ROLES.map((role) => (
                        <DropdownMenuRadioItem 
                            key={role.id} value={role.id}
                            className="font-mono text-[10px] font-bold uppercase tracking-widest py-3 focus:bg-primary focus:text-white cursor-pointer"
                        >
                            {role.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/**
 * CollaboratorInput - Secção de convite industrial.
 * 
 * @description Contém o campo de email, seletor de role e o botão de execução (invite).
 */
function CollaboratorInput({ 
    onInvite, isVerifying 
}: { 
    onInvite: (email: string, role: string) => Promise<void>; 
    isVerifying: boolean 
}) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("EDITOR")

    const handleAction = async () => {
        if (!email) return
        await onInvite(email, role)
        setEmail("")
    }

    return (
        <div className={cn(proPanel, "flex flex-col gap-3 p-6 md:flex-row md:items-center")}>
            <div className="min-w-0 flex-1 rounded-xl border-2 border-[#000000] bg-white px-4 py-3 dark:border-zinc-100 dark:bg-zinc-950 shadow-[2px_2px_0_0_#000000] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.1)]">
                <input
                    type="email" placeholder="nome@empresa.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-[#0D0D0D] outline-none placeholder:text-[#8C7B6B]/40 dark:text-white"
                />
            </div>

            <RoleSelector value={role} onChange={setRole} />

            <BrutalButton
                type="button" onClick={handleAction} disabled={isVerifying || !email}
                className="!h-12 w-full !rounded-xl !px-6 !text-[10px] !font-black !uppercase !tracking-widest md:w-auto"
                variant="brutal"
            >
                {isVerifying ? (
                    <span className="flex items-center gap-2">Verificando <Loader2 className="h-3 w-3 animate-spin" /></span>
                ) : (
                    "Convidar"
                )}
            </BrutalButton>
        </div>
    )
}

/**
 * CollaboratorItem - Representação de um colaborador indexado.
 */
function CollaboratorItem({ 
    perm, onRemove 
}: { 
    perm: PropertyPermission; onRemove: (email: string) => void 
}) {
    return (
        <motion.div 
            variants={itemFadeUp}
            className="flex items-center justify-between gap-4 rounded-xl border border-[#000000]/10 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/50 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black font-mono">
                    {perm.email[0].toUpperCase()}
                </div>
                <span className="truncate text-sm font-medium text-[#0D0D0D] dark:text-zinc-100">
                    {perm.email}
                </span>
            </div>
            <div className="flex shrink-0 items-center gap-4">
                <span className="rounded-lg bg-[#FAFAF5] border border-[#0D0D0D]/10 px-3 py-1 font-mono text-[9px] font-black uppercase text-[#8C7B6B] dark:bg-zinc-800 dark:text-zinc-400">
                    {perm.level}
                </span>
                <button
                    type="button" onClick={() => onRemove(perm.email)}
                    className="p-1.5 text-[#8C7B6B] hover:text-rose-600 transition-colors"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>
            </div>
        </motion.div>
    )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * CollaboratorManager - Módulo de Gestão de Acessos e Colaboração.
 * 
 * @description Orchestrador de equipa que permite convidar novos membros 
 * com níveis de permissão específicos e gerir a lista de colaboradores ativos.
 */
export function CollaboratorManager({ permissions, onAdd, onRemove, isCard = true }: CollaboratorManagerProps) {
    const [isVerifying, setIsVerifying] = useState(false)

    /** Executa o protocolo de convite com verificação de rede mockada */
    const handleInvite = async (email: string, role: string) => {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error("Email inválido")
            return
        }

        if (permissions.some(p => p.email === email)) {
            toast.error("Colaborador já adicionado")
            return
        }

        setIsVerifying(true)
        try {
            // Nexus Network Protocol: Simulação de verificação
            await new Promise(r => setTimeout(r, 800))
            onAdd(email, role)
            toast.success(`Protocolo: ${email} indexado com sucesso`)
        } catch (e) {
            toast.error("Falha na rede Nexus")
        } finally {
            setIsVerifying(false)
        }
    }

    const content = (
        <div className="space-y-6">
            {/* Secção de Entrada */}
            <CollaboratorInput onInvite={handleInvite} isVerifying={isVerifying} />

            {/* Listagem de Colaboradores */}
            <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-3"
            >
                <AnimatePresence mode="popLayout">
                    {permissions.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-10 text-center border-2 border-dashed border-[#0D0D0D]/10 rounded-2xl bg-[#FAFAF5]/30 dark:bg-zinc-900/20"
                        >
                            <p className="text-sm text-[#8C7B6B] italic font-serif">Sem colaboradores externos indexados.</p>
                        </motion.div>
                    ) : (
                        permissions.map((perm) => (
                            <CollaboratorItem key={perm.email} perm={perm} onRemove={onRemove} />
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )

    if (isCard) {
        return (
            <BrutalCard 
                id="collaborator-manager"
                title="Colaboradores"
                subtitle="Convites e níveis de acesso"
                icon={<ShieldCheck size={22} strokeWidth={2} />}
                iconBgColor="bg-blue-500/10 border-blue-500/20"
                iconTextColor="text-blue-500"
            >
                {content}
            </BrutalCard>
        )
    }

    return content
}
