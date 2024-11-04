import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { ThemeProvider } from '@/context/theme.provider'
import { Loader } from '@/components/Loader'



export const metadata: Metadata = {
    title: 'Rashad Portfolio | Software Engineer',
    description: 'Portfolio for Rashad Ataf',
    manifest: "/manifest.json"
}

const Navbar = dynamic(() =>
    import('@/components/NavBar').then((mod) => mod.Navbar),
    {
        loading: () => <Loader />,
    }
)

const Footer = dynamic(() =>
    import('@/components/Footer').then((mod) => mod.Footer),
    {
        loading: () => <Loader />,
    }
)

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
