"use client"

import { Button } from "@/components/ui/forms/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/data-display/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/forms/field"
import { Input } from "@/components/ui/forms/input"
import { useState } from "react";
import { usersAxios } from "@/lib/axiosAPI";

export function RegisterForm() {

  const [isTryingRegister, setIsTryingRegister] = useState(false);

  
  // TODO: Refactor implementation to simplify and improve error handling  
  async function handleRegister() {
    if (isTryingRegister) return; // Prevent multiple register attempts at the same time

    setIsTryingRegister(true);

    var email = (document.getElementById("email") as HTMLInputElement).value
    var password = (document.getElementById("password") as HTMLInputElement).value
    var passwordConfirm = (document.getElementById("confirm-password") as HTMLInputElement).value

    if (password !== passwordConfirm) {
      alert("As senhas não coincidem. Por favor, tente novamente.");
      setIsTryingRegister(false);

      // Clear password fields
      (document.getElementById("password") as HTMLInputElement).value = "";
      (document.getElementById("confirm-password") as HTMLInputElement).value = "";
      return;
    }

    await usersAxios.put("/auth/register", JSON.stringify({email, password}), {
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      if (response.status === 200) { // Assuming a successful login returns a 200 status code
        console.log("Registro efetuado!", response.data);
        alert("Conta criada com sucesso!");
      }
      else {
        console.log("resposta:", response);
      }
    })
    .catch(error => {
      console.error("error:", error);
      if (error.response) {
        console.error("Mensagem do servidor:", error.response.data);
          switch (error.response.status) {
            case 401: alert("Email ou senha incorretos. Tente novamente."); break;
            case 404: alert("Usuário não encontrado. Verifique seu email ou registre-se."); break;
            default: alert("Erro no servidor. Status: " + error.response.status); break;
          }
      }
      else if (error.request) {
        console.error("Requisição feita, mas sem resposta:", error.request);
        alert("Nenhuma resposta do servidor. Verifique sua conexão.");
      }
      else {
        console.error("Erro ao configurar a requisição :", error.message);
        alert("Erro ao configurar a requisição da mensagem: " + error.message);
      }
    });

    setIsTryingRegister(false);
  }

  return (
    <div className={"flex flex-col gap-6"}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create New Account</CardTitle>
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
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                </div>
                <Input id="confirm-password" type="password" required />
              </Field>
            </FieldGroup>
          </form>
          <Button type="submit" disabled={isTryingRegister} className="w-full mt-6" onClick={handleRegister}>
            {isTryingRegister ? "Carregando..." : "Create Account"}
          </Button>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}

