/**
 * @description Implementa a secção de perfil do utilizador para a Sidebar.
 * 
 * @version 1.0
 */

"use client"

import {
  BadgeCheck,
  ChevronsUpDown,
  KeyRound,
  LogIn,
  LogOut,
} from "lucide-react"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/data-display/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/layout/sidebar"
import { AuthService } from "@/services/auth.service"

/**
 * Componete da sideBar, onde o utilizador, pode gerir a sua conta, ou entrar numa.
 * 
 * Fornece 2 estados
 * 1. GUEST - um utilizador que não está a usar uma conta.
 * Fornece uma atalho para a pagina de login
 * 
 * 2. ADMIN/OWNER/STAFF - um utilizador com conta iniciada
 * Fornece um dropDown menu, com a opção de aceder a mais detalhes da conta, ou terminar a sessão
 * 
 * @param user - dados do utilizador 
 * @returns JSX.Element
 */
export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    role: "ADMIN" | "GUEST" | "OWNER" | "STAFF"
    isAuthenticated: boolean
  }
}) {
  const { isMobile } = useSidebar()

  const handleLogout = () => {
    AuthService.logout();
  }

  if (!user.isAuthenticated) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
            <Link href="/login">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LogIn className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Log in</span>
                <span className="truncate text-xs">Access your account</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // interface para uma conta de admin
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                <Link href="/profile" className="flex-1">
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <KeyRound />
                <Link href="/profile#apis" className="flex-1">
                  APIs
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
  )
}
