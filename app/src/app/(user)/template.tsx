import type { Metadata } from 'next'
import { ThemeProvider } from '@/context/theme.provider'
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
            <main role="main" className='flex-1'>
                {children}
            </main>
            <Footer />
        </ThemeProvider>
    )
}
