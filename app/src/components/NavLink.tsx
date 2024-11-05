import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLinkProp } from '@/types';

export const NavLink = ({ href, title, className }: NavLinkProp) => {
    const currentPath = usePathname();
    const isActive = currentPath === href;
    const linkClass = `py-5 px-3 hover:text-accent 
                       ${isActive ? 'text-accent font-bold' : 'text-secondary'}
                       ${className ? className : ''}`;
    return (
        <Link href={href} className={linkClass} scroll={false}>
            {title}
        </Link>
    );
};
