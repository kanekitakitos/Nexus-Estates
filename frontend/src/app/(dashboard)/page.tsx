"use client"
import { AppShell } from "@/components/layout/app-shell"
import { Calendar } from "@/components/ui/calendar"
import { BrutalCard, BrutalInteractiveCard, BrutalShard } from "@/components/ui/data-display/card"
import { Button } from "@/components/ui/forms/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "@/components/ui/overlay/dropdown-menu"
import { useState } from "react"

/**
 * @route ´/dashboard´
 * @description Pagina onde um dono pode ver estatisticas sobre as suas propriedades
 */
export default function Page() {
  const [ganhosDados, setGanhosDados] = useState({periodo:"Mês", valor:"156"})

  const opcoesPeriodo = [
  { label: "Hoje", valor: "24" },
  { label: "Semana", valor: "73" },
  { label: "Mês", valor: "156" },
  { label: "Ano", valor: "1232" },
];

  return (
    <AppShell>
      <div className="grid grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(6,1fr)] gap-4 p-4">
        <BrutalCard className="flex flex-col items-center justify-center place-content-center aspect-square rounded-lg ">
          <h1 className="text-sm font-bold whitespace-nowrap">Check-in:</h1>
          <h1 className="text-4xl font-extrabold text-center"> 72 </h1>
        </BrutalCard>

        <BrutalCard className="flex flex-col items-center justify-center aspect-square rounded-lg">
          <h1 className="text-sm font-bold whitespace-nowrap">Check-out:</h1>
          <h1 className="text-4xl font-extrabold text-center"> 43 </h1>
        </BrutalCard>

        <BrutalCard className="flex flex-col items-center justify-center aspect-square rounded-lg">
          <h1 className="text-sm font-bold whitespace-nowrap">Reservas:</h1>
          <h1 className="text-4xl font-extrabold text-center"> 37 </h1>
        </BrutalCard>

        <BrutalCard className="relative rounded-lg overflow-hidden flex flex-col items-center justify-center aspect-square">
          <div className="absolute  top-0.5 sm:top-0.5 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild> 
                  <Button variant="brutal" size="icon-xs" className="rounded-lg text-black">v</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background font-bold">
                <DropdownMenuGroup>
                  {opcoesPeriodo.map((opcao) => (
                    <DropdownMenuItem
                      key={opcao.label}
                      className="focus:bg-primary"
                      onSelect={() => {
                        setGanhosDados({periodo: opcao.label, valor: opcao.valor})
                      }}>{opcao.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <h1 className="text-xs font-bold whitespace-nowrap">Ganhos {ganhosDados.periodo}:</h1>
          <h1 className="text-4xl font-extrabold text-center"> {ganhosDados.valor}€ </h1>
        </BrutalCard>

        <BrutalCard className="col-span-2 row-span-3 rounded-lg">
        </BrutalCard>

      </div>
    </AppShell>
  )
}
