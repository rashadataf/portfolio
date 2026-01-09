import { redirect } from 'next/navigation';
import { auth, signOut } from "@/lib/auth";
import { ThemeProvider } from '@/context/theme.provider';
import { AdminSidebar } from '@/components/AdminSidebar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth();
    if (!session) {
        redirect('/');
    }

    async function adminSignOut() {
        "use server"
        await signOut({
            redirect: true,
            redirectTo: '/'
        })
    }
    return (
        <ThemeProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                <AdminSidebar signOut={adminSignOut} />

                <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box component="div" sx={{ flex: 1, overflowY: 'auto', py: { xs: 2, md: 4 } }}>
                        <Container maxWidth="lg">
                            {children}
                        </Container>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    )
}
