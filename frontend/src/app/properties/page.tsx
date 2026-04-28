import { AppShell } from "@/components/layout/app-shell"
import { PropertyView } from "@/features/property"

/**
 * @route ´/properties´
 * @description Pagina onde um dono pode ver estatisticas sobre as suas propriedades
 */
export default function Page() {
    return (
        <AppShell>
            <PropertyView/>
        </AppShell>
    )
}

