import { PixelBlast } from "@/components/ui/PixelBlast";
import {Nav} from "@/features/landing/ui/Nav"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-background">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-90">
        <PixelBlast
          color="#000000"
          pixelSize={4}
          patternDensity={1}
          liquid={true}
          liquidStrength={1}
          liquidRadius={2.5}
          enableRipples={true}
          rippleSpeed={0.75}
          rippleIntensityScale={3}
          edgeFade={0.8}
        />
      </div>
      <div className="relative z-10 flex min-h-svh w-full flex-col items-center p-6 md:p-10 pt-25 md:pt-30">
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
