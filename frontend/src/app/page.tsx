/**
 * @file page.tsx
 * @author Nexus Estates team
 * @description Página inicial da aplicação (Home). Define o ponto de entrada público.
 */

"use client"

import { HorizontalLanding } from "@/features/landing/views/HorizontalLanding"

/**
 * Componente da página principal.
 * @route `/`
 * @description Renderiza a página de aterragem (Landing Page) que os utilizadores veem ao aceder à raiz do site.
 * @returns {JSX.Element} O componente `HorizontalLanding` que contém as secções de marketing.
 */
export default function Home() {
  return (
      <HorizontalLanding />
  )
}
