import { useSyncExternalStore } from "react"

/**
 * Monitoriza uma query CSS e devolve o seu estado atual (true/false).
 * @param query - A string da media query a monitorizar (ex: "(max-width: 768px)")
 * @returns Um booleano que indica se a query coincide com o estado do browser. 
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {}
      const media = window.matchMedia(query)
      media.addEventListener("change", callback)
      return () => media.removeEventListener("change", callback)
    },
    () => {
      if (typeof window === "undefined") return false
      return window.matchMedia(query).matches
    },
    () => false
  )
}
