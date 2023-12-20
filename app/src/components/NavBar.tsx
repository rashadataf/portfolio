'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { NavLinkProp } from '@/types';
import { usePathname } from 'next/navigation';
import { ThemeToggler} from './DarkModeToggle';


const NavLink = ({ href, title }: NavLinkProp) => {
    const pathname = usePathname();

    return (
        <Link href={href} className={`after:content-[''] after:block after:m-auto after:h-1 ${pathname === href ? 'after:w-full after:bg-accent' : 'after:w-0'} after:transition-[width] after:ease-in-out after:duration-300 hover:after:w-full hover:after:bg-accent text-primary hover:text-main`} >
            {title}
        </Link >
    );
}

const Navbar = () => {
    return (
        <header className='w-full px-32 py-8 font-medium flex items-center justify-between bg-secondary text-main'>
            <Logo />
            <nav className='flex justify-between w-1/3'>
                <NavLink href="/" title='Home' />
                <NavLink href="/about" title='About' />
                <NavLink href="/projects" title='Projects' />
                <NavLink href="/articles" title='Articles' />
            </nav>

            <ThemeToggler />
        </header>
    );
};

export default Navbar;
