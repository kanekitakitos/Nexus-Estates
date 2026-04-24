"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card"
import { BrutalCard } from "@/components/ui/data-display/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/forms/field"
import { Input } from "@/components/ui/forms/input"
import { useRef, useState } from "react"
import { AuthService } from "@/services/auth.service"
import { notify } from "@/lib/notify"
import { getIdentityProviderKey, isClerkConfigured } from "@/features/auth/strategies/use-identity-provider"
import {
  SocialDivider,
  ClerkSocialIconRow,
  DisabledSocialIconRow,
} from "@/features/auth/components/social-icon-row"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const emailRef    = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [isTryingLogin, setIsTryingLogin] = useState(false)

  const idpKey          = getIdentityProviderKey()
  const showClerkSocial = idpKey === "clerk" && isClerkConfigured()

  async function handleLogin() {
    if (isTryingLogin) return

    const email    = emailRef.current?.value.trim()    ?? ""
    const password = passwordRef.current?.value.trim() ?? ""

    if (!email || !password) {
      notify.warning("Preenche todos os campos")
      return
    }

    setIsTryingLogin(true)

    try {
      const success = await AuthService.login({ email, password })

      if (success) {
        setTimeout(() => { window.location.href = "/" }, 1500)
      }
    } catch (error) {
      // Erros de negócio são tratados via toast dentro do AuthService.
      // Aqui apenas registamos erros inesperados.
      console.error("[LoginForm] Erro inesperado:", error)
    } finally {
      setIsTryingLogin(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <BrutalCard>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entra com as tuas credenciais ou continua com uma conta social.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); void handleLogin() }}>
            <FieldGroup>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  ref={emailRef}
                  variant="brutal"
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/recover"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceste a password?
                  </a>
                </div>
                <Input
                  ref={passwordRef}
                  variant="brutal"
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <Field>
                <Button
                  variant="brutal"
                  type="submit"
                  disabled={isTryingLogin}
                >
                  {isTryingLogin ? "A entrar..." : "Entrar"}
                </Button>
                <FieldDescription className="text-center">
                  Ainda não tens conta?{" "}
                  <a href="/register" className="underline-offset-4 hover:underline">
                    Regista-te
                  </a>
                </FieldDescription>
              </Field>

              <Field>
                <SocialDivider />
                <div className="mt-3">
                  {showClerkSocial ? <ClerkSocialIconRow /> : <DisabledSocialIconRow />}
                </div>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>

      </BrutalCard>
    </div>
  )
}
