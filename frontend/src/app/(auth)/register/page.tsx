import { FieldDescription } from "@/components/ui/forms/field"
import { RegisterForm } from "@/components/layout/auth/register-form"

export default function RegisterPage() {
    return (
    <div className={"flex flex-col gap-6"}>
      <RegisterForm />
      <FieldDescription className="px-6 text-center"></FieldDescription>
    </div>
    )
}
