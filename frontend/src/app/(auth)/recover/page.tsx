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

export default function RecoverPage() {
    return (
    <div className={"flex flex-col gap-6"}>
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
          <Button className="w-full mt-6">Send Reset Link</Button>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center"></FieldDescription>
    </div>
    )
}
