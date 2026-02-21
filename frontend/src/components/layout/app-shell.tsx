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
    <footer className="fixed inset-x-0 bottom-0 z-10 border-t-[2px] border-foreground/80 bg-secondary/95">
      <div className="mx-auto flex h-5 max-w-6xl items-center justify-between gap-2 px-4 text-[10px]">
        <div className="inline-flex items-center gap-2">
          <span className="font-mono uppercase tracking-[0.18em]">
            Copyright © {year} Nexus Estates
          </span>
        </div>
        <nav className="flex items-center gap-2 text-[9px] font-medium">
          <span className="cursor-pointer hover:underline">Home</span>
          <span className="cursor-pointer hover:underline">
            <a href="/login">Login</a>
          </span>
          <span className="cursor-pointer hover:underline">About</span>
          <span className="cursor-pointer hover:underline">Bookings</span>
          <span className="cursor-pointer hover:underline">Contact</span>
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
