import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Deteta se a largura da janela é inferior ao MOBILE_BREAKPOINT
 * @returns boolean - Retorna true se o ecrã for menor que 768px.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    /**
     * Função que vai atualizar.
     * Corre sempre que o eventListener dispara
     */
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // eventListener que escuta por mudanças de tamanho ou formato
    mql.addEventListener("change", onChange)

    // define se tem o tamanho Mobile
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
