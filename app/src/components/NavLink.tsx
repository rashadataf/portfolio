import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLinkProp } from '@/types';

export const NavLink = ({ href, title, className }: NavLinkProp) => {
    const currentPath = usePathname();
    const isActive = currentPath === href;
    const linkClass = `py-5 px-3 hover:text-accent-color 
                       ${isActive ? 'text-accent-color font-bold' : 'text-secondary-color'}
                       ${className ? className : ''}`;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if (isActive) {
            e.preventDefault(); // Prevent navigation if already on the current route
        }
    };

    return (
        <Link href={href} className={linkClass} onClick={handleClick} scroll={false}>
            {title}
        </Link>
    );
};
