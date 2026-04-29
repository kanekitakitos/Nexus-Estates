"use client"

import { SECTIONS, B, landingTokens } from "../lib/tokens"
import { BoingText } from "@/components/effects/BoingText"
import { useSyncExternalStore } from "react"
import { AuthService } from "@/services/auth.service"

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavProps = {
  active?: number
  goTo?: (i: number) => void
  fg?: string
  accentColor?: string
  activeLinkColor?: string
  ctaColor?: string
  hideLinks?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const containerStyle = (fg: string) => ({
  border: `2px solid ${fg}70`,
  background: `${fg}08`,
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo({ goTo, fg, accentColor }: { goTo?: NavProps["goTo"]; fg: string; accentColor?: string }) {
  const handleClick = () => {
    if (goTo) {
      goTo(0)
    } else {
      window.location.href = "/"
    }
  }
  return (
    <button
      onClick={handleClick}
      className="font-black uppercase tracking-tight text-[18px] md:text-[20px]"
      style={{ color: fg }}
    >
      <BoingText text={landingTokens.copy.landing.nav.brand} color={fg} activeColor={accentColor ?? B.orange} />
    </button>
  )
}

function NavLinks({ active, goTo, fg, accentColor, activeLinkColor, hideLinks }: NavProps) {
  if (hideLinks) return null

  return (
    <div className="hidden md:flex items-center gap-10">
      {SECTIONS.slice(1).map((s, i) => {
        const idx = i + 1
        const isActive = active === idx
        const baseColor = isActive ? (activeLinkColor ?? B.orange) : (fg || B.black)
        return (
          <button
            key={s.id}
            onClick={() => goTo?.(idx)}
            className="font-black uppercase tracking-widest text-[14px]"
            style={{ color: baseColor, opacity: isActive ? 1 : 0.88 }}
          >
            <BoingText text={s.label} color={baseColor} activeColor={accentColor ?? B.orange} />
          </button>
        )
      })}
    </div>
  )
}

function NavActions({
  fg,
  accentColor,
  ctaColor,
  isAuthenticated,
}: {
  fg: string
  accentColor?: string
  ctaColor?: string
  isAuthenticated: boolean
}) {
  return (
    <div className="flex items-center gap-8">
      {isAuthenticated ? (
        <a
          href="/dashboard"
          className="hidden md:inline font-black uppercase tracking-widest text-[14px]"
          style={{ color: fg, opacity: 0.88 }}
        >
          <BoingText text={landingTokens.copy.landing.nav.dashboard} color={fg} activeColor={accentColor ?? B.orange} />
        </a>
      ) : (
        <a
          href="/login"
          className="hidden md:inline font-black uppercase tracking-widest text-[14px]"
          style={{ color: fg, opacity: 0.88 }}
        >
          <BoingText text={landingTokens.copy.landing.nav.login} color={fg} activeColor={accentColor ?? B.orange} />
        </a>
      )}
      <a
        href="/booking"
        className="font-black uppercase tracking-widest text-[14px]"
        style={{ color: ctaColor ?? B.orange }}
      >
        <BoingText text={landingTokens.copy.landing.nav.start} color={ctaColor ?? B.orange} activeColor={accentColor ?? B.orange} />
      </a>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Nav({ active = 0, goTo, fg = B.black, accentColor, activeLinkColor, ctaColor, hideLinks = false }: NavProps) {
  const isAuthenticated = useSyncExternalStore(
    (onStoreChange) => {
      const handleStorageChange = () => onStoreChange();
      const handleAuthChange = () => onStoreChange();
      window.addEventListener("storage", handleStorageChange)
      window.addEventListener("auth-change", handleAuthChange)
      return () => {
        window.removeEventListener("storage", handleStorageChange)
        window.removeEventListener("auth-change", handleAuthChange)
      }
    },
    () => {
      return AuthService.getSession().isAuthenticated
    },
    () => false,
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-2 md:px-3 py-3">
      <div className="mx-auto w-full max-w-7xl rounded-md h-full" style={containerStyle(fg)}>
        <div className="flex items-center justify-between px-5 md:px-7 py-3">
          <Logo goTo={goTo} fg={fg} accentColor={accentColor} />
          <NavLinks active={active} goTo={goTo} fg={fg} accentColor={accentColor} activeLinkColor={activeLinkColor} ctaColor={ctaColor} hideLinks={hideLinks} />
          <NavActions fg={fg} accentColor={accentColor} ctaColor={ctaColor} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </nav>
  )
}
