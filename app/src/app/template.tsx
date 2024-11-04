import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { ThemeProvider } from '@/context/theme.provider'
import { Loader } from '@/components/Loader'
import { Navbar } from '@/components/NavBar'
import { Footer } from '@/components/Footer'



export const metadata: Metadata = {
    title: 'Rashad Portfolio | Software Engineer',
    description: 'Portfolio for Rashad Ataf',
    manifest: "/manifest.json"
}

export default function TemplateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider>
            <Navbar />
            <main role="main">
                {children}
            </main>
            <Footer />
        </ThemeProvider>
    )
}
