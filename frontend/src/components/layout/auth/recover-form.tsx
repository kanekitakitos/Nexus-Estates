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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/forms/field"
import { Input } from "@/components/ui/forms/input"

export function RecoverForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Card>
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
                        required
                        />
                    </Field>
                    </FieldGroup>
                </form>
                <Button className="w-full mt-6" onClick={()=>console.log("TO IMPLEMENT!")}>Send Reset Link</Button>
                </CardContent>
            </Card>
        </div>
)}