
import * as React from "react"

export function BrutalGridBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundColor: "var(--color-brutal-bg)",
        backgroundImage: `
          linear-gradient(var(--color-brutal-grid) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-brutal-grid) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
  )
}
