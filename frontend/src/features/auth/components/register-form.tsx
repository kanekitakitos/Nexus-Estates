/**
 * @description
 *  Componente para registro de um novo utilizador.
 *  Tambem implementa a logica para a componente se comunicar com o serviço users.
 * 
 * @version 1.0
 */

"use client"

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
} from "@/components/ui/forms/field"
import { Input } from "@/components/ui/forms/input"
import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner"


/**
 * componente do formulario para registro de um novo utilizador
 * 
 * @returns {JSX.Element} O formulário com suporte de Toasts para fornecer estados dos erros.
 * 
 * @version 1.0
 */
export function RegisterForm() {

  const [isTryingRegister, setIsTryingRegister] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  /**
   * Processa a tentatica de registro de um novo utilizador.
   * * @async
   * 
   * @returns {Promise<void>} Uma promessa que se resolve após a tentativa de autenticação, 
   * independentemente do sucesso (erros são tratados via toast).
   * 
   * @version 1.1
   */
  async function handleRegister() {
    if (isTryingRegister) return;

    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value
    const passwordConfirm = (document.getElementById("confirm-password") as HTMLInputElement).value

    if (!password || !passwordConfirm || !email){
      setPasswordError(true)
      toast.warning("Preenche todos os campos");
      return
    }

    if (password !== passwordConfirm) {
      setPasswordError(true)
      toast.error("As senhas não coincidem. Por favor, tente novamente.");
      return;
    }

    setIsTryingRegister(true);

    try {
      const success = await AuthService.register({ email, password });
      
      if (success) {
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (error) {
      // Erro tratado no AuthService
      console.error("Register component error:", error);
    } finally {
      setIsTryingRegister(false);
    }
  }


  // Codigo html da JSX.Element
  return (
    <div className={"flex flex-col gap-6"}>
      <BrutalCard>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Create New Account
          </CardTitle>
          <CardDescription>
            Enter your email and password to create your account
          </CardDescription>
        </CardHeader>

        <CardContent>

          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  variant="brutal"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                </div>
                <Input 
                  variant={passwordError ? "error" : "brutal"} 
                  id="password" 
                  type="password" 
                  required 
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                </div>
                <Input 
                  variant={passwordError ? "error" : "brutal"}
                  id="confirm-password"
                  type="password"
                  required 
                />
              </Field>
            </FieldGroup>
          </form>

          <Button variant={"brutal"} type="submit" disabled={isTryingRegister} className="w-full mt-6" onClick={handleRegister}>
            {isTryingRegister ? "Carregando..." : "Create Account"}
          </Button>

        </CardContent>

      </BrutalCard>
    </div>
  )
}

