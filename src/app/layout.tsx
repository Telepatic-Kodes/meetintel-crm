import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meeting Intel - Análisis de Reuniones',
  description: 'Análisis inteligente de transcripciones de reuniones B2B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
