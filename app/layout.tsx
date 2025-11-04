import './globals.css'

export const metadata = {
  title: 'Enciende Tu Luz',
  description: 'Fiesta anual de los grupos de crecimiento - 8 de diciembre 2025',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
