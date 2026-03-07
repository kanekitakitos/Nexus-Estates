"use client"

import { AppShell } from "@/components/layout/app-shell"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/navigation/breadcrumb"

import { PropertyView } from "@/components/layout/properti/property-view"


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
      <PropertyView />
    </AppShell>
  )
}
