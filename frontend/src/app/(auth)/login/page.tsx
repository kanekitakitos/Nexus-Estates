import { LoginForm } from "@/components/layout/auth/login-form"
import { FieldDescription } from "@/components/ui/forms/field"

export default function LoginPage() {
  return (
    <div className={"flex flex-col gap-6"}>
      <LoginForm />
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
        </FieldDescription>
    </div>
  )
}
