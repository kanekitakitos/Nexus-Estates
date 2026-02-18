'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  return (
    <NextThemeProvider
      attribute="class" // permite que o tema seja controlado via classes CSS (ex: "light" ou "dark")
      enableSystem
      defaultTheme="system"
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}