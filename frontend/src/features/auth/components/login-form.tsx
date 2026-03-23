/**
 * @description
 *  Componente de autenticação que fornece a interface de login.
 *  Tambem implementa a logica para a componente se comunicar com o serviço users.
 * 
 * @version 1.0
 */

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import {
  Card,
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
  FieldSeparator,
} from "@/components/ui/forms/field"
import { Input } from "@/components/ui/forms/input"
import { useState } from "react"
import { AuthService } from "@/services/auth.service"
import { toast } from "sonner"


/**
 * componente do formulario de login
 * 
 * @returns {JSX.Element} O formulário de login estruturado com suporte de Toasts para fornecer estados dos erros.
 * 
 * @version 1.0
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  
  const [isTryingLogin, setIsTryingLogin] = useState(false);

  /**
   * Processa a autenticação do utilizador.
   * * @async
   * 
   * @returns {Promise<void>} Uma promessa que se resolve após a tentativa de autenticação, 
   * independentemente do sucesso (erros são tratados via toast).
   * 
   * @version 1.1
   */
  async function handleLogin() {
    if (isTryingLogin) return;

    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value

    if (!password || !email){
      toast.warning("Preenche todos os campos");
      return
    }

    setIsTryingLogin(true);

    try {
      const success = await AuthService.login({ email, password });
      
      if (success) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (error) {
      // O erro já é tratado dentro do AuthService via toast
      console.error("Login component error:", error);
    } finally {
      setIsTryingLogin(false);
    }
  }


  // Codigo html da JSX.Element
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <BrutalCard>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input variant="brutal" id="email" type="email" placeholder="m@example.com" required/>
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/recover"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input variant="brutal" id="password" type="password" required />
              </Field>

              <Field>
                <Button variant="brutal" type="button" disabled={isTryingLogin} onClick={handleLogin}>
                  {isTryingLogin ? "Trying to Login..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/register">Sign up</a>
                </FieldDescription>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>

      </BrutalCard>
    </div> 
  )
}
