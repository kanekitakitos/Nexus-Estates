import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { BrutalCard } from "@/components/ui/data-display/card"
import { Badge } from "@/components/ui/badge"

interface BookingHowItWorksProps {
    mode?: "default" | "card"
    className?: string
}

export function BookingHowItWorks({ mode = "default", className }: BookingHowItWorksProps) {
        return (
            <BrutalCard 
                variant="primary"
                className={cn(
                    "group relative h-full w-full overflow-hidden transition-all hover:-translate-y-1 flex flex-col justify-between hover:shadow-[8px_8px_0_0_rgb(0,0,0)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.9)]",
                    className
                )}
            >
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-full border-[2px] border-foreground bg-background flex items-center justify-center shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)]">
                            <Users className="w-5 h-5 text-foreground" />
                        </div>
                        <Badge variant="brutal" className="-rotate-3">
                            Guide
                        </Badge>
                    </div>
                    
                    <h3 className="font-mono text-3xl font-black uppercase leading-[0.85] text-primary-foreground drop-shadow-[3px_3px_0_rgb(0,0,0)] break-words">
                        How it<br/>works
                    </h3>
                </div>

                {/* Steps */}
                <div className="flex flex-col gap-3 mt-4">
                    {[
                        { step: 1, label: "Browse" },
                        { step: 2, label: "Book" },
                        { step: 3, label: "Enjoy" }
                    ].map((item) => (
                        <Badge key={item.step} variant="brutal" className="w-full justify-start p-2 hover:translate-x-1 transition-transform gap-3 rounded-md">
                            <div className="flex items-center justify-center w-6 h-6 border-[2px] border-foreground bg-primary text-primary-foreground font-mono text-xs font-bold ">{item.step}</div>
                            <span className="font-mono text-sm font-bold text-foreground uppercase">{item.label}</span>
                        </Badge>
                    ))}
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-background/10 rounded-full blur-xl pointer-events-none" />
            </BrutalCard>
        )

}
