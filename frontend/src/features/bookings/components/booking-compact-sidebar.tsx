"use client"

import * as React from "react"
import Link from "next/link"
import type { BookingResponse } from "@/services/booking.service"

type UserRole = "ADMIN" | "GUEST" | "OWNER" | "STAFF"

export function BookingCompactSidebar({
  isAuthenticated,
  role,
  isLoading,
  myBookings,
  propertyBookings,
}: {
  isAuthenticated: boolean
  role: UserRole
  isLoading: boolean
  myBookings: BookingResponse[]
  propertyBookings: BookingResponse[]
}) {
  const canSeePropertyBookings = role === "OWNER" || role === "ADMIN" || role === "STAFF"

  const [scope, setScope] = React.useState<"mine" | "properties">("mine")
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<"ALL" | BookingResponse["status"]>("ALL")
  const [when, setWhen] = React.useState<"all" | "upcoming" | "past">("all")

  React.useEffect(() => {
    if (!isAuthenticated) {
      setScope("mine")
      return
    }
    if (canSeePropertyBookings) setScope("properties")
    else setScope("mine")
  }, [isAuthenticated, canSeePropertyBookings])

  const filtered = React.useMemo(() => {
    const scoped = scope === "properties" ? propertyBookings : myBookings
    const q = query.trim().toLowerCase()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const whenOk = (checkInDate: string) => {
      if (when === "all") return true
      const d = new Date(checkInDate)
      if (Number.isNaN(d.getTime())) return true
      d.setHours(0, 0, 0, 0)
      if (when === "upcoming") return d >= today
      return d < today
    }

    const statusOk = (s: BookingResponse["status"]) => (status === "ALL" ? true : s === status)

    if (!q && status === "ALL" && when === "all") return scoped

    return scoped.filter((b) => {
      if (!statusOk(b.status)) return false
      if (!whenOk(b.checkInDate)) return false
      if (!q) return true
      const hay = `${b.id} ${b.propertyId} ${b.status} ${b.currency} ${b.totalPrice}`.toLowerCase()
      return hay.includes(q)
    })
  }, [myBookings, propertyBookings, query, scope, status, when])

  const clear = React.useCallback(() => {
    setQuery("")
    setStatus("ALL")
    setWhen("all")
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground text-sm">
          <div className="mb-2">Precisa de iniciar sessão para ver as suas reservas.</div>
          <Link href="/login" className="underline">Ir para Login</Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground text-sm">A carregar reservas…</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="space-y-3">
        {canSeePropertyBookings && <BookingScopeToggle scope={scope} onChange={setScope} />}
        <BookingFilterBar
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          when={when}
          onWhenChange={setWhen}
          onClear={clear}
        />
        <BookingCards bookings={filtered} />
      </div>
    </div>
  )
}

function BookingScopeToggle({
  scope,
  onChange,
}: {
  scope: "mine" | "properties"
  onChange: (scope: "mine" | "properties") => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange("properties")}
        className={`h-9 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          scope === "properties"
            ? "bg-black text-white border-black"
            : "bg-white text-black/70 border-black hover:bg-black hover:text-white"
        }`}
      >
        Das Propriedades
      </button>
      <button
        type="button"
        onClick={() => onChange("mine")}
        className={`h-9 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          scope === "mine"
            ? "bg-black text-white border-black"
            : "bg-white text-black/70 border-black hover:bg-black hover:text-white"
        }`}
      >
        Minhas
      </button>
    </div>
  )
}

function BookingFilterBar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  when,
  onWhenChange,
  onClear,
}: {
  query: string
  onQueryChange: (value: string) => void
  status: "ALL" | BookingResponse["status"]
  onStatusChange: (value: "ALL" | BookingResponse["status"]) => void
  when: "all" | "upcoming" | "past"
  onWhenChange: (value: "all" | "upcoming" | "past") => void
  onClear: () => void
}) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000] space-y-3">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Pesquisar (ID, propriedade, estado, ...)"
        className="h-10 w-full rounded-xl border-2 border-black bg-white px-3 text-[12px] font-mono text-black placeholder:text-black/40 outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          title="Filtrar por estado"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as typeof status)}
          className="h-10 rounded-xl border-2 border-black bg-white px-3 text-[10px] font-black uppercase tracking-widest text-black outline-none"
        >
          <option value="ALL">Todos os estados</option>
          <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>

        <BookingWhenToggle value={when} onChange={onWhenChange} />

        <button
          type="button"
          onClick={onClear}
          className="ml-auto h-10 px-3 rounded-xl border-2 border-black bg-white text-[10px] font-black uppercase tracking-widest text-black/70 hover:bg-black hover:text-white transition-colors"
        >
          Limpar
        </button>
      </div>
    </div>
  )
}

function BookingWhenToggle({
  value,
  onChange,
}: {
  value: "all" | "upcoming" | "past"
  onChange: (value: "all" | "upcoming" | "past") => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`h-10 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          value === "all"
            ? "bg-black text-white border-black"
            : "bg-white text-black/70 border-black hover:bg-black hover:text-white"
        }`}
      >
        Todas
      </button>
      <button
        type="button"
        onClick={() => onChange("upcoming")}
        className={`h-10 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          value === "upcoming"
            ? "bg-black text-white border-black"
            : "bg-white text-black/70 border-black hover:bg-black hover:text-white"
        }`}
      >
        Futuras
      </button>
      <button
        type="button"
        onClick={() => onChange("past")}
        className={`h-10 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          value === "past"
            ? "bg-black text-white border-black"
            : "bg-white text-black/70 border-black hover:bg-black hover:text-white"
        }`}
      >
        Passadas
      </button>
    </>
  )
}

function BookingCards({ bookings }: { bookings: BookingResponse[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-black/60 text-sm">
        Ainda não tem reservas.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl border-2 border-black bg-white p-4 text-sm text-black shadow-[4px_4px_0_0_#000]"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">Reserva #{b.id}</div>
            <div className="text-xs text-black/60 font-mono uppercase tracking-widest">{b.status}</div>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-black/70 font-mono">
            <div>Property: {b.propertyId}</div>
            <div>{b.checkInDate} → {b.checkOutDate}</div>
            <div>Total: {b.totalPrice} {b.currency}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

