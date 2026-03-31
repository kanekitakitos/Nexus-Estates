import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 inline-flex w-full items-center justify-between rounded-2xl border-2 border-foreground/80 bg-secondary/80 px-3 py-2">
          <span className="font-mono uppercase tracking-[0.18em] text-[10px] sm:text-xs">
            Nexus Estates
          </span>
          <nav className="flex items-center gap-1">
            <Link
              href="/login"
              className="rounded-xl px-2 py-1 text-xs font-semibold transition-colors hover:bg-primary/10 hover:text-primary"
            >
              Login
            </Link>
            <Link
              href="/booking"
              className="rounded-xl px-2 py-1 text-xs font-semibold transition-colors hover:bg-primary/10 hover:text-primary"
            >
              Booking
            </Link>
          </nav>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
