import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/theme.provider'

const montserrat = Montserrat(
  {
    subsets: ['latin'],
    variable: '--font-montserrat'
  })

export const metadata: Metadata = {
  title: 'Rashad Portfolio | Software Engineer',
  description: 'portfolio for Rashad Ataf',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
