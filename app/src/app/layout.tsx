import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/context/theme.provider'
import Navbar from '@/components/NavBar'
import Footer from '@/components/Footer'

const montserrat = Montserrat(
  {
    subsets: ['latin'],
    variable: '--font-montserrat'
  })

export const metadata: Metadata = {
  title: 'Rashad Portfolio | Software Engineer',
  description: 'portfolio for Rashad Ataf',
  manifest: "/manifest.json"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} flex flex-col min-h-screen bg-main text-main`}>
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
