import { useEffect, useState } from "react"

/**
 * Monitoriza uma query CSS e devolve o seu estado atual (true/false).
 * @param query - A string da media query a monitorizar (ex: "(max-width: 768px)")
 * @returns Um booleano que indica se a query coincide com o estado do browser. 
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    /**
     * Função que vai atualizar.
     * Corre sempre que o eventListener dispara
     */
    const listener = () => {
      setMatches(media.matches)
    }

    // eventListener que escuta por mudanças de tamanho ou formato
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}
