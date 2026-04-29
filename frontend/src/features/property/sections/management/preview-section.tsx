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
import { proMeta, proPanel, proSectionTitle, propertyCopy, propertyTokens } from "../../lib/property-tokens"
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
  const titleStr = resolveTranslation(property.title) || propertyCopy.preview.noTitle

  return (
    <>
      <motion.div
        layoutId="gallery-container"
        className={propertyTokens.ui.preview.heroContainerClass}
        onClick={() => setIsFullscreen(true)}
      >
        <motion.img
          layoutId="gallery-image"
          src={images.length > 0 ? images[activeIndex] ?? images[0] : propertyTokens.ui.preview.fallbackImageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute left-6 top-6 z-10 flex flex-wrap gap-2 md:left-8 md:top-8">
          {property.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-black/40 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" strokeWidth={2} />
              {propertyCopy.preview.featured}
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
            {property.status === "AVAILABLE"
              ? propertyCopy.preview.statusAvailable
              : property.status === "MAINTENANCE"
                ? propertyCopy.preview.statusMaintenance
                : propertyCopy.preview.statusBooked}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10">
          <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
            {property.city || propertyCopy.preview.cityNull} · {property.location || propertyCopy.preview.locationVoid}
          </p>
          <h1 className="max-w-4xl font-serif text-4xl font-bold italic uppercase leading-[0.9] tracking-tighter text-white md:text-5xl lg:text-6xl">
            <BoingText text={titleStr} color="white" activeColor={propertyTokens.ui.preview.boingActiveColor} duration={0.5} />
          </h1>
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/85">
            <Eye className="h-4 w-4 opacity-70" strokeWidth={2} />
            {propertyCopy.preview.clickToExpand}
          </p>
        </div>
      </motion.div>

      <PropertyMediaModal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        images={images.length ? images : [...propertyTokens.ui.preview.placeholderImages]}
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
    { label: propertyCopy.preview.kpiBasePriceLabel, value: property.price ? `${property.price} €` : propertyCopy.preview.kpiVoid, hint: propertyCopy.preview.kpiBasePriceHint, color: "border-primary shadow-primary/20 bg-orange-50 dark:bg-orange-950/20" },
    { label: propertyCopy.preview.kpiCapacityLabel, value: property.maxGuests ? String(property.maxGuests) : propertyCopy.preview.kpiZero, hint: propertyCopy.preview.kpiCapacityHint, color: "border-indigo-500 shadow-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20" },
    { label: propertyCopy.preview.kpiRatingLabel, value: property.rating ? String(property.rating) : propertyCopy.preview.kpiNa, hint: propertyCopy.preview.kpiRatingHint, color: "border-emerald-500 shadow-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20" },
    { label: propertyCopy.preview.kpiIdentifierLabel, value: property.id?.toString().slice(0, 12) ?? propertyCopy.preview.kpiNull, hint: propertyCopy.preview.kpiIdentifierHint, color: propertyTokens.ui.preview.kpiIdentifierColorClass },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className={cn(proPanel, "p-5 border-2 transition-transform hover:-translate-y-1", m.color)}>
          <p className={proMeta}>{m.label}</p>
          <p className={propertyTokens.ui.preview.kpiValueClass}>
            {m.value}
          </p>
          <p className={propertyTokens.ui.preview.kpiHintClass}>{m.hint}</p>
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
  const desc = resolveTranslation(property.description) || propertyCopy.preview.descriptionMissing
  return (
    <section className={cn(proPanel, propertyTokens.ui.preview.aboutSectionClass)}>
      <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" strokeWidth={2.5} />
          <h2 className={cn(proSectionTitle, "text-primary italic")}>{propertyCopy.preview.descriptionTitle}</h2>
        </div>
      </div>
      <div className="px-6 py-8">
        <p className={cn("max-w-3xl text-base leading-relaxed", !resolveTranslation(property.description) ? "font-mono text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse" : propertyTokens.ui.preview.aboutDescFilledClass)}>
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
          <div className={propertyTokens.ui.preview.locationLeftMetaColorClass}>
            <Globe className="h-4 w-4" strokeWidth={2} />
            <span className={proMeta}>{propertyCopy.preview.geoTitle}</span>
          </div>
          <p className={propertyTokens.ui.preview.locationCityClass}>{property.city || propertyCopy.preview.cityUndefined}</p>
          <p className={propertyTokens.ui.preview.locationAddressClass}>{property.address || propertyCopy.preview.noStreetProtocol}</p>
          <p className={propertyTokens.ui.preview.locationSystemClass}>{property.location || propertyCopy.preview.locationSystemError}</p>
        </div>

        <div className={propertyTokens.ui.preview.tagsDividerClass}>
          <div className={propertyTokens.ui.preview.locationLeftMetaColorClass}>
            <Tag className="h-4 w-4" strokeWidth={2} />
            <span className={proMeta}>{propertyCopy.preview.tagsTitle}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {property.tags?.length ? (
              property.tags.map((tag, i) => (
                <span key={i} className={propertyTokens.ui.preview.tagChipClass}>
                  #{tag.toUpperCase()}
                </span>
              ))
            ) : (
              <span className={propertyTokens.ui.preview.untaggedClass}>{propertyCopy.preview.placeholderTagEmpty}</span>
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
          <h2 className={proSectionTitle}>{propertyCopy.preview.servicesTitle}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(property.amenityIds ?? []).length ? (
            (property.amenityIds ?? []).map((id) => (
              <span key={id} className={propertyTokens.ui.preview.amenityChipClass}>
                {getAmenityLabel(id)}
              </span>
            ))
          ) : (
            <span className={propertyTokens.ui.preview.comfortVoidClass}>{propertyCopy.preview.comfortVoid}</span>
          )}
        </div>
      </section>

      <section className={cn(proPanel, "p-6 md:p-8")}>
        <div className={propertyTokens.ui.preview.teamTitleRowClass}>
          <Users className="h-4 w-4" strokeWidth={2} />
          <h2 className={proSectionTitle}>{propertyCopy.preview.teamTitle}</h2>
        </div>
        <div className="space-y-4">
          {property.permissions?.map((perm) => (
            <div key={perm.email} className={propertyTokens.ui.preview.teamRowClass}>
              <div className="flex flex-col min-w-0">
                <span className={propertyTokens.ui.preview.teamEmailClass}>{perm.email}</span>
                <span className={propertyTokens.ui.preview.assignmentVerifiedClass}>{propertyCopy.preview.assignmentVerified}</span>
              </div>
              <span className={propertyTokens.ui.preview.permLevelBadgeClass}>
                {perm.level}
              </span>
            </div>
          ))}
          {!property.permissions?.length && (
            <div className={propertyTokens.ui.preview.teamNullClass}>{propertyCopy.preview.teamNull}</div>
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
    <section className={cn(proPanel, propertyTokens.ui.preview.rulesOuterClass)}>
      <div className={propertyTokens.ui.preview.rulesHeaderClass}>
        <div className="flex items-center gap-3">
          <div className={propertyTokens.ui.preview.rulesIconBadgeClass}>
            <Clock className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <h2 className={cn(proSectionTitle, "text-lg uppercase tracking-tighter")}>{propertyCopy.preview.managementTitle}</h2>
        </div>
        {onGoToRules && (
          <button onClick={onGoToRules} className={propertyTokens.ui.preview.rulesButtonClass}>
            {propertyCopy.preview.configure} <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className={propertyTokens.ui.preview.rulesLeftPanelClass}>
          <div className="space-y-8">
            <div>
              <span className={proMeta}>{propertyCopy.preview.checkInOutProtocol}</span>
              <div className="mt-6 flex items-center gap-6">
                <div className="flex-1 rounded-2xl border-2 border-primary/20 bg-primary/[0.03] p-6 text-center">
                  <p className="font-serif text-4xl font-bold italic text-primary dark:text-white">{rules.checkInTime || propertyCopy.preview.timeFallback}</p>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">{propertyCopy.preview.checkIn}</p>
                </div>
                <div className={propertyTokens.ui.preview.checkOutCardClass}>
                  <p className={propertyTokens.ui.preview.checkOutTimeClass}>{rules.checkOutTime || propertyCopy.preview.timeFallback}</p>
                  <p className={propertyTokens.ui.preview.checkOutLabelClass}>{propertyCopy.preview.checkOut}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={propertyTokens.ui.preview.infoBoxClass}>
                <span className={proMeta}>{propertyCopy.preview.stay}</span>
                <p className={propertyTokens.ui.preview.infoValueClass}>{rules.minNights ?? 0}d - {rules.maxNights ?? propertyCopy.preview.infinity}</p>
              </div>
              <div className={propertyTokens.ui.preview.infoBoxClass}>
                <span className={proMeta}>{propertyCopy.preview.leadTime}</span>
                <p className={propertyTokens.ui.preview.infoValueClass}>
                  {rules.bookingLeadTimeDays ?? 0} {propertyCopy.preview.daysLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={propertyTokens.ui.preview.seasonsPanelClass}>
          <span className={proMeta}>{propertyCopy.preview.yieldWindowsPrefix} ({seasons.length})</span>
          <div className="mt-6 space-y-3">
            {seasons.map((s, i) => (
              <div key={i} className={propertyTokens.ui.preview.seasonRowClass}>
                <div className="flex items-center gap-4">
                  <Calendar size={18} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-black uppercase text-primary">
                      {propertyCopy.preview.protocolPrefix}
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold">{s.startDate} → {s.endDate}</span>
                  </div>
                </div>
                <span className="font-serif text-xl font-bold italic text-primary">×{s.priceModifier.toFixed(2)}</span>
              </div>
            ))}
            {seasons.length === 0 && (
              <div className={propertyTokens.ui.preview.yieldVoidClass}>{propertyCopy.preview.yieldVoid}</div>
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
  const [syncedAt] = useState(() =>
    new Date().toLocaleString(propertyTokens.ui.preview.dateLocale, {
      dateStyle: propertyTokens.ui.preview.dateStyle,
      timeStyle: propertyTokens.ui.preview.timeStyle,
    })
  )

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
        className={propertyTokens.ui.preview.footerClass}
      >
        <div className="flex flex-wrap gap-6 font-mono text-[10px] font-black uppercase tracking-widest">
          <span>{propertyCopy.preview.updatedViewPrefix} {syncedAt}</span>
          <span className={propertyTokens.ui.preview.footerIdClass}>ID_{property.id?.toString().slice(0, 12)}</span>
        </div>
        <span className={propertyTokens.ui.preview.footerSystemClass}>{propertyCopy.preview.systemPreview}</span>
      </motion.footer>
    </motion.div>
  )
}
