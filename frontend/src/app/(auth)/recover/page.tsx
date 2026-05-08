/**
 * @file page.tsx
 * @author Nexus Estates team
 * @description Página de recuperação de conta (rota /recover). Renderiza o formulário de recuperação.
 */

import { RecoverForm } from "@/features/auth"

/**
 * @route ´/recover´
 * @description Página principal de recuperar acesso a uma conta.
 */
export default function RecoverPage() {
    return (
      <div className={"flex flex-col gap-6"}>
        <RecoverForm/>
      </div>
)}
