"use client"

import { useState } from "react"
import {
  Info, Sparkles, Eye, Star, Tag,
  Globe, Users, Clock, Calendar,
  ArrowUpRight
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OwnProperty } from "@/types"
import { useAmenityCatalog, resolveTranslation } from "../../model/hooks"
import { PropertyMediaModal } from "../../components/property-media-modal"
import { proMeta, proPanel, proSectionTitle } from "../../lib/property-tokens"
import { BoingText } from "@/components/effects/BoingText"
import { staggerContainer, itemFadeUp } from "../../lib/animations"

// ─── Tipos e Interfaces ───────────────────────────────────────────────────

/**
 * Propriedades do Visualizador de Edição.
 *
 * @description Contrato público do módulo de pré-visualização high-fidelity,
 * incluindo os dados do ativo e callback opcional para navegação à secção de regras.
 */
export interface PreviewSectionProps {
  /** Dados do ativo para renderização na prévia */
  property: OwnProperty
  /** Callback opcional para navegar para a secção de regras */
  onGoToRules?: () => void
}

// ─── Sub-Componentes Internos ──────────────────────────────────────────────

/**
 * PreviewHero — Secção de cabeçalho com galeria de impacto.
 *
 * @description Exibe a imagem principal com overlay de gradiente,
 * badges de estado (Featured/Status) e título hero editorial.
 * Inclui integração com modal de media para visualização em ecrã inteiro.
 *
 * @param property - Dados do ativo para renderização do hero
 */
function PreviewHero({ property }: { property: OwnProperty }) {
  const images = property.imageUrl ? [property.imageUrl] : []
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeIndex] = useState(0)
  const titleStr = resolveTranslation(property.title) || "Sem título"

  return (
    <>
      <motion.div
        layoutId="gallery-container"
        className="group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-2xl border-2 border-[#0D0D0D] bg-zinc-100 shadow-[8px_8px_0_0_#FF5E1A] dark:border-zinc-300 dark:bg-zinc-900 lg:aspect-[21/9]"
        onClick={() => setIsFullscreen(true)}
      >
        <motion.img
          layoutId="gallery-image"
          src={images.length > 0 ? images[activeIndex] ?? images[0] : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute left-6 top-6 z-10 flex flex-wrap gap-2 md:left-8 md:top-8">
          {property.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-black/40 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" strokeWidth={2} />
              Destaque
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
              property.status === "AVAILABLE"
                ? "border-emerald-400/40 bg-emerald-950/40 text-emerald-100"
                : "border-rose-400/40 bg-rose-950/40 text-rose-100"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                property.status === "AVAILABLE" ? "bg-emerald-400" : "bg-rose-400"
              )}
            />
            {property.status === "AVAILABLE" ? "Disponível" : property.status === "MAINTENANCE" ? "Manutenção" : "Ocupada"}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
            {property.city || "CITY_NULL"} · {property.location || "LOCATION_VOID"}
          </p>
          <h1 className="max-w-4xl font-serif text-4xl font-bold italic uppercase leading-[0.9] tracking-tighter text-white md:text-5xl lg:text-6xl">
            <BoingText text={titleStr} color="white" activeColor="#F97316" duration={0.5} />
          </h1>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/85">
            <Eye className="h-4 w-4 opacity-70" strokeWidth={2} />
            Clica para ampliar
          </p>
        </div>
      </motion.div>

      <PropertyMediaModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        images={images.length ? images : ["/placeholder-property.jpg"]}
        title={titleStr}
        initialIndex={activeIndex}
      />
    </>
  )
}

/**
 * PreviewKpis — Grelha de indicadores de performance e metadados.
 *
 * @description Exibe 4 KPIs em formato de card brutalista:
 * Preço base, Lotação, Avaliação e Identificador.
 *
 * @param property - Dados do ativo para cálculo dos KPIs
 */
function PreviewKpis({ property }: { property: OwnProperty }) {
  const items = [
    { label: "Preço base", value: property.price ? `${property.price} €` : "VOID", hint: "por noite (configurável)", color: "border-primary shadow-primary/20 bg-orange-50 dark:bg-orange-950/20" },
    { label: "Lotação", value: property.maxGuests ? String(property.maxGuests) : "00", hint: "hóspedes máx.", color: "border-indigo-500 shadow-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20" },
    { label: "Avaliação", value: property.rating ? String(property.rating) : "N/A", hint: "índice interno", color: "border-emerald-500 shadow-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20" },
    { label: "Identificador", value: property.id?.toString().slice(0, 12) ?? "NULL", hint: "referência", color: "border-[#0D0D0D] shadow-[#0D0D0D]/10 bg-white dark:bg-zinc-900" },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className={cn(proPanel, "p-5 border-2 transition-transform hover:-translate-y-1", m.color)}>
          <p className={proMeta}>{m.label}</p>
          <p className="mt-3 font-serif text-3xl font-bold italic tabular-nums tracking-tighter text-[#0D0D0D] dark:text-white">
            {m.value}
          </p>
          <p className="mt-1 text-xs text-[#8C7B6B] dark:text-zinc-500 font-medium">{m.hint}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * PreviewAbout — Detalhamento textual e informativo do ativo.
 *
 * @description Exibe a descrição editorial do ativo com fallback
 * animado caso a descrição esteja vazia (MISSING_DESCRIPTION).
 *
 * @param property - Dados do ativo para extrair a descrição
 */
function PreviewAbout({ property }: { property: OwnProperty }) {
  const desc = resolveTranslation(property.description) || "MISSING_DESCRIPTION // Operador, descreva este ativo para o catálogo comercial da Nexus Estates."
  return (
    <section className={cn(proPanel, "overflow-hidden border-2 border-primary/20 bg-[#FAFAF5] dark:bg-zinc-900")}>
      <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" strokeWidth={2.5} />
          <h2 className={cn(proSectionTitle, "text-primary italic")}>Descrição</h2>
        </div>
      </div>
      <div className="px-6 py-8">
        <p className={cn("max-w-3xl text-base leading-relaxed", !resolveTranslation(property.description) ? "font-mono text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse" : "text-[#0D0D0D]/90 dark:text-zinc-200")}>
          {desc}
        </p>
      </div>
    </section>
  )
}

/**
 * PreviewLocationTags — Indexação geográfica e categorização (Tags).
 *
 * @description Exibe a morada, cidade, região e tags do ativo
 * em formato editorial brutalista com separação visual.
 *
 * @param property - Dados do ativo para extrair localização e tags
 */
function PreviewLocationTags({ property }: { property: OwnProperty }) {
  return (
    <section className={cn(proPanel, "p-6 md:p-8")}>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-2 text-[#8C7B6B]">
            <Globe className="h-4 w-4" strokeWidth={2} />
            <span className={proMeta}>Geolocalização & Morada</span>
          </div>
          <p className="text-2xl font-bold tracking-tighter text-[#0D0D0D] dark:text-white uppercase">{property.city || "CITY_UNDEFINED"}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#8C7B6B] dark:text-zinc-400 italic">{property.address || "NO_STREET_PROTOCOL"}</p>
          <p className="mt-3 font-mono text-[10px] font-black uppercase tracking-widest text-[#0D0D0D]/40 dark:text-zinc-500">{property.location || "LOCATION_SYSTEM_ERROR"}</p>
        </div>

        <div className="border-[#0D0D0D]/5 dark:border-white/5 md:border-l-2 md:pl-8">
          <div className="mb-4 flex items-center gap-2 text-[#8C7B6B]">
            <Tag className="h-4 w-4" strokeWidth={2} />
            <span className={proMeta}>Indexação de Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {property.tags?.length ? (
              property.tags.map((tag, i) => (
                <span key={i} className="rounded-md border-2 border-[#0D0D0D]/10 bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-[#0D0D0D] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-none">
                  #{tag.toUpperCase()}
                </span>
              ))
            ) : (
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#8C7B6B]/30 italic leading-loose">
                PROTOCOL_UNTAGGED · Recomenda-se etiquetagem para SEO e indexação Nexus
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * PreviewServicesAcl — Listagem de serviços ativos e equipa responsável.
 *
 * @description Exibe as comodidades ativas (via `useAmenityCatalog`) e
 * a lista de colaboradores com os seus níveis de permissão.
 *
 * @param property - Dados do ativo para extrair amenities e permissões
 */
function PreviewServicesAcl({ property }: { property: OwnProperty }) {
  const { getAmenityLabel } = useAmenityCatalog()
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className={cn(proPanel, "p-6 md:p-8")}>
        <div className="mb-6 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
          <h2 className={proSectionTitle}>Serviços & Comodidades</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(property.amenityIds ?? []).length ? (
            (property.amenityIds ?? []).map((id) => (
              <span key={id} className="rounded-lg border border-[#0D0D0D]/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0D0D0D] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                {getAmenityLabel(id)}
              </span>
            ))
          ) : (
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#8C7B6B]/30 italic">COMFORT_VOID</span>
          )}
        </div>
      </section>

      <section className={cn(proPanel, "p-6 md:p-8")}>
        <div className="mb-6 flex items-center gap-2 text-[#8C7B6B]">
          <Users className="h-4 w-4" strokeWidth={2} />
          <h2 className={proSectionTitle}>Equipa & Colaboradores</h2>
        </div>
        <div className="space-y-4">
          {property.permissions?.map((perm) => (
            <div key={perm.email} className="flex items-center justify-between gap-4 border-b border-[#0D0D0D]/5 pb-3 last:border-0 dark:border-zinc-800">
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-bold text-[#0D0D0D] dark:text-zinc-200">{perm.email}</span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-[#8C7B6B]">Atribuição Verificada</span>
              </div>
              <span className="shrink-0 rounded-md border-2 border-[#0D0D0D] bg-white px-2 py-0.5 font-mono text-[9px] font-black uppercase text-[#0D0D0D] shadow-[2px_2px_0_0_#0D0D0D]">
                {perm.level}
              </span>
            </div>
          ))}
          {!property.permissions?.length && (
            <div className="font-mono text-[10px] font-black uppercase tracking-widest text-[#8C7B6B]/30 italic py-4">EQUIP_NULL</div>
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * PreviewRulesSection — Visualização de regras operacionais e janelas de rendimento.
 *
 * @description Painel dividido que mostra check-in/out, limites de estadia,
 * antecedência e janelas sazonais com multiplicadores de preço.
 * Inclui botão de navegação rápida para a secção de regras.
 *
 * @param property - Dados do ativo com regras operacionais
 * @param onGoToRules - Callback para navegar ao modo RULES
 */
function PreviewRulesSection({ property, onGoToRules }: { property: OwnProperty; onGoToRules?: () => void }) {
  const rules = property.propertyRule || {}
  const seasons = property.seasonalityRules || []

  return (
    <section className={cn(proPanel, "overflow-hidden border-2 border-[#0D0D0D] dark:border-white/20")}>
      <div className="flex items-center justify-between border-b-2 border-[#0D0D0D] px-6 py-5 dark:border-white/10 bg-[#FAFAF5] dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D0D0D] text-white">
            <Clock className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <h2 className={cn(proSectionTitle, "text-lg uppercase tracking-tighter")}>Gestão Operacional</h2>
        </div>
        {onGoToRules && (
          <button onClick={onGoToRules} className="group flex items-center gap-2 rounded-xl border-2 border-[#0D0D0D] bg-white px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] transition-all hover:bg-primary hover:text-white dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-300 shadow-[4px_4px_0_0_#0D0D0D]">
            Configurar <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-[#0D0D0D]/10 p-6 md:p-8 dark:border-white/10 lg:border-r-2">
          <div className="space-y-8">
            <div>
              <span className={proMeta}>Protocolo de Check-in/Out</span>
              <div className="mt-6 flex items-center gap-6">
                <div className="flex-1 rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-6 text-center">
                  <p className="font-serif text-4xl font-bold italic text-primary dark:text-white">{rules.checkInTime || "00:00"}</p>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Entrada</p>
                </div>
                <div className="flex-1 rounded-2xl border-2 border-[#0D0D0D]/5 bg-[#FAFAF5]/50 p-6 text-center">
                  <p className="font-serif text-4xl font-bold italic text-[#0D0D0D] dark:text-white">{rules.checkOutTime || "00:00"}</p>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-[#8C7B6B]">Saída</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border-2 border-[#0D0D0D]/5 bg-[#FAFAF5]/30 p-5">
                <span className={proMeta}>Estadia</span>
                <p className="mt-3 font-serif text-lg font-bold italic text-[#0D0D0D] dark:text-white">{rules.minNights ?? 0}d - {rules.maxNights ?? "∞"}</p>
              </div>
              <div className="rounded-xl border-2 border-[#0D0D0D]/5 bg-[#FAFAF5]/30 p-5">
                <span className={proMeta}>Antecedência</span>
                <p className="mt-3 font-serif text-lg font-bold italic text-[#0D0D0D] dark:text-white">{rules.bookingLeadTimeDays ?? 0} DIAS</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#FAFAF5]/30 p-6 md:p-8 dark:bg-zinc-900/20">
          <span className={proMeta}>Janelas de Rendimento ({seasons.length})</span>
          <div className="mt-6 space-y-3">
            {seasons.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border-2 border-[#0D0D0D]/5 bg-white p-4">
                <div className="flex items-center gap-4">
                  <Calendar size={18} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-black uppercase text-primary">Protocolo_{i + 1}</span>
                    <span className="text-xs font-bold">{s.startDate} → {s.endDate}</span>
                  </div>
                </div>
                <span className="font-serif text-xl font-bold italic text-primary">×{s.priceModifier.toFixed(2)}</span>
              </div>
            ))}
            {seasons.length === 0 && (
              <div className="py-12 text-center opacity-30 font-mono text-[10px] font-black uppercase tracking-widest">YIELD_VOID</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Componente Root ────────────────────────────────────────────────────────

/**
 * PreviewSection — Módulo de Visualização High-Fidelity.
 *
 * @description Fornece uma simulação final de como o ativo será apresentado
 * publicamente e exibe métricas analíticas e protocolos operacionais indexados.
 *
 * Integra cinco sub-secções especializadas:
 * - `PreviewHero` — Banner visual com galeria e badges
 * - `PreviewKpis` — Indicadores chave (preço, lotação, avaliação, ID)
 * - `PreviewAbout` — Descrição editorial do ativo
 * - `PreviewLocationTags` — Geolocalização e sistema de tags
 * - `PreviewServicesAcl` — Comodidades e equipa
 * - `PreviewRulesSection` — Regras operacionais e sazonalidade
 *
 * @see PreviewHero — Hero visual com modal fullscreen
 * @see PreviewKpis — KPIs em cards brutalistas
 * @see PreviewRulesSection — Visualização de regras e janelas de preço
 */
export function PreviewSection({ property, onGoToRules }: PreviewSectionProps) {
  const [syncedAt] = useState(() => new Date().toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }))

  if (!property) return null

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-6xl space-y-12 px-4 pb-24 lg:px-0"
    >
      {/* Hero Visual */}
      <motion.div variants={itemFadeUp}>
        <PreviewHero property={property} />
      </motion.div>

      {/* Indicadores Chave */}
      <motion.div variants={itemFadeUp}>
        <PreviewKpis property={property} />
      </motion.div>

      {/* Conteúdo Detalhado */}
      <div className="space-y-6">
        <motion.div variants={itemFadeUp}>
          <PreviewAbout property={property} />
        </motion.div>
        
        <motion.div variants={itemFadeUp}>
          <PreviewLocationTags property={property} />
        </motion.div>
        
        <motion.div variants={itemFadeUp}>
          <PreviewServicesAcl property={property} />
        </motion.div>
        
        <motion.div variants={itemFadeUp}>
          <PreviewRulesSection property={property} onGoToRules={onGoToRules} />
        </motion.div>
      </div>

      {/* Rodapé de Protocolo */}
      <motion.footer 
        variants={itemFadeUp}
        className="flex flex-col gap-4 border-t border-[#0D0D0D]/15 pt-8 text-sm text-[#8C7B6B] dark:border-zinc-800 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-wrap gap-6 font-mono text-[10px] font-black uppercase tracking-widest">
          <span>Vista Atualizada // {syncedAt}</span>
          <span className="flex items-center gap-1.5 underline underline-offset-4 decoration-primary/30">ID_{property.id?.toString().slice(0, 12)}</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8C7B6B]/80 font-black">Nexus_Core // System_Preview</span>
      </motion.footer>
    </motion.div>
  )
}
