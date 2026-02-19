"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar"
import { Separator } from "@/components/ui/layout/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/layout/sidebar"

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
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          {header}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
