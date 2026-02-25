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
import { usersAxios } from "@/lib/axiosAPI"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  
  const [isTryingLogin, setIsTryingLogin] = useState(false);


  // TODO: Refactor implementation to simplify and improve error handling  
  async function handleLogin() {
    if (isTryingLogin) return; // Prevent multiple login attempts at the same time

    var email = (document.getElementById("email") as HTMLInputElement).value
    var password = (document.getElementById("password") as HTMLInputElement).value

    if (!password || !email){
      toast.warning("Prenche todas as celulas");
      
      return
    }

    setIsTryingLogin(true);

    await usersAxios.post("/auth/login", JSON.stringify({email, password}), {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      setIsTryingLogin(false);

      if (response.status === 200) { // Assuming a successful login returns a 200 status code
        console.log("Login efetuado!", response.data);
        toast.error("Bem-vindo!");
      }
      else {
        console.log("resposta:", response);
      }
    })
    .catch(async (error) => {
      setIsTryingLogin(false);

      console.error("error:", error);
      if (error.response) {
        console.error("Mensagem do servidor:", error.response.data);
          switch (error.response.status) {
            case 401: toast.error("Email ou senha incorretos. Tente novamente."); break;
            case 404: toast.error("Usuário não encontrado. Verifique seu email ou registre-se."); break;
            default: toast.error("Erro no servidor. Status: " + error.response.status); break;
          }
      }
      else if (error.request) {
        console.error("Requisição feita, mas sem resposta:", error.request);
        toast.error("Nenhuma resposta do servidor. Verifique sua conexão.");
      }
      else {
        console.error("Erro ao configurar a requisição :", error.message);
        toast.error("Erro ao configurar a requisição da mensagem: " + error.message);
      }
    });
  }


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
