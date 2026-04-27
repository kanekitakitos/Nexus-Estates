import { AppShell } from "@/components/layout/app-shell"
import {DashBoardView} from "@/features/dashboard/dash-board-view";

/**
 * @route ´/dashboard´
 * @description Pagina onde um dono pode ver estatisticas sobre as suas propriedades
 */
export default function Page() {
  return (
    <AppShell>
        <DashBoardView/>
    </AppShell>
  )
}

