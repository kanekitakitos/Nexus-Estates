import { AppShell } from "@/components/layout/app-shell"
import { PropertyView } from "@/features/property"
import type { EditMode } from "@/features/property/sections/management/property-management-root"

/**
 * @route ´/properties´
 * @description Pagina onde um dono pode ver estatisticas sobre as suas propriedades
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

