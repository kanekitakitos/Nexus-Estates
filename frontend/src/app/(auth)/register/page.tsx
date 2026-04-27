import { FieldDescription } from "@/components/ui/forms/field"
import { RegisterForm } from "@/features/auth"


/**
 * @route ´/register´
 * @description Página principal de register de uma nova conta.
 */
export default function RegisterPage() {
    return (
    <div className={"flex flex-col gap-6"}>
      <RegisterForm />
      <FieldDescription className="px-6 text-center"></FieldDescription>
    </div>
    )
}
