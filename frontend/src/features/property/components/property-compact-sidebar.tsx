"use client"

import * as React from "react"
import Link from "next/link"
import { BrutalButton } from "@/components/ui/forms/button"
import { PropertyListBars } from "@/features/property/views/PropertyList"
import type { OwnProperty } from "@/types"

export function PropertyCompactSidebar({
  isAuthenticated,
  isLoading,
  properties,
  onManage,
  onSelect,
}: {
  isAuthenticated: boolean
  isLoading: boolean
  properties: OwnProperty[]
  onManage: () => void
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-col p-3">
      {/* Ação principal: abrir Gestão de Ativos */}
      <BrutalButton
        className="w-full mb-3 cursor-pointer relative z-20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        onClick={onManage}
      >
        Gestão de Ativos //
      </BrutalButton>

      {/* Estado: não autenticado */}
      {!isAuthenticated ? (
        <div className="px-1 py-3">
          <div className="text-muted-foreground text-sm">
            <div className="mb-2">Precisa de iniciar sessão para ver as suas propriedades.</div>
            <Link href="/login" className="underline">Ir para Login</Link>
          </div>
        </div>
      ) : isLoading ? (
        /* Estado: loading */
        <div className="py-10 text-center">
          <span className="font-mono text-[10px] uppercase font-black opacity-50 animate-pulse">
            Syncing_Assets...
          </span>
        </div>
      ) : (
        /* Lista: quick access de propriedades */
        <PropertyListBars
          properties={properties}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}

