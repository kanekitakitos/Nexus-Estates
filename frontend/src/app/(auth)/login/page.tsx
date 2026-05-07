/**
 * @file page.tsx
 * @author Nexus Estates team
 * @description Página de login (rota /login). Renderiza o formulário e copy legal de consentimento.
 */

import { LoginForm } from "@/features/auth"
import { FieldDescription } from "@/components/ui/forms/field"

/**
 * @route ´/login´
 * @description Página principal de autenticação, aceesivel através da rota ´/login´. 
 */
export default function LoginPage() {
  return (
    <div className={"flex flex-col gap-6"}>
      <LoginForm />
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our Terms of Service and Privacy Policy.
      </FieldDescription>
    </div>
  )
}
