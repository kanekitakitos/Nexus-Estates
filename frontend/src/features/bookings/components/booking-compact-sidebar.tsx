"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpDown } from "lucide-react"
import type { BookingResponse } from "@/services/booking.service"
import { SidebarFilterBar } from "@/components/ui/data-display/sidebar-filter-bar"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu"

type UserRole = "ADMIN" | "GUEST" | "OWNER" | "STAFF"

function normalizeQuery(value: string) {
  return value.trim().toLowerCase()
}

function dateAtStartOfDay(dateLike: string | Date) {
  const d = typeof dateLike === "string" ? new Date(dateLike) : new Date(dateLike)
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}

function bookingHaystack(b: BookingResponse) {
  return `reserva booking ${b.id} ${b.propertyId} ${b.status} ${b.currency} ${b.totalPrice} ${b.checkInDate} ${b.checkOutDate}`.toLowerCase()
}

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
  const [sort, setSort] = React.useState<"recentes" | "antigas">("recentes")

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
    const q = normalizeQuery(query)
    const today = dateAtStartOfDay(new Date()) ?? new Date()

    const whenOk = (checkInDate: string) => {
      if (when === "all") return true
      const d = dateAtStartOfDay(checkInDate)
      if (!d) return true
      if (when === "upcoming") return d >= today
      return d < today
    }

    const statusOk = (s: BookingResponse["status"]) => (status === "ALL" ? true : s === status)

    if (!q && status === "ALL" && when === "all") return scoped

    const next = scoped.filter((b) => {
      if (!statusOk(b.status)) return false
      if (!whenOk(b.checkInDate)) return false
      if (!q) return true
      return bookingHaystack(b).includes(q)
    })

    return next
      .slice()
      .sort((a, b) =>
        sort === "antigas"
          ? (a.checkInDate || "").localeCompare(b.checkInDate || "")
          : (b.checkInDate || "").localeCompare(a.checkInDate || ""),
      )
  }, [myBookings, propertyBookings, query, scope, sort, status, when])

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
          sort={sort}
          onSortChange={setSort}
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
  sort,
  onSortChange,
  onClear,
}: {
  query: string
  onQueryChange: (value: string) => void
  status: "ALL" | BookingResponse["status"]
  onStatusChange: (value: "ALL" | BookingResponse["status"]) => void
  when: "all" | "upcoming" | "past"
  onWhenChange: (value: "all" | "upcoming" | "past") => void
  sort: "recentes" | "antigas"
  onSortChange: (value: "recentes" | "antigas") => void
  onClear: () => void
}) {
  const canClear = query.length > 0 || status !== "ALL" || when !== "all"

  return (
    <SidebarFilterBar
      query={query}
      onQueryChange={onQueryChange}
      placeholder="PESQUISAR..."
      inputClassName="normal-case tracking-normal"
    >
      <BookingStatusDropdown value={status} onChange={onStatusChange} />
      <BookingWhenDropdown value={when} onChange={onWhenChange} />
      <BookingSortDropdown value={sort} onChange={onSortChange} />

      <button
        type="button"
        onClick={onClear}
        disabled={!canClear}
        className={cn(
          "ml-auto inline-flex h-6 items-center justify-center rounded-md border-2 border-foreground dark:border-zinc-700 bg-primary/10 px-1 py-0.5 text-[7px] font-mono font-black uppercase tracking-widest text-primary transition-all",
          "shadow-[2px_2px_0_0_#0D0D0D] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.25)]",
          "hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5",
          !canClear && "opacity-40 pointer-events-none shadow-none dark:shadow-none",
        )}
      >
        Limpar
      </button>
    </SidebarFilterBar>
  )
}

function BookingStatusDropdown({
  value,
  onChange,
}: {
  value: "ALL" | BookingResponse["status"]
  onChange: (value: "ALL" | BookingResponse["status"]) => void
}) {
  const label =
    value === "ALL"
      ? "STATUS"
      : value === "PENDING_PAYMENT"
        ? "PEND"
        : value === "CONFIRMED"
          ? "CONF"
          : value === "CANCELLED"
            ? "CANC"
            : value === "COMPLETED"
              ? "COMP"
              : "REFU"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border-2 border-foreground dark:border-zinc-700 bg-primary/10 font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-primary px-2 py-1 text-[8px]",
          )}
        >
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-44 border-2 border-foreground shadow-[4px_4px_0_0_#0D0D0D] p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as typeof value)}>
          <DropdownMenuRadioItem
            value="ALL"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Todas
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="PENDING_PAYMENT"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Pending
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="CONFIRMED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Confirmed
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="CANCELLED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Cancelled
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="COMPLETED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Completed
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="REFUNDED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Refunded
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BookingWhenDropdown({
  value,
  onChange,
}: {
  value: "all" | "upcoming" | "past"
  onChange: (value: "all" | "upcoming" | "past") => void
}) {
  const label = value === "all" ? "DATA" : value === "upcoming" ? "FUT" : "PAS"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border-2 border-foreground dark:border-zinc-700 bg-primary/10 font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-primary px-2 py-1 text-[8px]",
          )}
        >
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-36 border-2 border-foreground shadow-[4px_4px_0_0_#0D0D0D] p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as typeof value)}>
          <DropdownMenuRadioItem
            value="all"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Todas
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="upcoming"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Futuras
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="past"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Passadas
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BookingSortDropdown({
  value,
  onChange,
}: {
  value: "recentes" | "antigas"
  onChange: (value: "recentes" | "antigas") => void
}) {
  const label = value === "antigas" ? "ASC" : "DESC"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center gap-2 rounded-md border-2 border-foreground dark:border-zinc-700 bg-primary/10 font-mono font-black uppercase tracking-widest shadow-[2px_2px_0_0_#0D0D0D] hover:shadow-[3px_3px_0_0_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-primary px-2 py-1 text-[8px]",
          )}
        >
          <ArrowUpDown className="h-3 w-3" strokeWidth={3} />
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 border-2 border-foreground shadow-[4px_4px_0_0_#0D0D0D] p-1 bg-white/80 dark:bg-black/80 backdrop-blur-md"
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as "recentes" | "antigas")}>
          <DropdownMenuRadioItem
            value="recentes"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Recentes
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="antigas"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            Antigas
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function BookingCards({ bookings }: { bookings: BookingResponse[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        Ainda não tem reservas.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl border-2 border-foreground bg-background p-4 text-sm text-foreground shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.35)]"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">Reserva #{b.id}</div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{b.status}</div>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-muted-foreground font-mono">
            <div>Property: {b.propertyId}</div>
            <div>{b.checkInDate} → {b.checkOutDate}</div>
            <div>Total: {b.totalPrice} {b.currency}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
