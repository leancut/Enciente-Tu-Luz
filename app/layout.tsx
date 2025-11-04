import './globals.css'

export const metadata = {
  title: 'Llama App',
  description: 'Animación de llama con sonido y linterna',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
