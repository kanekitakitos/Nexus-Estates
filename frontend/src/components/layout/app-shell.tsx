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

interface AppShellProps {
  children: React.ReactNode
  header?: React.ReactNode
}

export function AppShell({ children, header }: AppShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <BrutalGridBackground />
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
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
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
