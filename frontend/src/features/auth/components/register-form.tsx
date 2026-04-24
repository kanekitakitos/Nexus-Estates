"use client"

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

// Os sub-componentes SocialDivider, ClerkSocialIconRow e DisabledSocialIconRow
// são partilhados com o LoginForm — importar do ficheiro de componentes comuns.
import {
  SocialDivider,
  ClerkSocialIconRow,
  DisabledSocialIconRow,
} from "@/features/auth/components/social-icon-row"


// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function RegisterForm() {
  const emailRef           = useRef<HTMLInputElement>(null)
  const phoneRef           = useRef<HTMLInputElement>(null)
  const passwordRef        = useRef<HTMLInputElement>(null)
  const passwordConfirmRef = useRef<HTMLInputElement>(null)

  const [isTryingRegister, setIsTryingRegister] = useState(false)
  const [passwordError,    setPasswordError]    = useState(false)

  const idpKey          = getIdentityProviderKey()
  const showClerkSocial = idpKey === "clerk" && isClerkConfigured()

  async function handleRegister() {
    if (isTryingRegister) return

    const email           = emailRef.current?.value.trim()           ?? ""
    const phone           = phoneRef.current?.value.trim()           ?? ""
    const password        = passwordRef.current?.value               ?? ""
    const passwordConfirm = passwordConfirmRef.current?.value        ?? ""

    if (!email || !phone || !password || !passwordConfirm) {
      setPasswordError(true)
      notify.warning("Preenche todos os campos")
      return
    }

    if (password !== passwordConfirm) {
      setPasswordError(true)
      notify.error("As passwords não coincidem. Tenta novamente.")
      return
    }

    setPasswordError(false)
    setIsTryingRegister(true)

    try {
      const success = await AuthService.register({ email, password, phone })

      if (success) {
        setTimeout(() => { window.location.href = "/" }, 1500)
      }
    } catch (error) {
      // Erros de negócio são tratados via toast dentro do AuthService.
      // Aqui apenas registamos erros inesperados.
      console.error("[RegisterForm] Erro inesperado:", error)
    } finally {
      setIsTryingRegister(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <BrutalCard>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>
            Cria a tua conta com email e password, ou usa um provedor social.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); void handleRegister() }}>
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
                <FieldLabel htmlFor="phone">Telemóvel</FieldLabel>
                <Input
                  ref={phoneRef}
                  variant="brutal"
                  id="phone"
                  type="tel"
                  placeholder="+351 912 345 678"
                  autoComplete="tel"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Nova Password</FieldLabel>
                <Input
                  ref={passwordRef}
                  variant={passwordError ? "error" : "brutal"}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  onChange={() => passwordError && setPasswordError(false)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">Confirmar Password</FieldLabel>
                <Input
                  ref={passwordConfirmRef}
                  variant={passwordError ? "error" : "brutal"}
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  onChange={() => passwordError && setPasswordError(false)}
                />
              </Field>

              <Field>
                <Button
                  variant="brutal"
                  type="submit"
                  disabled={isTryingRegister}
                  className="w-full mt-2"
                >
                  {isTryingRegister ? "A criar conta..." : "Criar Conta"}
                </Button>
                <FieldDescription className="text-center">
                  Já tens conta?{" "}
                  <a href="/login" className="underline-offset-4 hover:underline">
                    Entrar
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
