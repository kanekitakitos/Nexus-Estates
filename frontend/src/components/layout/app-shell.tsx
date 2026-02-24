"use client"

import * as React from "react"
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

interface AppShellProps {
  children: React.ReactNode
  header?: React.ReactNode
}

function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="fixed inset-x-0 bottom-0 z-10 border-t-[2px] border-foreground/80 bg-secondary/95 backdrop-blur-sm supports-[backdrop-filter]:bg-secondary/60 lg:pl-[var(--sidebar-width)]">
      <div className="mx-auto flex h-auto min-h-[1.25rem] w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-2 text-[9px] sm:text-[10px] md:flex-row md:gap-4 md:px-6 md:py-1">
        <div className="inline-flex items-center gap-2 w-full justify-center md:w-auto md:justify-start">
          <span className="font-mono uppercase tracking-[0.18em] text-center md:text-left whitespace-normal break-words leading-tight">
            Copyright © {year} Nexus Estates
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-3 font-medium md:justify-end md:gap-4">
          <a href="/" className="cursor-pointer hover:underline hover:text-primary transition-colors">Home</a>
          <a href="/login" className="cursor-pointer hover:underline hover:text-primary transition-colors">Login</a>
          <a href="#" className="cursor-pointer hover:underline hover:text-primary transition-colors">About</a>
          <a href="#" className="cursor-pointer hover:underline hover:text-primary transition-colors">Bookings</a>
          <a href="#" className="cursor-pointer hover:underline hover:text-primary transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  )
}

export function AppShell({ children, header }: AppShellProps) {
  const [hideHeader, setHideHeader] = React.useState(false)

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
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <BrutalGridBackground />
      <AppSidebar className="z-30" />
      <SidebarInset className="bg-transparent">
        <header
          className={cn(
            "bg-background sticky top-0 z-20 flex shrink-0 items-center justify-between gap-2 border-b p-4 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.4,1)]",
            hideHeader && "-translate-y-full"
          )}
        >
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {header}
          </div>
          <AnimatedThemeToggler className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground/80 shadow-sm transition-colors hover:bg-primary/10 hover:text-primary" />
        </header>
        <div className="flex min-h-[calc(100vh-56px)] flex-1 flex-col pb-10">
          <div className="flex-1">{children}</div>
          <AppFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
