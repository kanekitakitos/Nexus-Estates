"use client"

import { AppShell } from "@/components/layout/app-shell"
import { BookingView } from "@/features/bookings"

/**
 * @route ´/booking´
 *
 * Ponto de entrada principal da aplicação
 * Fornece uma visualização de reservas (Bookings).
 * Configura a estrutura de navegação superior com Breadcrumbs para fornecer á `AppShell`.
 * @notes Esta página é automaticamente envolvida pelo RootLayout (´layout.tsx´), herdando os contextos globais.
 */
export default function Home() {
  return (
    <AppShell>
      <BookingView />
    </AppShell>
  )
}
