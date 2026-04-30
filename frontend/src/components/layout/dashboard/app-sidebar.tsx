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
import { usePathname, useRouter } from "next/navigation"
import { useView } from "@/providers/view-context"

import { NavUser } from "@/components/layout/dashboard/nav-user"
import { motion } from "framer-motion"
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
import { BookingService, type BookingResponse } from "@/services/booking.service"
import { notify } from "@/lib/notify"

import { BookingCompactSidebar } from "@/features/bookings"
import { PropertyCompactSidebar } from "@/features/property"
import { ChatCompactSidebar } from "@/features/chat"
import { OwnProperty } from "@/types"
import { PropertyService } from "@/services/property.service"
import { AuthService } from "@/services/auth.service"
import { mapPropertyRecordToOwnProperty } from "@/features/property/lib/property-utils"

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
    url: "#",
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
    roles: ["ADMIN", "GUEST", "OWNER", "STAFF"],
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

  const router = useRouter()
  const pathname = usePathname()
  const { setOpen, state } = useSidebar()
  const [activeItem, setActiveItem] = React.useState("Bookings")
  const [myBookings, setMyBookings] = React.useState<BookingResponse[]>([])
  const [propertyBookings, setPropertyBookings] = React.useState<BookingResponse[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = React.useState(false)
  const [properties, setProperties] = React.useState<OwnProperty[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = React.useState(false)
  // Permite abrir diretamente uma conversa específica (ex.: inquiry) quando o fluxo é iniciado fora do painel "Chat".
  const [chatLaunch, setChatLaunch] = React.useState<{ chatId?: string; nonce: number }>({ chatId: undefined, nonce: 0 })

  // Estado real do utilizador vindo do localStorage
  const [currentUser, setCurrentUser] = React.useState({
    name: "Convidado",
    email: "guest@nexus-estates.com",
    avatar: "/avatars/guest.jpg",
    role: "GUEST" as UserRole,
    isAuthenticated: false,
  })

  const syncUserSession = React.useCallback(() => {
    const session = AuthService.getSession()
    const email = session.email || null
    const token = session.token || null
    const roleRaw = session.role || null

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
    /**
     * Evento global: utilizado para flows cross-feature (ex.: BookingDetails → "Contactar proprietário").
     *
     * Payload esperado:
     * - detail.chatId (ex.: "inquiry:123" ou "booking:456")
     */
    const onOpenChat = (ev: Event) => {
      const custom = ev as CustomEvent<{ chatId?: string }>
      const nextChatId = custom.detail?.chatId
      setActiveItem("Chat")
      setChatLaunch((prev) => ({ chatId: nextChatId, nonce: prev.nonce + 1 }))
      setOpen(true)
    }

    window.addEventListener("open-chat", onOpenChat as EventListener)
    return () => window.removeEventListener("open-chat", onOpenChat as EventListener)
  }, [setOpen])

  React.useEffect(() => {
    const load = async () => {
      if (activeItem !== "Bookings") return
      if (!currentUser.isAuthenticated) return
      try {
        setIsLoadingBookings(true)
        const minePromise = BookingService.getMyBookings().catch(() => [])

        const role = currentUser.role
        const canSeePropertyBookings = role === "OWNER" || role === "ADMIN" || role === "STAFF"
        let nextProperties = properties

        if (canSeePropertyBookings && nextProperties.length === 0) {
          try {
            const page = await PropertyService.listMine({ page: 0, size: 25, sort: "name,asc" })
            const mapped: OwnProperty[] = page.content.map((p) => {
              const base = mapPropertyRecordToOwnProperty(p as unknown as Record<string, unknown>)
              return {
                ...base,
                description: "",
                imageUrl: "",
                tags: [],
                amenityIds: [],
              }
            })
            setProperties(mapped)
            nextProperties = mapped
          } catch {
            nextProperties = []
          }
        }

        const propertyIds = canSeePropertyBookings
          ? nextProperties
              .map((p) => {
                const n = Number(p.id)
                return Number.isNaN(n) ? null : n
              })
              .filter((n): n is number => typeof n === "number")
          : []

        const propertyBookingsPromise = canSeePropertyBookings
          ? Promise.all(
              propertyIds.map((id) => BookingService.getBookingsByProperty(id, { silent: true }).catch(() => [])),
            ).then((chunks) =>
              chunks.flat(),
            )
          : Promise.resolve([])

        const [mine, owned] = await Promise.all([minePromise, propertyBookingsPromise])

        const sortDesc = (items: BookingResponse[]) =>
          [...items].sort((a, b) => (b.checkInDate || "").localeCompare(a.checkInDate || ""))

        setMyBookings(sortDesc(mine))

        const byId = new Map<number, BookingResponse>()
        for (const b of owned) {
          if (typeof b?.id === "number") byId.set(b.id, b)
        }
        setPropertyBookings(sortDesc(Array.from(byId.values())))
      } finally {
        setIsLoadingBookings(false)
      }
    }

    load()
  }, [activeItem, currentUser.isAuthenticated, currentUser.role, properties])

  React.useEffect(() => {
    const load = async () => {
      if (activeItem !== "Properties") return
      if (!currentUser.isAuthenticated) { setProperties([]); return }
      try {
        setIsLoadingProperties(true)
        const page = await PropertyService.listMine({ page: 0, size: 25, sort: "name,asc" })
        const mapped: OwnProperty[] = page.content.map((p) => {
          const base = mapPropertyRecordToOwnProperty(p as unknown as Record<string, unknown>)
          return {
            ...base,
            description: "",
            imageUrl: "",
            tags: [],
            amenityIds: [],
          }
        })
        setProperties(mapped)
      } catch (err) {
        console.error(err)
        setProperties([])
        notify.error("Não foi possível carregar as tuas propriedades.")
      } finally {
        setIsLoadingProperties(false)
      }
    }

    load()
  }, [activeItem, currentUser.isAuthenticated])

  const filteredNavMain = menuItems.filter((item) =>
      item.roles.includes(currentUser.role)
  )

  const { setView, selectPropertyId } = useView()

  return (
      <Sidebar
          collapsible="icon"
          className="overflow-hidden border-r-2 border-foreground shadow-[10px_0_0_0_#0D0D0D] dark:shadow-[10px_0_0_0_rgba(0,0,0,0.5)] bg-transparent"
          {...props}
      >
        <SidebarBackground />

        <div className="flex h-full w-full flex-row">

          {/* Painel 1: Menu Primário (Ícones) */}
          <Sidebar
              collapsible="none"
              className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r-2 border-foreground bg-white/20 dark:bg-black/20 backdrop-blur-md"
          >
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0" onClick={()=>setView("booking")}>
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
                              onDoubleClick={
                                item.title === "Properties" ? ()=>setView("properties") :
                                item.title === "Bookings" ? ()=>setView("booking") :
                                // sem evento
                                ()=>{}
                              }

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
          <Sidebar
              collapsible="none"
              className={`flex-1 transition-opacity duration-100 bg-white/10 dark:bg-black/10 backdrop-blur-md ${state === "collapsed" ? "hidden opacity-0" : "flex opacity-100"}`}
          >
            <SidebarHeader className="border-b-2 border-foreground/10 p-4 h-[64px] flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <div className="text-foreground text-sm font-black font-mono uppercase tracking-[0.2em] italic">
                {activeItem}
              </div>
            </SidebarHeader>

            <SidebarContent className="p-0">
              {activeItem === "Chat" ? (
                <>
                  {/* Painel: Chat */}
                  <ChatCompactSidebar initialChatId={chatLaunch.chatId} launchNonce={chatLaunch.nonce} />
                </>
              ) : activeItem === "Properties" ? (
                <>
                  {/* Painel: Properties */}
                  <PropertyCompactSidebar
                    isAuthenticated={currentUser.isAuthenticated}
                    isLoading={isLoadingProperties}
                    properties={properties}
                    onManage={() => {
                      setView("properties")
                      selectPropertyId(null)
                      if (pathname !== "/properties") router.push("/properties")
                    }}
                    onSelect={(id) => {
                      setView("properties")
                      selectPropertyId(id)
                      if (pathname !== "/properties") router.push("/properties")
                    }}
                  />
                </>
              ) : activeItem === "Bookings" ? (
                <>
                  {/* Painel: Bookings */}
                  <BookingCompactSidebar
                    isAuthenticated={currentUser.isAuthenticated}
                    role={currentUser.role}
                    isLoading={isLoadingBookings}
                    myBookings={myBookings}
                    propertyBookings={propertyBookings}
                  />
                </>
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center p-4 text-sm">
                  {/* Estado default */}
                  Conteúdo de {activeItem}
                </div>
              )}
            </SidebarContent>
          </Sidebar>

        </div>
      </Sidebar>
  )
}

function SidebarBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-0 w-32 h-32 rounded-full bg-foreground/5 blur-3xl dark:bg-white/5"
      />
    </div>
  )
}
