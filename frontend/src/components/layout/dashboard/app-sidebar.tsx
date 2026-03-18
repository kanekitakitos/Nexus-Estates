/**
 * @description
 * Sidebar principal da aplicação com sistema de ícones + detalhes.
 * Implementa navegação filtrada por roles de utilizador, estado de colapso sincronizado e fornecimento a funcionalidades
 * 
 * @version 1.0
 */

"use client"

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
import { useChatStrategy } from "@/features/chat/ChatProvider"


type UserRole = "ADMIN" | "GUEST" | "OWNER" | "STAFF"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "OWNER", "STAFF"],
  },
  {
    title: "Properties",
    url: "/",
    icon: Building2,
    roles: ["ADMIN", "GUEST", "OWNER", "STAFF"],
  },
  {
    title: "Bookings",
    url: "#",
    icon: Calendar,
    roles: ["ADMIN", "GUEST", "OWNER", "STAFF"],
  },
  {
    title: "Clients",
    url: "#",
    icon: Users,
    roles: ["ADMIN", "OWNER"],
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    roles: ["ADMIN", "OWNER"],
  },
]

/**
 * 
 * SideBar colapsavel com sistema de duplo painel.
 * 1. Painel Primario: Fornece navegação por ícons selecionaveis e um perfil de utilizador
 * 2. Painel de Detalhes: Conteodo dinamico, basedo no item selecionado.
 * 
 * @param props - caracteristicas para dar para a side bar
 * @returns JSX.Element
 */
export function AppSidebar({
                             ...props
                           }: React.ComponentProps<typeof Sidebar>) {

  const { setOpen, state } = useSidebar()
  const [activeItem, setActiveItem] = React.useState("Bookings")
  const chatStrategy = useChatStrategy()
  const ChatList = chatStrategy.ChatList
  const ChatWindow = chatStrategy.ChatWindow
  const [selectedChatId, setSelectedChatId] = React.useState<string | undefined>(undefined)

  // Estado real do utilizador vindo do localStorage
  const [currentUser, setCurrentUser] = React.useState({
    name: "Convidado",
    email: "guest@nexus-estates.com",
    avatar: "/avatars/guest.jpg",
    role: "GUEST" as UserRole,
  })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail')
      const role = localStorage.getItem('userRole') as UserRole
      
      if (email && role) {
        setCurrentUser({
          name: email.split('@')[0], // Nome simplificado a partir do email
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: role
        })
      }
    }
  }, [])

  const filteredNavMain = menuItems.filter((item) =>
      item.roles.includes(currentUser.role)
  )

  return (
      <Sidebar
          collapsible="icon"
          className="overflow-hidden"
          {...props}
      >

        <div className="flex h-full w-full flex-row">

          {/* Painel 1: Menu Primário (Ícones) */}
          <Sidebar
              collapsible="none"
              className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r bg-sidebar"
          >
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                    <a href="/">
                      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <Building2 className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Nexus Estates</span>
                        <span className="truncate text-xs">Property Management</span>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent className="px-1 md:px-0">
                  <SidebarMenu>
                    {filteredNavMain.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                              onClick={() => {
                                setActiveItem(item.title)
                                setOpen(true)
                                if (item.url !== "#") window.location.href = item.url
                              }}
                              isActive={activeItem === item.title}
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

          {/* Painel 2: Detalhes (inclui lista de chats e janela do chat) */}
          {/* Nota: a própria janela do chat inclui o seu header com seta de voltar */}
          <Sidebar
              collapsible="none"
              className={`flex-1 transition-opacity duration-100 ${state === "collapsed" ? "hidden opacity-0" : "flex opacity-100"}`}
          >
            <SidebarHeader className="border-b p-3 h-[56px] flex items-center gap-2">
              <div className="text-foreground text-base font-medium">
                {activeItem === "Clients" ? "Clients" : activeItem}
              </div>
            </SidebarHeader>

            <SidebarContent className="p-0">
              {activeItem === "Clients" ? (
                <>
                  {!selectedChatId ? (
                    <div className="h-[calc(100vh-56px)] overflow-y-auto animate-slide-in-left">
                      <ChatList
                        onSelectChat={setSelectedChatId}
                        selectedChatId={selectedChatId}
                      />
                    </div>
                  ) : (
                    <div key={selectedChatId} className="flex-1 h-[calc(100vh-56px)] overflow-hidden animate-slide-in-right">
                      <ChatWindow chatId={selectedChatId} onBack={() => setSelectedChatId(undefined)} />
                    </div>
                  )}
                </>
              ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center p-4 text-sm">
                    Conteúdo de {activeItem}
                  </div>
              )}
            </SidebarContent>
          </Sidebar>

        </div>
      </Sidebar>
  )
}
