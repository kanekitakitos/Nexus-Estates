"use client"

import { useEffect, useState } from "react"

interface AnimatedCounterProps {
  /** Valor final a animar */
  value: number
  /** Duração total da animação em milissegundos */
  duration?: number
}

/**
 * AnimatedCounter
 *
 * Componente de transição numérica fluida: conta de 0 até `value`
 * durante o tempo `duration` com cadência constante.
 *
 * Responsabilidade única: Animar um número de 0 até ao valor alvo.
 */
export function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) return

    const incrementTime = (duration / end) > 10 ? (duration / end) : 10

    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start === end) clearInterval(timer)
    }, incrementTime)

    return () => clearInterval(timer)
  }, [value, duration])

  return <>{count.toString().padStart(2, "0")}</>
}
