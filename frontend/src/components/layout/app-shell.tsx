"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar"
import { Separator } from "@/components/ui/layout/separator"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/layout/sidebar"
import { BrutalGridBackground } from "@/components/ui/layout/brutal-grid-background"
import { cn } from "@/lib/utils"
import ClickSpark from "@/components/ClickSpark"
import { LogOut, User, LayoutDashboard } from "lucide-react"
import { AuthService } from "@/services/auth.service"

interface AppShellProps {
  children: React.ReactNode
  header?: React.ReactNode
  showHeader?: boolean
}

function AppHeaderNav({ pathname, isAuthenticated }: { pathname: string; isAuthenticated: boolean }) {
  const links = [
    { href: "/", label: "Home" },
    ...(isAuthenticated ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    { href: "/properties", label: "Properties" },
    { href: "/booking", label: "Booking" },
    ...(!isAuthenticated ? [{ href: "/login", label: "Login" }] : []),
  ]

  const handleLogout = () => {
    AuthService.logout()
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md px-2 py-1.5 sm:px-3 sm:py-2 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] transition-all hover:shadow-[6px_6px_0px_rgba(0,0,0,0.15)]">
      <span className="font-mono uppercase tracking-[0.18em] text-[10px] sm:text-xs font-bold px-1">
        Nexus Estates
      </span>
      <span className="h-4 w-px bg-border/50 mx-1" />
      <nav className="flex items-center gap-0.5 sm:gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all hover:bg-primary/10 hover:text-primary whitespace-nowrap",
                isActive && "bg-primary/20 text-primary shadow-[2px_2px_0px_rgba(0,0,0,0.05)]"
              )}
            >
              {link.label}
            </Link>
          )
        })}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="group ml-1 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground hover:rotate-12"
            title="Logout"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        )}
      </nav>
    </div>
  )
}

function AppFooter({ isAuthenticated }: { isAuthenticated: boolean }) {
  const year = new Date().getFullYear()

  return (
    <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 lg:pl-[var(--sidebar-width)]">
      <div className="mx-auto flex h-auto min-h-[1.25rem] w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 text-[10px] sm:text-xs md:flex-row md:gap-4 md:px-6 md:py-2">
        <div className="inline-flex items-center gap-2 w-full justify-center md:w-auto md:justify-start">
          <span className="font-mono uppercase tracking-[0.1em] text-center md:text-left text-muted-foreground font-medium">
            Copyright © {year} Nexus Estates
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 font-bold md:justify-end md:gap-6 text-muted-foreground/80">
          <Link href="/" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Home</Link>
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Login</Link>
              <Link href="/register" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Register</Link>
            </>
          ) : (
            <Link href="/dashboard" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Dashboard</Link>
          )}
        </nav>
      </div>
    </footer>
  )
}

export function AppShell({ children, header, showHeader = true }: AppShellProps) {
  const [hideHeader, setHideHeader] = React.useState(false)
  const [isDark, setIsDark] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  const syncAuth = React.useCallback(() => {
    const session = AuthService.getSession()
    setIsAuthenticated(session.isAuthenticated)
  }, [])

  React.useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const currentY = window.scrollY
      const goingDown = currentY > lastY && currentY > 40
      const goingUp = currentY < lastY

      if (goingDown) {
        setHideHeader(true)
      } else if (goingUp || currentY <= 40) {
        setHideHeader(false)
      }
      lastY = currentY
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    syncAuth()
    return AuthService.subscribeSession(syncAuth)
  }, [syncAuth])

  return (
    <SidebarProvider
      defaultOpen={false}
      style={{ "--sidebar-width": "350px" } as React.CSSProperties}
    >
      <BrutalGridBackground defaultVariant="terminal-logs" />
      {!isHome && <AppSidebar className="z-30" />}
      <ClickSpark sparkColor={isDark ? "#fff" : "#000"}>
        <SidebarInset className="bg-transparent">
          <header
            className={cn(
              "bg-background/80 backdrop-blur-md sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b border-border/50 p-4 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.4,1)]",
              hideHeader && "-translate-y-full",
              isHome ? "justify-center" : "justify-between"
            )}
          >
            {showHeader &&
              (isHome ? (
                <div className="flex items-center justify-center">
                  {header ?? <AppHeaderNav pathname={pathname} isAuthenticated={isAuthenticated} />}
                </div>
              ) : (
                <>
                  <div className="flex flex-1 items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                    {header ?? <AppHeaderNav pathname={pathname} isAuthenticated={isAuthenticated} />}
                  </div>
                  <AnimatedThemeToggler className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card/60 backdrop-blur-sm text-foreground/80 shadow-sm transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/50" />
                </>
              ))}
          </header>
          <div className="flex min-h-[calc(100vh-56px)] flex-1 flex-col pb-10">
            <div className="flex-1">
              {children}
            </div>
            <AppFooter isAuthenticated={isAuthenticated} />
          </div>
        </SidebarInset>
      </ClickSpark>
    </SidebarProvider>
  )
}
