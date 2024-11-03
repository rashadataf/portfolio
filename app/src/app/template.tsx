import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { ThemeProvider } from '@/context/theme.provider'
import dynamic from 'next/dynamic'
import { Loader } from '@/components/Loader'

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat'
})

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
        <body className={`${montserrat.className} flex flex-col min-h-screen bg-main text-main`}>
            <ThemeProvider>
                <Navbar />
                <main role="main">
                    {children}
                </main>
                <Footer />
            </ThemeProvider>
        </body>
    )
}
