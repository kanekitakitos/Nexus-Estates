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

interface AppShellProps {
  children: React.ReactNode
  header?: React.ReactNode
  showHeader?: boolean
}

function AppHeaderNav({ pathname }: { pathname: string }) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/properties", label: "Properties" },
    { href: "/booking", label: "Booking" },
    { href: "/login", label: "Login" },

  ]

  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md px-3 py-2 shadow-sm">
      <span className="font-mono uppercase tracking-[0.18em] text-[10px] sm:text-xs font-semibold">
        Nexus Estates
      </span>
      <span className="h-4 w-px bg-border" />
      <nav className="flex items-center gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:bg-primary/10 hover:text-primary",
                isActive && "bg-primary/15 text-primary shadow-sm"
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 lg:pl-[var(--sidebar-width)]">
      <div className="mx-auto flex h-auto min-h-[1.25rem] w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 text-[10px] sm:text-xs md:flex-row md:gap-4 md:px-6 md:py-2">
        <div className="inline-flex items-center gap-2 w-full justify-center md:w-auto md:justify-start">
          <span className="font-mono uppercase tracking-[0.1em] text-center md:text-left text-muted-foreground">
            Copyright © {year} Nexus Estates
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 font-medium md:justify-end md:gap-6 text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
          <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
        </nav>
      </div>
    </footer>
  )
}

export function AppShell({ children, header, showHeader = true }: AppShellProps) {
  const [hideHeader, setHideHeader] = React.useState(false)
  const [isDark, setIsDark] = React.useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

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
                  {header ?? <AppHeaderNav pathname={pathname} />}
                </div>
              ) : (
                <>
                  <div className="flex flex-1 items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                    {header ?? <AppHeaderNav pathname={pathname} />}
                  </div>
                  <AnimatedThemeToggler className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card/60 backdrop-blur-sm text-foreground/80 shadow-sm transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/50" />
                </>
              ))}
          </header>
          <div className="flex min-h-[calc(100vh-56px)] flex-1 flex-col pb-10">
            <div className="flex-1">
              {children}
            </div>
            <AppFooter />
          </div>
        </SidebarInset>
      </ClickSpark>
    </SidebarProvider>
  )
}