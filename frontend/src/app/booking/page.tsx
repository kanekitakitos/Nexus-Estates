"use client"

import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { BookingView } from "@/features/bookings/booking-view"
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
          <BreadcrumbLink asChild>
            <Link href="/">Nexus Estates</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <Link href="/dashboard">
            <BreadcrumbPage className="cursor-pointer hover:text-primary transition-colors">
              Dashboard
            </BreadcrumbPage>
          </Link>
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
