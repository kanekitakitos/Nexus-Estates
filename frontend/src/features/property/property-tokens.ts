/**
 * Tokens visuais da área Properties — alinhados à landing (`tokens.tsx` / DESIGN.md).
 * Centraliza classes repetidas para consistência editorial neo-brutalista.
 */

/** Etiquetas mono tipo landing (eyebrows, protocolos) */
export const nexusEyebrowClass =
  "font-mono text-[9px] font-black uppercase tracking-[0.32em] text-[#0D0D0D]/65 dark:text-zinc-400"

export const nexusEyebrowAccentClass =
  "font-mono text-[10px] font-black uppercase tracking-[0.28em] text-primary"

/** Corpo secundário legível (muted da paleta Nexus) */
export const nexusMutedBodyClass = "text-[#8C7B6B] dark:text-zinc-400"

/** Borda e sombra dura padrão editorial */
export const nexusHardBorder = "border-[2px] border-[#0D0D0D] dark:border-zinc-100"

/** Borders de alta fidelidade (mais espessas para elementos principais) */
export const nexusHardBorderHeavy = "border-[3px] border-[#0D0D0D] dark:border-[#FAFAF5]"

export const nexusShadowSm = "shadow-[3px_3px_0_0_#0D0D0D] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.85)]"
export const nexusShadowMd = "shadow-[6px_6px_0_0_#0D0D0D] dark:shadow-[6px_6px_0_0_rgba(24,24,27,1)]"
export const nexusShadowLg = "shadow-[10px_10px_0_0_#0D0D0D] dark:shadow-[10px_10px_0_0_rgba(24,24,27,1)]"

/** Glows dinâmicos baseados no estado (Brutal Glow) */
export const nexusGlowPrimary = "shadow-[0_0_15px_rgba(249,115,22,0.3)] dark:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
export const nexusGlowEmerald = "shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.2)]"

/** Glassmorphism Editorial Neo-Brutalista */
export const nexusGlass = "bg-[#FAFAF5]/85 dark:bg-zinc-900/85 backdrop-blur-xl"

/** Hover físico: “pressionar” (DESIGN.md) */
export const nexusCardPressHover =
  "transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:translate-x-0.5 hover:translate-y-0.5"

/** Kinetic Displacements (Offsets físicos no hover) */
export const nexusKineticLight = "hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0 transition-transform duration-200"
export const nexusKineticHeavy = "hover:-translate-y-2 hover:-translate-x-2 active:translate-y-0.5 active:translate-x-0.5 transition-transform duration-300"

/** Superfícies de backoffice — Ajustadas para Neo-Brutalismo Editorial */
export const proPanel =
  "rounded-2xl border-[2px] border-[#0D0D0D] bg-white shadow-[6px_6px_0_0_#0D0D0D] dark:border-zinc-100 dark:bg-zinc-950 dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.15)]"

export const proSectionTitle = "font-serif text-xl font-bold italic tracking-tight text-[#0D0D0D] dark:text-zinc-100 uppercase"

export const proMeta =
  "text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[#8C7B6B] dark:text-zinc-500"
