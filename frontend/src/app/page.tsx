"use client"

import { AppShell } from "@/components/layout/app-shell"
import { BookingView } from "@/components/layout/booking/booking-view"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/navigation/breadcrumb"

/**
 * @route ´/´
 * 
 * Ponto de entrada principal da aplicação
 * Fornece uma visualização de reservas (Bookings).
 * Configura a estrutura de navegação superior com Breadcrumbs para fornecer á `AppShell`.
 * * @notes Esta página é automaticamente envolvida pelo RootLayout (´layout.tsx´), herdando os contextos globais.
 */
export default function Home() {
  const header = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="#">Nexus Estates</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>Bookings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <AppShell header={header}>
      <BookingView />
    </AppShell>
  )
}
