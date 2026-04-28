"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpDown } from "lucide-react"
import type { BookingResponse } from "@/services/booking.service"
import { SidebarFilterBar } from "@/components/ui/data-display/sidebar-filter-bar"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu"
import { bookingsTokens } from "@/features/bookings/tokens"

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
  return `${bookingsTokens.copy.sidebar.bookingHaystackPrefix}${b.id} ${b.propertyId} ${b.status} ${b.currency} ${b.totalPrice} ${b.checkInDate} ${b.checkOutDate}`.toLowerCase()
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
          <div className="mb-2">{bookingsTokens.copy.sidebar.needsAuthTitle}</div>
          <Link href="/login" className="underline">{bookingsTokens.copy.sidebar.goToLogin}</Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground text-sm">{bookingsTokens.copy.sidebar.loadingBookings}</div>
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
        className={cn(
          bookingsTokens.ui.sidebar.scopeBtnBaseClass,
          scope === "properties" ? bookingsTokens.ui.sidebar.scopeBtnActiveClass : bookingsTokens.ui.sidebar.scopeBtnInactiveClass
        )}
      >
        {bookingsTokens.copy.sidebar.scopeProperties}
      </button>
      <button
        type="button"
        onClick={() => onChange("mine")}
        className={cn(
          bookingsTokens.ui.sidebar.scopeBtnBaseClass,
          scope === "mine" ? bookingsTokens.ui.sidebar.scopeBtnActiveClass : bookingsTokens.ui.sidebar.scopeBtnInactiveClass
        )}
      >
        {bookingsTokens.copy.sidebar.scopeMine}
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
      placeholder={bookingsTokens.copy.sidebar.searchPlaceholder}
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
          bookingsTokens.ui.sidebar.clearBtnClass,
          bookingsTokens.ui.sidebar.clearBtnShadowClass,
          bookingsTokens.ui.sidebar.clearBtnHoverShadowClass,
          !canClear && "opacity-40 pointer-events-none shadow-none dark:shadow-none",
        )}
      >
        {bookingsTokens.copy.sidebar.clear}
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
      ? bookingsTokens.copy.sidebar.statusAllLabel
      : value === "PENDING_PAYMENT"
        ? bookingsTokens.copy.sidebar.statusPendingShort
        : value === "CONFIRMED"
          ? bookingsTokens.copy.sidebar.statusConfirmedShort
          : value === "CANCELLED"
            ? bookingsTokens.copy.sidebar.statusCancelledShort
            : value === "COMPLETED"
              ? bookingsTokens.copy.sidebar.statusCompletedShort
              : bookingsTokens.copy.sidebar.statusRefundedShort

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            bookingsTokens.ui.sidebar.dropdownTriggerClass,
          )}
        >
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn("w-44", bookingsTokens.ui.sidebar.dropdownContentClass)}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as typeof value)}>
          <DropdownMenuRadioItem
            value="ALL"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.statusAll}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="PENDING_PAYMENT"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.statusPending}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="CONFIRMED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.statusConfirmed}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="CANCELLED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.statusCancelled}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="COMPLETED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.statusCompleted}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="REFUNDED"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.statusRefunded}
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
  const label = value === "all" ? bookingsTokens.copy.sidebar.whenAllShort : value === "upcoming" ? bookingsTokens.copy.sidebar.whenUpcomingShort : bookingsTokens.copy.sidebar.whenPastShort

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            bookingsTokens.ui.sidebar.dropdownTriggerClass,
          )}
        >
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn("w-36", bookingsTokens.ui.sidebar.dropdownContentClass)}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as typeof value)}>
          <DropdownMenuRadioItem
            value="all"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.whenAll}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="upcoming"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.whenUpcoming}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="past"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.whenPast}
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
  const label = value === "antigas" ? bookingsTokens.copy.sidebar.sortAscShort : bookingsTokens.copy.sidebar.sortDescShort

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            bookingsTokens.ui.sidebar.dropdownTriggerClass,
          )}
        >
          <ArrowUpDown className="h-3 w-3" strokeWidth={3} />
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-40", bookingsTokens.ui.sidebar.dropdownContentClass)}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as "recentes" | "antigas")}>
          <DropdownMenuRadioItem
            value="recentes"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.sortRecent}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="antigas"
            className="font-mono text-[9px] font-bold uppercase tracking-widest py-2 focus:bg-primary focus:text-primary-foreground"
          >
            {bookingsTokens.copy.sidebar.sortOld}
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
        {bookingsTokens.copy.sidebar.empty}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className={bookingsTokens.ui.sidebar.cardClass}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">{bookingsTokens.copy.sidebar.bookingLabelPrefix}{b.id}</div>
            <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{b.status}</div>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-muted-foreground font-mono">
            <div>{bookingsTokens.copy.sidebar.propertyLabel}{b.propertyId}</div>
            <div>{b.checkInDate} → {b.checkOutDate}</div>
            <div>{bookingsTokens.copy.sidebar.totalLabel}{b.totalPrice} {b.currency}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
