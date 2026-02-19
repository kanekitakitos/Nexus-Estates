"use client"

import * as React from "react"
import { Building2, Calendar, LayoutDashboard, Settings, Users } from "lucide-react"

import { NavUser } from "@/components/layout/dashboard/nav-user"
import { Label } from "@/components/ui/forms/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/layout/sidebar"
import { Switch } from "@/components/ui/forms/switch"

// User Roles
type UserRole = "ADMIN" | "GUEST"

// Current User State (Mock - replace with real auth context later)
const currentUser = {
  name: "Admin User",
  email: "admin@nexus-estates.com",
  avatar: "/avatars/shadcn.jpg",
  role: "GUEST" as UserRole, // Change to "GUEST" to test guest view
}

// Menu Items Configuration
const menuItems = [
  {
    title: "Dashboard",
    url: "#",
    icon: LayoutDashboard,
    roles: ["ADMIN", "GUEST"],
  },
  {
    title: "Properties",
    url: "#",
    icon: Building2,
    roles: ["ADMIN", "GUEST"],
  },
  {
    title: "Bookings",
    url: "#",
    icon: Calendar,
    roles: ["ADMIN", "GUEST"],
  },
  {
    title: "Clients",
    url: "#",
    icon: Users,
    roles: ["ADMIN"], // Admin only
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    roles: ["ADMIN"], // Admin only
  },
]

// Mock Data
const mockData = {
  properties: [
    {
      id: "1",
      title: "Luxury Villa in Bali",
      subtitle: "Ubud, Bali, Indonesia",
      status: "Active",
      price: "$350/night",
      details: "4 Guests • 2 Bedrooms • Pool",
    },
    {
      id: "2",
      title: "Modern Apartment",
      subtitle: "New York, USA",
      status: "Booked",
      price: "$200/night",
      details: "2 Guests • 1 Bedroom • WiFi",
    },
    {
      id: "3",
      title: "Cozy Cottage",
      subtitle: "Cotswolds, UK",
      status: "Active",
      price: "$150/night",
      details: "3 Guests • 2 Bedrooms • Fireplace",
    },
    {
      id: "4",
      title: "Beachfront Condo",
      subtitle: "Miami, USA",
      status: "Maintenance",
      price: "$300/night",
      details: "4 Guests • 2 Bedrooms • Ocean View",
    },
    {
      id: "5",
      title: "Mountain Cabin",
      subtitle: "Aspen, USA",
      status: "Active",
      price: "$400/night",
      details: "6 Guests • 3 Bedrooms • Hot Tub",
    },
  ],
  bookings: [
    {
      id: "101",
      title: "Luxury Villa in Bali",
      subtitle: "Guest: John Doe",
      status: "Confirmed",
      price: "$1,400",
      details: "Check-in: Oct 12 • 4 Nights",
    },
    {
      id: "102",
      title: "Modern Apartment",
      subtitle: "Guest: Jane Smith",
      status: "Pending",
      price: "$600",
      details: "Check-in: Nov 01 • 3 Nights",
    },
    {
      id: "103",
      title: "Mountain Cabin",
      subtitle: "Guest: Robert Brown",
      status: "Completed",
      price: "$2,000",
      details: "Check-in: Sep 15 • 5 Nights",
    },
  ],
  clients: [
    {
      id: "201",
      title: "John Doe",
      subtitle: "john.doe@example.com",
      status: "Guest",
      price: "5 Bookings",
      details: "Member since 2023",
    },
    {
      id: "202",
      title: "Jane Smith",
      subtitle: "jane.smith@example.com",
      status: "Guest",
      price: "2 Bookings",
      details: "Member since 2024",
    },
    {
      id: "203",
      title: "Robert Brown",
      subtitle: "robert.b@example.com",
      status: "VIP",
      price: "12 Bookings",
      details: "Member since 2022",
    },
  ],
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Filter menu items based on user role
  const filteredNavMain = menuItems.filter((item) =>
    item.roles.includes(currentUser.role)
  )

  const [activeItem, setActiveItem] = React.useState(filteredNavMain[0])
  const [items, setItems] = React.useState(mockData.properties)
  const { setOpen } = useSidebar()

  // Update list content based on selected nav item
  React.useEffect(() => {
    switch (activeItem.title) {
      case "Properties":
        setItems(mockData.properties)
        break
      case "Bookings":
        // For guests, we might want to show only their bookings in real app
        setItems(mockData.bookings)
        break
      case "Clients":
        if (currentUser.role === "ADMIN") {
          setItems(mockData.clients)
        }
        break
      default:
        setItems([])
        break
    }
  }, [activeItem])

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Nexus</span>
                    <span className="truncate text-xs">Estates</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {filteredNavMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={currentUser} />
        </SidebarFooter>
      </Sidebar>

      {/* Secondary Sidebar - Content List */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Filter</span>
              <Switch className="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {items.length > 0 ? (
                items.map((item) => (
                  <a
                    href="#"
                    key={item.id}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      <span className="ml-auto text-xs">{item.price}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    <div className="flex w-full items-center gap-2 mt-1">
                       <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                        {item.status}
                      </span>
                      <span className="ml-auto text-xs truncate max-w-[150px]">
                        {item.details}
                      </span>
                    </div>
                  </a>
                ))
              ) : (
                 <div className="p-4 text-sm text-muted-foreground text-center">
                    Select a category to view items
                 </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
