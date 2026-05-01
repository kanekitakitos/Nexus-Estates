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
import { notify } from "@/lib/notify"
import { proPanel, propertyCopy, propertyTokens } from "../lib/property-tokens"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, itemFadeUp } from "../lib/animations"

// ─── Tipos e Interfaces ───────────────────────────────────────────────────

/** Propriedades do Gestor de Colaboradores */
export interface CollaboratorManagerProps {
    /** Lista de permissões/colaboradores atuais */
    permissions: PropertyPermission[]
    /** Callback para adicionar novo colaborador */
    onAdd: (email: string, accessLevel: PropertyPermission["accessLevel"]) => Promise<void>
    /** Callback para remover colaborador existente */
    onRemove: (userId: number) => void
    /** Se verdadeiro, envolve o conteúdo num BrutalCard */
    isCard?: boolean
}

/** Definição de papéis/roles disponíveis */
export const ROLES = [
    { id: "STAFF" as const, label: propertyCopy.collaboratorManager.roleViewer },
    { id: "MANAGER" as const, label: propertyCopy.collaboratorManager.roleEditor }
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
                <button className={propertyTokens.ui.collaborator.roleTriggerClass}>
                    {ROLES.find(r => r.id === value)?.label || propertyCopy.collaboratorManager.roleFallback}
                    <ChevronDown size={14} strokeWidth={3} className="opacity-40" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={propertyTokens.ui.collaborator.roleContentClass}>
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
    onInvite: (email: string, accessLevel: PropertyPermission["accessLevel"]) => Promise<void>;
    isVerifying: boolean 
}) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<PropertyPermission["accessLevel"]>("MANAGER")

    const handleAction = async () => {
        if (!email) return
        await onInvite(email, role)
        setEmail("")
    }

    return (
        <div className={cn(proPanel, "flex flex-col gap-3 p-6 md:flex-row md:items-center")}>
            <div className={propertyTokens.ui.collaborator.emailBoxClass}>
                <input
                    type="email" placeholder={propertyCopy.collaboratorManager.emailPlaceholder} value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={propertyTokens.ui.collaborator.emailInputClass}
                />
            </div>

            <RoleSelector value={role} onChange={setRole} />

            <BrutalButton
                type="button" onClick={handleAction} disabled={isVerifying || !email}
                className="!h-12 w-full !rounded-xl !px-6 !text-[10px] !font-black !uppercase !tracking-widest md:w-auto"
                variant="brutal"
            >
                {isVerifying ? (
                    <span className="flex items-center gap-2">{propertyCopy.collaboratorManager.verifying} <Loader2 className="h-3 w-3 animate-spin" /></span>
                ) : (
                    propertyCopy.collaboratorManager.invite
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
    perm: PropertyPermission; onRemove: (userId: number) => void
}) {
    return (
        <motion.div 
            variants={itemFadeUp}
            className={propertyTokens.ui.collaborator.itemClass}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black font-mono">
                    {perm.email[0].toUpperCase()}
                </div>
                <span className={propertyTokens.ui.collaborator.itemEmailClass}>
                    {perm.email}
                </span>
            </div>
            <div className="flex shrink-0 items-center gap-4">
                <span className={propertyTokens.ui.collaborator.permBadgeClass}>
                    {perm.accessLevel}
                </span>
                <button
                    type="button" onClick={() => onRemove(perm.userId)}
                    className={propertyTokens.ui.collaborator.removeButtonClass}
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
    const handleInvite = async (email: string, accessLevel: PropertyPermission["accessLevel"]) => {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            notify.error(propertyCopy.collaboratorManager.invalidEmail)
            return
        }

        if (permissions.some(p => p.email === email)) {
            notify.error(propertyCopy.collaboratorManager.alreadyAdded)
            return
        }

        setIsVerifying(true)
        try {
            // Nexus Network Protocol: Simulação de verificação
            await new Promise(r => setTimeout(r, 800))
            await onAdd(email, accessLevel)
            notify.success(`${propertyCopy.collaboratorManager.inviteOkPrefix} ${email} ${propertyCopy.collaboratorManager.inviteOkSuffix}`)
        } catch (e) {
            const msg = e instanceof Error ? e.message : null
            notify.error(msg && msg.trim() ? msg : propertyCopy.collaboratorManager.networkFail)
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
                            className={propertyTokens.ui.collaborator.emptyStateClass}
                        >
                            <p className={propertyTokens.ui.collaborator.emptyTextClass}>{propertyCopy.collaboratorManager.empty}</p>
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
                title={propertyCopy.collaboratorManager.cardTitle}
                subtitle={propertyCopy.collaboratorManager.cardSubtitle}
                icon={<ShieldCheck size={22} strokeWidth={2} />}
                iconBgColor={propertyTokens.ui.collaborator.cardIconBgColor}
                iconTextColor={propertyTokens.ui.collaborator.cardIconTextColor}
            >
                {content}
            </BrutalCard>
        )
    }

    return content
}
