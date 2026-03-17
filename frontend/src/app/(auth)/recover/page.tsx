import { RecoverForm } from "@/features/auth/components/recover-form"

/**
 * @route ´/recover´
 * @description Página principal de recuperar acesso a uma conta.
 */
export default function RecoverPage() {
    return (
      <div className={"flex flex-col gap-6"}>
        <RecoverForm/>
      </div>
)}
