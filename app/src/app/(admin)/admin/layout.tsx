import { redirect } from 'next/navigation';
import { auth, signOut } from "@/lib/auth";
import { ThemeProvider } from '@/context/theme.provider';
import { AdminSidebar } from '@/components/AdminSidebar';

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
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar signOut={adminSignOut} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ThemeProvider>
    )
}
