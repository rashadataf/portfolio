import type { Metadata } from 'next'
import { ThemeProvider } from '@/context/theme.provider'
import { Navbar } from '@/components/NavBar'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
    title: 'Rashad Portfolio | Software Engineer',
    description: 'Portfolio for Rashad Ataf',
    manifest: "/manifest.json"
}

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

export default function TemplateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider>
            <Navbar />
            <Box component="main" sx={{ flex: '1 1 auto', py: 4 }}>
                <Container maxWidth="lg">
                    {children}
                </Container>
            </Box>
            <Footer />
        </ThemeProvider>
    )
}
