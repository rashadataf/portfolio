'use client';
import Link from 'next/link';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { usePathname } from 'next/navigation';

export const AdminSidebar = ({
    signOut,
}: {
    signOut: () => void
}) => {
    const [isCollapsed, setIsCollapsed] = useSafeState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside
            className={`bg-gray-800 text-white flex flex-col h-full transition-all overflow-hidden ${isCollapsed ? 'w-16' : 'w-64'
                }`}
        >
            <div className="flex justify-between items-center p-4">
                {!isCollapsed && <span>Admin Panel</span>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-300 hover:text-white focus:outline-none"
                >
                    {isCollapsed ? '➡️' : '⬅️'}
                </button>
            </div>

            <nav className={`flex-1 p-2 ${isCollapsed ? 'hidden' : 'block'}`}>
                <ul>
                    <li>
                        <Link
                            href="/admin"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/articles"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/articles') ? 'bg-gray-700' : ''
                                }`}
                        >
                            All Articles
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/profile"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/profile') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Profile
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/skills"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/skills') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Skills
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/experience"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/experience') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Experience
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/education"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/education') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Education
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/projects"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/projects') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Projects
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/articles/drafts"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/articles/drafts') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Drafts
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/articles/published"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/articles/published') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Published
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/articles/archived"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/articles/archived') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Archived
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/settings"
                            className={`block p-2 hover:bg-gray-700 ${isActive('/admin/settings') ? 'bg-gray-700' : ''
                                }`}
                        >
                            Settings
                        </Link>
                    </li>
                </ul>
            </nav>

            {!isCollapsed && (
                <div className="p-4">
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="w-full p-2 text-sm bg-red-600 hover:bg-red-500 rounded"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            )}
        </aside>
    );
};
