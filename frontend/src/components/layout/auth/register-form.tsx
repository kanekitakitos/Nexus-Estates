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

export function RegisterForm() {

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

