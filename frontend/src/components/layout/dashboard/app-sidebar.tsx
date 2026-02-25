import * as React from "react"
import { Building2, Calendar, LayoutDashboard, Settings, Users } from "lucide-react"

import { NavUser } from "@/components/layout/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/layout/sidebar"

type UserRole = "ADMIN" | "GUEST"

const currentUser = {
  name: "Admin User",
  email: "admin@nexus-estates.com",
  avatar: "/avatars/shadcn.jpg",
  role: "ADMIN" as UserRole,
}

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
    roles: ["ADMIN"],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    roles: ["ADMIN"],
  },
]

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const filteredNavMain = menuItems.filter((item) =>
    item.roles.includes(currentUser.role)
  )

  const { setOpen } = useSidebar()

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
                      onClick={() => {
                        setOpen(true)
                      }}
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
    </Sidebar>
  )
}
