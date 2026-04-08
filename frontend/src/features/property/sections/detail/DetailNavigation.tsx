import { ArrowLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/forms/button"

interface DetailNavigationProps {
    onBack: () => void
    onEdit: () => void
}

export function DetailNavigation({ onBack, onEdit }: DetailNavigationProps) {
    return (
        <div className="mb-8 flex justify-between items-center gap-4">
            <Button 
                onClick={onBack} 
                variant="outline" 
                className="group gap-2 border-2 text-xs font-black uppercase tracking-widest px-4 font-mono shadow-[2px_2px_0_0_rgb(0,0,0)] hover:shadow-[4px_4px_0_0_rgb(0,0,0)] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
                Voltar à Lista
            </Button>
            <Button 
                onClick={onEdit} 
                variant="brutal" 
                className="group gap-2 bg-primary text-primary-foreground border-2 border-foreground text-xs font-black uppercase tracking-widest px-6 shadow-[3px_3px_0_0_rgb(0,0,0)] hover:shadow-[5px_5px_0_0_rgb(0,0,0)] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
                <Pencil className="h-4 w-4" strokeWidth={3} />
                Editar Perfil
            </Button>
        </div>
    )
}
