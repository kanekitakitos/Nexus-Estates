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
import { PropertyEdit } from "@/components/layout/properti/v1/property-edit"
import { PropertyEdit2  } from "@/components/layout/properti/v2/property-edit2"
import { PropertyList  } from "@/components/layout/properti/v2/property-list"

import { BookingProperty } from "@/components/layout/booking/booking-card"

const prop : BookingProperty =     {
        id: "18",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    }


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
      <PropertyEdit2 property={prop} onBack={()=>{}} />
    </AppShell>
  )
}
