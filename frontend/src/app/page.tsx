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
import {useView, ViewProvider} from "@/features/view-context"
import {PropertyView} from "@/components/layout/properti/property-view";


/**
 * @route ´/´
 * 
 * Ponto de entrada principal da aplicação
 * Fornece uma visualização de reservas (Bookings).
 * Configura a estrutura de navegação superior com Breadcrumbs para fornecer á `AppShell`.
 * * @notes Esta página é automaticamente envolvida pelo RootLayout (´layout.tsx´), herdando os contextos globais.
 */
export default function Home() {
  const { view } = useView()

  const getView = () => {
    switch (view) {
      case "booking": return <BookingView key="booking" />
      case "properties": return <PropertyView key="properties" />
    }
  }


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

  // ViewProvider permite que todos os elementos dentro dele possam alterar a view que está ativa
  return (
    <AppShell header={header}>
      {getView()}
    </AppShell>
  )
}