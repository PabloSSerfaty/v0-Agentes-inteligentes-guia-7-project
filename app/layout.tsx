import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

// Configurar la fuente Inter con el subconjunto latino
const inter = Inter({ subsets: ["latin"] })

/**
 * Componente de layout raíz de la aplicación.
 * Proporciona la estructura HTML básica y el proveedor de tema.
 *
 * @param children - Componentes hijos a renderizar dentro del layout
 * @returns Componente React con la estructura HTML básica
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
