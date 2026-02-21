import { Users } from "lucide-react"

export function BookingHowItWorks() {
    return (
        <section className="bg-card border-[2px] border-foreground p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 mb-24 shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] -rotate-1 mx-4 md:mx-0 transition-transform hover:rotate-0 duration-300">
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