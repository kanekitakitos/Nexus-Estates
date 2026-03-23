/**
 * @description
 * Sidebar principal da aplicação com sistema de ícones + detalhes.
 * Implementa navegação filtrada por roles de utilizador, estado de colapso sincronizado e fornecimento a funcionalidades
 * 
 * @version 1.0
 */

"use client"

import * as React from "react"
import { Building2, Calendar, LayoutDashboard, MessageSquare } from "lucide-react"
import Link from "next/link"

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
import { BookingService, type BookingResponse } from "@/services/booking.service"

import { PropertyList, PropertyListBars } from "../properti/property-list"
import { MOCK_PROPERTIES } from "../properti/property-view"

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
    title: "Chat",
    url: "#",
    icon: MessageSquare,
    roles: ["ADMIN", "OWNER", "STAFF"],
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
  const [bookings, setBookings] = React.useState<BookingResponse[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = React.useState(false)

  // Estado real do utilizador vindo do localStorage
  const [currentUser, setCurrentUser] = React.useState({
    name: "Convidado",
    email: "guest@nexus-estates.com",
    avatar: "/avatars/guest.jpg",
    role: "GUEST" as UserRole,
    isAuthenticated: false,
  })

  const syncUserSession = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail')
      const token = localStorage.getItem('token')
      const roleRaw = localStorage.getItem('userRole')

      const normalizeRole = (value: string | null): UserRole => {
        const normalized = (value || "").replace(/^ROLE_/, "").toUpperCase()
        if (normalized === "ADMIN" || normalized === "OWNER" || normalized === "STAFF" || normalized === "GUEST") {
          return normalized as UserRole
        }
        return "GUEST"
      }
      
      if (email && token) {
        const role = normalizeRole(roleRaw)
        setCurrentUser({
          name: email.split('@')[0],
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: role,
          isAuthenticated: true,
        })
      } else {
        setCurrentUser({
          name: "Convidado",
          email: "guest@nexus-estates.com",
          avatar: "/avatars/guest.jpg",
          role: "GUEST",
          isAuthenticated: false,
        })
      }
    }
  }, [])

  React.useEffect(() => {
    syncUserSession()

    // Escuta mudanças no localStorage de outras abas ou do próprio AuthService
    window.addEventListener('storage', syncUserSession)
    
    // Custom event para quando o login acontece na mesma aba
    window.addEventListener('auth-change', syncUserSession)

    return () => {
      window.removeEventListener('storage', syncUserSession)
      window.removeEventListener('auth-change', syncUserSession)
    }
  }, [syncUserSession])

  React.useEffect(() => {
    const load = async () => {
      if (activeItem !== "Bookings") return
      if (!currentUser.isAuthenticated) return
      try {
        setIsLoadingBookings(true)
        const data = await BookingService.getMyBookings()
        setBookings(data)
      } finally {
        setIsLoadingBookings(false)
      }
    }

    load()
  }, [activeItem, currentUser.isAuthenticated])

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
                    <Link href="/">
                      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <Building2 className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Nexus Estates</span>
                        <span className="truncate text-xs">Property Management</span>
                      </div>
                    </Link>
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
                {activeItem}
              </div>
            </SidebarHeader>

            <SidebarContent className="p-0">
              {activeItem === "Chat" ? (
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
              ) 
              : activeItem === "Properties" ? (
                  <div key={selectedChatId} className="flex-1 h-[calc(100vh-56px)]">
                    <PropertyListBars propertys={MOCK_PROPERTIES} isExiting={true} animate={false} onSelect={()=>{}}/>
                  </div>
              )
              : activeItem === "Bookings" ? (
                <div className="h-[calc(100vh-56px)] overflow-y-auto p-4">
                  {!currentUser.isAuthenticated ? (
                    <div className="text-muted-foreground text-sm">
                      <div className="mb-2">Precisa de iniciar sessão para ver as suas reservas.</div>
                      <Link href="/login" className="underline">Ir para Login</Link>
                    </div>
                  ) : isLoadingBookings ? (
                    <div className="text-muted-foreground text-sm">A carregar reservas…</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-muted-foreground text-sm">Ainda não tem reservas.</div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b) => (
                        <div key={b.id} className="rounded-lg border p-3 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">Reserva #{b.id}</div>
                            <div className="text-xs text-muted-foreground">{b.status}</div>
                          </div>
                          <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                            <div>Property: {b.propertyId}</div>
                            <div>{b.checkInDate} → {b.checkOutDate}</div>
                            <div>Total: {b.totalPrice} {b.currency}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
