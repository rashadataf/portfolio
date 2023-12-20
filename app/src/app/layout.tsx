import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/theme.provider'
import Navbar from '@/components/NavBar'

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
    <ThemeProvider>
      <html lang="en">
        <body className={montserrat.className}>
          <Navbar />
          {children}
        </body>
      </html>
    </ThemeProvider>
  )
}
