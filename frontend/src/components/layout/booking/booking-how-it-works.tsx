import { Users, Search, CreditCard, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingHowItWorksProps {
    mode?: "default" | "card"
    className?: string
}

export function BookingHowItWorks({ mode = "default", className }: BookingHowItWorksProps) {
    if (mode === "card") {
        return (
            <div className={cn(
                "group relative h-full w-full overflow-hidden rounded-lg border-[3px] border-foreground bg-primary shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgb(0,0,0)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.9)] flex flex-row items-center justify-between p-0",
                className
            )}>
                {/* Left Section - Title & Icon */}
                <div className="flex flex-col justify-between h-full p-6 w-1/3 border-r-[3px] border-foreground bg-primary z-10 relative">
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-12 h-12 rounded-full border-[2px] border-foreground bg-background flex items-center justify-center shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)]">
                            <Users className="w-6 h-6 text-foreground" />
                        </div>
                        <div className="bg-background border-[2px] border-foreground px-3 py-1 font-mono text-xs font-bold uppercase shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)] -rotate-3">
                            Guide
                        </div>
                    </div>
                    
                    <h3 className="font-mono text-4xl font-black uppercase leading-[0.9] text-primary-foreground drop-shadow-[3px_3px_0_rgb(0,0,0)]">
                        How it<br/>works
                    </h3>
                    
                    <p className="font-mono text-xs font-medium text-primary-foreground/90 leading-tight mt-4">
                        Simple, secure, and memorable stays await you.
                    </p>
                </div>

                {/* Right Section - Steps */}
                <div className="flex-1 grid grid-cols-3 h-full bg-background">
                    <div className="flex flex-col items-center justify-center gap-4 border-r-[2px] border-foreground p-4 group/item hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center justify-center w-12 h-12 rounded-none border-[2px] border-foreground bg-primary text-primary-foreground font-mono text-xl font-bold shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] transition-transform group-hover/item:scale-110 group-hover/item:-rotate-3">1</div>
                        <span className="font-mono text-xl font-bold text-foreground uppercase tracking-tight">Browse</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 border-r-[2px] border-foreground p-4 group/item hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center justify-center w-12 h-12 rounded-none border-[2px] border-foreground bg-primary text-primary-foreground font-mono text-xl font-bold shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] transition-transform group-hover/item:scale-110 group-hover/item:rotate-3">2</div>
                        <span className="font-mono text-xl font-bold text-foreground uppercase tracking-tight">Book</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 p-4 group/item hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center justify-center w-12 h-12 rounded-none border-[2px] border-foreground bg-primary text-primary-foreground font-mono text-xl font-bold shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] transition-transform group-hover/item:scale-110 group-hover/item:-rotate-3">3</div>
                        <span className="font-mono text-xl font-bold text-foreground uppercase tracking-tight">Enjoy</span>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-background/10 rounded-full blur-2xl pointer-events-none" />
            </div>
        )
    }

    return (
        <section className={cn("bg-card border-[2px] border-foreground p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 mb-24 shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] -rotate-1 mx-4 md:mx-0 transition-transform hover:rotate-0 duration-300", className)}>
            <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative">
                    <div className="w-48 h-48 rounded-full border-[2px] border-foreground flex items-center justify-center bg-primary shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] animate-pulse-slow">
                        <Users size={80} strokeWidth={1} className="text-primary-foreground" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-foreground text-background rounded-full flex items-center justify-center font-mono text-2xl font-bold rotate-12 border-[2px] border-background dark:border-foreground animate-bounce-slow shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)]">
                        !
                    </div>
                </div>
            </div>
            <div className="w-full md:w-2/3">
                <h2 className="font-mono text-4xl md:text-5xl font-black uppercase mb-8 leading-none tracking-tight -skew-x-6 w-fit bg-secondary px-4 py-1 border-[2px] border-foreground shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.9)]">
                    How it works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group hover:-translate-y-1 transition-transform duration-200">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 border-[2px] border-foreground bg-foreground text-background font-mono text-sm font-bold shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">1</span>
                            <div className="font-mono text-lg font-bold uppercase underline decoration-2 underline-offset-2">Browse</div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                            Browse our curated selection of premium properties. Filter by location, price, and amenities to find your perfect match.
                        </p>
                    </div>
                    <div className="group hover:-translate-y-1 transition-transform duration-200 delay-75">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 border-[2px] border-foreground bg-foreground text-background font-mono text-sm font-bold shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">2</span>
                            <div className="font-mono text-lg font-bold uppercase underline decoration-2 underline-offset-2">Book</div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                            Book securely with our encrypted payment system. Instant confirmation and direct communication with hosts.
                        </p>
                    </div>
                    <div className="group hover:-translate-y-1 transition-transform duration-200 delay-150">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 border-[2px] border-foreground bg-foreground text-background font-mono text-sm font-bold shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">3</span>
                            <div className="font-mono text-lg font-bold uppercase underline decoration-2 underline-offset-2">Enjoy</div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                            Enjoy your stay with 24/7 support. Experience luxury living and create unforgettable memories.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
