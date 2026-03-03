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
} from "@/components/ui/forms/field"
import { Input } from "@/components/ui/forms/input"
import {toast} from "sonner";
import {usersAxios} from "@/lib/axiosAPI";
import {useState} from "react";


export function RecoverForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const [isTryingRegister, setIsTryingRegister] = useState(false);

    // TODO: Refactor implementation to simplify and improve error handling
    async function handleRegister() {
        if (isTryingRegister) return; // Prevent multiple register attempts at the same time


        const email = (document.getElementById("email") as HTMLInputElement).value

        if (!email){
            toast.warning("Prenche todas as celulas");

            return
        }

        setIsTryingRegister(true);

        await usersAxios.post("/auth/password/forgot", JSON.stringify({email}), {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (response.status === 200) { // Assuming a successful login returns a 200 status code
                    console.log("Recuperação efetuada!", response.data);
                    toast.error("Pedido enviado com sucesso!");
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

        setIsTryingRegister(false);
    }


    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <BrutalCard>
                <CardHeader className="text-center">
                <CardTitle className="text-xl">Recover Account</CardTitle>
                <CardDescription>
                    Enter the email of your account to receive a password reset link
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
                        variant={"brutal"}
                        required
                        />
                    </Field>
                    </FieldGroup>
                </form>
                <Button variant={"brutal"} className="w-full mt-6" onClick={()=>console.log("TO IMPLEMENT!")}>Send Reset Link</Button>
                </CardContent>
            </BrutalCard>
        </div>
)}