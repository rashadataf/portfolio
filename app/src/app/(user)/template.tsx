import type { Metadata } from 'next'
import Link from 'next/link'
import { ThemeProvider } from '@/context/theme.provider'
import { Navbar } from '@/components/NavBar'
import { Footer } from '@/components/Footer'
import profilePic from '@public/images/rashad.webp';


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
            <Link
                rel="preload"
                // href="/_next/static/media/rashad.webp"
                href={profilePic.src}
                as="image"
                media="(max-width: 768px)"
                type="image/webp"
            />
            <main role="main" className='flex-1'>
                {children}
            </main>
            <Footer />
        </ThemeProvider>
    )
}
