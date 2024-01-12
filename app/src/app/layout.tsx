import type { Metadata } from 'next'
import './globals.css'

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
      {children}
    </html>
  )
}
