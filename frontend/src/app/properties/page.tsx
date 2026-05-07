/**
 * @file page.tsx
 * @author Nexus Estates team
 * @description Página principal para a gestão de propriedades. Renderiza a view de propriedades dentro do AppShell.
 */

import { AppShell } from "@/components/layout/app-shell"
import { PropertyView } from "@/features/property"
import type { EditMode } from "@/features/property/sections/management/property-management-root"

/**
 * Componente principal da rota `/properties`.
 * @route `/properties`
 * @description Renderiza a página onde um proprietário pode visualizar, gerir e ver estatísticas sobre as suas propriedades.
 *              Aceita parâmetros de pesquisa (query params) para abrir diretamente uma propriedade específica ou num modo específico.
 * @param {Object} props - Propriedades do componente.
 * @param {Object} [props.searchParams] - Parâmetros de pesquisa da URL.
 * @param {string} [props.searchParams.propertyId] - ID da propriedade a ser aberta inicialmente.
 * @param {string} [props.searchParams.mode] - Modo inicial de visualização (ex: "VIEW", "EDIT", "RULES").
 * @returns {JSX.Element} O layout da aplicação (`AppShell`) contendo a `PropertyView`.
 */
export default function Page({
  searchParams,
}: {
  searchParams?: { propertyId?: string; mode?: string }
}) {
  const propertyId = typeof searchParams?.propertyId === "string" ? searchParams.propertyId : undefined
  const modeRaw = typeof searchParams?.mode === "string" ? searchParams.mode : undefined

  const initialMode: EditMode | undefined =
    modeRaw === "EDIT" || modeRaw === "RULES" || modeRaw === "VIEW" ? (modeRaw as EditMode) : undefined

  return (
    <AppShell>
      <PropertyView initialPropertyId={propertyId} initialMode={initialMode} />
    </AppShell>
  )
}

